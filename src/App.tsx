import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  Target,
  Sparkles,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  PieChart as PieChartIcon,
  Maximize2,
  Minimize2,
  Lock,
  LogOut,
  Key,
  Shield,
  Palette,
  Check,
  Tag,
  Edit2,
  User,
  Users,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Globe,
  Sun,
  Moon,
  MessageSquare,
  X,
  Send,
  AlertTriangle,
  ListTodo,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { Activity, Goal, GoalSubTask, GoalTier, TrackingMethod } from './types/tracker';
import { UserAccount, AuditLog } from './types/user';
import { ColorThemeKey, COLOR_THEMES, AVATAR_COLORS } from './types/theme';
import { toPersianDigits, formatMinutesToHours, formatJalaliDate, getPersianDayName, g2j, formatDisplayDate, formatDisplayDateWithMonth, getTehranTodayIso } from './utils/jalali';
import { ProgressSummaryWidget } from './components/ProgressSummaryWidget';
import { DailyChecklistWidget } from './components/DailyChecklistWidget';
import { WeeklyReportWidget } from './components/WeeklyReportWidget';
import { JalaliCalendarWidget } from './components/JalaliCalendarWidget';
import { GoalDeadlinesCalendarWidget } from './components/GoalDeadlinesCalendarWidget';
import { TehranClockWidget } from './components/TehranClockWidget';
import { PomodoroTimerWidget } from './components/PomodoroTimerWidget';
import { JalaliDatePicker } from './components/JalaliDatePicker';
import { Language, translations } from './utils/translations';
import { exportAuditLogsToExcel } from './utils/excel';
import {
  registerUserInFirestore,
  loginUserFromFirestore,
  fetchAllUsersFromFirestore,
  saveUserDataToFirestore,
  loadUserDataFromFirestore
} from './services/userService';

// Preset Colors for Custom Goals
const PRESET_GOAL_COLORS = [
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#6366F1', // Indigo
  '#F97316'  // Orange
];

// Initial Empty Data Defaults
const INITIAL_GOALS: Goal[] = [];
const INITIAL_ACTIVITIES: Activity[] = [];
const DEFAULT_CATEGORIES: string[] = ['عمومی', 'مطالعه', 'ورزش', 'پروژه کاری', 'تمرکز و یادگیری'];

// Admin Account
const DEFAULT_ADMIN_USER: UserAccount = {
  id: 'usr-admin',
  username: 'admin',
  displayName: 'مدیر سیستم (Admin)',
  password: 'admin',
  avatarColor: 'purple',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  loginCount: 1,
  role: 'admin'
};

export default function App() {
  // Mobile Performance Optimization: Detect screen width to disable Framer Motion animations on mobile (<768px)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Language & RTL State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('youcandoit_lang') as Language) || 'fa';
  });

  const t = translations[lang] || translations.fa;

  const toggleLanguage = () => {
    const nextLang = lang === 'fa' ? 'en' : 'fa';
    setLang(nextLang);
    localStorage.setItem('youcandoit_lang', nextLang);
  };

  // Dark / Light Theme Mode State (#9, Issue #3)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('youcandoit_dark_mode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('youcandoit_dark_mode', String(isDarkMode));
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // Color Theme Accent State (#9, Issue #2)
  const [themeKey, setThemeKey] = useState<ColorThemeKey>(() => {
    const saved = localStorage.getItem('progress_app_theme') as ColorThemeKey;
    return saved && COLOR_THEMES[saved] ? saved : 'teal';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('progress_app_theme', themeKey);
  }, [themeKey]);

  const activeTheme = COLOR_THEMES[themeKey] || COLOR_THEMES.teal;

  // Audit Logs for Login/Logout (#18)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('youcandoit_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('youcandoit_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAuditEvent = (username: string, displayName: string, event: 'login' | 'logout') => {
    const now = new Date();
    const jalaliDateStr = formatJalaliDate(now);
    const jalaliTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      username,
      displayName,
      event,
      timestamp: now.toISOString(),
      jalaliDate: jalaliDateStr,
      jalaliTime: jalaliTimeStr
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

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
    return list.find(u => u && u.username && typeof u.username === 'string' && u.username.toLowerCase() === activeUsername.toLowerCase()) || null;
  });

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const sessionUnlocked = sessionStorage.getItem('progress_unlocked');
    return sessionUnlocked === 'true' && currentUser !== null;
  });

  // Auth Forms State
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState<string>(() => users[0]?.username || 'admin');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState('teal');

  // Admin Panel Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminApiKeyInput, setAdminApiKeyInput] = useState('');
  const [adminApiKeyStatus, setAdminApiKeyStatus] = useState<string | null>(null);

  // User Profile Modal State (#6)
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [userProfileTab, setUserProfileTab] = useState<'info' | 'password' | 'categories'>('info');
  const [profileDisplayNameInput, setProfileDisplayNameInput] = useState('');
  const [profileAvatarColorInput, setProfileAvatarColorInput] = useState('teal');
  const [profileOldPassword, setProfileOldPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch admin API key status
  useEffect(() => {
    if (isAdminModalOpen) {
      fetch('/api/admin/config')
        .then(res => res.json())
        .then(data => {
          if (data.hasCustomKey) {
            setAdminApiKeyStatus(`کلید ثبت شده: ${data.maskedKey}`);
          } else {
            setAdminApiKeyStatus('هیچ کلید اختصاصی ثبت نشده است.');
          }
        })
        .catch(() => setAdminApiKeyStatus('خطا در دریافت وضعیت کلید.'));
    }
  }, [isAdminModalOpen]);

  const handleSaveAdminApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminApiKeyInput.trim()) return;
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: adminApiKeyInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setAdminApiKeyStatus('کلید API ادمین با موفقیت ذخیره و فعال گردید.');
        setAdminApiKeyInput('');
      } else {
        setAdminApiKeyStatus('خطا در ذخیره کلید.');
      }
    } catch {
      setAdminApiKeyStatus('خطا در ارتباط با سرور.');
    }
  };

  // AI Chatbot State (#14)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'سلام! من دستیار هوشمند You Can Do it هستم. چطور می‌توانم در دستیابی به اهداف به شما کمک کنم؟' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userText }];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          userDataContext: `تعداد اهداف فعال کاربر: ${goals.length} - تعداد فعالیت‌ها: ${activities.length}`
        })
      });
      const data = await res.json();
      if (data.text) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else if (data.error) {
        setChatMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${data.error}` }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: '⚠️ خطا در دریافت پاسخ از هوش مصنوعی.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Custom Categories State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState('');

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

  // Load users from Firestore on mount
  useEffect(() => {
    fetchAllUsersFromFirestore().then(remoteUsers => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(prev => {
          const merged = [...remoteUsers];
          prev.forEach(p => {
            if (p && p.username && !merged.some(m => m && m.username && m.username.toLowerCase() === p.username.toLowerCase())) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });
  }, []);

  // Save users list
  useEffect(() => {
    localStorage.setItem('progress_users_list', JSON.stringify(users));
  }, [users]);

  // Load activities & goals whenever active currentUser changes
  const [activities, setActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (!currentUser || !currentUser.username) return;
    const userKey = currentUser.username.toLowerCase();

    // Load from Firestore first
    loadUserDataFromFirestore(currentUser.id).then(remoteData => {
      if (remoteData) {
        if (remoteData.activities) setActivities(remoteData.activities);
        if (remoteData.goals) setGoals(remoteData.goals);
        if (remoteData.categories) setCategories(remoteData.categories);
      } else {
        // Fallback to local storage if no Firestore data yet
        const actSaved = localStorage.getItem(`progress_user_${userKey}_activities`);
        if (actSaved) {
          try { setActivities(JSON.parse(actSaved)); } catch { setActivities([]); }
        } else {
          setActivities([]);
        }

        const goalSaved = localStorage.getItem(`progress_user_${userKey}_goals`);
        if (goalSaved) {
          try { setGoals(JSON.parse(goalSaved)); } catch { setGoals(INITIAL_GOALS); }
        } else {
          setGoals(INITIAL_GOALS);
        }

        const catSaved = localStorage.getItem(`progress_user_${userKey}_categories`);
        if (catSaved) {
          try { setCategories(JSON.parse(catSaved)); } catch { setCategories(DEFAULT_CATEGORIES); }
        } else {
          setCategories(DEFAULT_CATEGORIES);
        }
      }
    });

    // Initialize user profile modal state
    setProfileDisplayNameInput(currentUser.displayName || '');
    setProfileAvatarColorInput(currentUser.avatarColor || 'teal');
  }, [currentUser?.id, currentUser?.username]);

  // Save state locally and to Firestore
  useEffect(() => {
    if (!currentUser || !currentUser.username) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_activities`, JSON.stringify(activities));
    saveUserDataToFirestore(currentUser.id, activities, goals, categories);
  }, [activities, currentUser?.id, currentUser?.username]);

  useEffect(() => {
    if (!currentUser || !currentUser.username) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_goals`, JSON.stringify(goals));
    saveUserDataToFirestore(currentUser.id, activities, goals, categories);
  }, [goals, currentUser?.id, currentUser?.username]);

  useEffect(() => {
    if (!currentUser || !currentUser.username) return;
    const userKey = currentUser.username.toLowerCase();
    localStorage.setItem(`progress_user_${userKey}_categories`, JSON.stringify(categories));
    saveUserDataToFirestore(currentUser.id, activities, goals, categories);
  }, [categories, currentUser?.id, currentUser?.username]);

  // Auth Handlers with Firestore
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthLoading(true);

    try {
      // First try login via Firestore database
      const res = await loginUserFromFirestore(loginUsername, loginPassword);
      if (res.success && res.user) {
        const updatedTarget = res.user;
        setUsers(prev => {
          const exists = prev.some(u => u.id === updatedTarget.id);
          if (exists) return prev.map(u => u.id === updatedTarget.id ? updatedTarget : u);
          return [...prev, updatedTarget];
        });
        setCurrentUser(updatedTarget);
        setIsUnlocked(true);
        sessionStorage.setItem('progress_active_username', updatedTarget.username);
        localStorage.setItem('progress_active_username', updatedTarget.username);
        sessionStorage.setItem('progress_unlocked', 'true');
        setLoginPassword('');
        logAuditEvent(updatedTarget.username, updatedTarget.displayName, 'login');
        return;
      }

      // If Firestore lookup failed or offline fallback, try local users list
      const target = users.find(u => u && u.username && u.username.toLowerCase() === loginUsername.trim().toLowerCase());
      if (!target) {
        setAuthError(res.error || 'کاربری با این نام کاربری پیدا نشد.');
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
        role: (target.username && target.username.toLowerCase() === 'admin') ? 'admin' : (target.role || 'user')
      };

      const updatedUsers = users.map(u => u.id === target.id ? updatedTarget : u);
      setUsers(updatedUsers);
      setCurrentUser(updatedTarget);
      setIsUnlocked(true);
      sessionStorage.setItem('progress_active_username', updatedTarget.username);
      localStorage.setItem('progress_active_username', updatedTarget.username);
      sessionStorage.setItem('progress_unlocked', 'true');
      setLoginPassword('');

      logAuditEvent(updatedTarget.username, updatedTarget.displayName, 'login');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const cleanUsername = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setAuthError('نام کاربری باید حداقل ۳ کاراکتر انگلیسی باشد.');
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

    setIsAuthLoading(true);

    try {
      // Register in Firestore with strict unique username check
      const res = await registerUserInFirestore({
        username: cleanUsername,
        displayName: regDisplayName.trim(),
        password: regPassword,
        avatarColor: regAvatarColor || 'teal',
        createdAt: new Date().toISOString(),
        role: cleanUsername === 'admin' ? 'admin' : 'user'
      });

      if (!res.success || !res.user) {
        setAuthError(res.error || 'خطا در ثبت‌نام کاربر.');
        return;
      }

      const newUser = res.user;
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsUnlocked(true);
      sessionStorage.setItem('progress_active_username', newUser.username);
      localStorage.setItem('progress_active_username', newUser.username);
      sessionStorage.setItem('progress_unlocked', 'true');

      logAuditEvent(newUser.username, newUser.displayName, 'login');

      setRegUsername('');
      setRegDisplayName('');
      setRegPassword('');
      setRegConfirmPassword('');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logAuditEvent(currentUser.username, currentUser.displayName, 'logout');
    }
    setCurrentUser(null);
    setIsUnlocked(false);
    sessionStorage.removeItem('progress_active_username');
    localStorage.removeItem('progress_active_username');
    sessionStorage.removeItem('progress_unlocked');
    setIsUserProfileModalOpen(false);
    setIsAdminModalOpen(false);
  };

  // User Profile Updates (#6)
  const handleUpdateProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileDisplayNameInput.trim()) {
      setProfileMsg({ text: 'نام نمایشی نمی‌تواند خالی باشد.', type: 'error' });
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      displayName: profileDisplayNameInput.trim(),
      avatarColor: profileAvatarColorInput
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setUsers(updatedUsers);
    setCurrentUser(updated);
    setProfileMsg({ text: 'اطلاعات پروفایل با موفقیت بروزرسانی شد.', type: 'success' });
    setTimeout(() => setProfileMsg(null), 2500);
  };

  const handleChangeProfilePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentUser.password !== profileOldPassword) {
      setProfileMsg({ text: 'رمز عبور فعلی نادرست است.', type: 'error' });
      return;
    }

    if (profileNewPassword.length < 4) {
      setProfileMsg({ text: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد.', type: 'error' });
      return;
    }

    if (profileNewPassword !== profileConfirmPassword) {
      setProfileMsg({ text: 'تکرار رمز عبور جدید با هم مطابقت ندارد.', type: 'error' });
      return;
    }

    const updated: UserAccount = {
      ...currentUser,
      password: profileNewPassword
    };

    const updatedUsers = users.map(u => u.id === currentUser.id ? updated : u);
    setUsers(updatedUsers);
    setCurrentUser(updated);
    setProfileOldPassword('');
    setProfileNewPassword('');
    setProfileConfirmPassword('');
    setProfileMsg({ text: 'رمز عبور شما با موفقیت تغییر یافت.', type: 'success' });
    setTimeout(() => setProfileMsg(null), 2500);
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      setProfileMsg({ text: 'این دسته‌بندی قبلاً اضافه شده است.', type: 'error' });
      return;
    }
    setCategories(prev => [...prev, trimmed]);
    setNewCategoryInput('');
    setProfileMsg({ text: `دسته‌بندی "${trimmed}" اضافه شد.`, type: 'success' });
    setTimeout(() => setProfileMsg(null), 2000);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    const updatedCategories = categories.filter(c => c !== catToDelete);
    setCategories(updatedCategories);
    setProfileMsg({ text: `دسته‌بندی "${catToDelete}" حذف شد.`, type: 'success' });
    setTimeout(() => setProfileMsg(null), 2000);
  };

  const getAvatarBadgeClass = (colorId?: string) => {
    const found = AVATAR_COLORS.find(c => c.id === colorId);
    return found ? found.bgClass : 'bg-teal-500/20 text-teal-300 border-teal-500/40';
  };

  // Today's Date (Tehran Timezone)
  const todayIso = getTehranTodayIso();

  // Pomodoro Activity Logger
  const handleLogPomodoroActivity = (title: string, durationMins: number, category: string, goalId?: string) => {
    const newAct: Activity = {
      id: `act-pomo-${Date.now()}`,
      title,
      duration: durationMins,
      date: todayIso,
      jalaliDate: formatDisplayDate(todayIso, 'fa'),
      description: 'ثبت خودکار از طریق ساعت پومودورو',
      goalId,
      category: category || 'عمومی'
    };
    setActivities(prev => [newAct, ...prev]);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Activity Form & Edit State
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [actTitle, setActTitle] = useState('');
  const [actDuration, setActDuration] = useState<number | ''>('');
  const [actGoalId, setActGoalId] = useState<string>('');
  const [actCategory, setActCategory] = useState<string>('عمومی');
  const [actDate, setActDate] = useState(todayIso);
  const [actDescription, setActDescription] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Search, Filter & Sort State
  const [selectedGoalTierFilter, setSelectedGoalTierFilter] = useState<GoalTier | 'all'>('all');
  const [selectedGoalTimeFilter, setSelectedGoalTimeFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  const [activitySortOrder, setActivitySortOrder] = useState<'date_asc' | 'date_desc' | 'created'>('date_asc');

  // Goal Modal & Edit State
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTargetType, setNewGoalTargetType] = useState<'hours' | 'days'>('hours');
  const [newGoalTargetHours, setNewGoalTargetHours] = useState<number | ''>(50);
  const [newGoalTargetDays, setNewGoalTargetDays] = useState<number | ''>(30);
  const [newGoalDailyHours, setNewGoalDailyHours] = useState<number | ''>(2);
  const [newGoalTier, setNewGoalTier] = useState<GoalTier>('monthly');
  const [newGoalStartDate, setNewGoalStartDate] = useState(todayIso);
  const [newGoalDeadlineDate, setNewGoalDeadlineDate] = useState('');
  const [newGoalTrackingMethod, setNewGoalTrackingMethod] = useState<TrackingMethod>('hours_logged');
  const [newGoalColor, setNewGoalColor] = useState('#06B6D4');
  const [newGoalCategory, setNewGoalCategory] = useState('عمومی');

  // Sub-task State during creation
  const [newGoalSubTasks, setNewGoalSubTasks] = useState<GoalSubTask[]>([]);
  const [subTaskTitleInput, setSubTaskTitleInput] = useState('');
  const [subTaskDayInput, setSubTaskDayInput] = useState<number | ''>('');

  const handleAddSubTaskToForm = () => {
    if (!subTaskTitleInput.trim()) return;
    const st: GoalSubTask = {
      id: `st-${Date.now()}`,
      title: subTaskTitleInput.trim(),
      dayNumber: Number(subTaskDayInput) || undefined,
      isCompleted: false
    };
    setNewGoalSubTasks(prev => [...prev, st]);
    setSubTaskTitleInput('');
    setSubTaskDayInput('');
  };

  const handleRemoveSubTaskFromForm = (id: string) => {
    setNewGoalSubTasks(prev => prev.filter(st => st.id !== id));
  };

  // Start Editing Activity Handler
  const handleStartEditActivity = (act: Activity) => {
    setEditingActivityId(act.id);
    setActTitle(act.title);
    setActDuration(act.duration);
    setActGoalId(act.goalId || '');
    setActCategory(act.category || 'عمومی');
    setActDate(act.date || todayIso);
    setActDescription(act.description || '');
  };

  const handleCancelEditActivity = () => {
    setEditingActivityId(null);
    setActTitle('');
    setActDuration('');
    setActGoalId('');
    setActCategory('عمومی');
    setActDate(todayIso);
    setActDescription('');
  };

  // Adding or Updating Activity Handler
  const handleAddOrUpdateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle.trim() || !actDuration || Number(actDuration) <= 0) return;

    const durationNum = Number(actDuration);
    const jalaliFormatted = formatDisplayDate(actDate || todayIso, 'fa');

    if (editingActivityId) {
      setActivities(prev => prev.map(a => {
        if (a.id !== editingActivityId) return a;
        return {
          ...a,
          title: actTitle.trim(),
          duration: durationNum,
          date: actDate,
          jalaliDate: jalaliFormatted,
          description: actDescription.trim(),
          goalId: actGoalId || undefined,
          category: actCategory
        };
      }));
      setEditingActivityId(null);
    } else {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        title: actTitle.trim(),
        duration: durationNum,
        date: actDate,
        jalaliDate: jalaliFormatted,
        description: actDescription.trim(),
        goalId: actGoalId || undefined,
        category: actCategory
      };
      setActivities(prev => [newActivity, ...prev]);
    }

    // Reset form
    setActTitle('');
    setActDuration('');
    setActGoalId('');
    setActCategory('عمومی');
    setActDate(todayIso);
    setActDescription('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Open New Goal Modal
  const handleOpenNewGoalModal = () => {
    setEditingGoalId(null);
    setNewGoalTitle('');
    setNewGoalTargetType('hours');
    setNewGoalTargetHours(50);
    setNewGoalTargetDays(30);
    setNewGoalDailyHours(2);
    setNewGoalTier('monthly');
    setNewGoalStartDate(todayIso);
    setNewGoalDeadlineDate('');
    setNewGoalTrackingMethod('hours_logged');
    setNewGoalColor('#06B6D4');
    setNewGoalCategory('عمومی');
    setNewGoalSubTasks([]);
    setIsGoalModalOpen(true);
  };

  // Start Editing Goal Handler
  const handleStartEditGoal = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setNewGoalTitle(goal.title);
    setNewGoalTargetType(goal.targetType || 'hours');
    setNewGoalTargetHours(goal.targetHours || 50);
    setNewGoalTargetDays(goal.targetDays || 30);
    setNewGoalDailyHours(goal.dailyHours || 2);
    setNewGoalTier(goal.tier || 'monthly');
    setNewGoalStartDate(goal.startDate || todayIso);
    setNewGoalDeadlineDate(goal.deadlineDate || '');
    setNewGoalTrackingMethod(goal.trackingMethod || 'hours_logged');
    setNewGoalColor(goal.color || '#06B6D4');
    setNewGoalCategory(goal.category || 'عمومی');
    setNewGoalSubTasks(goal.subTasks || []);
    setIsGoalModalOpen(true);
  };

  // Direct Goal Color Update
  const handleUpdateGoalColorDirectly = (goalId: string, color: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, color } : g));
  };

  // Adding or Updating Goal Handler
  const handleAddOrUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const targetH = newGoalTargetType === 'hours'
      ? Number(newGoalTargetHours || 50)
      : Number(newGoalTargetDays || 30) * Number(newGoalDailyHours || 2);

    if (editingGoalId) {
      setGoals(prev => prev.map(g => {
        if (g.id !== editingGoalId) return g;
        return {
          ...g,
          title: newGoalTitle.trim(),
          targetHours: targetH,
          targetDays: newGoalTargetType === 'days' ? Number(newGoalTargetDays) : undefined,
          dailyHours: newGoalTargetType === 'days' ? Number(newGoalDailyHours) : undefined,
          targetType: newGoalTargetType,
          tier: newGoalTier,
          startDate: newGoalStartDate,
          deadlineDate: newGoalDeadlineDate || undefined,
          trackingMethod: newGoalTrackingMethod,
          color: newGoalColor,
          category: newGoalCategory,
          subTasks: newGoalSubTasks
        };
      }));
      setEditingGoalId(null);
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title: newGoalTitle.trim(),
        targetHours: targetH,
        targetDays: newGoalTargetType === 'days' ? Number(newGoalTargetDays) : undefined,
        dailyHours: newGoalTargetType === 'days' ? Number(newGoalDailyHours) : undefined,
        targetType: newGoalTargetType,
        tier: newGoalTier,
        startDate: newGoalStartDate,
        deadlineDate: newGoalDeadlineDate || undefined,
        trackingMethod: newGoalTrackingMethod,
        color: newGoalColor,
        category: newGoalCategory,
        subTasks: newGoalSubTasks,
        currentHours: 0
      };
      setGoals(prev => [...prev, newGoal]);
    }

    setNewGoalTitle('');
    setNewGoalSubTasks([]);
    setIsGoalModalOpen(false);
  };

  // Toggle Goal Subtask completion
  const handleToggleSubTask = (goalId: string, subTaskId: string) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      const updatedSt = (goal.subTasks || []).map(st =>
        st.id === subTaskId ? { ...st, isCompleted: !st.isCompleted } : st
      );
      return { ...goal, subTasks: updatedSt };
    }));
  };

  // Request Deletion Modal
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

  const handleConfirmDelete = () => {
    const { type, idOrName } = deleteConfirmModal;
    if (!idOrName) return;

    if (type === 'activity') {
      setActivities(prev => prev.filter(act => act.id !== idOrName));
    } else if (type === 'goal') {
      setGoals(prev => prev.filter(g => g.id !== idOrName));
    } else if (type === 'category') {
      handleDeleteCategory(idOrName);
    }

    setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Helper to determine Goal Time Status
  const getGoalTimeStatus = (goal: Goal): 'active' | 'upcoming' | 'past' => {
    const start = (goal.startDate || '').replace(/\//g, '-');
    const dead = (goal.deadlineDate || goal.targetDate || '').replace(/\//g, '-');

    if (dead && dead < todayIso) return 'past';
    if (start && start > todayIso) return 'upcoming';
    return 'active';
  };

  // Sorted Activities (Ascending by date: e.g. tomorrow before 2 days from now)
  const sortedActivities = useMemo(() => {
    const list = [...activities];
    if (activitySortOrder === 'date_asc') {
      list.sort((a, b) => {
        const dA = a.date || '';
        const dB = b.date || '';
        if (dA !== dB) return dA.localeCompare(dB);
        return b.id.localeCompare(a.id);
      });
    } else if (activitySortOrder === 'date_desc') {
      list.sort((a, b) => {
        const dA = a.date || '';
        const dB = b.date || '';
        if (dA !== dB) return dB.localeCompare(dA);
        return b.id.localeCompare(a.id);
      });
    }
    return list;
  }, [activities, activitySortOrder]);

  // Filtered and Chronologically Sorted Goals by Tier and Time Status
  const filteredAndSortedGoals = useMemo(() => {
    let list = [...goals];

    // Filter by tier
    if (selectedGoalTierFilter !== 'all') {
      list = list.filter(g => g.tier === selectedGoalTierFilter);
    }

    // Filter by time status
    if (selectedGoalTimeFilter !== 'all') {
      list = list.filter(g => getGoalTimeStatus(g) === selectedGoalTimeFilter);
    }

    // Sort chronologically by start date, then deadline date
    list.sort((a, b) => {
      const startA = a.startDate ? a.startDate.replace(/\//g, '-') : '9999-99-99';
      const startB = b.startDate ? b.startDate.replace(/\//g, '-') : '9999-99-99';
      if (startA !== startB) return startA.localeCompare(startB);

      const deadA = a.deadlineDate ? a.deadlineDate.replace(/\//g, '-') : (a.targetDate ? a.targetDate.replace(/\//g, '-') : '9999-99-99');
      const deadB = b.deadlineDate ? b.deadlineDate.replace(/\//g, '-') : (b.targetDate ? b.targetDate.replace(/\//g, '-') : '9999-99-99');
      return deadA.localeCompare(deadB);
    });

    return list;
  }, [goals, selectedGoalTierFilter, selectedGoalTimeFilter, todayIso]);

  // Total Minutes logged
  const totalLoggedMinutes = useMemo(() => {
    return activities.reduce((sum, a) => sum + Number(a.duration || 0), 0);
  }, [activities]);

  // Auth Screen
  if (!isUnlocked || !currentUser) {
    return (
      <MotionConfig reducedMotion={isMobile ? 'always' : 'never'}>
        <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="bg-[#0F172A] text-slate-200 min-h-screen w-full flex items-center justify-center p-4 font-sans relative">
        {/* Top Controls on Login Screen */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 z-20">
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Globe className={`w-4 h-4 ${activeTheme.textPrimary}`} />
            <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-md"
            title={isDarkMode ? 'سویچ به پوسته روشن' : 'سویچ به پوسته تیره'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 bg-slate-800 border ${activeTheme.badgeBorder} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner ${activeTheme.textPrimary}`}>
              <Sparkles className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 mb-1 tracking-tight">
              You Can Do it
            </h1>
            <p className="text-slate-400 text-xs font-medium">
              {t.tagline}
            </p>
          </div>

          {/* Navigation Tabs (Login / Register) */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'login'
                  ? `${activeTheme.btnPrimary} text-slate-950 shadow-md`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authTab === 'register'
                  ? `${activeTheme.btnPrimary} text-slate-950 shadow-md`
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.register}</span>
            </button>
          </div>

          {authError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
              {authError}
            </div>
          )}

          {/* LOGIN FORM */}
          {authTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {users.length > 0 && (
                <div>
                  <label className="block text-[11px] text-slate-400 mb-2">
                    {lang === 'fa' ? 'انتخاب سریع کاربر:' : 'Quick Select User:'}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3 max-h-28 overflow-y-auto p-1">
                    {users.filter(u => u && u.username).map(u => (
                      <button
                        key={u.id || u.username}
                        type="button"
                        onClick={() => {
                          setLoginUsername(u.username || '');
                          setAuthError('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                          (loginUsername || '').toLowerCase() === (u.username || '').toLowerCase()
                            ? `${activeTheme.badgeBg} ${activeTheme.badgeBorder} ${activeTheme.textPrimary} ring-2 ${activeTheme.ringAccent}`
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${getAvatarBadgeClass(u.avatarColor)}`}>
                          {(u.displayName || u.username || 'U').charAt(0)}
                        </span>
                        <span>{u.displayName || u.username}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.username}:
                </label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t.password}:
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className={`w-full ${activeTheme.btnPrimary} text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50`}
              >
                {isAuthLoading ? (
                  <span className="animate-pulse">{lang === 'fa' ? 'در حال برقراری ارتباط با دیتابیس...' : 'Connecting to database...'}</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.login}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.displayName}:
                </label>
                <input
                  type="text"
                  required
                  value={regDisplayName}
                  onChange={e => setRegDisplayName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t.username}:
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="مثال: nazanin_1380"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {lang === 'fa' ? '⚠️ نام کاربری منحصر‌به‌فرد بوده و جهت ثبت‌نام در دیتابیس است' : 'Unique username saved in database'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.password}:
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t.confirmPassword}:
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading}
                className={`w-full ${activeTheme.btnPrimary} text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50`}
              >
                {isAuthLoading ? (
                  <span className="animate-pulse">{lang === 'fa' ? 'در حال ایجاد حساب در دیتابیس...' : 'Creating account in database...'}</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t.register}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion={isMobile ? 'always' : 'never'}>
      <div dir={lang === 'fa' ? 'rtl' : 'ltr'} className="bg-[#0F172A] text-slate-200 min-h-screen w-full p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] gap-6">

        {/* Top Bar Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/95 p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${activeTheme.badgeBg} border ${activeTheme.badgeBorder} flex items-center justify-center ${activeTheme.textPrimary} font-bold`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 font-sans">
                {t.appName}
              </h1>
              <p className="text-xs text-slate-400">
                {t.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Tehran Clock Widget */}
            <TehranClockWidget lang={lang} />

            {/* Pomodoro Timer Toggle Widget */}
            <PomodoroTimerWidget
              goals={goals}
              activeTheme={activeTheme}
              onLogActivity={handleLogPomodoroActivity}
              lang={lang}
            />

            {/* Daily Checklist Popover Widget (#1, #10) */}
            <DailyChecklistWidget
              activities={activities}
              goals={goals}
              activeTheme={activeTheme}
              username={currentUser.username}
              lang={lang}
            />

            {/* Language Switcher Toggle (#15, Issue #4) */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className={`w-4 h-4 ${activeTheme.textPrimary}`} />
              <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
            </button>

            {/* Light / Dark Mode Toggle (#9, Issue #3) */}
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
              title={isDarkMode ? 'سویچ به پوسته روشن' : 'سویچ به پوسته تیره'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* User Profile Panel Button (#6, Issue #6) */}
            <button
              type="button"
              onClick={() => setIsUserProfileModalOpen(true)}
              className={`px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border ${activeTheme.borderAccent} rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm`}
            >
              <User className={`w-4 h-4 ${activeTheme.textPrimary}`} />
              <span>{t.userPanel}</span>
            </button>

            {/* Admin Settings Button */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>{t.adminPanel}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all cursor-pointer"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* SECTION 1: OVERALL PROGRESS & MOTIVATIONAL SUMMARY (#2, #12) */}
        <ProgressSummaryWidget
          activities={activities}
          goals={goals}
          activeTheme={activeTheme}
          userName={currentUser.displayName}
          lang={lang}
        />

        {/* SECTION 2: CHARTS, ANALYTICS & JALALI CALENDAR (#13, #19) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <WeeklyReportWidget
              activities={activities}
              goals={goals}
              activeTheme={activeTheme}
              userName={currentUser.displayName}
              lang={lang}
            />
          </div>
          <div className="lg:col-span-5">
            <JalaliCalendarWidget
              activities={activities}
              activeTheme={activeTheme}
              lang={lang}
              selectedDate={actDate}
              onSelectDate={(isoDate) => setActDate(isoDate)}
            />
          </div>
        </div>

        {/* SECTION 3: GOALS MANAGEMENT (#3, #5, #7, #8, #11, #16, #17) */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder} flex items-center justify-center font-bold`}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100 font-sans">
                  {t.goals}
                </h2>
                <p className="text-xs text-slate-400">
                  {lang === 'fa' ? 'مدیریت اهداف شخصی و تعیین سطح‌های زمانی' : 'Manage your custom personal goals'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Time Status Category Filter Tabs */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setSelectedGoalTimeFilter('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTimeFilter === 'all' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {lang === 'fa' ? 'همه زمان‌ها' : 'All Time'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTimeFilter('active')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTimeFilter === 'active' ? 'bg-emerald-500 text-slate-950' : 'text-emerald-400 hover:text-emerald-300'
                  }`}
                >
                  {lang === 'fa' ? '🟢 جاری' : '🟢 Active'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTimeFilter('upcoming')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTimeFilter === 'upcoming' ? 'bg-cyan-500 text-slate-950' : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                >
                  {lang === 'fa' ? '🔵 پیش‌رو' : '🔵 Upcoming'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTimeFilter('past')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTimeFilter === 'past' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'fa' ? '🔴 گذشته' : '🔴 Past'}
                </button>
              </div>

              {/* Tier Filter Tabs (#8) */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setSelectedGoalTierFilter('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTierFilter === 'all' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {lang === 'fa' ? 'همه سطوح' : 'All Tiers'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTierFilter('daily')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTierFilter === 'daily' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.daily}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTierFilter('monthly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTierFilter === 'monthly' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTierFilter('yearly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedGoalTierFilter === 'yearly' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.yearly}
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenNewGoalModal}
                className={`px-4 py-2 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer`}
              >
                <Plus className="w-4 h-4" />
                <span>{t.addGoal}</span>
              </button>
            </div>
          </div>

          {/* Goal Deadlines Jalali Calendar Widget */}
          <GoalDeadlinesCalendarWidget
            goals={goals}
            activities={activities}
            activeTheme={activeTheme}
            lang={lang}
          />

          {/* Goals Grid Cards */}
          {filteredAndSortedGoals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {t.noGoals}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedGoals.map(goal => {
                const loggedHours = activities
                  .filter(a => a.goalId === goal.id)
                  .reduce((sum, a) => sum + (Number(a.duration || 0) / 60), 0);
                const currentTot = (goal.currentHours || 0) + loggedHours;
                const percent = Math.min(Math.round((currentTot / goal.targetHours) * 100), 100);
                const timeStatus = getGoalTimeStatus(goal);

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/80 relative space-y-3 shadow-md"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: goal.color || '#06B6D4' }}
                        />
                        <h3 className="font-bold text-slate-100 text-sm truncate">{goal.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Time Status Badge */}
                        {timeStatus === 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                            {lang === 'fa' ? '🟢 جاری' : '🟢 Active'}
                          </span>
                        )}
                        {timeStatus === 'upcoming' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                            {lang === 'fa' ? '🔵 پیش‌رو' : '🔵 Upcoming'}
                          </span>
                        )}
                        {timeStatus === 'past' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                            {lang === 'fa' ? '🔴 گذشته' : '🔴 Ended'}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartEditGoal(goal)}
                          className="text-slate-400 hover:text-amber-300 p-1 cursor-pointer transition-colors"
                          title={lang === 'fa' ? 'ویرایش هدف' : 'Edit goal'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteGoal(goal.id, goal.title)}
                          className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                          title={lang === 'fa' ? 'حذف هدف' : 'Delete goal'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tier badge & Jalali Dates */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                      <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-mono">
                        {goal.tier === 'daily' ? t.daily : goal.tier === 'monthly' ? t.monthly : t.yearly}
                      </span>
                      {goal.startDate && (
                        <span>{lang === 'fa' ? 'شروع:' : 'Start:'} {formatDisplayDateWithMonth(goal.startDate, lang)}</span>
                      )}
                      {goal.deadlineDate && (
                        <span>{lang === 'fa' ? 'ددلاین:' : 'Deadline:'} {formatDisplayDateWithMonth(goal.deadlineDate, lang)}</span>
                      )}
                    </div>

                    {/* Goal Color Palette Quick Selector */}
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium mr-1">{lang === 'fa' ? 'رنگ:' : 'Color:'}</span>
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                        {PRESET_GOAL_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleUpdateGoalColorDirectly(goal.id, c)}
                            className={`w-3.5 h-3.5 rounded-full transition-transform cursor-pointer ${
                              goal.color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono text-slate-300">
                        <span>{currentTot.toFixed(1)} / {goal.targetHours}h</span>
                        <span className={`font-bold ${activeTheme.textPrimary}`}>
                          {lang === 'fa' ? `٪${toPersianDigits(percent)}` : `${percent}%`}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%`, backgroundColor: goal.color || '#06B6D4' }}
                        />
                      </div>
                    </div>

                    {/* Sub-tasks Section (#11) */}
                    {goal.subTasks && goal.subTasks.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">{t.subTasks}:</span>
                        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {goal.subTasks.map(st => (
                            <div
                              key={st.id}
                              onClick={() => handleToggleSubTask(goal.id, st.id)}
                              className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-slate-100"
                            >
                              <button type="button" className="text-slate-400">
                                {st.isCompleted ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <div className="w-3.5 h-3.5 border border-slate-600 rounded" />
                                )}
                              </button>
                              <span className={st.isCompleted ? 'line-through text-slate-500' : ''}>
                                {st.title} {st.dayNumber ? `(${lang === 'fa' ? 'روز' : 'Day'} ${lang === 'fa' ? toPersianDigits(st.dayNumber) : st.dayNumber})` : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4: LOG NEW ACTIVITY & ACTIVITIES TABLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add Activity Form */}
          <div className="lg:col-span-5 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className={`w-5 h-5 ${activeTheme.textPrimary}`} />
                <span>{editingActivityId ? (lang === 'fa' ? 'ویرایش فعالیت' : 'Edit Activity') : t.addActivity}</span>
              </h2>
              {editingActivityId && (
                <button
                  type="button"
                  onClick={handleCancelEditActivity}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {lang === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {lang === 'fa' ? 'عنوان فعالیت:' : 'Activity Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={actTitle}
                  onChange={e => setActTitle(e.target.value)}
                  placeholder={lang === 'fa' ? 'مثلاً: مطالعه کتاب، تمرین برنامه‌نویسی...' : 'e.g. Reading, Coding practice...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {lang === 'fa' ? 'زمان (دقیقه):' : 'Duration (minutes):'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={actDuration}
                    onChange={e => setActDuration(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {lang === 'fa' ? 'تاریخ ثبت فعالیت (شمسی):' : 'Log Date (Jalali):'}
                  </label>
                  <JalaliDatePicker
                    valueIso={actDate}
                    onChangeIso={setActDate}
                    lang={lang}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {lang === 'fa' ? 'ارتباط با هدف (اختیاری):' : 'Link to Goal (Optional):'}
                </label>
                <select
                  value={actGoalId}
                  onChange={e => setActGoalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                >
                  <option value="">{lang === 'fa' ? '-- بدون هدف --' : '-- No Goal --'}</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">{t.category}:</label>
                <select
                  value={actCategory}
                  onChange={e => setActCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {lang === 'fa' ? 'توضیحات تکمیلی:' : 'Notes / Details:'}
                </label>
                <textarea
                  rows={2}
                  value={actDescription}
                  onChange={e => setActDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl shadow-lg active:scale-98 transition-all cursor-pointer`}
                >
                  {editingActivityId ? (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes') : t.addActivity}
                </button>
                {editingActivityId && (
                  <button
                    type="button"
                    onClick={handleCancelEditActivity}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                  >
                    {lang === 'fa' ? 'انصراف' : 'Cancel'}
                  </button>
                )}
              </div>

              {showSuccessToast && (
                <div className="p-2 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl border border-emerald-500/40 text-center font-bold">
                  {lang === 'fa' ? 'فعالیت با موفقیت ذخیره شد!' : 'Activity saved successfully!'}
                </div>
              )}
            </form>
          </div>

          {/* Activities List Table */}
          <div className="lg:col-span-7 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className={`w-5 h-5 ${activeTheme.textPrimary}`} />
                <span>{t.activities}</span>
              </h2>

              <div className="flex items-center gap-2">
                {/* Sort Order Selector */}
                <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActivitySortOrder('date_asc')}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                      activitySortOrder === 'date_asc' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={lang === 'fa' ? 'مرتب‌سازی صعودی بر اساس تاریخ (فردا قبل از دو روز دیگه)' : 'Sort ascending by date'}
                  >
                    {lang === 'fa' ? '📅 تاریخ (نزدیک‌ترین اول)' : '📅 Date (Asc)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivitySortOrder('date_desc')}
                    className={`px-2.5 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                      activitySortOrder === 'date_desc' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={lang === 'fa' ? 'مرتب‌سازی نزولی بر اساس تاریخ' : 'Sort descending by date'}
                  >
                    {lang === 'fa' ? '📅 تاریخ (دورترین اول)' : '📅 Date (Desc)'}
                  </button>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  {lang === 'fa' ? `${toPersianDigits(activities.length)} مورد` : `${activities.length} items`}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {sortedActivities.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  {t.noActivities}
                </div>
              ) : (
                sortedActivities.map(act => (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/70 flex items-center justify-between text-xs gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-200">{act.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        {/* Language aware date format (#4) */}
                        <span>{formatDisplayDate(act.date, lang)}</span>
                        <span>•</span>
                        <span>{act.category || 'عمومی'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${activeTheme.badgeBg} ${activeTheme.badgeText} px-2.5 py-1 rounded-lg border ${activeTheme.badgeBorder}`}>
                        {lang === 'fa' ? `${toPersianDigits(act.duration)} دقیقه` : `${act.duration} mins`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEditActivity(act)}
                        className="text-slate-400 hover:text-amber-300 p-1 cursor-pointer transition-colors"
                        title={lang === 'fa' ? 'ویرایش فعالیت' : 'Edit activity'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDeleteActivity(act.id, act.title)}
                        className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        title={lang === 'fa' ? 'حذف فعالیت' : 'Delete activity'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* USER PROFILE MODAL (#6, Issue #6) */}
      <AnimatePresence>
        {isUserProfileModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${getAvatarBadgeClass(currentUser.avatarColor)} flex items-center justify-center font-bold text-sm`}>
                    {currentUser.displayName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{t.userPanel}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsUserProfileModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => setUserProfileTab('info')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userProfileTab === 'info' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.profileInfo}
                </button>
                <button
                  type="button"
                  onClick={() => setUserProfileTab('password')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userProfileTab === 'password' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.changePassword}
                </button>
                <button
                  type="button"
                  onClick={() => setUserProfileTab('categories')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    userProfileTab === 'categories' ? `${activeTheme.btnPrimary} text-slate-950` : 'text-slate-400'
                  }`}
                >
                  {t.customCategories}
                </button>
              </div>

              {profileMsg && (
                <div className={`p-2.5 rounded-xl border text-xs font-bold text-center ${
                  profileMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {profileMsg.text}
                </div>
              )}

              {/* TAB 1: PROFILE INFO & STATS */}
              {userProfileTab === 'info' && (
                <div className="space-y-4">
                  <form onSubmit={handleUpdateProfileInfo} className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">{t.displayName}:</label>
                      <input
                        type="text"
                        required
                        value={profileDisplayNameInput}
                        onChange={e => setProfileDisplayNameInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1.5">{t.avatarColor}:</label>
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_COLORS.map(ac => (
                          <button
                            key={ac.id}
                            type="button"
                            onClick={() => setProfileAvatarColorInput(ac.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
                              profileAvatarColorInput === ac.id
                                ? `${ac.bgClass} ring-2 ring-white`
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span>{ac.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-2 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl cursor-pointer shadow-md`}
                    >
                      {t.saveChanges}
                    </button>
                  </form>

                  {/* Personal Stats Card */}
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-slate-200">{t.myStats}</h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{t.totalGoalsCount}:</span>
                        <span className="font-mono font-bold text-sm">{lang === 'fa' ? toPersianDigits(goals.length) : goals.length}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{t.totalHoursLogged}:</span>
                        <span className="font-mono font-bold text-sm">{(totalLoggedMinutes / 60).toFixed(1)} h</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{t.accountRole}:</span>
                        <span className="font-mono font-bold text-xs">{currentUser.role === 'admin' ? 'مدیر (Admin)' : 'کاربر عادی'}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">{t.memberSince}:</span>
                        <span className="font-mono text-xs">{formatDisplayDate(currentUser.createdAt, lang)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHANGE PASSWORD */}
              {userProfileTab === 'password' && (
                <form onSubmit={handleChangeProfilePassword} className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.currentPassword}:</label>
                    <input
                      type="password"
                      required
                      value={profileOldPassword}
                      onChange={e => setProfileOldPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.newPassword}:</label>
                    <input
                      type="password"
                      required
                      value={profileNewPassword}
                      onChange={e => setProfileNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.confirmNewPassword}:</label>
                    <input
                      type="password"
                      required
                      value={profileConfirmPassword}
                      onChange={e => setProfileConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl cursor-pointer shadow-md`}
                  >
                    {t.changePassword}
                  </button>
                </form>
              )}

              {/* TAB 3: CUSTOM CATEGORIES */}
              {userProfileTab === 'categories' && (
                <div className="space-y-3">
                  <form onSubmit={handleAddCategory} className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={e => setNewCategoryInput(e.target.value)}
                      placeholder="عنوان دسته‌بندی جدید..."
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                    />
                    <button
                      type="submit"
                      className={`px-4 py-2 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl cursor-pointer`}
                    >
                      {t.addCategory}
                    </button>
                  </form>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {categories.map(c => (
                      <div key={c} className="flex justify-between items-center p-2 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="font-bold text-slate-200">{c}</span>
                        {c !== 'عمومی' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(c)}
                            className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING AI ASSISTANT CHATBOT WIDGET (#14) */}
      <div className="fixed bottom-4 right-4 z-50">
        <AnimatePresence>
          {isAiChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-3 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96"
            >
              <div className={`p-3.5 ${activeTheme.btnPrimary} text-slate-950 flex justify-between items-center font-bold`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs">{t.aiAssistant}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiChatOpen(false)}
                  className="p-1 hover:bg-black/10 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs bg-slate-950/40">
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl max-w-[85%] ${
                      m.role === 'user'
                        ? `${activeTheme.btnPrimary} text-slate-950 font-medium ml-auto text-left`
                        : 'bg-slate-800 text-slate-200 border border-slate-700 text-right'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                {isChatLoading && (
                  <div className="text-slate-400 text-[10px] animate-pulse">در حال نگارش پاسخ...</div>
                )}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="سوال یا راهنمایی خود را بنویسید..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-slate-500"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className={`px-3 py-1.5 ${activeTheme.btnPrimary} text-slate-950 rounded-xl font-bold cursor-pointer disabled:opacity-50`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsAiChatOpen(!isAiChatOpen)}
          className={`w-12 h-12 rounded-full ${activeTheme.btnPrimary} text-slate-950 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* COLOR THEME PICKER FLOATING AT BOTTOM-LEFT (#9, Issue #2) */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-3 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-full shadow-2xl flex items-center justify-center cursor-pointer"
            title={t.theme}
          >
            <Palette className={`w-5 h-5 ${activeTheme.textPrimary}`} />
          </button>

          <AnimatePresence>
            {isThemeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute bottom-14 left-0 bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-2xl space-y-2 w-48 text-xs"
              >
                <span className="font-bold text-slate-300 block border-b border-slate-800 pb-1">{t.theme}:</span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(COLOR_THEMES).map(([k, th]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setThemeKey(k as ColorThemeKey);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`h-8 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        themeKey === k ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: th.swatchBg || '#14B8A6' }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CREATE / EDIT GOAL MODAL (#3, #5, #8, #11) */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100">
                  {editingGoalId ? (lang === 'fa' ? 'ویرایش هدف' : 'Edit Goal') : t.addGoal}
                </h3>
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddOrUpdateGoal} className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.goalTitle}:</label>
                  <input
                    type="text"
                    required
                    value={newGoalTitle}
                    onChange={e => setNewGoalTitle(e.target.value)}
                    placeholder="مثلاً: یادگیری کامل زبان انگلیسی..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                  />
                </div>

                {/* Target Measurement Type Selector (#3) */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGoalTargetType('hours')}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      newGoalTargetType === 'hours'
                        ? `${activeTheme.badgeBg} ${activeTheme.badgeBorder} ${activeTheme.textPrimary}`
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t.byHours}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGoalTargetType('days')}
                    className={`py-2 rounded-xl border font-bold cursor-pointer ${
                      newGoalTargetType === 'days'
                        ? `${activeTheme.badgeBg} ${activeTheme.badgeBorder} ${activeTheme.textPrimary}`
                        : 'bg-slate-950 border-slate-700 text-slate-400'
                    }`}
                  >
                    {t.byDays}
                  </button>
                </div>

                {newGoalTargetType === 'hours' ? (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.targetHours}:</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newGoalTargetHours}
                      onChange={e => setNewGoalTargetHours(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">{t.targetDays}:</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newGoalTargetDays}
                        onChange={e => setNewGoalTargetDays(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">ساعت تمرکز در روز:</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={newGoalDailyHours}
                        onChange={e => setNewGoalDailyHours(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500 font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Tier Selector (#8) */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.tier}:</label>
                  <select
                    value={newGoalTier}
                    onChange={e => setNewGoalTier(e.target.value as GoalTier)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                  >
                    <option value="daily">{t.daily}</option>
                    <option value="monthly">{t.monthly}</option>
                    <option value="yearly">{t.yearly}</option>
                  </select>
                </div>

                {/* Goal Color Selector (#4) */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {lang === 'fa' ? 'رنگ هدف:' : 'Goal Color:'}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_GOAL_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewGoalColor(c)}
                        className={`w-6 h-6 rounded-full border border-slate-600 transition-all cursor-pointer ${
                          newGoalColor === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                    <input
                      type="color"
                      value={newGoalColor}
                      onChange={e => setNewGoalColor(e.target.value)}
                      className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 cursor-pointer p-0.5"
                      title={lang === 'fa' ? 'رنگ دلخواه' : 'Custom color'}
                    />
                  </div>
                </div>

                {/* Dates & Deadlines Jalali Picker (#1, #5) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.startDate}:</label>
                    <JalaliDatePicker
                      valueIso={newGoalStartDate}
                      onChangeIso={setNewGoalStartDate}
                      lang={lang}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">{t.deadlineDate}:</label>
                    <JalaliDatePicker
                      valueIso={newGoalDeadlineDate}
                      onChangeIso={setNewGoalDeadlineDate}
                      lang={lang}
                    />
                  </div>
                </div>

                {/* Tracking Method Choice (#5) */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">{t.trackingMethod}:</label>
                  <select
                    value={newGoalTrackingMethod}
                    onChange={e => setNewGoalTrackingMethod(e.target.value as TrackingMethod)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-slate-500"
                  >
                    <option value="hours_logged">{t.byHoursLogged}</option>
                    <option value="days_remaining">{t.byDaysRemaining}</option>
                  </select>
                </div>

                {/* Sub-tasks Breakdown Input (#11) */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-slate-300 font-medium">{t.subTasks}:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subTaskTitleInput}
                      onChange={e => setSubTaskTitleInput(e.target.value)}
                      placeholder="عنوان زیرکار..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200"
                    />
                    <input
                      type="number"
                      value={subTaskDayInput}
                      onChange={e => setSubTaskDayInput(e.target.value ? Number(e.target.value) : '')}
                      placeholder="روز..."
                      className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-200 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubTaskToForm}
                      className={`px-3 py-1.5 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl cursor-pointer`}
                    >
                      +
                    </button>
                  </div>

                  {newGoalSubTasks.length > 0 && (
                    <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                      {newGoalSubTasks.map(st => (
                        <div key={st.id} className="flex justify-between items-center bg-slate-900 p-1.5 rounded-lg">
                          <span>{st.title} {st.dayNumber ? `(روز ${st.dayNumber})` : ''}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubTaskFromForm(st.id)}
                            className="text-red-400 p-0.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl shadow-lg cursor-pointer`}
                >
                  {editingGoalId ? (lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes') : t.addGoal}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN PANEL MODAL (#4, #14, #18) */}
      <AnimatePresence>
        {isAdminModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-5 text-xs overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-slate-100">{t.adminPanel}</h3>
                </div>
                <button type="button" onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Admin GEMINI API KEY Config Section (#14, Issue #5) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-purple-300 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>{t.adminApiKey}</span>
                </h4>
                {adminApiKeyStatus && (
                  <p className="text-[11px] text-slate-400 font-mono">{adminApiKeyStatus}</p>
                )}
                <form onSubmit={handleSaveAdminApiKey} className="flex gap-2">
                  <input
                    type="password"
                    value={adminApiKeyInput}
                    onChange={e => setAdminApiKeyInput(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl cursor-pointer hover:bg-purple-500 transition-colors"
                  >
                    {t.saveApiKey}
                  </button>
                </form>
              </div>

              {/* Audit Log Excel Export Section (#18) */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-emerald-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{t.exportExcel}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    دریافت فایل اکسل تمام ورود و خروج‌های ثبت‌شده در سیستم ({auditLogs.length} رکورد)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportAuditLogsToExcel(auditLogs)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>دانلود خروجی Excel</span>
                </button>
              </div>

              {/* Registered Users Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">لیست کاربران ثبت شده ({users.length}):</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <th className="p-2.5">کاربر</th>
                        <th className="p-2.5">نام کاربری</th>
                        <th className="p-2.5">نقش</th>
                        <th className="p-2.5">تعداد ورود</th>
                        <th className="p-2.5">تاریخ ثبت‌نام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.filter(u => u && (u.id || u.username)).map(u => (
                        <tr key={u.id || u.username} className="hover:bg-slate-800/50">
                          <td className="p-2.5 font-bold text-slate-200">{u.displayName || u.username || 'کاربر'}</td>
                          <td className="p-2.5 font-mono text-cyan-400">@{u.username || '—'}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {u.role === 'admin' ? 'مدیر' : 'کاربر عادی'}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono">{u.loginCount || 1}</td>
                          <td className="p-2.5 font-mono text-slate-400">
                            {formatDisplayDate(u.createdAt, lang)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG (#1) */}
      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 text-center text-xs"
            >
              <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-100">{t.confirmDelete}</h3>
                <p className="text-slate-400">
                  آیا از حذف «<span className="text-slate-200 font-bold">{deleteConfirmModal.title}</span>» اطمینان دارید؟
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer shadow-lg"
                >
                  {t.delete}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
    </MotionConfig>
  );
}
