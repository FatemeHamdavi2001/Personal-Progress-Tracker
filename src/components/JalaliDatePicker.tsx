import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { g2j, j2g, JALALI_MONTH_NAMES, toPersianDigits, getJalaliMonthDays } from '../utils/jalali';

interface JalaliDatePickerProps {
  valueIso: string; // YYYY-MM-DD
  onChangeIso: (isoDate: string) => void;
  lang: 'fa' | 'en';
  activeThemeAccent?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  valueIso,
  onChangeIso,
  lang,
  activeThemeAccent = 'teal'
}) => {
  // Parse valueIso into Jalali
  const dateObj = valueIso ? new Date(valueIso) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const [initJy, initJm, initJd] = g2j(validDate.getFullYear(), validDate.getMonth() + 1, validDate.getDate());

  const [jy, setJy] = useState<number>(initJy);
  const [jm, setJm] = useState<number>(initJm);
  const [jd, setJd] = useState<number>(initJd);

  // Sync state if props valueIso changes externally
  useEffect(() => {
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
    onChangeIso(newIso);
  };

  const yearsOptions = [1403, 1404, 1405, 1406, 1407];
  const daysInMonth = getJalaliMonthDays(jy, jm);

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 border border-slate-700/80 rounded-xl">
        {/* Day Select */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-0.5 px-1">{lang === 'fa' ? 'روز' : 'Day'}:</label>
          <select
            value={jd}
            onChange={e => updateDate(jy, jm, Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-mono cursor-pointer"
          >
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dNum = idx + 1;
              return (
                <option key={dNum} value={dNum}>
                  {lang === 'fa' ? toPersianDigits(dNum) : dNum}
                </option>
              );
            })}
          </select>
        </div>

        {/* Month Select */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-0.5 px-1">{lang === 'fa' ? 'ماه' : 'Month'}:</label>
          <select
            value={jm}
            onChange={e => updateDate(jy, jm, Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-sans cursor-pointer"
          >
            {JALALI_MONTH_NAMES.map((mName, idx) => (
              <option key={mName} value={idx + 1}>
                {lang === 'fa' ? mName : `Month ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        {/* Year Select */}
        <div>
          <label className="block text-[10px] text-slate-400 mb-0.5 px-1">{lang === 'fa' ? 'سال' : 'Year'}:</label>
          <select
            value={jy}
            onChange={e => updateDate(Number(e.target.value), jm, jd)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-500 font-mono cursor-pointer"
          >
            {yearsOptions.map(yNum => (
              <option key={yNum} value={yNum}>
                {lang === 'fa' ? toPersianDigits(yNum) : yNum}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1 text-teal-400 font-semibold">
          <Calendar className="w-3 h-3" />
          <span>
            {lang === 'fa'
              ? `${toPersianDigits(jd)} ${JALALI_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`
              : `${valueIso}`}
          </span>
        </span>
      </div>
    </div>
  );
};
