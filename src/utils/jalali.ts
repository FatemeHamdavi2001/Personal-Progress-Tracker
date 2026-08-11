// Persian Jalali date helpers and digit converter

export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

// Get Date components specifically for Tehran Timezone (Asia/Tehran)
export function getTehranDateParts(d: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  dayOfWeek: number;
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tehran',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });

    const parts = formatter.formatToParts(d);
    const map: Record<string, string> = {};
    parts.forEach(p => { map[p.type] = p.value; });

    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10);
    const day = parseInt(map.day, 10);
    let hours = parseInt(map.hour, 10);
    if (hours === 24) hours = 0; // Handle 24-hour edge case in Intl
    const minutes = parseInt(map.minute, 10);
    const seconds = parseInt(map.second, 10);

    const tehranDateObj = new Date(year, month - 1, day);
    const dayOfWeek = tehranDateObj.getDay();

    return { year, month, day, hours, minutes, seconds, dayOfWeek };
  } catch (err) {
    // Fallback if Intl timeZone fails
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    const dayOfWeek = d.getDay();
    return { year, month, day, hours, minutes, seconds, dayOfWeek };
  }
}

// Get Tehran current ISO date string YYYY-MM-DD
export function getTehranTodayIso(): string {
  const { year, month, day } = getTehranDateParts();
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return `${year}-${pad(month)}-${pad(day)}`;
}

// Get Tehran current Jalali tuple [jy, jm, jd]
export function getTehranJalaliToday(): [number, number, number] {
  const { year, month, day } = getTehranDateParts();
  return g2j(year, month, day);
}

// Format Tehran live time string (HH:MM:SS)
export function formatTehranTime(d: Date = new Date(), lang: 'fa' | 'en' = 'fa'): string {
  const { hours, minutes, seconds } = getTehranDateParts(d);
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  const timeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return lang === 'fa' ? toPersianDigits(timeStr) : timeStr;
}

// Gregorian to Jalali converter
export function g2j(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return [jy, jm, jd];
}

export function formatJalaliDate(dateInput: Date | string | number): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }
  const [jy, jm, jd] = g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

export function formatJalaliTime(dateInput?: Date | string | number): string {
  const date = dateInput ? (dateInput instanceof Date ? dateInput : new Date(dateInput)) : new Date();
  if (isNaN(date.getTime())) return '00:00:00';
  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function getPersianDayName(dateInput: Date | string | number, lang: 'fa' | 'en' = 'fa'): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  if (lang === 'en') {
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return enDays[date.getDay()];
  }
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
  return days[date.getDay()];
}

export const JALALI_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const GREGORIAN_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Language-aware Date Formatter (Jalali vs Gregorian)
export function formatDisplayDate(dateInput: Date | string | number, lang: 'fa' | 'en' = 'fa'): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  if (lang === 'fa') {
    const [jy, jm, jd] = g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const pad = (n: number) => n < 10 ? '0' + n : String(n);
    return toPersianDigits(`${jy}/${pad(jm)}/${pad(jd)}`);
  } else {
    const pad = (n: number) => n < 10 ? '0' + n : String(n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}

export function formatDisplayDateWithMonth(dateInput: Date | string | number, lang: 'fa' | 'en' = 'fa'): string {
  if (!dateInput) return '-';
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  if (lang === 'fa') {
    const [jy, jm, jd] = g2j(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return `${toPersianDigits(jd)} ${JALALI_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`;
  } else {
    return `${GREGORIAN_MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
}

// Jalali to Gregorian converter
export function j2g(jy: number, jm: number, jd: number): [number, number, number] {
  let jy2 = (jy <= 979) ? jy : jy - 979;
  let gy = (jy <= 979) ? 621 : 1600;
  let days = (365 * jy2) + Math.floor(jy2 / 33) * 8 + Math.floor(((jy2 % 33) + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gm = 0;
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (gm = 1; gm <= 12; gm++) {
    const v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return [gy, gm, gd];
}

export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const [gy, gm, gd] = j2g(jy, jm, jd);
  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  return `${gy}-${pad(gm)}-${pad(gd)}`;
}

export function getJalaliMonthDays(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  const isLeap = ((jy - (jy > 0 ? 474 : 473)) % 2820 + 474 + 38) * 682 % 2816 < 682;
  return isLeap ? 30 : 29;
}

export function getPersianStartWeekday(jy: number, jm: number): number {
  const [gy, gm, gd] = j2g(jy, jm, 1);
  const dateObj = new Date(gy, gm - 1, gd);
  const gDay = dateObj.getDay(); // 0: Sun, 1: Mon ... 6: Sat
  return (gDay + 1) % 7; // 0: Sat, 1: Sun ... 6: Fri
}

export function formatMinutesToHours(mins: number, lang: 'fa' | 'en' = 'fa'): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (lang === 'en') {
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  if (h === 0) return `${toPersianDigits(m)} د`;
  if (m === 0) return `${toPersianDigits(h)} س`;
  return `${toPersianDigits(h)} س و ${toPersianDigits(m)} د`;
}
