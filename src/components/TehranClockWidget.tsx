import React, { useState, useEffect } from 'react';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { getTehranDateParts, formatTehranTime, getTehranJalaliToday, JALALI_MONTH_NAMES, toPersianDigits, getPersianDayName } from '../utils/jalali';
import { Language } from '../utils/translations';

interface TehranClockWidgetProps {
  lang?: Language;
}

export const TehranClockWidget: React.FC<TehranClockWidgetProps> = ({ lang = 'fa' }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentLang: 'fa' | 'en' = lang === 'en' ? 'en' : 'fa';
  const tehranParts = getTehranDateParts(now);
  const [jy, jm, jd] = getTehranJalaliToday();
  const dayName = getPersianDayName(now, currentLang);
  const timeFormatted = formatTehranTime(now, currentLang);

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 shadow-md hover:border-slate-600 transition-all text-xs font-sans select-none">
      {/* Pulse Live Dot */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
      </div>

      {/* Live Time */}
      <div className="font-mono font-bold text-slate-100 text-sm tracking-wide">
        {timeFormatted}
      </div>

      {/* Tehran Date & Timezone */}
      <div className="hidden sm:flex flex-col text-[10px] text-slate-400 border-r border-slate-700/80 pr-2.5 mr-0.5">
        <span className="font-medium text-slate-300">
          {lang === 'fa'
            ? `${dayName}، ${toPersianDigits(jd)} ${JALALI_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`
            : `${tehranParts.year}-${tehranParts.month}-${tehranParts.day}`}
        </span>
        <span className="text-[9px] text-teal-400/90 font-mono flex items-center gap-0.5">
          <MapPin className="w-2.5 h-2.5" />
          <span>{lang === 'fa' ? 'تهران (GMT+3:30)' : 'Tehran Time'}</span>
        </span>
      </div>
    </div>
  );
};
