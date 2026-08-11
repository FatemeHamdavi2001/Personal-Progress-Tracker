export interface UserAccount {
  id: string;
  username: string; // unique lowercase, e.g. "nazanin", "ali"
  displayName: string; // e.g. "نازنین", "علی"
  password: string; // e.g. "1234"
  avatarColor: string; // color identifier e.g. "teal", "blue", "purple", "emerald", "amber", "rose"
  createdAt: string;
  lastLoginAt?: string;
  loginCount?: number;
  role?: 'admin' | 'user';
}

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  displayName: string;
  event: 'login' | 'logout';
  timestamp: string; // ISO string
  jalaliDate: string; // YYYY/MM/DD
  jalaliTime: string; // HH:mm:ss
}

export const AVATAR_COLORS = [
  { id: 'teal', name: 'فیروزه‌ای', bgClass: 'bg-teal-500/20 text-teal-400 border-teal-500/40', badgeClass: 'bg-teal-500 text-slate-950' },
  { id: 'blue', name: 'آبی', bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/40', badgeClass: 'bg-blue-500 text-slate-950' },
  { id: 'purple', name: 'بنفش', bgClass: 'bg-purple-500/20 text-purple-400 border-purple-500/40', badgeClass: 'bg-purple-500 text-white' },
  { id: 'emerald', name: 'زمردی', bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', badgeClass: 'bg-emerald-500 text-slate-950' },
  { id: 'amber', name: 'کهربایی', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/40', badgeClass: 'bg-amber-500 text-slate-950' },
  { id: 'rose', name: 'گل‌بهی', bgClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40', badgeClass: 'bg-rose-500 text-white' },
];
