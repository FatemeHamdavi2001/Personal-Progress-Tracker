import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Lightbulb,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Flame,
  ArrowUpRight,
  Share2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits, formatMinutesToHours, formatJalaliDate, getPersianDayName } from '../utils/jalali';
import { Language, translations } from '../utils/translations';
import { MonthlyReportPdfModal } from './MonthlyReportPdfModal';

interface WeeklyReportWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  userName?: string;
  lang?: Language;
}

const DEFAULT_BAR_COLORS = [
  '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#3B82F6', '#14B8A6'
];

export const WeeklyReportWidget: React.FC<WeeklyReportWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  userName = 'کاربر گرامی',
  lang = 'fa'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const t = translations[lang] || translations.fa;

  // Compute last 7 days range
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Filter activities from last 7 days
  const weeklyActivities = activities.filter(act => {
    const actDate = new Date(act.date);
    return !isNaN(actDate.getTime()) ? actDate >= sevenDaysAgo && actDate <= now : true;
  });

  // Calculate metrics
  const totalMinutesThisWeek = weeklyActivities.reduce((sum, a) => sum + Number(a.duration || 0), 0);
  const totalHoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);

  // Unique active days in last 7 days
  const activeDaysSet = new Set(weeklyActivities.map(a => a.date));
  const activeDaysCount = activeDaysSet.size;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  weeklyActivities.forEach(a => {
    const cat = a.category || 'عمومی';
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(a.duration || 0);
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] ? sortedCategories[0][0] : null;

  // Compute Bar Chart data for last 7 days with goal/task custom colors
  const barChartData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = getPersianDayName(d);
      const dayActs = activities.filter(a => a.date === iso);
      const mins = dayActs.reduce((sum, a) => sum + Number(a.duration || 0), 0);
      const hours = Math.round((mins / 60) * 10) / 10;

      // Assign custom color based on goal logged or fallback
      let barColor = activeTheme.dotBg ? '#14B8A6' : '#06B6D4';
      if (dayActs.length > 0) {
        const goalWithColor = goals.find(g => g.id === dayActs[0].goalId && g.color);
        if (goalWithColor?.color) {
          barColor = goalWithColor.color;
        } else {
          barColor = DEFAULT_BAR_COLORS[i % DEFAULT_BAR_COLORS.length];
        }
      }

      result.push({
        dayName,
        dateIso: iso,
        hours,
        minutes: mins,
        color: barColor,
        activitiesCount: dayActs.length
      });
    }
    return result;
  }, [activities, goals, activeTheme]);

  // Overall goal percent calculation
  const totalGoalHoursTarget = goals.reduce((sum, g) => sum + (g.targetHours || 0), 0);
  const totalGoalHoursAchieved = goals.reduce((sum, g) => {
    const loggedFromActs = activities
      .filter(a => a.goalId === g.id)
      .reduce((s, a) => s + (a.duration / 60), 0);
    return sum + (g.currentHours || 0) + loggedFromActs;
  }, 0);

  const overallGoalPercent = totalGoalHoursTarget > 0
    ? Math.min(Math.round((totalGoalHoursAchieved / totalGoalHoursTarget) * 100), 100)
    : 0;

  // Determine performance tier
  let performanceBadge = {
    label: lang === 'fa' ? 'آغاز مسیر' : 'Starting',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Target
  };

  if (activeDaysCount >= 5 && totalMinutesThisWeek >= 600) {
    performanceBadge = {
      label: lang === 'fa' ? 'عملکرد فوق‌العاده' : 'Exceptional',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Flame
    };
  } else if (activeDaysCount >= 3 || totalMinutesThisWeek >= 300) {
    performanceBadge = {
      label: lang === 'fa' ? 'در مسیر رشد' : 'On Track',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: TrendingUp
    };
  }

  const handleCopyReport = () => {
    const reportSummary = `📊 گزارش عملکرد هفتگی You Can Do it
⏱ مجموع زمان تمرکز: ${formatMinutesToHours(totalMinutesThisWeek)}
📅 روزهای فعال: ${activeDaysCount} از ۷ روز
🎯 پیشرفت کلی اهداف: ${overallGoalPercent}٪
📌 حوزه اصلی: ${topCategory || 'ثبت نشده'}`;

    navigator.clipboard.writeText(reportSummary);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const BadgeIcon = performanceBadge.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-slate-800/40 rounded-2xl p-5 sm:p-6 border border-slate-700/50 relative overflow-hidden flex flex-col gap-5 shadow-xl"
    >
      {/* Decorative Glow */}
      <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none ${activeTheme.swatchBg}`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder} flex items-center justify-center shadow-lg`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-sans">
              <span>{t.barChartTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'fa' ? 'روند ۷ روز اخیر با رنگ‌های اختصاصی هر هدف' : '7-day analysis with distinct goal colors'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${performanceBadge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{performanceBadge.label}</span>
          </span>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Redesigned Multi-Colored Bar Chart Area */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">
            {lang === 'fa' ? 'ساعات تمرکز روزانه:' : 'Daily Focus Hours:'}
          </span>
          <span className="font-mono text-teal-400 font-bold">
            {lang === 'fa' ? toPersianDigits(totalHoursThisWeek) : totalHoursThisWeek} {t.hours}
          </span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="dayName"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [`${lang === 'fa' ? toPersianDigits(val) : val} ${t.hours}`, 'زمان کارکرد']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '12px',
                  fontFamily: 'inherit'
                }}
              />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metric Highlights Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>زمان تمرکز</span>
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-lg font-extrabold font-mono ${activeTheme.textPrimary}`}>
              {lang === 'fa' ? toPersianDigits(totalHoursThisWeek) : totalHoursThisWeek}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">{t.hours}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>روزهای فعال</span>
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-amber-300">
              {lang === 'fa' ? toPersianDigits(activeDaysCount) : activeDaysCount} / 7
            </span>
            <span className="text-[10px] text-slate-500 font-sans">{t.days}</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>پیشرفت اهداف</span>
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-emerald-400">
              %{lang === 'fa' ? toPersianDigits(overallGoalPercent) : overallGoalPercent}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between truncate">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate">
            <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">دسته اصلی</span>
          </span>
          <div className="mt-2 truncate font-bold text-xs text-slate-200">
            {topCategory ? (
              <span className="text-purple-300 truncate block">{topCategory}</span>
            ) : (
              <span className="text-slate-500">-</span>
            )}
          </div>
        </div>
      </div>

      {/* PDF Export & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60">
        <button
          type="button"
          onClick={() => setIsPdfModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>{lang === 'fa' ? 'دانلود گزارش PDF پیشرفت ماهانه' : 'Download Monthly Progress PDF Report'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyReport}
          className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-teal-400" />
          <span>{copiedToast ? (lang === 'fa' ? 'کپی شد!' : 'Copied!') : (lang === 'fa' ? 'اشتراک خلاصه' : 'Share Summary')}</span>
        </button>
      </div>

      {/* Monthly PDF Report Modal */}
      <MonthlyReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        activities={activities}
        goals={goals}
        activeTheme={activeTheme}
        userName={userName}
        lang={lang}
      />
    </motion.div>
  );
};
