import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Plus,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits } from '../utils/jalali';
import { Language } from '../utils/translations';

interface PomodoroTimerWidgetProps {
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  onLogActivity?: (title: string, durationMins: number, category: string, goalId?: string) => void;
  lang?: Language;
}

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const DEFAULT_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

export const PomodoroTimerWidget: React.FC<PomodoroTimerWidgetProps> = ({
  goals,
  activeTheme,
  onLogActivity,
  lang = 'fa'
}) => {
  const [isActive, setIsActive] = useState(false); // Global toggle on/off
  const [isExpanded, setIsExpanded] = useState(false); // Widget open/minimized
  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [completedSessions, setCompletedSessions] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      console.error('Audio play failed', err);
    }
  };

  // Switch timer mode
  const handleSwitchMode = (newMode: Mode) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setMode(newMode);
    setTimeLeft(DEFAULT_DURATIONS[newMode]);
  };

  // Start / Pause
  const handleToggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(DEFAULT_DURATIONS[mode]);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            playChime();

            // Session completed
            if (mode === 'focus') {
              setCompletedSessions(c => c + 1);

              // Auto log activity if callback exists
              const mins = Math.round(DEFAULT_DURATIONS.focus / 60);
              const goal = goals.find(g => g.id === selectedGoalId);
              const actTitle = customTitle.trim() || (goal ? `تمرکز روی هدف: ${goal.title}` : 'جلسه پومودورو');
              const cat = goal ? goal.category : 'مطالعه و تمرکز';

              if (onLogActivity) {
                onLogActivity(actTitle, mins, cat, selectedGoalId || undefined);
              }
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedGoalId, customTitle, soundEnabled, goals, onLogActivity]);

  // Format time MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  const timeFormatted = `${pad(mins)}:${pad(secs)}`;
  const displayTime = lang === 'fa' ? toPersianDigits(timeFormatted) : timeFormatted;

  const totalDuration = DEFAULT_DURATIONS[mode];
  const progressPercent = Math.min(Math.max(((totalDuration - timeLeft) / totalDuration) * 100, 0), 100);

  if (!isActive) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsActive(true);
          setIsExpanded(true);
        }}
        className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
        title={lang === 'fa' ? 'فعال‌سازی تایمر پومودورو' : 'Activate Pomodoro Timer'}
      >
        <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>{lang === 'fa' ? 'پومودورو' : 'Pomodoro'}</span>
      </button>
    );
  }

  return (
    <div className="relative z-40">
      {/* Minimized Pill Bar */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 rounded-xl px-2.5 py-1 shadow-lg text-xs font-sans">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="flex items-center gap-2 text-amber-300 font-bold hover:text-amber-200 cursor-pointer"
        >
          <Timer className={`w-4 h-4 text-amber-400 ${isRunning ? 'animate-spin' : ''}`} />
          <span className="font-mono text-sm tracking-wider">{displayTime}</span>
        </button>

        <button
          type="button"
          onClick={handleToggleTimer}
          className={`p-1 rounded-lg transition-colors cursor-pointer ${
            isRunning ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
          }`}
          title={isRunning ? 'توقف' : 'شروع'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
        >
          {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsActive(false);
            setIsRunning(false);
          }}
          className="p-1 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer"
          title="غیرفعال‌سازی"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Expanded Popover Modal Widget */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute left-0 sm:right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-4 z-50 text-right dir-rtl"
          >
            {/* Popover Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">
                    {lang === 'fa' ? 'ساعت پومودورو و تمرکز' : 'Pomodoro Focus Timer'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'fa' ? 'افزایش تمرکز کاری و درسی' : 'Boost study & work focus'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(s => !s)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    soundEnabled
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={soundEnabled ? 'صدا فعال' : 'صدا غیرفعال'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleSwitchMode('focus')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'focus'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'تمرکز (۲۵د)' : 'Focus (25m)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('shortBreak')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'shortBreak'
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'استراحت (۵د)' : 'Break (5m)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchMode('longBreak')}
                className={`py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  mode === 'longBreak'
                    ? 'bg-indigo-500 text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'استراحت (۱۵د)' : 'Long (15m)'}</span>
              </button>
            </div>

            {/* Timer Visual Display */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden space-y-3">
              {/* Progress Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    mode === 'focus' ? 'bg-amber-400' : mode === 'shortBreak' ? 'bg-teal-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Huge Clock Digital Display */}
              <div className="text-4xl sm:text-5xl font-mono font-black text-slate-100 tracking-wider">
                {displayTime}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>{lang === 'fa' ? 'تعداد جلسات انجام‌شده:' : 'Completed sessions:'}</span>
                <span className="font-bold text-amber-300 font-mono">
                  {lang === 'fa' ? toPersianDigits(completedSessions) : completedSessions}
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  title="بازنشانی"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToggleTimer}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                    isRunning
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : mode === 'focus'
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : mode === 'shortBreak'
                      ? 'bg-teal-400 hover:bg-teal-300 text-slate-950'
                      : 'bg-indigo-400 hover:bg-indigo-300 text-slate-950'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'توقف' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{lang === 'fa' ? 'شروع تمرکز' : 'Start Focus'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Attach Goal / Activity Option */}
            <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
              <label className="block text-[11px] font-medium text-slate-300">
                {lang === 'fa' ? 'اتصال زمان تمرکز به هدف:' : 'Attach session to goal:'}
              </label>

              <select
                value={selectedGoalId}
                onChange={e => setSelectedGoalId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="">{lang === 'fa' ? '-- بدون هدف خاص (تمرکز عمومی) --' : '-- General Focus --'}</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder={lang === 'fa' ? 'عنوان اختصاصی فعالیت (اختیاری)' : 'Custom activity title (optional)'}
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
