export const DEFAULT_CATEGORIES = ['مطالعه', 'برنامه‌نویسی', 'ورزش', 'زبان', 'عمومی'];

export interface Activity {
  id: string;
  title: string;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD
  jalaliDate: string;
  description?: string;
  goalId?: string;
  category?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  targetHours: number;
  currentHours: number;
  category?: string;
}

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-1',
    title: 'یادگیری کامل جنگو',
    targetDate: '1403/08/30',
    targetHours: 100,
    currentHours: 0,
    category: 'برنامه‌نویسی'
  },
  {
    id: 'goal-2',
    title: 'مطالعه زبان تخصصی',
    targetDate: '1403/09/15',
    targetHours: 50,
    currentHours: 0,
    category: 'زبان'
  },
  {
    id: 'goal-3',
    title: 'ورزش و تندرستی',
    targetDate: '1403/07/30',
    targetHours: 30,
    currentHours: 0,
    category: 'ورزش'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [];
