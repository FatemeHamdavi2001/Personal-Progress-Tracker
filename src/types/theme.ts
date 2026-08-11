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
