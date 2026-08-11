export interface CategoryItem {
  name: string;
  iconName?: string;
  color?: string;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [];

export interface GoalSubTask {
  id: string;
  title: string;
  dayNumber?: number; // e.g., Day 1, Day 2
  targetDate?: string;
  targetHours?: number;
  isCompleted?: boolean;
}

export type GoalTier = 'daily' | 'monthly' | 'yearly';
export type TrackingMethod = 'hours_logged' | 'days_remaining';
export type TargetType = 'hours' | 'days';

export interface Goal {
  id: string;
  title: string;
  startDate?: string; // YYYY/MM/DD or YYYY-MM-DD
  targetDate?: string; // YYYY/MM/DD or YYYY-MM-DD (deadline)
  deadlineDate?: string;
  targetHours: number;
  currentHours: number; // initial baseline hours
  targetType?: TargetType; // 'hours' or 'days'
  targetDays?: number;
  dailyHours?: number;
  trackingMethod?: TrackingMethod; // 'hours_logged' or 'days_remaining'
  tier?: GoalTier; // 'daily' | 'monthly' | 'yearly'
  subTasks?: GoalSubTask[];
  category?: string;
  color?: string; // hex or tailwind color
  durationMonths?: number;
}

export interface Activity {
  id: string;
  title: string;
  duration: number; // in minutes
  date: string; // YYYY-MM-DD
  jalaliDate: string;
  description?: string;
  goalId?: string;
  category?: string;
  subTaskId?: string;
}

export const INITIAL_GOALS: Goal[] = [];
export const INITIAL_ACTIVITIES: Activity[] = [];
