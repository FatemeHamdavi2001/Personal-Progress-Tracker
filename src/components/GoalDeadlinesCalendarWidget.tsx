import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Flag, Target, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, Activity } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import {
  g2j,
  j2g,
  getJalaliMonthDays,
  getPersianStartWeekday,
  JALALI_MONTH_NAMES,
  toPersianDigits,
  formatDisplayDateWithMonth,
  jalaliToIso,
  getTehranJalaliToday,
  getTehranTodayIso
} from '../utils/jalali';
import { Language, translations } from '../utils/translations';

interface GoalDeadlinesCalendarWidgetProps {
  goals: Goal[];
  activities: Activity[];
  activeTheme: ColorThemeConfig;
  lang?: Language;
}

export const GoalDeadlinesCalendarWidget: React.FC<GoalDeadlinesCalendarWidgetProps> = ({
  goals,
  activities,
  activeTheme,
  lang = 'fa'
}) => {
  const currentLang: 'fa' | 'en' = lang === 'en' ? 'en' : 'fa';
  const t = translations[currentLang] || translations.fa;
  const todayIso = getTehranTodayIso();
  const [todayJy, todayJm, todayJd] = getTehranJalaliToday();

  const [viewJy, setViewJy] = useState<number>(todayJy);
  const [viewJm, setViewJm] = useState<number>(todayJm);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (viewJm === 1) {
      setViewJm(12);
      setViewJy(prev => prev - 1);
    } else {
      setViewJm(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewJm === 12) {
      setViewJm(1);
      setViewJy(prev => prev + 1);
    } else {
      setViewJm(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setViewJy(todayJy);
    setViewJm(todayJm);
    setSelectedIsoDate(null);
  };

  const totalDays = getJalaliMonthDays(viewJy, viewJm);
  const startWeekday = getPersianStartWeekday(viewJy, viewJm);

  const weekdays = lang === 'fa' 
    ? ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
    : ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];

  // Helper to normalize ISO dates
  const normalizeDate = (dStr?: string) => {
    if (!dStr) return '';
    return dStr.replace(/\//g, '-').split('T')[0];
  };

  // Map deadlines to ISO dates
  // Key: ISO date string, Value: array of goals due on that date
  const deadlinesMap: Record<string, Goal[]> = {};
  const startsMap: Record<string, Goal[]> = {};

  goals.forEach(goal => {
    const deadline = normalizeDate(goal.deadlineDate || goal.targetDate);
    if (deadline) {
      if (!deadlinesMap[deadline]) deadlinesMap[deadline] = [];
      deadlinesMap[deadline].push(goal);
    }

    const start = normalizeDate(goal.startDate);
    if (start) {
      if (!startsMap[start]) startsMap[start] = [];
      startsMap[start].push(goal);
    }
  });

  // Calculate month goals due
  const monthGoalsDue: { goal: Goal; isoDate: string; dayNum: number }[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const iso = jalaliToIso(viewJy, viewJm, day);
    if (deadlinesMap[iso]) {
      deadlinesMap[iso].forEach(g => {
        monthGoalsDue.push({ goal: g, isoDate: iso, dayNum: day });
      });
    }
  }

  // Selected date goals list
  const selectedDateGoals = selectedIsoDate ? (deadlinesMap[selectedIsoDate] || []) : [];
  const selectedDateStarts = selectedIsoDate ? (startsMap[selectedIsoDate] || []) : [];

  return (
    <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-xl text-slate-950 font-bold shadow-md">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{lang === 'fa' ? 'تقویم ضرب‌الاجل اهداف' : 'Goal Deadlines Calendar'}</span>
              <span className="text-xs text-amber-400 font-mono">
                ({JALALI_MONTH_NAMES[viewJm - 1]} {toPersianDigits(viewJy)})
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'fa'
                ? 'نمایش موعد سررسید و ددلاین اهداف به صورت نقاط رنگی در تقویم'
                : 'Displaying goal deadline dates as colored dots on the calendar'}
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title={lang === 'fa' ? 'امروز' : 'Today'}
          >
            {lang === 'fa' ? 'امروز' : 'Today'}
          </button>

          <button
            type="button"
            onClick={lang === 'fa' ? handleNextMonth : handlePrevMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={lang === 'fa' ? handlePrevMonth : handleNextMonth}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
        {weekdays.map((wd, i) => (
          <div key={wd} className={i === 6 ? 'text-rose-400' : 'text-slate-400'}>
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
        {/* Leading empty cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-11" />
        ))}

        {/* Days of Month */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNum = i + 1;
          const iso = jalaliToIso(viewJy, viewJm, dayNum);
          const isToday = iso === todayIso;
          const isSelected = iso === selectedIsoDate;

          const dayDeadlines = deadlinesMap[iso] || [];
          const dayStarts = startsMap[iso] || [];
          const hasDeadlines = dayDeadlines.length > 0;
          const hasStarts = dayStarts.length > 0;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedIsoDate(prev => prev === iso ? null : iso)}
              className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-between p-1 transition-all relative cursor-pointer group ${
                isSelected
                  ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-200 font-bold shadow-lg scale-105 z-10'
                  : isToday
                  ? 'bg-slate-800 text-white font-bold border-2 border-teal-400 shadow-md'
                  : hasDeadlines
                  ? 'bg-slate-800/90 text-slate-100 border border-slate-700 hover:border-amber-400/60'
                  : 'bg-slate-950/40 text-slate-400 border border-slate-800/60 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between w-full px-1">
                <span className="font-mono font-medium text-[11px]">
                  {lang === 'fa' ? toPersianDigits(dayNum) : dayNum}
                </span>

                {hasStarts && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    title={lang === 'fa' ? 'تاریخ شروع هدف' : 'Goal Start Date'}
                  />
                )}
              </div>

              {/* Deadline Colored Dots */}
              <div className="flex items-center justify-center gap-1 w-full flex-wrap px-0.5 overflow-hidden">
                {dayDeadlines.slice(0, 3).map((goal) => (
                  <span
                    key={goal.id}
                    className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-950 shadow-xs shrink-0 animate-pulse"
                    style={{ backgroundColor: goal.color || '#F59E0B' }}
                    title={`ددلاین: ${goal.title}`}
                  />
                ))}
                {dayDeadlines.length > 3 && (
                  <span className="text-[9px] font-mono text-amber-300 font-bold leading-none">
                    +{dayDeadlines.length - 3}
                  </span>
                )}
              </div>

              {/* Hover Tooltip */}
              {(hasDeadlines || hasStarts) && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-950 border border-slate-700 text-slate-100 text-[10px] px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-30 flex items-center gap-1.5">
                  <Flag className="w-3 h-3 text-amber-400" />
                  <span>
                    {hasDeadlines
                      ? `${dayDeadlines.length} ${lang === 'fa' ? 'ددلاین هدف' : 'goal deadline(s)'}`
                      : `${dayStarts.length} ${lang === 'fa' ? 'شروع هدف' : 'goal start(s)'}`}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Goal Details Panel */}
      <AnimatePresence>
        {selectedIsoDate && (selectedDateGoals.length > 0 || selectedDateStarts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 space-y-2 text-xs"
          >
            <div className="flex justify-between items-center text-amber-300 font-bold border-b border-slate-800 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Flag className="w-4 h-4 text-amber-400" />
                <span>
                  {lang === 'fa' ? 'اهداف تاریخ:' : 'Goals for Date:'} {formatDisplayDateWithMonth(selectedIsoDate, currentLang)}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedIsoDate(null)}
                className="text-slate-400 hover:text-slate-200 text-[11px]"
              >
                {lang === 'fa' ? 'بستن' : 'Close'}
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {selectedDateGoals.map(goal => {
                const loggedHours = activities
                  .filter(a => a.goalId === goal.id)
                  .reduce((sum, a) => sum + (Number(a.duration || 0) / 60), 0);
                const totalHours = (goal.currentHours || 0) + loggedHours;
                const percent = Math.min(Math.round((totalHours / (goal.targetHours || 1)) * 100), 100);

                return (
                  <div
                    key={goal.id}
                    className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: goal.color || '#F59E0B' }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 truncate">{goal.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="text-amber-400 font-medium">
                            {lang === 'fa' ? 'موعد سررسید' : 'Deadline'}
                          </span>
                          <span>•</span>
                          <span>{goal.category || 'عمومی'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className="text-slate-300 font-bold text-[11px]">
                        {totalHours.toFixed(1)} / {goal.targetHours}h ({toPersianDigits(percent)}٪)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deadlines Summary List for Current Month */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>
              {lang === 'fa'
                ? `ددلاین‌های اهداف در ${JALALI_MONTH_NAMES[viewJm - 1]} (${toPersianDigits(monthGoalsDue.length)})`
                : `Goal Deadlines in ${JALALI_MONTH_NAMES[viewJm - 1]} (${monthGoalsDue.length})`}
            </span>
          </span>
        </div>

        {monthGoalsDue.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {monthGoalsDue.map(({ goal, isoDate, dayNum }) => (
              <div
                key={`${goal.id}-${isoDate}`}
                onClick={() => setSelectedIsoDate(isoDate)}
                className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between text-xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: goal.color || '#F59E0B' }}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-200 truncate">{goal.title}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {toPersianDigits(dayNum)} {JALALI_MONTH_NAMES[viewJm - 1]}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-amber-300 font-mono shrink-0">
                  {lang === 'fa' ? 'ددلاین' : 'Deadline'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 bg-slate-950/30 rounded-xl border border-slate-800/50 text-slate-500 text-xs">
            {lang === 'fa'
              ? 'در این ماه هیچ ددلاینی ثبت نشده است.'
              : 'No goal deadlines recorded for this month.'}
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>{lang === 'fa' ? 'موعد سررسید (ددلاین)' : 'Goal Deadline'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            <span>{lang === 'fa' ? 'شروع هدف' : 'Goal Start'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-teal-400 inline-block" />
            <span>{lang === 'fa' ? 'امروز' : 'Today'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
