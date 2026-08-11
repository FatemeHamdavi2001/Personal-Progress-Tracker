import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, RotateCcw } from 'lucide-react';
import { g2j, j2g, jalaliToIso, JALALI_MONTH_NAMES, toPersianDigits, getJalaliMonthDays } from '../utils/jalali';
import { ColorThemeConfig } from '../types/theme';

interface JalaliDatePickerProps {
  value: string; // ISO format 'YYYY-MM-DD'
  onChange: (isoDate: string) => void;
  activeTheme: ColorThemeConfig;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  activeTheme
}) => {
  const todayObj = new Date();
  const todayIso = todayObj.toISOString().split('T')[0];

  // Parse ISO string to Gregorian then Jalali
  const parseIsoToJalali = (isoStr: string): [number, number, number] => {
    try {
      const parts = (isoStr || todayIso).split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return g2j(parts[0], parts[1], parts[2]);
      }
    } catch {
      // fallback
    }
    return g2j(todayObj.getFullYear(), todayObj.getMonth() + 1, todayObj.getDate());
  };

  const [jy, jm, jd] = parseIsoToJalali(value);

  const maxDays = getJalaliMonthDays(jy, jm);

  // Years array around current year
  const currentJy = parseIsoToJalali(todayIso)[0];
  const years = [currentJy - 2, currentJy - 1, currentJy, currentJy + 1, currentJy + 2];

  const handleYearChange = (newJy: number) => {
    const validJd = Math.min(jd, getJalaliMonthDays(newJy, jm));
    const newIso = jalaliToIso(newJy, jm, validJd);
    onChange(newIso);
  };

  const handleMonthChange = (newJm: number) => {
    const validJd = Math.min(jd, getJalaliMonthDays(jy, newJm));
    const newIso = jalaliToIso(jy, newJm, validJd);
    onChange(newIso);
  };

  const handleDayChange = (newJd: number) => {
    const newIso = jalaliToIso(jy, jm, newJd);
    onChange(newIso);
  };

  const setToday = () => {
    onChange(todayIso);
  };

  const setYesterday = () => {
    const yest = new Date(todayObj);
    yest.setDate(yest.getDate() - 1);
    onChange(yest.toISOString().split('T')[0]);
  };

  const isTodaySelected = value === todayIso;

  return (
    <div className="space-y-2">
      {/* Header Display / Quick Shortcuts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-200 font-sans font-bold">
          <CalendarIcon className={`w-3.5 h-3.5 ${activeTheme.textPrimary}`} />
          <span>{toPersianDigits(jd)} {JALALI_MONTH_NAMES[jm - 1]} {toPersianDigits(jy)}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={setToday}
            className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer ${
              isTodaySelected
                ? `${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.badgeBorder} font-bold`
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            امروز
          </button>
          <button
            type="button"
            onClick={setYesterday}
            className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 rounded text-[10px] font-sans transition-all cursor-pointer"
          >
            دیروز
          </button>
        </div>
      </div>

      {/* Dropdown Selectors for Day, Month, Year */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Day Select */}
        <div className="relative">
          <select
            value={jd}
            onChange={e => handleDayChange(Number(e.target.value))}
            className={`w-full bg-slate-900 border border-slate-700/90 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:${activeTheme.borderAccent} font-sans appearance-none cursor-pointer pr-2 pl-6`}
          >
            {Array.from({ length: maxDays }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>
                {toPersianDigits(day)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
        </div>

        {/* Month Select */}
        <div className="relative">
          <select
            value={jm}
            onChange={e => handleMonthChange(Number(e.target.value))}
            className={`w-full bg-slate-900 border border-slate-700/90 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:${activeTheme.borderAccent} font-sans appearance-none cursor-pointer pr-2 pl-6`}
          >
            {JALALI_MONTH_NAMES.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
        </div>

        {/* Year Select */}
        <div className="relative">
          <select
            value={jy}
            onChange={e => handleYearChange(Number(e.target.value))}
            className={`w-full bg-slate-900 border border-slate-700/90 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:${activeTheme.borderAccent} font-sans appearance-none cursor-pointer pr-2 pl-6`}
          >
            {years.map(yr => (
              <option key={yr} value={yr}>
                {toPersianDigits(yr)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-slate-500 absolute left-2 top-2.5 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
