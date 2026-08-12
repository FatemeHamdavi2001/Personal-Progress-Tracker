import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { g2j, j2g, JALALI_MONTH_NAMES, toPersianDigits, getJalaliMonthDays } from '../utils/jalali';

interface JalaliDatePickerProps {
  valueIso: string;
  onChangeIso: (isoDate: string) => void;
  lang: 'fa' | 'en';
  activeThemeAccent?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  valueIso,
  onChangeIso,
  lang,
}) => {
  const dateObj = valueIso ? new Date(valueIso) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const [initJy, initJm, initJd] = g2j(validDate.getFullYear(), validDate.getMonth() + 1, validDate.getDate());

  const [jy, setJy] = useState<number>(initJy);
  const [jm, setJm] = useState<number>(initJm);
  const [jd, setJd] = useState<number>(initJd);

  // ref برای اینکه بدونیم تغییر از داخل کامپوننت هست یا از بیرون
  const isInternalChange = useRef(false);

  // فقط وقتی valueIso از بیرون تغییر کنه، state رو به‌روز کن
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const d = valueIso ? new Date(valueIso) : new Date();
    if (!isNaN(d.getTime())) {
      const [y, m, day] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
      setJy(y);
      setJm(m);
      setJd(day);
    }
  }, [valueIso]);

  const updateDate = (newJy: number, newJm: number, newJd: number) => {
    const maxDays = getJalaliMonthDays(newJy, newJm);
    const validJd = Math.min(newJd, maxDays);

    setJy(newJy);
    setJm(newJm);
    setJd(validJd);

    const [gy, gm, gd] = j2g(newJy, newJm, validJd);
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const newIso = `${gy}-${pad(gm)}-${pad(gd)}`;

    // علامت بزن که این تغییر از داخل کامپوننت بوده
    isInternalChange.current = true;
    onChangeIso(newIso);
  };

  const handleMonthChange = (delta: number) => {
    let newMonth = jm + delta;
    let newYear = jy;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
    const maxDays = getJalaliMonthDays(newYear, newMonth);
    const newDay = Math.min(jd, maxDays);
    updateDate(newYear, newMonth, newDay);
  };

  const handleYearChange = (delta: number) => {
    const newYear = jy + delta;
    if (newYear < 1300 || newYear > 1500) return;
    const maxDays = getJalaliMonthDays(newYear, jm);
    const newDay = Math.min(jd, maxDays);
    updateDate(newYear, jm, newDay);
  };

  const handleDayClick = (day: number) => {
    updateDate(jy, jm, day);
  };

  const daysInMonth = getJalaliMonthDays(jy, jm);
  const currentMonthName = JALALI_MONTH_NAMES[jm - 1];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between bg-slate-950 p-2 border border-slate-700/80 rounded-xl">
        <button
          type="button"
          onClick={() => handleMonthChange(-1)}
          className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleYearChange(-1)}
            className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>

          <span className="font-bold text-slate-200 text-sm">
            {lang === 'fa'
              ? `${currentMonthName} ${toPersianDigits(jy)}`
              : `${jy} ${currentMonthName}`}
          </span>

          <button
            type="button"
            onClick={() => handleYearChange(1)}
            className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => handleMonthChange(1)}
          className="p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="bg-slate-950 p-1.5 border border-slate-700/80 rounded-xl">
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = dayNum === jd;
            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDayClick(dayNum)}
                className={`py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {lang === 'fa' ? toPersianDigits(dayNum) : dayNum}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1 text-teal-400 font-semibold">
          <Calendar className="w-3 h-3" />
          <span>
            {lang === 'fa'
              ? `${toPersianDigits(jd)} ${currentMonthName} ${toPersianDigits(jy)}`
              : `${valueIso}`}
          </span>
        </span>
      </div>
    </div>
  );
};