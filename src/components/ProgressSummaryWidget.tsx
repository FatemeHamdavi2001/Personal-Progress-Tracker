import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Sparkles, Target, Flame, Award, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';
import { Activity, Goal } from '../types/tracker';
import { toPersianDigits, formatMinutesToHours } from '../utils/jalali';
import { ColorThemeConfig } from '../types/theme';
import { Language, translations } from '../utils/translations';
import { getDailyMotivation } from '../utils/motivation';

interface ProgressSummaryWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  userName?: string;
  lang?: Language;
}

export const ProgressSummaryWidget: React.FC<ProgressSummaryWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  userName,
  lang = 'fa'
}) => {
  const t = translations[lang] || translations.fa;

  // Accurately calculate completed goals without double-counting hours (#2 bug fix)
  const goalsWithProgress = useMemo(() => {
    return goals.map(goal => {
      // Calculate logged hours strictly from activities linked to this goal
      const loggedHours = activities
        .filter(act => act.goalId === goal.id)
        .reduce((sum, act) => sum + (Number(act.duration || 0) / 60), 0);

      const baselineHours = goal.currentHours || 0;
      const totalHours = Math.max(loggedHours, baselineHours);
      const target = goal.targetHours || 1;

      let percent = 0;
      if (goal.trackingMethod === 'days_remaining' && goal.targetDays) {
        // Measure by days elapsed vs total target days
        const targetDays = goal.targetDays || 1;
        const loggedDaysCount = new Set(activities.filter(a => a.goalId === goal.id).map(a => a.date)).size;
        percent = Math.min(Math.round((loggedDaysCount / targetDays) * 100), 100);
      } else {
        // Measure by hours logged
        percent = Math.min(Math.round((totalHours / target) * 100), 100);
      }

      const isCompleted = percent >= 100;
      return { ...goal, totalHours, percent, isCompleted };
    });
  }, [activities, goals]);

  const totalGoals = goals.length;
  const completedGoalsCount = goalsWithProgress.filter(g => g.isCompleted).length;
  const overallCompletionRate = totalGoals > 0 
    ? Math.round(goalsWithProgress.reduce((acc, g) => acc + g.percent, 0) / totalGoals) 
    : 0;

  const totalLoggedMinutes = activities.reduce((sum, act) => sum + Number(act.duration || 0), 0);
  const totalLoggedHoursStr = formatMinutesToHours(totalLoggedMinutes);

  // Daily non-repeating motivational phrase (#12)
  const dailyQuote = getDailyMotivation(lang as 'fa' | 'en');

  // Motivational Message Header based on completed goals
  const getMotivationalHeader = () => {
    if (totalGoals === 0) {
      return {
        title: lang === 'fa' ? 'شروع یک مسیر تازه' : 'A New Journey Begins',
        icon: Zap,
        badgeText: lang === 'fa' ? 'آماده ساخت اهداف' : 'Ready to Start',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        gradient: 'from-amber-500/15 via-orange-500/10 to-transparent'
      };
    }

    if (completedGoalsCount === 0) {
      return {
        title: lang === 'fa' ? 'انگیزه روزانه: قدم‌های اولیه' : 'Daily Spark: First Steps',
        icon: Flame,
        badgeText: lang === 'fa' ? 'در حال تلاش و حرکت' : 'In Progress',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        gradient: 'from-blue-500/15 via-indigo-500/10 to-transparent'
      };
    }

    if (completedGoalsCount === 1) {
      return {
        title: lang === 'fa' ? 'اولین پیروزی به دست آمد!' : 'First Goal Milestone Reached!',
        icon: Award,
        badgeText: lang === 'fa' ? '۱ هدف کامل شده' : '1 Goal Completed',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        gradient: 'from-teal-500/15 via-emerald-500/10 to-transparent'
      };
    }

    if (completedGoalsCount >= 2 && completedGoalsCount < totalGoals) {
      return {
        title: lang === 'fa' ? 'پیشرفت خیره‌کننده و بی‌وقفه' : 'Unstoppable Momentum',
        icon: Sparkles,
        badgeText: lang === 'fa' 
          ? `${toPersianDigits(completedGoalsCount)} هدف کامل شده` 
          : `${completedGoalsCount} Goals Completed`,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        gradient: 'from-purple-500/15 via-fuchsia-500/10 to-transparent'
      };
    }

    // All goals completed
    return {
      title: lang === 'fa' ? 'قهرمان بی‌رقیب - ۱۰۰٪ اهداف فتح شد!' : '100% All Goals Completed!',
      icon: Trophy,
      badgeText: lang === 'fa' ? 'تمام اهداف فتح شد' : 'All Goals Achieved',
      badgeColor: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50',
      gradient: 'from-emerald-500/20 via-teal-500/15 to-transparent'
    };
  };

  const motive = getMotivationalHeader();
  const MotiveIcon = motive.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl flex flex-col justify-between gap-5"
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 left-0 bottom-0 bg-gradient-to-br ${motive.gradient} pointer-events-none rounded-2xl`} />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-center shrink-0 text-amber-400 shadow-md">
            <MotiveIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{t.progressSummary}</span>
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

      {/* Non-repeating Daily Motivational Text Banner (#12) */}
      <div className="relative z-10 p-3.5 bg-slate-900/80 border border-slate-700/60 rounded-xl flex items-start gap-3">
        <span className="text-xl shrink-0 leading-none">💡</span>
        <div className="space-y-0.5">
          <span className="text-[10px] text-amber-400 font-bold block">{t.motivationalMessage}:</span>
          <p className="text-xs text-slate-100 leading-relaxed font-sans font-medium">
            «{dailyQuote}»
          </p>
        </div>
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
              {lang === 'fa' ? toPersianDigits(completedGoalsCount) : completedGoalsCount}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              / {lang === 'fa' ? toPersianDigits(totalGoals) : totalGoals}
            </span>
          </div>
        </div>

        {/* Stat 2: Total Logged Hours */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{t.totalLogged}</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {lang === 'fa' ? toPersianDigits(totalLoggedHoursStr) : totalLoggedHoursStr}
          </div>
        </div>

        {/* Stat 3: Total Activities */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>فعالیت‌های ثبت‌شده</span>
            <TrendingUp className={`w-3.5 h-3.5 ${activeTheme.textPrimary}`} />
          </div>
          <div className="text-lg font-bold font-mono text-slate-100">
            {lang === 'fa' ? toPersianDigits(activities.length) : activities.length}{' '}
            <span className="text-xs font-normal text-slate-400">مورد</span>
          </div>
        </div>

        {/* Stat 4: Average Goal Progress % */}
        <div className="p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>میزان تحقق اهداف</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300">
            {lang === 'fa' ? toPersianDigits(overallCompletionRate) : overallCompletionRate}٪
          </div>
        </div>
      </div>
    </motion.div>
  );
};
