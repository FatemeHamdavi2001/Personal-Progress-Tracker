// Non-repeating daily motivational quotes repository in Farsi and English

export const MOTIVATIONAL_QUOTES_FA = [
  "هر روز یک فرصت تازه است تا یک گام به هدف بزرگت نزدیک‌تر شوی.",
  "موفقیت حاصل مجموعه‌ای از تلاش‌های کوچک است که هر روز تکرار می‌شوند.",
  "بهترین زمان برای شروع همین الان است؛ نگذار فردا به حسرت تبدیل شود.",
  "اراده انسان قدرتمندتر از هر مانعی است که در مسیر قرار می‌گیرد.",
  "انضباط شخصی یعنی انتخاب آنچه بیشتر از همه می‌خواهی به جای آنچه اکنون می‌خواهی.",
  "استمرار و نظم رمز اصلی موفقیت برترین افراد جهان است.",
  "هیچ هدفی خیلی بزرگ نیست وقتی آن را به گام‌های کوچک و روزانه تقسیم کنی.",
  "امروز طوری تلاش کن که فردا از خودت تشکر کنی.",
  "تمرکز روی هدف، انرژی تو را مضاعف و مسیر را روشن می‌سازد.",
  "شکست هرگز پایان کار نیست، بلکه تجریه‌ای گرانبها برای اوج‌گیری مجدد است.",
  "ارزش یک ساعت تمرکز کامل بالاتر از روزها تلاش پراکنده است.",
  "تو توانایی ساختن آینده‌ای را داری که همواره آرزویش را داشتی.",
  "باور داشتن به خود اولین قدم در مسیر فتح قله‌های بزرگ است.",
  "هر عادت مثبت جدید یک دارایی باارزش برای تمام عمر توست.",
  "صبر و پایداری در مسیر، سخت‌ترین دره‌ها را به هموارترین راه‌ها تبدیل می‌کند.",
  "روی پیشرفت خودت تمرکز کن، نه مقایسه با دیگران.",
  "رویاهای بزرگ داشته باش و سخت برایشان تلاش کن.",
  "امروز کاری را انجام بده که آینده‌ات بابت آن از تو سپاسگزار باشد.",
  "قدرت واقعی در ادامه دادن است زمانی که بقیه ناامید می‌شوند.",
  "هر دقیقه زمان تو ارزشمند است؛ آن را با هوشمندی سرمایه‌گذاری کن.",
  "تغییرات کوچک امروز، نتایج فوق‌العاده فردایت را رقم می‌زنند.",
  "تسلیم شدن هرگز گزینه نیست؛ به خودت و مسیرت ایمان داشته باش.",
  "انرژی مثبت تو بهترین شتاب‌دهنده برای رسیدن به اهدافت است.",
  "پیشرفت‌های روزانه حتی اگر ۱٪ باشند در طول یک سال تحولی ۳۷ برابری می‌سازند.",
  "امروز روز توست؛ با انگیزه و قدرت کامل به پیش برو!",
  "کیفیت زندگی تو را کیفیت عادت‌های روزانه‌ات تعیین می‌کند.",
  "هیچ‌گاه قدرت قدم‌های کوچک اما پیوسته را دست‌کم نگیر.",
  "شجاعت یعنی شروع کار حتی زمانی که مسیر کاملاً روشن نیست.",
  "موفقیت‌های بزرگ با تعهدات کوچک شروع می‌شوند.",
  "تو از آنچه فکر می‌کنی شجاع‌تر، قوی‌تر و باهوش‌تر هستی."
];

export const MOTIVATIONAL_QUOTES_EN = [
  "Every day is a fresh opportunity to get one step closer to your dream.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "The best time to start was yesterday. The next best time is now.",
  "Self-discipline is choosing between what you want now and what you want most.",
  "Consistency is the secret ingredient that transforms average into excellence.",
  "No goal is too big when broken down into clear daily actions.",
  "Work hard today so your future self will thank you tomorrow.",
  "Focus turns energy into power and clears the path to victory.",
  "Failure is not the opposite of success; it is a stepping stone to it.",
  "An hour of deep focus is worth days of distracted effort.",
  "You have the power to create the future you have always envisioned.",
  "Believing in yourself is the first step toward achieving greatness.",
  "Focus on your own progress, not on comparing yourself to others.",
  "Dream big, stay focused, and keep pushing forward every single day.",
  "Patience and persistence turn the hardest challenges into smooth roads.",
  "Never underestimate the power of small, consistent daily steps.",
  "Your energy and focus are your most valuable assets—invest them wisely.",
  "Small changes today create extraordinary results tomorrow.",
  "Giving up is never an option; stay committed to your vision.",
  "1% improvement every day leads to 37x growth over a year.",
  "Today is your day—take bold action with full momentum!",
  "The quality of your life is determined by the quality of your habits.",
  "Courage is taking the first step even when the full path isn't visible.",
  "Great achievements begin with simple, unwavering daily commitments.",
  "You are braver than you believe, stronger than you seem, and smarter than you think."
];

export function getDailyMotivation(lang: 'fa' | 'en' = 'fa', customDate?: string): string {
  const dateStr = customDate || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const quotes = lang === 'en' ? MOTIVATIONAL_QUOTES_EN : MOTIVATIONAL_QUOTES_FA;
  const index = Math.abs(hash) % quotes.length;
  return quotes[index];
}
