import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Target, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  BookOpen, 
  Code, 
  Dumbbell, 
  Languages, 
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  X,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  Settings,
  Maximize,
  Minimize,
  User,
  UserPlus,
  UserCheck,
  Users,
  UserCircle,
  LogIn,
  Download,
  FileJson,
  FileSpreadsheet,
  Palette,
  Tags,
  Edit3,
  RotateCcw,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Activity, Goal, INITIAL_ACTIVITIES, INITIAL_GOALS, DEFAULT_CATEGORIES } from './types/tracker';
import { UserAccount, AVATAR_COLORS } from './types/user';
import { toPersianDigits, formatJalaliDate, getPersianDayName, formatMinutesToHours, g2j } from './utils/jalali';
import { MonthlyCalendarWidget } from './components/MonthlyCalendarWidget';
import { WeeklyReportWidget } from './components/WeeklyReportWidget';
import { DailyChecklistWidget } from './components/DailyChecklistWidget';
import { GeminiChatbotWidget } from './components/GeminiChatbotWidget';
import { JalaliDatePicker } from './components/JalaliDatePicker';
import { ProgressSummaryWidget } from './components/ProgressSummaryWidget';
import { ColorThemeKey, ColorThemeConfig } from './types/theme';

export const COLOR_THEMES: Record<ColorThemeKey, ColorThemeConfig> = {
  teal: {
    id: 'teal',
    name: 'زمردی / فیروزه‌ای',
    dotBg: 'bg-teal-400',
    textPrimary: 'text-teal-400',
    textLight: 'text-teal-300',
    gradientText: 'from-teal-400 to-emerald-400',
    btnPrimary: 'bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950',
    badgeBg: 'bg-teal-500/10',
    badgeBorder: 'border-teal-500/30',
    badgeText: 'text-teal-300',
    borderAccent: 'border-teal-500/30',
    ringAccent: 'ring-teal-400',
    shadowGlow: 'shadow-teal-500/20',
    chartBarSelected: 'bg-gradient-to-t from-teal-500 to-emerald-300 shadow-xl shadow-teal-500/40',
    chartBarToday: 'bg-gradient-to-t from-teal-600 to-teal-400 shadow-lg shadow-teal-500/20',
    chartBarRegular: 'bg-gradient-to-t from-teal-700 to-teal-500 group-hover:from-teal-600 group-hover:to-teal-400',
    swatchBg: 'bg-teal-500',
    activeFilterBtn: 'bg-teal-500/20 border-teal-500 text-teal-300',
  },
  blue: {
    id: 'blue',
    name: 'آبی / لاجوردی',
    dotBg: 'bg-blue-400',
    textPrimary: 'text-blue-400',
    textLight: 'text-blue-300',
    gradientText: 'from-blue-400 to-cyan-400',
    btnPrimary: 'bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-slate-950',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-300',
    borderAccent: 'border-blue-500/30',
    ringAccent: 'ring-blue-400',
    shadowGlow: 'shadow-blue-500/20',
    chartBarSelected: 'bg-gradient-to-t from-blue-500 to-cyan-300 shadow-xl shadow-blue-500/40',
    chartBarToday: 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/20',
    chartBarRegular: 'bg-gradient-to-t from-indigo-700 to-blue-500 group-hover:from-indigo-600 group-hover:to-blue-400',
    swatchBg: 'bg-blue-500',
    activeFilterBtn: 'bg-blue-500/20 border-blue-500 text-blue-300',
  },
  purple: {
    id: 'purple',
    name: 'بنفش / ارغوانی',
    dotBg: 'bg-purple-400',
    textPrimary: 'text-purple-400',
    textLight: 'text-purple-300',
    gradientText: 'from-purple-400 to-fuchsia-400',
    btnPrimary: 'bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-slate-950',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-300',
    borderAccent: 'border-purple-500/30',
    ringAccent: 'ring-purple-400',
    shadowGlow: 'shadow-purple-500/20',
    chartBarSelected: 'bg-gradient-to-t from-purple-500 to-fuchsia-300 shadow-xl shadow-purple-500/40',
    chartBarToday: 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg shadow-purple-500/20',
    chartBarRegular: 'bg-gradient-to-t from-purple-700 to-purple-500 group-hover:from-purple-600 group-hover:to-purple-400',
    swatchBg: 'bg-purple-500',
    activeFilterBtn: 'bg-purple-500/20 border-purple-500 text-purple-300',
  },
  black: {
    id: 'black',
    name: 'مشکی / زغالی',
    dotBg: 'bg-slate-200',
    textPrimary: 'text-slate-200',
    textLight: 'text-slate-100',
    gradientText: 'from-slate-100 via-zinc-300 to-slate-400',
    btnPrimary: 'bg-gradient-to-r from-slate-200 to-zinc-400 hover:from-white hover:to-slate-300 text-slate-950',
    badgeBg: 'bg-slate-200/10',
    badgeBorder: 'border-slate-400/30',
    badgeText: 'text-slate-200',
    borderAccent: 'border-slate-500/40',
    ringAccent: 'ring-slate-300',
    shadowGlow: 'shadow-slate-400/20',
    chartBarSelected: 'bg-gradient-to-t from-slate-400 to-zinc-100 shadow-xl shadow-slate-300/30',
    chartBarToday: 'bg-gradient-to-t from-slate-600 to-slate-300 shadow-lg shadow-slate-400/20',
    chartBarRegular: 'bg-gradient-to-t from-zinc-700 to-slate-400 group-hover:from-zinc-600 group-hover:to-slate-300',
    swatchBg: 'bg-slate-300',
    activeFilterBtn: 'bg-slate-200/20 border-slate-400 text-slate-100',
  },
  gray: {
    id: 'gray',
    name: 'خاکستری / نقره‌ای',
    dotBg: 'bg-gray-300',
    textPrimary: 'text-gray-300',
    textLight: 'text-gray-200',
    gradientText: 'from-gray-200 to-slate-400',
    btnPrimary: 'bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300 text-slate-950',
    badgeBg: 'bg-gray-400/10',
    badgeBorder: 'border-gray-400/30',
    badgeText: 'text-gray-200',
    borderAccent: 'border-gray-400/30',
    ringAccent: 'ring-gray-300',
    shadowGlow: 'shadow-gray-400/20',
    chartBarSelected: 'bg-gradient-to-t from-gray-400 to-slate-100 shadow-xl shadow-gray-400/30',
    chartBarToday: 'bg-gradient-to-t from-gray-600 to-gray-300 shadow-lg shadow-gray-400/20',
    chartBarRegular: 'bg-gradient-to-t from-gray-700 to-gray-400 group-hover:from-gray-600 group-hover:to-gray-300',
    swatchBg: 'bg-gray-400',
    activeFilterBtn: 'bg-gray-400/20 border-gray-400 text-gray-200',
  },
  pink: {
    id: 'pink',
    name: 'صورتی / رز',
    dotBg: 'bg-pink-400',
    textPrimary: 'text-pink-400',
    textLight: 'text-pink-300',
    gradientText: 'from-pink-400 to-rose-300',
    btnPrimary: 'bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-400 hover:to-pink-300 text-slate-950',
    badgeBg: 'bg-pink-500/10',
    badgeBorder: 'border-pink-500/30',
    badgeText: 'text-pink-300',
    borderAccent: 'border-pink-500/30',
    ringAccent: 'ring-pink-400',
    shadowGlow: 'shadow-pink-500/20',
    chartBarSelected: 'bg-gradient-to-t from-pink-500 to-rose-300 shadow-xl shadow-pink-500/40',
    chartBarToday: 'bg-gradient-to-t from-pink-600 to-pink-400 shadow-lg shadow-pink-500/20',
    chartBarRegular: 'bg-gradient-to-t from-pink-700 to-pink-500 group-hover:from-pink-600 group-hover:to-pink-400',
    swatchBg: 'bg-pink-500',
    activeFilterBtn: 'bg-pink-500/20 border-pink-500 text-pink-300',
  },
  cherry: {
    id: 'cherry',
    name: 'قرمز گیلاسی',
    dotBg: 'bg-rose-500',
    textPrimary: 'text-rose-400',
    textLight: 'text-rose-300',
    gradientText: 'from-rose-500 via-red-500 to-pink-500',
    btnPrimary: 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white',
    badgeBg: 'bg-rose-500/10',
    badgeBorder: 'border-rose-500/30',
    badgeText: 'text-rose-300',
    borderAccent: 'border-rose-500/30',
    ringAccent: 'ring-rose-400',
    shadowGlow: 'shadow-rose-500/25',
    chartBarSelected: 'bg-gradient-to-t from-rose-600 to-red-400 shadow-xl shadow-rose-500/40',
    chartBarToday: 'bg-gradient-to-t from-rose-700 to-rose-500 shadow-lg shadow-rose-500/20',
    chartBarRegular: 'bg-gradient-to-t from-red-800 to-rose-600 group-hover:from-red-700 group-hover:to-rose-500',
    swatchBg: 'bg-rose-600',
    activeFilterBtn: 'bg-rose-500/20 border-rose-500 text-rose-300',
  }
};

const DEFAULT_ADMIN_USER: UserAccount = {
  id: 'usr-admin',
  username: 'admin',
  displayName: 'کاربر اصلی (ادمین)',
  password: '1234',
  avatarColor: 'teal',
  createdAt: new Date('2026-01-01').toISOString(),
  lastLoginAt: new Date().toISOString(),
  loginCount: 1,
  role: 'admin'
};

export default function App() {
  // Multi-User Management State
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('progress_users_list');
    if (!saved) return [DEFAULT_ADMIN_USER];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_ADMIN_USER];
    } catch {
      return [DEFAULT_ADMIN_USER];
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const activeUsername = sessionStorage.getItem('progress_active_username') || localStorage.getItem('progress_active_username');
    if (!activeUsername) return null;
    const savedList = localStorage.getItem('progress_users_list');
    let list = [DEFAULT_ADMIN_USER];
    if (savedList) {
      try { list = JSON.parse(savedList); } catch {}
    }
    return list.find(u => u.username.toLowerCase() === activeUsername.toLowerCase()) || null;
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const sessionUnlocked = sessionStorage.getItem('progress_unlocked');
    return sessionUnlocked === 'true' && currentUser !== null;
  });

  // Auth / Login / Register Form State
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState<string>(() => users[0]?.username || 'admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form Inputs
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState('teal');

  // Admin Panel Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Security & Account Settings Modal State
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'switch' | 'password' | 'categories'>('switch');
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [securityModalMsg, setSecurityModalMsg] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Custom Categories State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Switch User Password Prompt State inside Modal
  const [switchTargetUser, setSwitchTargetUser] = useState<UserAccount | null>(null);
  const [switchPasswordInput, setSwitchPasswordInput] = useState('');

  // Delete Confirmation Dialog State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'activity' | 'goal' | 'category';
    idOrName: string;
    title: string;
  }>({
    isOpen: false,
    type: 'activity',
    idOrName: '',
    title: ''
  });

  // Save users list
  useEffect(() => {
    localStorage.setItem('progress_users_list', JSON.stringify(users));
  }, [users]);

  // Load activities & goals whenever active currentUser changes
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = currentUser.username.toLowerCase();
    
    // Load activities
    const actSaved = localStorage.getItem(`progress_user_${userKey}_activities`);
    if (actSaved) {
      try { setActivities(JSON.parse(actSaved)); } catch { setActivities([]); }
    } else if (userKey === 'admin') {
      // Migrate legacy single-user data
      const legacyAct = localStorage.getItem('progress_activities');
      if (legacyAct) {
        try {
          const parsed: Activity[] = JSON.parse(legacyAct);
          const defaultIds = ['act-1', 'act-2', 'act-3', 'act-4', 'act-5'];
          setActivities(parsed.filter(a => !defaultIds.includes(a.id)));
        } catch { setActivities([]); }
      } else { setActivities([]); }
    } else {
      setActivities([]);
    }

    // Load goals
    const goalSaved = localStorage.getItem(`progress_user_${userKey}_goals`);
    if (goalSaved) {
      try { setGoals(JSON.parse(goalSaved)); } catch { setGoals(INITIAL_GOALS); }
    } else if (userKey === 'admin') {
      const legacyGoals = localStorage.getItem('progress_goals');
      if (legacyGoals) {
        try { setGoals(JSON.parse(legacyGoals)); } catch { setGoals(INITIAL_GOALS); }
      } else { setGoals(INITIAL_GOALS); }
    } else {
      setGoals(INITIAL_GOALS);
    }

    // Load categories
    const catSaved = localStorage.getItem(`progress_user_${userKey}_categories`);
    if (catSaved) {
      try { setCategories(JSON.parse(catSaved)); } catch { setCategories(DEFAULT_CATEGORIES); }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }
  }, [currentUser?.username]);

  // Save activities & goals & categories to currently active user key
  useEffect(() => {
    if (!currentUser) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_activities`, JSON.stringify(activities));
  }, [activities, currentUser?.username]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_goals`, JSON.stringify(goals));
  }, [goals, currentUser?.username]);

  useEffect(() => {
    if (!currentUser) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_categories`, JSON.stringify(categories));
  }, [categories, currentUser?.username]);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const target = users.find(u => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!target) {
      setAuthError('کاربری با این نام پیدا نشد.');
      return;
    }
    if (target.password !== loginPassword) {
      setAuthError('رمز ورود اشتباه است.');
      return;
    }

    const nowIso = new Date().toISOString();
    const updatedTarget: UserAccount = {
      ...target,
      lastLoginAt: nowIso,
      loginCount: (target.loginCount || 0) + 1,
      role: target.username.toLowerCase() === 'admin' ? 'admin' : (target.role || 'user')
    };

    const updatedUsers = users.map(u => u.id === target.id ? updatedTarget : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedTarget);
    setIsUnlocked(true);
    sessionStorage.setItem('progress_active_username', updatedTarget.username);
    localStorage.setItem('progress_active_username', updatedTarget.username);
    sessionStorage.setItem('progress_unlocked', 'true');
    setLoginPassword('');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setAuthError('نام کاربری باید حداقل ۳ کاراکتر انگلیسی باشد (بدون فاصله).');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      setAuthError('این نام کاربری قبلاً ثبت شده است. لطفاً نام دیگری انتخاب کنید.');
      return;
    }

    if (!regDisplayName.trim()) {
      setAuthError('لطفاً نام یا نام نمایشی خود را وارد کنید.');
      return;
    }

    if (regPassword.length < 4) {
      setAuthError('رمز ورود باید حداقل ۴ کاراکتر باشد.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError('تکرار رمز ورود با رمز وارد شده مطابقت ندارد.');
      return;
    }

    const nowIso = new Date().toISOString();
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      displayName: regDisplayName.trim(),
      password: regPassword,
      avatarColor: regAvatarColor || 'teal',
      createdAt: nowIso,
      lastLoginAt: nowIso,
      loginCount: 1,
      role: cleanUsername === 'admin' ? 'admin' : 'user'
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Auto Login
    setCurrentUser(newUser);
    setIsUnlocked(true);
    sessionStorage.setItem('progress_active_username', newUser.username);
    localStorage.setItem('progress_active_username', newUser.username);
    sessionStorage.setItem('progress_unlocked', 'true');

    // Reset fields
    setRegUsername('');
    setRegDisplayName('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsUnlocked(false);
    sessionStorage.removeItem('progress_active_username');
    localStorage.removeItem('progress_active_username');
    sessionStorage.removeItem('progress_unlocked');
    setIsSecurityModalOpen(false);
  };

  const handleSwitchAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchTargetUser) return;
    if (switchTargetUser.password !== switchPasswordInput) {
      setSecurityModalMsg({ text: 'رمز ورود اشتباه است.', type: 'error' });
      return;
    }

    setCurrentUser(switchTargetUser);
    sessionStorage.setItem('progress_active_username', switchTargetUser.username);
    localStorage.setItem('progress_active_username', switchTargetUser.username);
    setSecurityModalMsg({ text: `با موفقیت به حساب ${switchTargetUser.displayName} منتقل شدید.`, type: 'success' });
    setSwitchTargetUser(null);
    setSwitchPasswordInput('');
    setTimeout(() => {
      setSecurityModalMsg(null);
      setIsSecurityModalOpen(false);
    }, 1200);
  };

  // Change Password for current user
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (currentPinInput !== currentUser.password) {
      setSecurityModalMsg({ text: 'رمز فعلی نادرست است.', type: 'error' });
      return;
    }
    if (newPinInput.length < 4) {
      setSecurityModalMsg({ text: 'رمز جدید باید حداقل ۴ رقم باشد.', type: 'error' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setSecurityModalMsg({ text: 'رمز جدید و تکرار آن یکسان نیستند.', type: 'error' });
      return;
    }

    const updatedUsers = users.map(u => u.username === currentUser.username ? { ...u, password: newPinInput } : u);
    setUsers(updatedUsers);
    setCurrentUser(prev => prev ? { ...prev, password: newPinInput } : null);

    setSecurityModalMsg({ text: 'رمز ورود با موفقیت تغییر یافت!', type: 'success' });
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => {
      setSecurityModalMsg(null);
      setIsSecurityModalOpen(false);
    }, 1500);
  };

  // Category Management Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      setSecurityModalMsg({ text: 'این دسته‌بندی قبلاً اضافه شده است.', type: 'error' });
      return;
    }
    setCategories(prev => [...prev, trimmed]);
    setNewCategoryInput('');
    setSecurityModalMsg({ text: `دسته‌بندی "${trimmed}" با موفقیت اضافه شد.`, type: 'success' });
    setTimeout(() => setSecurityModalMsg(null), 2000);
  };

  const handleSaveEditCategory = (index: number) => {
    const oldName = categories[index];
    const trimmed = editingCategoryName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategoryIndex(null);
      return;
    }
    if (categories.some((c, i) => i !== index && c === trimmed)) {
      setSecurityModalMsg({ text: 'دسته‌بندی دیگری با این نام وجود دارد.', type: 'error' });
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[index] = trimmed;
    setCategories(updatedCategories);

    setActivities(prev => prev.map(act => act.category === oldName ? { ...act, category: trimmed } : act));
    setGoals(prev => prev.map(g => g.category === oldName ? { ...g, category: trimmed } : g));

    if (actCategory === oldName) {
      setActCategory(trimmed);
    }

    setEditingCategoryIndex(null);
    setEditingCategoryName('');
    setSecurityModalMsg({ text: `دسته‌بندی "${oldName}" به "${trimmed}" تغییر نام یافت.`, type: 'success' });
    setTimeout(() => setSecurityModalMsg(null), 2000);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    if (categories.length <= 1) {
      setSecurityModalMsg({ text: 'حداقل یک دسته‌بندی باید در لیست باقی بماند.', type: 'error' });
      return;
    }

    const updatedCategories = categories.filter(c => c !== catToDelete);
    const fallbackCat = updatedCategories[0] || 'عمومی';

    setCategories(updatedCategories);

    setActivities(prev => prev.map(act => act.category === catToDelete ? { ...act, category: fallbackCat } : act));
    setGoals(prev => prev.map(g => g.category === catToDelete ? { ...g, category: fallbackCat } : g));

    if (actCategory === catToDelete) {
      setActCategory(fallbackCat);
    }

    setSecurityModalMsg({ text: `دسته‌بندی "${catToDelete}" حذف شد و موارد مرتبط به "${fallbackCat}" منتقل شدند.`, type: 'success' });
    setTimeout(() => setSecurityModalMsg(null), 2500);
  };

  const handleResetCategories = () => {
    setCategories(DEFAULT_CATEGORIES);
    setSecurityModalMsg({ text: 'دسته‌بندی‌ها به حالت پیش‌فرض بازنشانی شدند.', type: 'success' });
    setTimeout(() => setSecurityModalMsg(null), 2000);
  };

  // Helper to get avatar badge styling
  const getAvatarBadgeClass = (colorId: string) => {
    const found = AVATAR_COLORS.find(c => c.id === colorId);
    return found ? found.bgClass : 'bg-teal-500/20 text-teal-400 border-teal-500/40';
  };

  // Today's date representations
  const todayObj = new Date();
  const todayJalali = formatJalaliDate(todayObj);
  const todayIso = todayObj.toISOString().split('T')[0];

  // Form State for Adding Activity
  const [actTitle, setActTitle] = useState('');
  const [actDuration, setActDuration] = useState<number | ''>('');
  const [actGoalId, setActGoalId] = useState<string>('');
  const [actCategory, setActCategory] = useState<Activity['category']>('مطالعه');
  const [actDate, setActDate] = useState(todayIso);
  const [actDescription, setActDescription] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('همه');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [chartDaysRange, setChartDaysRange] = useState<7 | 14 | 30>(7);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Color Theme State
  const [themeKey, setThemeKey] = useState<ColorThemeKey>(() => {
    const saved = localStorage.getItem('progress_app_theme') as ColorThemeKey;
    return saved && COLOR_THEMES[saved] ? saved : 'teal';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('progress_app_theme', themeKey);
  }, [themeKey]);

  const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.teal;

  // Export Data Handlers
  const handleExportJSON = () => {
    setIsExportMenuOpen(false);
    if (!filteredActivities || filteredActivities.length === 0) return;
    const dataStr = JSON.stringify({
      username: currentUser?.username || 'user',
      displayName: currentUser?.displayName || 'کاربر',
      exportDate: new Date().toISOString(),
      totalRecords: filteredActivities.length,
      activities: filteredActivities
    }, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-${currentUser?.username || 'user'}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    setIsExportMenuOpen(false);
    if (!filteredActivities || filteredActivities.length === 0) return;
    const headers = ['تاریخ', 'عنوان فعالیت', 'دسته بندی', 'مدت زمان (دقیقه)', 'توضیحات'];
    const rows = filteredActivities.map(act => [
      `"${act.jalaliDate || act.date || ''}"`,
      `"${(act.title || '').replace(/"/g, '""')}"`,
      `"${(act.category || '').replace(/"/g, '""')}"`,
      `"${act.duration || 0}"`,
      `"${(act.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activities-${currentUser?.username || 'user'}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [dayDetailModalData, setDayDetailModalData] = useState<{
    dayName: string;
    dateStr: string;
    isoDate: string;
    minutes: number;
    activities: Activity[];
  } | null>(null);

  // Modal for New Goal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetHours, setNewGoalTargetHours] = useState<number | ''>(50);
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');

  // Legacy lock helper
  const handleLockApp = () => {
    handleLogout();
  };

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('progress_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('progress_goals', JSON.stringify(goals));
  }, [goals]);

  // Compute chart data based on selected time range (7, 14, or 30 days)
  const chartData = useMemo(() => {
    const days: {
      dayName: string;
      dateStr: string;
      persianDigitsDate: string;
      isoDate: string;
      minutes: number;
      activityCount: number;
      dayActivities: Activity[];
      isToday: boolean;
    }[] = [];

    for (let i = chartDaysRange - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateIso = d.toISOString().split('T')[0];
      const jalaliStr = formatJalaliDate(d);
      const dayName = getPersianDayName(d);
      const persianDigitsStr = toPersianDigits(jalaliStr);

      const dayActs = activities.filter(
        act =>
          act.date === dateIso ||
          act.jalaliDate === jalaliStr ||
          act.jalaliDate === persianDigitsStr
      );

      const minutes = dayActs.reduce((sum, act) => sum + Number(act.duration || 0), 0);

      days.push({
        dayName,
        dateStr: jalaliStr,
        persianDigitsDate: persianDigitsStr,
        isoDate: dateIso,
        minutes,
        activityCount: dayActs.length,
        dayActivities: dayActs,
        isToday: i === 0,
      });
    }

    return days;
  }, [activities, chartDaysRange]);

  const maxChartMinutes = useMemo(() => {
    const max = Math.max(...chartData.map(d => d.minutes), 60);
    return max;
  }, [chartData]);

  // Helper to format chart bar label nicely
  const formatBarValue = (minutes: number) => {
    if (minutes === 0) return '۰';
    if (minutes < 60) return `${toPersianDigits(minutes)} د`;
    const hours = (minutes / 60).toFixed(1).replace(/\.0$/, '');
    return `${toPersianDigits(hours)} س`;
  };

  // Handle Adding an Activity
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDuration || Number(actDuration) <= 0) return;

    const durationNum = Number(actDuration);
    const [gy, gm, gd] = (actDate || todayIso).split('-').map(Number);
    const [jy, jm, jd] = g2j(gy, gm, gd);
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const jalaliFormatted = `${jy}/${pad(jm)}/${pad(jd)}`;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      title: actTitle.trim(),
      duration: durationNum,
      date: actDate,
      jalaliDate: toPersianDigits(jalaliFormatted),
      description: actDescription.trim(),
      goalId: actGoalId || undefined,
      category: actCategory
    };

    setActivities(prev => [newActivity, ...prev]);

    // If linked to a goal, increment current hours
    if (actGoalId) {
      setGoals(prevGoals =>
        prevGoals.map(goal => {
          if (goal.id === actGoalId) {
            const addedHours = durationNum / 60;
            return {
              ...goal,
              currentHours: Number((goal.currentHours + addedHours).toFixed(1))
            };
          }
          return goal;
        })
      );
    }

    // Reset form
    setActTitle('');
    setActDuration('');
    setActDescription('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Handle Adding a Goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || !newGoalTargetHours) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetHours: Number(newGoalTargetHours),
      currentHours: 0,
      targetDate: newGoalTargetDate || '1403/12/29'
    };

    setGoals(prev => [...prev, newGoal]);
    setNewGoalTitle('');
    setNewGoalTargetHours(50);
    setIsGoalModalOpen(false);
  };

  // Request Deletion (Triggers Confirmation Dialog)
  const requestDeleteActivity = (id: string, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'activity',
      idOrName: id,
      title: title || 'این فعالیت'
    });
  };

  const requestDeleteGoal = (id: string, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'goal',
      idOrName: id,
      title: title || 'این هدف'
    });
  };

  const requestDeleteCategory = (catName: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'category',
      idOrName: catName,
      title: catName
    });
  };

  // Perform actual deletion after confirmation
  const handleConfirmDelete = () => {
    const { type, idOrName } = deleteConfirmModal;
    if (!idOrName) return;

    if (type === 'activity') {
      setActivities(prev => prev.filter(act => act.id !== idOrName));
      if (dayDetailModalData) {
        setDayDetailModalData(prev => prev ? {
          ...prev,
          activities: prev.activities.filter(a => a.id !== idOrName),
          minutes: prev.activities.filter(a => a.id !== idOrName).reduce((sum, a) => sum + Number(a.duration || 0), 0)
        } : null);
      }
    } else if (type === 'goal') {
      setGoals(prev => prev.filter(g => g.id !== idOrName));
    } else if (type === 'category') {
      handleDeleteCategory(idOrName);
    }

    setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategoryFilter === 'همه' || act.category === selectedCategoryFilter;
      
      let matchesDay = true;
      if (selectedDayFilter) {
        matchesDay = act.date === selectedDayFilter || 
                   act.jalaliDate === selectedDayFilter || 
                   act.jalaliDate === toPersianDigits(selectedDayFilter);
      }

      return matchesSearch && matchesCategory && matchesDay;
    });
  }, [activities, searchQuery, selectedCategoryFilter, selectedDayFilter]);

  // Overall statistics
  const totalMinutesThisWeek = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalHoursLogged = (activities.reduce((acc, curr) => acc + curr.duration, 0) / 60).toFixed(1);

  // If user is locked out or no user logged in
  if (!isUnlocked || !currentUser) {
    return (
      <div dir="rtl" className="bg-[#0F172A] text-slate-200 min-h-screen w-full flex items-center justify-center p-4 font-sans selection:bg-teal-500/30">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-teal-500/10 relative overflow-hidden backdrop-blur-xl"
        >
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Icon & Title Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner text-teal-400">
              <Users className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-l from-teal-400 to-blue-500 mb-1">
              ردیاب پیشرفت اختصاصی
            </h1>
            <p className="text-slate-400 text-xs">
              ورود با نام کاربری منحصر به‌فرد جهت دسترسی به اطلاعات شخصی
            </p>
          </div>

          {/* Navigation Tabs (Login / Register) */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'login'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود به حساب</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'register'
                  ? 'bg-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ایجاد حساب جدید</span>
            </button>
          </div>

          {/* Global Auth Error Alert */}
          {authError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-right font-medium animate-in fade-in">
              {authError}
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-right">
              {/* Quick Select User Pills if accounts exist */}
              {users.length > 0 && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-2">
                    انتخاب سریع از میان کاربران موجود:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3 max-h-28 overflow-y-auto p-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setLoginUsername(u.username);
                          setAuthError('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                          loginUsername.toLowerCase() === u.username.toLowerCase()
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 ring-2 ring-teal-500/30'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarBadgeClass(u.avatarColor)}`}>
                          {u.displayName.charAt(0)}
                        </span>
                        <span>{u.displayName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">@{u.username}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  نام کاربری (Username):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={e => {
                      setLoginUsername(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="مثلاً: nazanin"
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-teal-300 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                  />
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  رمز ورود (Password):
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      if (authError) setAuthError('');
                    }}
                    placeholder="رمز ورود خود را وارد کنید..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-teal-300 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود به داشبورد</span>
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER FORM */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  نام و نام خانوادگی / نام نمایشی:
                </label>
                <input
                  type="text"
                  required
                  value={regDisplayName}
                  onChange={e => setRegDisplayName(e.target.value)}
                  placeholder="مثلاً: نازنین حامدی"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  نام کاربری منحصر به‌فرد (انگلیسی):
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="مثلاً: nazanin"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500 transition-all placeholder:text-slate-600"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  این نام آی‌دی اختصاصی شما جهت جداسازی کامل داده‌هاست.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    رمز ورود:
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="رمز ورود..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    تکرار رمز ورود:
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="تکرار رمز..."
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Avatar Color Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  رنگ پروفایل شما:
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setRegAvatarColor(c.id)}
                      className={`h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border ${c.bgClass} ${
                        regAvatarColor === c.id ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.name}
                    >
                      {regAvatarColor === c.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>ساخت حساب و ورود به داشبورد</span>
              </button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-[#0F172A] text-slate-200 min-h-screen w-full p-4 sm:p-6 md:p-8 font-sans selection:bg-teal-500/30">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-slate-800 pb-5 gap-4"
        >
          <div>
            <div className="flex items-center gap-3">
              <h1 className={`text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-l ${activeTheme.gradientText}`}>
                ردیاب پیشرفت شخصی
              </h1>
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.badgeBorder}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTheme.dotBg} animate-pulse`}></span>
                فعال
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              مشاهده و مدیریت اهداف یادگیری و فعالیت‌های روزانه
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tracking-widest text-slate-400 self-end sm:self-auto">
            
            {/* Active User Account Badge */}
            <div 
              onClick={() => setIsSecurityModalOpen(true)}
              className="flex items-center gap-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 cursor-pointer transition-colors"
              title="مدیریت و سوییچ حساب"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-inner ${getAvatarBadgeClass(currentUser.avatarColor)}`}>
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="flex flex-col text-right font-sans">
                <span className="text-slate-200 font-bold text-xs leading-tight">
                  {currentUser.displayName}
                </span>
                <span className={`text-[10px] ${activeTheme.textPrimary} font-mono`}>
                  @{currentUser.username}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex flex-col items-end">
              <span className="text-slate-500 text-[11px]">امروز</span>
              <span className={`${activeTheme.textPrimary} text-lg font-bold font-sans`}>
                {toPersianDigits(todayJalali)}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-slate-500 text-[11px]">کارکرد کل</span>
              <span className="text-blue-400 text-lg font-bold font-sans">
                {toPersianDigits(totalHoursLogged)} ساعت
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800"></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              
              {/* Daily Checklist Top Corner Widget */}
              <DailyChecklistWidget
                activities={activities}
                goals={goals}
                activeTheme={activeTheme}
                username={currentUser?.username || 'user'}
              />

              {/* Theme Picker Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
                  title="تغییر تم رنگی اپلیکیشن"
                >
                  <Palette className={`w-4 h-4 ${activeTheme.textPrimary}`} />
                  <span className="hidden md:inline">تم رنگی</span>
                </button>

                <AnimatePresence>
                  {isThemeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden text-xs p-2 space-y-1"
                    >
                      <div className="px-2 py-1 text-[10px] text-slate-400 font-semibold border-b border-slate-800 mb-1">
                        انتخاب تم رنگی:
                      </div>
                      {(Object.keys(COLOR_THEMES) as ColorThemeKey[]).map(key => {
                        const t = COLOR_THEMES[key];
                        const isSelected = themeKey === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setThemeKey(key);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full text-right px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? `${t.badgeBg} ${t.badgeText} font-bold border ${t.badgeBorder}`
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded-full ${t.swatchBg} shadow-sm inline-block`}></span>
                              <span>{t.name}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
                title={isFullscreen ? "خروج از تمام‌صفحه" : "حالت تمام‌صفحه"}
              >
                {isFullscreen ? (
                  <Minimize className={`w-4 h-4 ${activeTheme.textPrimary}`} />
                ) : (
                  <Maximize className={`w-4 h-4 ${activeTheme.textPrimary}`} />
                )}
                <span className="hidden md:inline">
                  {isFullscreen ? "خروج" : "تمام‌صفحه"}
                </span>
              </button>

              {currentUser?.username.toLowerCase() === 'admin' && (
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-sans cursor-pointer shadow-sm"
                  title="پنل اختصاصی ادمین اصلی - آمار کاربران"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="hidden md:inline font-bold">پنل ادمین ({toPersianDigits(users.length)})</span>
                </button>
              )}

              <button
                onClick={() => setIsSecurityModalOpen(true)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
                title="مدیریت حساب و کاربران"
              >
                <Users className={`w-4 h-4 ${activeTheme.textPrimary}`} />
                <span className="hidden md:inline">مدیریت کاربر</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors border border-slate-700/80 flex items-center gap-1.5 text-xs font-sans cursor-pointer"
                title="خروج از حساب"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="hidden md:inline">خروج</span>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <main className="flex-1 grid grid-cols-12 gap-6 lg:gap-8">
          
          {/* Overall Progress Summary & Motivational Card */}
          <div className="col-span-12">
            <ProgressSummaryWidget
              activities={activities}
              goals={goals}
              activeTheme={activeTheme}
              userName={currentUser?.name}
            />
          </div>

          {/* Left Column (8 cols on large screens) */}
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Activity Bar Chart with Framer Motion Smooth Transition */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 flex flex-col relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2 font-sans">
                    <span className={`w-2.5 h-2.5 ${activeTheme.dotBg} rounded-full animate-pulse`}></span>
                    نمودار کارکرد ({toPersianDigits(chartDaysRange)} روز اخیر)
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    جهت مشاهده یا فیلتر فعالیت‌ها، روی ستون هر روز کلیک کنید
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  {/* Time Range Selector Tabs */}
                  <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 gap-1">
                    {[
                      { range: 7, label: '۷ روز' },
                      { range: 14, label: '۱۴ روز' },
                      { range: 30, label: '۳۰ روز' }
                    ].map(item => (
                      <button
                        key={item.range}
                        type="button"
                        onClick={() => {
                          setChartDaysRange(item.range as 7 | 14 | 30);
                          setSelectedDayFilter(null);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                          chartDaysRange === item.range
                            ? `${activeTheme.badgeBg} ${activeTheme.badgeText} font-bold border ${activeTheme.badgeBorder}`
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {selectedDayFilter && (
                    <button
                      onClick={() => setSelectedDayFilter(null)}
                      className={`px-2.5 py-1 ${activeTheme.badgeBg} border ${activeTheme.badgeBorder} ${activeTheme.badgeText} rounded-lg text-xs flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer`}
                    >
                      <span>فیلتر روز فعال</span>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <span className="px-3 py-1 bg-slate-900/80 border border-slate-700/80 rounded-lg text-xs text-slate-300 font-mono">
                    مجموع {toPersianDigits(chartDaysRange)} روز: <strong className={activeTheme.textPrimary}>{toPersianDigits(formatMinutesToHours(chartData.reduce((s, d) => s + d.minutes, 0)))}</strong>
                  </span>
                </div>
              </div>

              {/* Chart Visual Grid & Bars Container */}
              <div className="relative pt-8 pb-3 px-2">
                {/* Horizontal Background Grid Lines */}
                <div className="absolute inset-x-2 top-8 bottom-12 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-dashed border-slate-400 w-full flex justify-end">
                    <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-slate-900 px-1 rounded">
                      {formatBarValue(maxChartMinutes)}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-slate-400 w-full flex justify-end">
                    <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-slate-900 px-1 rounded">
                      {formatBarValue(Math.round(maxChartMinutes / 2))}
                    </span>
                  </div>
                  <div className="border-b border-slate-600 w-full flex justify-end">
                    <span className="text-[10px] font-mono text-slate-400 -mt-2.5 bg-slate-900 px-1 rounded">
                      ۰
                    </span>
                  </div>
                </div>

                {/* Bars */}
                <div className="h-56 sm:h-64 flex items-end justify-between gap-1.5 sm:gap-3 relative z-10 overflow-x-auto pb-2 no-scrollbar">
                  {chartData.map((day, idx) => {
                    const isSelected = selectedDayFilter === day.dateStr || selectedDayFilter === day.persianDigitsDate || selectedDayFilter === day.isoDate;
                    const heightPercent = maxChartMinutes > 0 
                      ? Math.max((day.minutes / maxChartMinutes) * 100, day.minutes > 0 ? 10 : 4) 
                      : 4;

                    return (
                      <div
                        key={`${day.isoDate}-${idx}`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDayFilter(null);
                          } else {
                            setSelectedDayFilter(day.dateStr);
                          }
                        }}
                        className={`flex flex-col items-center flex-1 min-w-[24px] h-full justify-end gap-1.5 group cursor-pointer relative transition-all rounded-xl p-1 ${
                          isSelected ? `${activeTheme.badgeBg} ring-2 ${activeTheme.ringAccent} ${activeTheme.shadowGlow}` : 'hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Hover / Active Floating Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-11 bg-slate-950 border border-slate-700 text-slate-100 text-[11px] font-mono px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20 flex flex-col items-center">
                          <span className={`${activeTheme.textPrimary} font-bold`}>{toPersianDigits(day.minutes)} دقیقه</span>
                          <span className="text-[9px] text-slate-400">{day.dayName} ({day.persianDigitsDate})</span>
                        </div>

                        {/* Top Value Label (Permanent Smart Value Badge) */}
                        <div className={`text-[9px] sm:text-[11px] font-mono font-semibold transition-colors ${
                          day.minutes > 0 
                            ? isSelected ? `${activeTheme.textLight} font-bold` : 'text-slate-300' 
                            : 'text-slate-600'
                        }`}>
                          {formatBarValue(day.minutes)}
                        </div>

                        {/* Column Bar Container with Framer Motion Smooth Height Growth */}
                        <div className="w-full bg-slate-900/60 rounded-t-xl relative flex items-end h-full overflow-hidden border border-slate-700/40">
                          <motion.div
                            key={`bar-${day.isoDate}-${chartDaysRange}`}
                            initial={{ height: '0%' }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{
                              type: 'spring',
                              stiffness: 170,
                              damping: 22,
                              mass: 0.8
                            }}
                            className={`w-full rounded-t-xl ${
                              isSelected
                                ? activeTheme.chartBarSelected
                                : day.isToday
                                ? activeTheme.chartBarToday
                                : day.minutes > 0
                                ? activeTheme.chartBarRegular
                                : 'bg-slate-800/40'
                            }`}
                          />
                        </div>

                        {/* Day Name & Date Label */}
                        <div className="flex flex-col items-center">
                          <span className={`text-[10px] sm:text-xs font-medium transition-colors ${
                            isSelected 
                              ? `${activeTheme.textLight} font-bold` 
                              : day.isToday 
                              ? `${activeTheme.textPrimary} font-semibold` 
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}>
                            {chartDaysRange > 14 ? day.persianDigitsDate.slice(8) : day.dayName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono hidden sm:inline">
                            {day.persianDigitsDate.slice(5)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Click Quick Details Banner */}
              {selectedDayFilter && (
                <div className="mt-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
                  {(() => {
                    const matchedDay = chartData.find(d => d.dateStr === selectedDayFilter || d.persianDigitsDate === selectedDayFilter || d.isoDate === selectedDayFilter);
                    return (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg">
                            <BarChart3 className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-slate-200 font-bold">{matchedDay?.dayName} ({matchedDay?.persianDigitsDate}): </span>
                            <span className="text-teal-300 font-mono font-bold">{toPersianDigits(matchedDay?.minutes || 0)} دقیقه</span>
                            <span className="text-slate-400"> ({toPersianDigits(matchedDay?.activityCount || 0)} فعالیت)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => {
                              if (matchedDay) {
                                setDayDetailModalData({
                                  dayName: matchedDay.dayName,
                                  dateStr: matchedDay.persianDigitsDate,
                                  isoDate: matchedDay.isoDate,
                                  minutes: matchedDay.minutes,
                                  activities: matchedDay.dayActivities
                                });
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/40 rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            مشاهده لیست کامل روز
                          </button>
                          <button
                            onClick={() => {
                              if (matchedDay) {
                                setActDate(matchedDay.isoDate);
                                const formEl = document.getElementById('add-activity-form');
                                formEl?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            + ثبت برای این روز
                          </button>
                          <button
                            onClick={() => setSelectedDayFilter(null)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg"
                            title="لغو فیلتر"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </motion.div>

            {/* Weekly Insights & Analysis Report Widget */}
            <WeeklyReportWidget
              activities={activities}
              goals={goals}
              activeTheme={activeTheme}
            />

            {/* Recent Activities List / Table */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
              className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 flex-1 flex flex-col"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className={`w-5 h-5 ${activeTheme.textPrimary}`} />
                  آخرین فعالیت‌ها
                </h2>

                {/* Filter, Search Bar & Export Button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:${activeTheme.borderAccent}`}
                    />
                  </div>

                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className={`bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:${activeTheme.borderAccent}`}
                  >
                    <option value="همه">همه دسته‌ها</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Export Button & Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      className={`px-3 py-1.5 bg-slate-900 hover:bg-slate-800 ${activeTheme.textPrimary} border border-slate-700 hover:${activeTheme.borderAccent} rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm`}
                      title="دریافت خروجی از لیست فعالیت‌ها"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">دریافت خروجی</span>
                    </button>

                    <AnimatePresence>
                      {isExportMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden text-xs py-1"
                        >
                          <div className="px-3 py-1.5 text-[10px] text-slate-500 border-b border-slate-800 font-semibold">
                            فرمت خروجی را انتخاب کنید:
                          </div>
                          <button
                            type="button"
                            onClick={handleExportCSV}
                            className="w-full text-right px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            <span>خروجی CSV (اکسل)</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleExportJSON}
                            className="w-full text-right px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <FileJson className="w-4 h-4 text-blue-400" />
                            <span>خروجی JSON (پشتیبان)</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto flex-1">
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    هیچ فعالیتی ثبت نشده است.
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 border-b border-slate-700/70 text-right">
                      <tr>
                        <th className="pb-3 font-medium pr-2">تاریخ</th>
                        <th className="pb-3 font-medium">عنوان فعالیت</th>
                        <th className="pb-3 font-medium">دسته</th>
                        <th className="pb-3 font-medium text-left pl-2">مدت (دقیقه)</th>
                        <th className="pb-3 font-medium text-center w-12">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40">
                      {filteredActivities.map((act, index) => (
                        <motion.tr
                          key={act.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                          className="hover:bg-slate-700/20 transition-colors group"
                        >
                          <td className="py-3 pr-2 text-slate-400 text-xs font-mono whitespace-nowrap">
                            {act.jalaliDate}
                          </td>
                          <td className="py-3">
                            <div className="font-medium text-slate-200">{act.title}</div>
                            {act.description && (
                              <div className="text-xs text-slate-400 mt-0.5 max-w-md truncate">
                                {act.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-700/50 text-slate-300 border border-slate-600/30">
                              {act.category || 'عمومی'}
                            </span>
                          </td>
                          <td className={`py-3 text-left pl-2 font-mono ${activeTheme.textPrimary} font-bold whitespace-nowrap`}>
                            {toPersianDigits(act.duration)}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => requestDeleteActivity(act.id, act.title)}
                              className="text-slate-500 hover:text-red-400 transition-colors opacity-60 group-hover:opacity-100 p-1 cursor-pointer"
                              title="حذف فعالیت"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>

          </section>

          {/* Right Column (4 cols on large screens) */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Goals Widget */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
              className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50"
            >
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className={`w-5 h-5 ${activeTheme.textPrimary}`} />
                  اهداف فعلی
                </h2>
                <button
                  onClick={() => setIsGoalModalOpen(true)}
                  className={`text-xs ${activeTheme.textPrimary} font-medium flex items-center gap-1 ${activeTheme.badgeBg} hover:bg-slate-800 border ${activeTheme.badgeBorder} px-2.5 py-1 rounded-lg transition-colors cursor-pointer`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  هدف جدید
                </button>
              </div>

              <div className="space-y-5">
                {goals.length === 0 ? (
                  <p className="text-slate-500 text-xs text-center py-4">هدفی تعریف نشده است.</p>
                ) : (
                  goals.map((goal, idx) => {
                    const loggedHours = activities
                      .filter(act => act.goalId === goal.id)
                      .reduce((sum, act) => sum + (act.duration / 60), 0);
                    const totalHours = loggedHours + (goal.currentHours || 0);
                    const percent = Math.min(Math.round((totalHours / goal.targetHours) * 100), 100);
                    const isCompleted = percent >= 100;
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.05, ease: 'easeOut' }}
                        className={`space-y-2 group relative transition-all duration-300 ${
                          isCompleted 
                            ? 'p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'p-1'
                        }`}
                      >
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{goal.title}</span>
                            {isCompleted && (
                              <motion.span
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>تکمیل شد</span>
                                <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                              </motion.span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs font-mono">
                              {toPersianDigits(totalHours.toFixed(1))} / {toPersianDigits(goal.targetHours)}h
                            </span>
                            <span className={`font-mono font-bold text-xs ${isCompleted ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : activeTheme.textPrimary}`}>
                              {toPersianDigits(percent)}٪
                            </span>
                            <button
                              onClick={() => requestDeleteGoal(goal.id, goal.title)}
                              className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                              title="حذف هدف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2.5 w-full bg-slate-700/60 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse'
                                : percent > 50
                                ? `bg-gradient-to-r ${activeTheme.gradientText}`
                                : 'bg-slate-500'
                            }`}
                          ></motion.div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* Monthly Jalali Calendar Widget */}
            <MonthlyCalendarWidget
              activities={activities}
              actDate={actDate}
              onSelectDate={(isoDate) => {
                setActDate(isoDate);
              }}
              activeTheme={activeTheme}
            />

            {/* Add Activity Form */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
              id="add-activity-form"
              className={`bg-slate-800/80 rounded-2xl p-6 border ${activeTheme.borderAccent} flex-1 flex flex-col justify-between relative`}
            >
              
              {showSuccessToast && (
                <div className={`absolute top-3 left-3 right-3 ${activeTheme.swatchBg} text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-300`}>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    فعالیت با موفقیت ثبت شد!
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Plus className={`w-5 h-5 ${activeTheme.textPrimary}`} />
                  ثبت فعالیت جدید
                </h2>

                <form onSubmit={handleAddActivity} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                      عنوان فعالیت
                    </label>
                    <input
                      type="text"
                      required
                      value={actTitle}
                      onChange={e => setActTitle(e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:${activeTheme.borderAccent} transition-colors`}
                      placeholder="مثلاً مطالعه داکیومنت..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                        مدت (دقیقه)
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={actDuration}
                        onChange={e => setActDuration(e.target.value === '' ? '' : Number(e.target.value))}
                        className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:${activeTheme.borderAccent} transition-colors`}
                        placeholder="۶۰"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                        تاریخ فعالیت (شمسی)
                      </label>
                      <JalaliDatePicker
                        value={actDate}
                        onChange={setActDate}
                        activeTheme={activeTheme}
                      />
                    </div>
                  </div>

                  {/* Goal and Category Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                        ارتباط با هدف
                      </label>
                      <select
                        value={actGoalId}
                        onChange={e => setActGoalId(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:${activeTheme.borderAccent} transition-colors`}
                      >
                        <option value="">بدون هدف خاص</option>
                        {goals.map(g => (
                          <option key={g.id} value={g.id}>{g.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                        دسته‌بندی
                      </label>
                      <select
                        value={actCategory}
                        onChange={e => setActCategory(e.target.value)}
                        className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:${activeTheme.borderAccent} transition-colors`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 uppercase tracking-wider font-medium">
                      توضیحات (اختیاری)
                    </label>
                    <textarea
                      value={actDescription}
                      onChange={e => setActDescription(e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 h-20 focus:outline-none focus:${activeTheme.borderAccent} transition-colors resize-none`}
                      placeholder="جزئیات بیشتر..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`w-full ${activeTheme.btnPrimary} font-bold py-3 rounded-lg transition-all mt-2 shadow-lg ${activeTheme.shadowGlow} active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2`}
                  >
                    <span>ذخیره فعالیت</span>
                  </button>
                </form>
              </div>
            </motion.div>

          </aside>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center text-slate-500 text-[11px] tracking-wider border-t border-slate-800/80 pt-4 pb-2">
          طراحی‌شده بر اساس قالب Elegant Dark • ابزار ردیابی و مدیریت پیشرفت شخصی
        </footer>

      </div>

      {/* Goal Creation Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5"
            >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" />
                افزودن هدف جدید
              </h3>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">عنوان هدف</label>
                <input
                  type="text"
                  required
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  placeholder="مثلاً یادگیری کامل پایتون"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">ساعت هدف</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newGoalTargetHours}
                    onChange={e => setNewGoalTargetHours(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="۱۰۰"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">تاریخ هدف</label>
                  <input
                    type="text"
                    value={newGoalTargetDate}
                    onChange={e => setNewGoalTargetDate(e.target.value)}
                    placeholder="۱۴۰۳/۰۹/۳۰"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-900 transition-colors shadow-lg shadow-teal-500/10"
                >
                  افزودن هدف
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Multi-User Account Management & Switcher Modal */}
      <AnimatePresence>
      {isSecurityModalOpen && currentUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5"
          >
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm shadow-inner ${getAvatarBadgeClass(currentUser.avatarColor)}`}>
                  {currentUser.displayName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    {currentUser.displayName}
                  </h3>
                  <span className="text-xs text-teal-400 font-mono">@{currentUser.username}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsSecurityModalOpen(false);
                  setSecurityModalMsg(null);
                  setSwitchTargetUser(null);
                  setCurrentPinInput('');
                  setNewPinInput('');
                  setConfirmPinInput('');
                }}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setModalActiveTab('switch'); setSecurityModalMsg(null); setSwitchTargetUser(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === 'switch'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>سوییچ ({toPersianDigits(users.length)})</span>
              </button>

              <button
                type="button"
                onClick={() => { setModalActiveTab('password'); setSecurityModalMsg(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === 'password'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تغییر رمز</span>
              </button>

              <button
                type="button"
                onClick={() => { setModalActiveTab('categories'); setSecurityModalMsg(null); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalActiveTab === 'categories'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tags className="w-3.5 h-3.5" />
                <span>دسته‌بندی‌ها ({toPersianDigits(categories.length)})</span>
              </button>
            </div>

            {/* Global Modal Message */}
            {securityModalMsg && (
              <div
                className={`text-xs p-3 rounded-xl border font-medium ${
                  securityModalMsg.type === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                }`}
              >
                {securityModalMsg.text}
              </div>
            )}

            {/* TAB 1: ACCOUNTS LIST & SWITCHER */}
            {modalActiveTab === 'switch' && (
              <div className="space-y-4">
                {switchTargetUser ? (
                  /* Password Prompt for Target Switch User */
                  <form onSubmit={handleSwitchAccountSubmit} className="bg-slate-800/80 p-4 rounded-xl border border-teal-500/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <span>ورود به حساب:</span>
                      <span className="text-teal-300 font-bold">{switchTargetUser.displayName}</span>
                      <span className="text-slate-400 font-mono">(@{switchTargetUser.username})</span>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        رمز ورود این کاربر را وارد کنید:
                      </label>
                      <input
                        type="password"
                        autoFocus
                        required
                        value={switchPasswordInput}
                        onChange={e => setSwitchPasswordInput(e.target.value)}
                        placeholder="رمز ورود..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setSwitchTargetUser(null); setSwitchPasswordInput(''); }}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 rounded-lg"
                      >
                        انصراف
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                      >
                        تأیید و سوییچ
                      </button>
                    </div>
                  </form>
                ) : (
                  /* List of Registered Accounts */
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {users.map(u => {
                      const isActive = u.username.toLowerCase() === currentUser.username.toLowerCase();
                      return (
                        <div
                          key={u.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isActive
                              ? 'bg-teal-500/10 border-teal-500/50'
                              : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${getAvatarBadgeClass(u.avatarColor)}`}>
                              {u.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200 text-xs">{u.displayName}</span>
                                {isActive && (
                                  <span className="text-[10px] px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-md font-semibold">
                                    حساب فعال
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">@{u.username}</span>
                            </div>
                          </div>

                          {!isActive && (
                            <button
                              onClick={() => {
                                setSwitchTargetUser(u);
                                setSwitchPasswordInput('');
                                setSecurityModalMsg(null);
                              }}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-teal-500/20 hover:text-teal-300 text-slate-300 border border-slate-700 hover:border-teal-500/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              انتقال به این حساب
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج از حساب</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSecurityModalOpen(false);
                      handleLogout();
                      setAuthTab('register');
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ ساخت حساب جدید</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CHANGE PASSWORD */}
            {modalActiveTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-3.5 text-right">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">رمز ورود فعلی:</label>
                  <input
                    type="password"
                    required
                    value={currentPinInput}
                    onChange={e => setCurrentPinInput(e.target.value)}
                    placeholder="رمز فعلی..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">رمز جدید:</label>
                    <input
                      type="password"
                      required
                      value={newPinInput}
                      onChange={e => setNewPinInput(e.target.value)}
                      placeholder="رمز جدید..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">تکرار رمز جدید:</label>
                    <input
                      type="password"
                      required
                      value={confirmPinInput}
                      onChange={e => setConfirmPinInput(e.target.value)}
                      placeholder="تکرار..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsSecurityModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-800"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-lg shadow-teal-500/10 cursor-pointer"
                  >
                    ثبت تغییر رمز
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: CUSTOM CATEGORIES MANAGEMENT */}
            {modalActiveTab === 'categories' && (
              <div className="space-y-4 text-right">
                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    placeholder="نام دسته‌بندی جدید (مثلاً مطالعه، ورزش، کار)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-teal-500/10 cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن</span>
                  </button>
                </form>

                {/* Categories List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="text-[11px] text-slate-400 font-medium mb-2 flex items-center justify-between">
                    <span>لیست دسته‌بندی‌های فعال ({toPersianDigits(categories.length)} مورد):</span>
                    <button
                      type="button"
                      onClick={handleResetCategories}
                      className="text-[10px] text-slate-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title="بازنشانی به حالت پیش‌فرض"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>بازنشانی پیش‌فرض</span>
                    </button>
                  </div>

                  {categories.map((cat, idx) => {
                    const isEditing = editingCategoryIndex === idx;
                    return (
                      <div
                        key={`${cat}-${idx}`}
                        className="p-2.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between gap-2"
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              autoFocus
                              value={editingCategoryName}
                              onChange={e => setEditingCategoryName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveEditCategory(idx);
                                if (e.key === 'Escape') setEditingCategoryIndex(null);
                              }}
                              className="flex-1 bg-slate-900 border border-teal-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditCategory(idx)}
                              className="p-1 bg-teal-500 text-slate-950 rounded-lg hover:bg-teal-400 cursor-pointer"
                              title="ذخیره"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryIndex(null)}
                              className="p-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 cursor-pointer"
                              title="انصراف"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                              <span className="text-xs font-semibold text-slate-200">{cat}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategoryIndex(idx);
                                  setEditingCategoryName(cat);
                                }}
                                className="p-1.5 text-slate-400 hover:text-teal-300 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                                title="ویرایش نام"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDeleteCategory(cat)}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                                title="حذف دسته‌بندی"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Day Details Modal */}
      <AnimatePresence>
      {dayDetailModalData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  جزئیات فعالیت‌های {dayDetailModalData.dayName} ({dayDetailModalData.dateStr})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  مجموع کارکرد: <strong className="text-teal-300 font-mono">{toPersianDigits(dayDetailModalData.minutes)} دقیقه</strong> ({toPersianDigits(formatMinutesToHours(dayDetailModalData.minutes))})
                </p>
              </div>
              <button
                onClick={() => setDayDetailModalData(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Day's Activities */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {dayDetailModalData.activities.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  هیچ فعالیتی برای این روز ثبت نشده است.
                </div>
              ) : (
                dayDetailModalData.activities.map(act => (
                  <div
                    key={act.id}
                    className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-sm">{act.title}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded-md">
                          {act.category}
                        </span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left font-mono font-bold text-teal-400 text-sm whitespace-nowrap">
                        {toPersianDigits(act.duration)} دقیقه
                      </div>
                      <button
                        type="button"
                        onClick={() => requestDeleteActivity(act.id, act.title)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="حذف فعالیت"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => {
                  setActDate(dayDetailModalData.isoDate);
                  setDayDetailModalData(null);
                  const formEl = document.getElementById('add-activity-form');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
              >
                + ثبت فعالیت جدید برای این روز
              </button>
              <button
                onClick={() => setDayDetailModalData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Admin Panel Modal */}
      <AnimatePresence>
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 w-full max-w-3xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>پنل اختصاصی ادمین اصلی</span>
                    <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      @admin
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    مشاهده آمار ورود و لیست کاربران عضو اپلیکیشن
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Privacy & Data Isolation Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-emerald-200 block">تضمین جداسازی کامل داده‌ها و حفظ حریم خصوصی:</span>
                <p className="text-emerald-300/90 leading-relaxed">
                  اطلاعات کارها و اهداف شخصی کاربران کاملاً ایزوله در حافظه اختصاصی هر کاربر (<code className="font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">progress_user_[username]</code>) ذخیره شده و هیچ شخص دیگری حتی ادمین اصلی به جزئیات فعالیت‌ها دسترسی ندارد. پنل ادمین تنها متادیتای ورود و تعداد کاربران را نمایش می‌دهد.
                </p>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-medium">کل کاربران ثبت‌شده</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-extrabold text-amber-400 font-sans">
                    {toPersianDigits(users.length)}
                  </span>
                  <Users className="w-5 h-5 text-amber-400/60" />
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-medium">مجموع دفعات ورود</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-extrabold text-teal-400 font-sans">
                    {toPersianDigits(users.reduce((sum, u) => sum + (u.loginCount || 1), 0))}
                  </span>
                  <LogIn className="w-5 h-5 text-teal-400/60" />
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                <span className="text-slate-400 text-xs font-medium">آخرین کاربر ثبت‌نام‌شده</span>
                <div className="mt-2 flex items-center gap-2 truncate">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {users[users.length - 1]?.displayName || '-'}
                  </span>
                  <span className="text-[10px] text-teal-400 font-mono shrink-0">
                    @{users[users.length - 1]?.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative flex-1 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={e => setAdminSearchQuery(e.target.value)}
                  placeholder="جستجوی کاربر با نام یا نام کاربری..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const exportData = JSON.stringify({
                    exportedBy: 'admin',
                    exportedAt: new Date().toISOString(),
                    totalUsersCount: users.length,
                    users: users.map(u => ({
                      id: u.id,
                      username: u.username,
                      displayName: u.displayName,
                      role: u.role || (u.username === 'admin' ? 'admin' : 'user'),
                      createdAt: u.createdAt,
                      lastLoginAt: u.lastLoginAt || u.createdAt,
                      loginCount: u.loginCount || 1
                    }))
                  }, null, 2);
                  const blob = new Blob([exportData], { type: 'application/json;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `admin-users-list-${new Date().toISOString().slice(0, 10)}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>خروجی لیست کاربران (JSON)</span>
              </button>
            </div>

            {/* User Directory Table */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">کاربر</th>
                      <th className="py-2.5 px-3">نام کاربری</th>
                      <th className="py-2.5 px-3">نقش</th>
                      <th className="py-2.5 px-3">تاریخ ثبت‌نام</th>
                      <th className="py-2.5 px-3">آخرین ورود</th>
                      <th className="py-2.5 px-3 text-center">تعداد ورود</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {users
                      .filter(u => 
                        u.displayName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                        u.username.toLowerCase().includes(adminSearchQuery.toLowerCase())
                      )
                      .map(u => {
                        const isAdminUser = u.username.toLowerCase() === 'admin' || u.role === 'admin';
                        const regDate = u.createdAt ? formatJalaliDate(u.createdAt) : '-';
                        const lastLogin = u.lastLoginAt ? formatJalaliDate(u.lastLoginAt) : regDate;
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-slate-100">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarBadgeClass(u.avatarColor)}`}>
                                  {u.displayName.charAt(0)}
                                </span>
                                <span>{u.displayName}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-teal-400">
                              @{u.username}
                            </td>
                            <td className="py-2.5 px-3">
                              {isAdminUser ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                                  مدیر اصلی
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                  کاربر عادی
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans">
                              {toPersianDigits(regDate)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-sans">
                              {toPersianDigits(lastLogin)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                              {toPersianDigits(u.loginCount || 1)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                بستن پنل
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog Modal */}
      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 text-right relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-slate-100">
                    {deleteConfirmModal.type === 'activity' && 'تأیید حذف فعالیت'}
                    {deleteConfirmModal.type === 'goal' && 'تأیید حذف هدف'}
                    {deleteConfirmModal.type === 'category' && 'تأیید حذف دسته‌بندی'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    آیا از حذف{' '}
                    <strong className="text-red-400 font-semibold">«{deleteConfirmModal.title}»</strong>{' '}
                    اطمینان دارید؟
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {deleteConfirmModal.type === 'activity' && 'این فعالیت به طور کامل حذف شده و آمار زمان‌بندی مربوطه به‌روزرسانی خواهد شد.'}
                    {deleteConfirmModal.type === 'goal' && 'این هدف حذف خواهد شد. فعالیت‌های ثبت‌شده مرتبط کماکان محفوظ می‌مانند.'}
                    {deleteConfirmModal.type === 'category' && 'این دسته‌بندی حذف خواهد شد و موارد مربوطه به دسته‌بندی جایگزین منتقل می‌شوند.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تأیید و حذف قطعی</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Gemini Chatbot AI Coach */}
      <GeminiChatbotWidget
        activities={activities}
        goals={goals}
        activeTheme={activeTheme}
        username={currentUser?.username || 'کاربر'}
      />

    </div>
  );
}
