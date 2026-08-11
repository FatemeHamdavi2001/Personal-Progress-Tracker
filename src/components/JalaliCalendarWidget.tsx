import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { ColorThemeConfig } from '../types/theme';
import {
  g2j,
  j2g,
  getJalaliMonthDays,
  getPersianStartWeekday,
  JALALI_MONTH_NAMES,
  toPersianDigits,
  formatDisplayDate,
  getTehranJalaliToday,
  getTehranTodayIso
} from '../utils/jalali';
import { Activity } from '../types/tracker';

interface JalaliCalendarWidgetProps {
  activities: Activity[];
  activeTheme: ColorThemeConfig;
  lang: 'fa' | 'en';
  onSelectDate?: (isoDate: string) => void;
  selectedDate?: string;
}

export const JalaliCalendarWidget: React.FC<JalaliCalendarWidgetProps> = ({
  activities,
  activeTheme,
  lang,
  onSelectDate,
  selectedDate
}) => {
  const [currentJy, currentJm, currentJd] = getTehranJalaliToday();
  const todayIso = getTehranTodayIso();

  // State for displayed month/year in calendar
  const [viewJy, setViewJy] = useState<number>(currentJy); // e.g. 1405
  const [viewJm, setViewJm] = useState<number>(currentJm); // 1-12

  // Previous Month
  const handlePrevMonth = () => {
    if (viewJm === 1) {
      setViewJm(12);
      setViewJy(prev => prev - 1);
    } else {
      setViewJm(prev => prev - 1);
    }
  };

  // Next Month
  const handleNextMonth = () => {
    if (viewJm === 12) {
      setViewJm(1);
      setViewJy(prev => prev + 1);
    } else {
      setViewJm(prev => prev + 1);
    }
  };

  // Reset to Current Today
  const handleTodayReset = () => {
    setViewJy(currentJy);
    setViewJm(currentJm);
  };

  const totalDays = getJalaliMonthDays(viewJy, viewJm);
  const startWeekday = getPersianStartWeekday(viewJy, viewJm); // 0: Sat ... 6: Fri

  // Weekday Labels
  const faWeekdays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const enWeekdays = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
  const weekdays = lang === 'fa' ? faWeekdays : enWeekdays;

  // Build activity lookup map by ISO date
  const activityDatesSet = new Set<string>();
  activities.forEach(a => {
    if (a.date) {
      activityDatesSet.add(a.date);
    }
  });

  return (
    <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 shadow-lg backdrop-blur-xl space-y-3">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder}`}>
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>{lang === 'fa' ? JALALI_MONTH_NAMES[viewJm - 1] : `Month ${viewJm}`}</span>
              <span className={`font-mono ${activeTheme.textPrimary}`}>
                {lang === 'fa' ? toPersianDigits(viewJy) : viewJy}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">
              {lang === 'fa' ? `تقویم ماهانه سال ${toPersianDigits(viewJy)}` : `Monthly Jalali Calendar (${viewJy})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleTodayReset}
            className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-all cursor-pointer font-medium"
            title={lang === 'fa' ? 'امروز' : 'Today'}
          >
            {lang === 'fa' ? 'امروز' : 'Today'}
          </button>
          <button
            type="button"
            onClick={lang === 'fa' ? handleNextMonth : handlePrevMonth}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={lang === 'fa' ? handlePrevMonth : handleNextMonth}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Grid Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, idx) => (
          <div
            key={idx}
            className={`text-[10px] font-bold py-1 ${idx === 6 ? 'text-red-400' : 'text-slate-400'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {/* Empty slots before first day */}
        {Array.from({ length: startWeekday }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-7" />
        ))}

        {/* Days of month */}
        {Array.from({ length: totalDays }).map((_, idx) => {
          const dayNum = idx + 1;
          const isToday = viewJy === currentJy && viewJm === currentJm && dayNum === currentJd;

          // Compute ISO date string for this day
          const [gy, gm, gd] = j2g(viewJy, viewJm, dayNum);
          const pad = (n: number) => (n < 10 ? '0' + n : String(n));
          const dayIso = `${gy}-${pad(gm)}-${pad(gd)}`;

          const hasActivity = activityDatesSet.has(dayIso);
          const isSelected = selectedDate === dayIso;

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => onSelectDate && onSelectDate(dayIso)}
              className={`h-7.5 w-full rounded-lg flex flex-col items-center justify-center relative transition-all text-xs font-mono cursor-pointer ${
                isToday
                  ? `${activeTheme.btnPrimary} text-slate-950 font-extrabold shadow-md scale-105 z-10`
                  : isSelected
                  ? `bg-slate-700 text-slate-100 font-bold border ${activeTheme.borderAccent}`
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
              }`}
            >
              <span>{lang === 'fa' ? toPersianDigits(dayNum) : dayNum}</span>
              {hasActivity && (
                <span
                  className={`w-1 h-1 rounded-full absolute bottom-1 ${
                    isToday ? 'bg-slate-950' : activeTheme.badgeBg
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
