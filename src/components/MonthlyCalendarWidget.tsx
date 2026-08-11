import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Plus, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import {
  g2j,
  toPersianDigits,
  JALALI_MONTH_NAMES,
  getJalaliMonthDays,
  getPersianStartWeekday,
  jalaliToIso,
  formatMinutesToHours,
  getTehranJalaliToday,
  getTehranTodayIso
} from '../utils/jalali';
import { Activity } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';

interface MonthlyCalendarWidgetProps {
  activities: Activity[];
  actDate: string; // ISO date string YYYY-MM-DD
  onSelectDate: (isoDate: string, persianDateStr: string) => void;
  activeTheme: ColorThemeConfig;
}

export const MonthlyCalendarWidget: React.FC<MonthlyCalendarWidgetProps> = ({
  activities,
  actDate,
  onSelectDate,
  activeTheme
}) => {
  const [todayJy, todayJm, todayJd] = getTehranJalaliToday();
  const todayIso = getTehranTodayIso();

  const [currentJy, setCurrentJy] = useState(todayJy);
  const [currentJm, setCurrentJm] = useState(todayJm);
  const [selectedNotice, setSelectedNotice] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (currentJm === 1) {
      setCurrentJm(12);
      setCurrentJy(prev => prev - 1);
    } else {
      setCurrentJm(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentJm === 12) {
      setCurrentJm(1);
      setCurrentJy(prev => prev + 1);
    } else {
      setCurrentJm(prev => prev + 1);
    }
  };

  const handleResetToToday = () => {
    setCurrentJy(todayJy);
    setCurrentJm(todayJm);
  };

  const totalDays = getJalaliMonthDays(currentJy, currentJm);
  const startWeekday = getPersianStartWeekday(currentJy, currentJm);

  // Weekday column names
  const weekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  // Days array
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  const handleDayClick = (dayNum: number) => {
    const iso = jalaliToIso(currentJy, currentJm, dayNum);
    const pStr = `${toPersianDigits(dayNum)} ${JALALI_MONTH_NAMES[currentJm - 1]}`;
    onSelectDate(iso, pStr);
    
    setSelectedNotice(`تاریخ انتخاب شد: ${pStr} - فرم آماده ثبت است`);
    setTimeout(() => {
      setSelectedNotice(null);
    }, 4000);

    // Scroll to form smoothly
    const formEl = document.getElementById('add-activity-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
      className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 flex flex-col gap-4 relative"
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className={`w-5 h-5 ${activeTheme.textPrimary}`} />
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5 font-sans">
            <span>{JALALI_MONTH_NAMES[currentJm - 1]}</span>
            <span className="text-slate-400 font-mono text-xs">{toPersianDigits(currentJy)}</span>
          </h2>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleResetToToday}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-lg text-[11px] font-sans transition-colors cursor-pointer"
            title="بازگشت به ماه جاری"
          >
            امروز
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="ماه بعدی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="ماه قبلی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {selectedNotice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center justify-between ${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.badgeBorder}`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>{selectedNotice}</span>
          </span>
          <a
            href="#add-activity-form"
            className="underline font-bold text-[11px] hover:opacity-80"
          >
            ثبت فعالیت
          </a>
        </motion.div>
      )}

      {/* Grid Header (Weekdays) */}
      <div className="grid grid-cols-7 text-center gap-1 text-[11px] font-semibold text-slate-400 border-b border-slate-700/60 pb-2">
        {weekdays.map((wd, i) => (
          <div key={i} className={i === 6 ? 'text-rose-400' : 'text-slate-400'}>
            {wd}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {/* Leading empty cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 sm:h-9" />
        ))}

        {/* Days */}
        {daysArray.map(dayNum => {
          const iso = jalaliToIso(currentJy, currentJm, dayNum);
          const isToday = iso === todayIso;
          const isSelected = iso === actDate;

          // Compute activity metrics for this day
          const dayActs = activities.filter(a => a.date === iso);
          const dayMins = dayActs.reduce((sum, a) => sum + a.duration, 0);

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => handleDayClick(dayNum)}
              className={`h-8 sm:h-9 rounded-xl text-xs font-mono font-medium flex flex-col items-center justify-center relative transition-all cursor-pointer group ${
                isSelected
                  ? `${activeTheme.badgeBg} border-2 ${activeTheme.borderAccent} font-bold ${activeTheme.textPrimary} shadow-md`
                  : isToday
                  ? 'bg-slate-700/80 text-white font-bold border border-slate-500'
                  : dayMins > 0
                  ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>{toPersianDigits(dayNum)}</span>

              {/* Activity indicator dot or bar */}
              {dayMins > 0 && (
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${
                    isSelected
                      ? activeTheme.dotBg
                      : 'bg-emerald-400 animate-pulse'
                  }`}
                />
              )}

              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-slate-950 border border-slate-700 text-slate-100 text-[10px] font-sans px-2 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 flex items-center gap-1">
                <span>{toPersianDigits(dayNum)} {JALALI_MONTH_NAMES[currentJm - 1]}</span>
                {dayMins > 0 ? (
                  <span className={`${activeTheme.textPrimary} font-bold font-mono`}>
                    ({formatMinutesToHours(dayMins)})
                  </span>
                ) : (
                  <span className="text-slate-500">(بدون فعالیت)</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend & Quick Action */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-700 border border-slate-500" />
            <span>امروز</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>فعالیت‌دار</span>
          </span>
        </div>
        <a
          href="#add-activity-form"
          className={`flex items-center gap-1 ${activeTheme.textPrimary} hover:underline font-medium text-[11px]`}
        >
          <Plus className="w-3 h-3" />
          <span>ثبت برای تاریخ دلخواه</span>
        </a>
      </div>
    </motion.div>
  );
};
