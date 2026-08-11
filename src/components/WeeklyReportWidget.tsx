import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits, formatMinutesToHours } from '../utils/jalali';

interface WeeklyReportWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
}

export const WeeklyReportWidget: React.FC<WeeklyReportWidgetProps> = ({
  activities,
  goals,
  activeTheme
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedToast, setCopiedToast] = useState(false);

  // Compute last 7 days range
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Filter activities from last 7 days
  const weeklyActivities = activities.filter(act => {
    const actDate = new Date(act.date);
    return actDate >= sevenDaysAgo && actDate <= now;
  });

  // Calculate metrics
  const totalMinutesThisWeek = weeklyActivities.reduce((sum, a) => sum + a.duration, 0);
  const totalHoursThisWeek = (totalMinutesThisWeek / 60).toFixed(1);

  // Unique active days in last 7 days
  const activeDaysSet = new Set(weeklyActivities.map(a => a.date));
  const activeDaysCount = activeDaysSet.size;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  weeklyActivities.forEach(a => {
    const cat = a.category || 'عمومی';
    categoryMap[cat] = (categoryMap[cat] || 0) + a.duration;
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] ? sortedCategories[0][0] : null;
  const topCategoryMins = sortedCategories[0] ? sortedCategories[0][1] : 0;

  // Goals progress calculations
  const totalGoalHoursTarget = goals.reduce((sum, g) => sum + g.targetHours, 0);
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
    label: 'آغاز مسیر',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Target
  };

  if (activeDaysCount >= 5 && totalMinutesThisWeek >= 600) { // 10+ hours & 5+ days
    performanceBadge = {
      label: 'عملکرد فوق‌العاده',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: Flame
    };
  } else if (activeDaysCount >= 3 || totalMinutesThisWeek >= 300) { // 5+ hours or 3+ days
    performanceBadge = {
      label: 'در مسیر رشد',
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      icon: TrendingUp
    };
  }

  // Generate intelligent analysis narrative
  const generateAnalysisText = () => {
    if (weeklyActivities.length === 0) {
      return 'هنوز هیچ فعالیتی در ۷ روز گذشته ثبت نشده است. با ثبت اولین فعالیت خود در روز جاری، روند پیشرفت و تحلیل عملکرد هفتگی فعال خواهد شد.';
    }

    let text = `در ۷ روز گذشته، شما در مجموع ${toPersianDigits(formatMinutesToHours(totalMinutesThisWeek))} زمان تمرکز داشته‌اید و در ${toPersianDigits(activeDaysCount)} روز از هفته فعال بوده‌اید. `;

    if (topCategory) {
      const topCatPercent = Math.round((topCategoryMins / totalMinutesThisWeek) * 100);
      text += `بیشترین تمرکز شما روی بخش «${topCategory}» بود که ${toPersianDigits(topCatPercent)}٪ از کل فعالیت‌های این هفته را تشکیل می‌دهد. `;
    }

    if (goals.length > 0) {
      if (overallGoalPercent >= 80) {
        text += `مجموع پیشرفت شما در اهداف فعال به ${toPersianDigits(overallGoalPercent)}٪ رسیده است و در آستانه دستیابی کامل به اهداف خود قرار دارید!`;
      } else if (overallGoalPercent >= 40) {
        text += `پیشرفت کلی شما در اهداف ${toPersianDigits(overallGoalPercent)}٪ است. استمرار فعلی، شانس تحقق اهداف در زمان مقرر را به‌شدت افزایش می‌دهد.`;
      } else {
        text += `تاکنون ${toPersianDigits(overallGoalPercent)}٪ از اهداف تعریف‌شده محقق شده است. با افزایش زمان تمرکز روزانه، به اهداف اصلی نزدیک‌تر خواهید شد.`;
      }
    } else {
      text += 'پیشنهاد می‌شود برای اندازه‌گیری دقیق‌تر عملکرد، یک هدف جدید در پنل اهداف تعریف کنید.';
    }

    return text;
  };

  // Generate actionable tips
  const generateTips = () => {
    const tips: string[] = [];

    if (activeDaysCount < 3) {
      tips.push('تثبیت ثبات قدم: حداقل ۴ روز در هفته را به ثبت فعالیت اختصاص دهید؛ حتی روزی ۲۰ دقیقه تمرکز، ماندگاری عادت را تثبیت می‌کند.');
    } else if (activeDaysCount >= 5) {
      tips.push('حفظ ثبات عالی: شما پایداری بالایی دارید! اکنون می‌توانید با برنامه‌ریزی زمان‌های استراحت منظم، از افت انرژی جلوگیری کنید.');
    }

    if (topCategory && sortedCategories.length > 1) {
      const secondCat = sortedCategories[1][0];
      tips.push(`توازن فعالیت‌ها: بخش عمده زمان شما به «${topCategory}» اختصاص داشته است. برای حفظ تعادل، کمی زمان بیشتر به «${secondCat}» تخصیص دهید.`);
    } else if (sortedCategories.length === 1) {
      tips.push('تنوع‌بخشی: ثبت فعالیت‌ها در دسته‌بندی‌های مختلف، به شما دید همه‌جانبه‌تری از حوزه‌های توسعه شخصی می‌دهد.');
    }

    if (totalMinutesThisWeek < 180) { // < 3 hours
      tips.push('تکنیک پومودورو: استفاده از بازه‌های ۲۵ دقیقه‌ای تمرکز و ۵ دقیقه استراحت، شروع کار را آسان‌تر می‌سازد.');
    } else {
      tips.push('افزایش عمق تمرکز: بازه‌های زمانی نود دقیقه‌ای تمرکز عمیق (Deep Work) را برای موضوعات پیچیده‌تر امتحان کنید.');
    }

    return tips.slice(0, 2);
  };

  const analysisText = generateAnalysisText();
  const tips = generateTips();

  const handleCopyReport = () => {
    const reportSummary = `📊 گزارش عملکرد هفتگی
⏱ مجموع زمان تمرکز: ${formatMinutesToHours(totalMinutesThisWeek)}
📅 روزهای فعال: ${activeDaysCount} از ۷ روز
🎯 پیشرفت کلی اهداف: ${overallGoalPercent}٪
📌 حوزه اصلی: ${topCategory || 'ثبت نشده'}

${analysisText}`;

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
      className="bg-slate-800/40 rounded-2xl p-5 sm:p-6 border border-slate-700/50 relative overflow-hidden flex flex-col gap-5"
    >
      {/* Decorative Glow Effect */}
      <div className={`absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none ${activeTheme.swatchBg}`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder} flex items-center justify-center shadow-lg`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-sans">
              <span>گزارش و تحلیل هفتگی</span>
              <span className="text-[10px] font-mono font-normal bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full text-slate-400">
                هفته جاری
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تحلیل هوشمند میزان تمرکز و روند تحقق اهداف
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
            title={isExpanded ? 'بستن جزییات' : 'نمایش جزییات'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
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
              {toPersianDigits(totalHoursThisWeek)}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">ساعت</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>روزهای فعال</span>
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-amber-300">
              {toPersianDigits(activeDaysCount)} <span className="text-xs font-normal text-slate-500">/ ۷</span>
            </span>
            <span className="text-[10px] text-slate-500 font-sans">روز</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>پیشرفت اهداف</span>
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-lg font-extrabold font-mono text-emerald-400">
              ٪{toPersianDigits(overallGoalPercent)}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">کل</span>
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

      {/* Expanded Report Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="space-y-4 pt-1 overflow-hidden"
          >
            {/* Analysis Narrative Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs leading-relaxed text-slate-300 flex items-start gap-3">
              <Sparkles className={`w-5 h-5 ${activeTheme.textPrimary} shrink-0 mt-0.5 animate-pulse`} />
              <div className="space-y-1.5 flex-1">
                <span className="font-bold text-slate-100 block">تحلیل و سنجش روند:</span>
                <p className="text-slate-300 leading-relaxed font-sans">{analysisText}</p>
              </div>
            </div>

            {/* Smart Suggestions */}
            {tips.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>پیشنهادهای کاربردی برای هفته پیش‌رو:</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-300 flex items-start gap-2.5"
                    >
                      <ArrowUpRight className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Goal Proximity Visual Progress Bars */}
            {goals.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span>میزان نزدیکی به اهداف فعال:</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {toPersianDigits(goals.length)} هدف در حال پیگیری
                  </span>
                </div>

                <div className="space-y-2.5">
                  {goals.map(goal => {
                    const loggedFromActs = activities
                      .filter(a => a.goalId === goal.id)
                      .reduce((s, a) => s + (a.duration / 60), 0);
                    const currentTot = (goal.currentHours || 0) + loggedFromActs;
                    const pct = Math.min(Math.round((currentTot / goal.targetHours) * 100), 100);

                    return (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium text-slate-300">{goal.title}</span>
                          <span className="font-mono text-slate-400">
                            ٪{toPersianDigits(pct)} ({toPersianDigits(currentTot.toFixed(1))}/{toPersianDigits(goal.targetHours)}h)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              pct >= 100
                                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                                : pct >= 50
                                ? activeTheme.btnPrimary
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="text-slate-500">
                بروزرسانی بر اساس {toPersianDigits(weeklyActivities.length)} ثبت فعالیت این هفته
              </span>

              <button
                type="button"
                onClick={handleCopyReport}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
              >
                {copiedToast ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">گزارش کپی شد</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>کپی خلاصه گزارش</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
