export type ColorThemeKey = 'teal' | 'blue' | 'purple' | 'black' | 'gray' | 'pink' | 'cherry';

export interface ColorThemeConfig {
  id: ColorThemeKey;
  name: string;
  dotBg: string;
  textPrimary: string;
  textLight: string;
  gradientText: string;
  btnPrimary: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  borderAccent: string;
  ringAccent: string;
  shadowGlow: string;
  chartBarSelected: string;
  chartBarToday: string;
  chartBarRegular: string;
  swatchBg: string;
  activeFilterBtn: string;
}

export const COLOR_THEMES: Record<ColorThemeKey, ColorThemeConfig> = {
  teal: {
    id: 'teal',
    name: 'فیروزه‌ای (پیش‌فرض)',
    dotBg: 'bg-teal-400',
    textPrimary: 'text-teal-400',
    textLight: 'text-teal-300',
    gradientText: 'from-teal-400 to-cyan-500',
    btnPrimary: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold',
    badgeBg: 'bg-teal-500/20',
    badgeBorder: 'border-teal-500/40',
    badgeText: 'text-teal-300',
    borderAccent: 'border-teal-500',
    ringAccent: 'ring-teal-500',
    shadowGlow: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]',
    chartBarSelected: '#14B8A6',
    chartBarToday: '#2DD4BF',
    chartBarRegular: '#0F766E',
    swatchBg: '#14B8A6',
    activeFilterBtn: 'bg-teal-500 text-slate-950'
  },
  blue: {
    id: 'blue',
    name: 'آبی اقیانوسی',
    dotBg: 'bg-blue-400',
    textPrimary: 'text-blue-400',
    textLight: 'text-blue-300',
    gradientText: 'from-blue-400 to-sky-500',
    btnPrimary: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold',
    badgeBg: 'bg-blue-500/20',
    badgeBorder: 'border-blue-500/40',
    badgeText: 'text-blue-300',
    borderAccent: 'border-blue-500',
    ringAccent: 'ring-blue-500',
    shadowGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    chartBarSelected: '#3B82F6',
    chartBarToday: '#60A5FA',
    chartBarRegular: '#1D4ED8',
    swatchBg: '#3B82F6',
    activeFilterBtn: 'bg-blue-500 text-slate-950'
  },
  purple: {
    id: 'purple',
    name: 'بنفش سلطنتی',
    dotBg: 'bg-purple-400',
    textPrimary: 'text-purple-400',
    textLight: 'text-purple-300',
    gradientText: 'from-purple-400 to-fuchsia-500',
    btnPrimary: 'bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-500/40',
    badgeText: 'text-purple-300',
    borderAccent: 'border-purple-500',
    ringAccent: 'ring-purple-500',
    shadowGlow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    chartBarSelected: '#A855F7',
    chartBarToday: '#C084FC',
    chartBarRegular: '#6B21A8',
    swatchBg: '#A855F7',
    activeFilterBtn: 'bg-purple-500 text-slate-950'
  },
  black: {
    id: 'black',
    name: 'سیاه مینیمال',
    dotBg: 'bg-slate-200',
    textPrimary: 'text-slate-100',
    textLight: 'text-slate-300',
    gradientText: 'from-slate-100 to-slate-400',
    btnPrimary: 'bg-slate-200 hover:bg-white text-slate-950 font-bold',
    badgeBg: 'bg-slate-800',
    badgeBorder: 'border-slate-600',
    badgeText: 'text-slate-200',
    borderAccent: 'border-slate-400',
    ringAccent: 'ring-slate-400',
    shadowGlow: 'shadow-[0_0_15px_rgba(255,255,255,0.2)]',
    chartBarSelected: '#E2E8F0',
    chartBarToday: '#F8FAFC',
    chartBarRegular: '#475569',
    swatchBg: '#64748B',
    activeFilterBtn: 'bg-slate-200 text-slate-950'
  },
  gray: {
    id: 'gray',
    name: 'خاکستری مدرن',
    dotBg: 'bg-zinc-400',
    textPrimary: 'text-zinc-300',
    textLight: 'text-zinc-400',
    gradientText: 'from-zinc-200 to-zinc-400',
    btnPrimary: 'bg-zinc-400 hover:bg-zinc-300 text-slate-950 font-bold',
    badgeBg: 'bg-zinc-800/60',
    badgeBorder: 'border-zinc-700',
    badgeText: 'text-zinc-300',
    borderAccent: 'border-zinc-500',
    ringAccent: 'ring-zinc-400',
    shadowGlow: 'shadow-[0_0_15px_rgba(161,161,170,0.2)]',
    chartBarSelected: '#A1A1AA',
    chartBarToday: '#D4D4D8',
    chartBarRegular: '#3F3F46',
    swatchBg: '#71717A',
    activeFilterBtn: 'bg-zinc-400 text-slate-950'
  },
  pink: {
    id: 'pink',
    name: 'صورتی مدرن',
    dotBg: 'bg-pink-400',
    textPrimary: 'text-pink-400',
    textLight: 'text-pink-300',
    gradientText: 'from-pink-400 to-rose-400',
    btnPrimary: 'bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold',
    badgeBg: 'bg-pink-500/20',
    badgeBorder: 'border-pink-500/40',
    badgeText: 'text-pink-300',
    borderAccent: 'border-pink-500',
    ringAccent: 'ring-pink-500',
    shadowGlow: 'shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    chartBarSelected: '#EC4899',
    chartBarToday: '#F472B6',
    chartBarRegular: '#9D174D',
    swatchBg: '#EC4899',
    activeFilterBtn: 'bg-pink-500 text-slate-950'
  },
  cherry: {
    id: 'cherry',
    name: 'گیلاسی / یاقوتی',
    dotBg: 'bg-rose-500',
    textPrimary: 'text-rose-400',
    textLight: 'text-rose-300',
    gradientText: 'from-rose-400 to-red-500',
    btnPrimary: 'bg-rose-600 hover:bg-rose-500 text-white font-bold',
    badgeBg: 'bg-rose-500/20',
    badgeBorder: 'border-rose-500/40',
    badgeText: 'text-rose-300',
    borderAccent: 'border-rose-500',
    ringAccent: 'ring-rose-500',
    shadowGlow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    chartBarSelected: '#F43F5E',
    chartBarToday: '#FB7185',
    chartBarRegular: '#9F1239',
    swatchBg: '#F43F5E',
    activeFilterBtn: 'bg-rose-600 text-white'
  }
};

export const AVATAR_COLORS = [
  { id: 'teal', name: 'فیروزه‌ای', bgClass: 'bg-teal-500/20 text-teal-400 border-teal-500/40' },
  { id: 'purple', name: 'بنفش', bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  { id: 'blue', name: 'آبی', bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  { id: 'amber', name: 'طلایی', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  { id: 'emerald', name: 'زمردی', bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  { id: 'pink', name: 'صورتی', bgClass: 'bg-pink-500/20 text-pink-400 border-pink-500/40' }
];
