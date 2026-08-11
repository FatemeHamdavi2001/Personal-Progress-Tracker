import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, Target, Flame, Award, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { Activity, Goal } from '../types/tracker';
import { toPersianDigits, formatMinutesToHours } from '../utils/jalali';
import { ColorThemeConfig } from '../types/theme';

interface ProgressSummaryWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  userName?: string;
}

export const ProgressSummaryWidget: React.FC<ProgressSummaryWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  userName
}) => {
  // Calculate completed goals
  const goalsWithProgress = goals.map(goal => {
    const loggedHours = activities
      .filter(act => act.goalId === goal.id)
      .reduce((sum, act) => sum + (act.duration / 60), 0);
    const totalHours = loggedHours + (goal.currentHours || 0);
    const percent = Math.min(Math.round((totalHours / goal.targetHours) * 100), 100);
    const isCompleted = percent >= 100;
    return { ...goal, totalHours, percent, isCompleted };
  });

  const totalGoals = goals.length;
  const completedGoalsCount = goalsWithProgress.filter(g => g.isCompleted).length;
  const overallCompletionRate = totalGoals > 0 
    ? Math.round(goalsWithProgress.reduce((acc, g) => acc + g.percent, 0) / totalGoals) 
    : 0;

  const totalLoggedMinutes = activities.reduce((sum, act) => sum + Number(act.duration || 0), 0);
  const totalLoggedHoursStr = formatMinutesToHours(totalLoggedMinutes);

  // Motivational Message Generator based on completed goals
  const getMotivationalContent = () => {
    if (totalGoals === 0) {
      return {
        title: 'شروع یک مسیر تازه',
        message: 'هنوز هدفی تعریف نکرده‌اید! یک هدف جدید ثبت کنید تا مسیر پیشرفت خود را با انرژی و هوشمندی دنبال کنید.',
        icon: Zap,
        badgeText: 'آماده ساخت اهداف',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        gradient: 'from-amber-500/15 via-orange-500/10 to-transparent'
      };
    }

    if (completedGoalsCount === 0) {
      return {
        title: 'انگیزه روزانه: قدم‌های اولیه',
        message: 'هر مسیر بزرگی با قدم اول شروع می‌شود! روی اهدافت تمرکز کن، اولین هدف را فتح کن و مزه شیرین موفقیت را بچش. 🚀',
        icon: Flame,
        badgeText: 'در حال تلاش و حرکت',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        gradient: 'from-blue-500/15 via-indigo-500/10 to-transparent'
      };
    }

    if (completedGoalsCount === 1) {
      return {
        title: 'اولین پیروزی به دست آمد!',
        message: 'فوق‌العاده است! اولین هدف شما به ۱۰۰٪ رسید. نشان دادی قدرت پایبندی داری؛ حالا وقتش رسیده هدف بعدی را فتح کنی! 🔥',
        icon: Award,
        badgeText: '۱ هدف کامل شده',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        gradient: 'from-teal-500/15 via-emerald-500/10 to-transparent'
      };
    }

    if (completedGoalsCount === 2) {
      return {
        title: 'استمرار قدرتمند!',
        message: '۲ هدف بزرگ را به سرانجام رساندی! ثبات کاری تو تحسین‌برانگیز است؛ همین فرمول تمرکز را ادامه بده و اوج بگیر. ⭐',
        icon: Sparkles,
        badgeText: '۲ هدف کامل شده',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
        gradient: 'from-indigo-500/15 via-purple-500/10 to-transparent'
      };
    }

    if (completedGoalsCount >= 3 && completedGoalsCount < totalGoals) {
      return {
        title: 'پیشرفت خیره‌کننده و بی‌وقفه',
        message: `شما تا کنون ${toPersianDigits(completedGoalsCount)} هدف اصلی را کاملاً تکمیل کرده‌اید! الگو و مظهر ثبات هستید؛ به فتح بقیه اهداف بسیار نزدیک شده‌اید. 🏆`,
        icon: Trophy,
        badgeText: `${toPersianDigits(completedGoalsCount)} هدف کامل شده`,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        gradient: 'from-purple-500/15 via-fuchsia-500/10 to-transparent'
      };
    }

    // ALL goals completed (completedGoalsCount === totalGoals)
    return {
      title: 'قهرمان بی‌رقیب - ۱۰۰٪ اهداف فتح شد!',
      message: `شگفت‌انگیز است! تمام ${toPersianDigits(totalGoals)} هدف فعال شما با موفقیت کامل شدند. نشان دادی هیچ مانعی جلوی اراده‌ات نیست. وقت چالش‌های بزرگتر است! 👑`,
      icon: Trophy,
      badgeText: 'تمام اهداف فتح شد',
      badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
      gradient: 'from-emerald-500/20 via-teal-500/15 to-transparent'
    };
  };

  const motive = getMotivationalContent();
  const MotiveIcon = motive.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between gap-5"
    >
      {/* Background Decorative Accent */}
      <div className={`absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-br ${motive.gradient} pointer-events-none rounded-2xl`} />

      {/* Header: Title & Motivational Badge */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
            <MotiveIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>خلاصه پیشرفت و ارزیابی عملکرد</span>
              {userName && (
                <span className="text-xs font-normal text-slate-400">({userName})</span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-medium">{motive.title}</p>
          </div>
        </div>

        <span className={`px-3 py-1 text-xs font-bold rounded-full border shadow-sm flex items-center gap-1.5 ${motive.badgeColor}`}>
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{motive.badgeText}</span>
        </span>
      </div>

      {/* Dynamic Motivational Quote Banner */}
      <div className="relative z-10 p-3.5 bg-slate-900/70 border border-slate-700/60 rounded-xl flex items-start gap-3">
        <span className="text-xl shrink-0 leading-none">💡</span>
        <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
          {motive.message}
        </p>
      </div>

      {/* Grid Summary Stats Cards */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        {/* Stat 1: Completed Goals */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>اهداف تکمیل‌شده</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-100">
              {toPersianDigits(completedGoalsCount)}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {toPersianDigits(totalGoals)}</span>
          </div>
        </div>

        {/* Stat 2: Total Logged Hours */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>کل زمان ثبت‌شده</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {toPersianDigits(totalLoggedHoursStr)}
          </div>
        </div>

        {/* Stat 3: Total Activities */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>فعالیت‌های ثبت‌شده</span>
            <TrendingUp className={`w-3.5 h-3.5 ${activeTheme.textPrimary}`} />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {toPersianDigits(activities.length)} <span className="text-xs font-normal text-slate-400">مورد</span>
          </div>
        </div>

        {/* Stat 4: Average Goal Progress % */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>میزان تحقق اهداف</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {toPersianDigits(overallCompletionRate)}٪
          </div>
        </div>
      </div>
    </motion.div>
  );
};
