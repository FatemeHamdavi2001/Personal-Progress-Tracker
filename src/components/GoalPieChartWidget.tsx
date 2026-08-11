import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon, Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Activity, Goal } from '../types/tracker';
import { toPersianDigits, formatMinutesToHours } from '../utils/jalali';
import { Language, translations } from '../utils/translations';
import { ColorThemeConfig } from '../types/theme';

interface GoalPieChartWidgetProps {
  goals: Goal[];
  activities: Activity[];
  lang?: Language;
  activeTheme: ColorThemeConfig;
}

const PIE_COLORS = [
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EC4899', // pink
  '#3B82F6', // blue
  '#F43F5E', // rose
  '#14B8A6', // teal
  '#A855F7', // fuchsia
];

export const GoalPieChartWidget: React.FC<GoalPieChartWidgetProps> = ({
  goals,
  activities,
  lang = 'fa',
  activeTheme
}) => {
  const [timeRange, setTimeRange] = useState<'month' | 'year'>('month');
  const t = translations[lang] || translations.fa;

  // Filter activities based on selected range (last 30 days vs 365 days)
  const filteredActivities = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === 'month' ? 30 : 365;
    const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    return activities.filter(act => {
      if (!act.date) return true;
      const actDate = new Date(act.date);
      return !isNaN(actDate.getTime()) ? actDate >= cutoff : true;
    });
  }, [activities, timeRange]);

  // Generate pie chart data distribution by Category or by Goal
  const pieData = useMemo(() => {
    if (goals.length === 0 && filteredActivities.length === 0) return [];

    // Map time logged per goal/category
    const map = new Map<string, { name: string; minutes: number; color?: string }>();

    filteredActivities.forEach(act => {
      const goal = goals.find(g => g.id === act.goalId);
      const name = goal ? goal.title : (act.category || 'سایر / عمومی');
      const color = goal?.color;
      const current = map.get(name) || { name, minutes: 0, color };
      current.minutes += Number(act.duration || 0);
      map.set(name, current);
    });

    // Also include goals with baseline target hours
    goals.forEach(goal => {
      if (!map.has(goal.title)) {
        const loggedMins = filteredActivities
          .filter(a => a.goalId === goal.id)
          .reduce((sum, a) => sum + Number(a.duration || 0), 0);
        map.set(goal.title, {
          name: goal.title,
          minutes: loggedMins > 0 ? loggedMins : (goal.currentHours || 1) * 60,
          color: goal.color
        });
      }
    });

    const result = Array.from(map.values())
      .filter(item => item.minutes > 0)
      .map((item, idx) => ({
        name: item.name,
        value: Math.round((item.minutes / 60) * 10) / 10, // in hours
        minutes: item.minutes,
        color: item.color || PIE_COLORS[idx % PIE_COLORS.length]
      }));

    return result;
  }, [goals, filteredActivities]);

  const totalHours = useMemo(() => {
    return pieData.reduce((sum, d) => sum + d.value, 0).toFixed(1);
  }, [pieData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/60 shadow-xl space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold shrink-0">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{t.pieChartTitle}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'fa' 
                ? 'تحلیل تصویری سهم هر هدف و فعالیت در موازنه زمان'
                : 'Visual distribution of time logged across goals'}
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 shrink-0">
          <button
            type="button"
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? '۳۰ روز اخیر (ماهانه)' : 'Monthly'}
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeRange === 'year'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'fa' ? 'یک سال اخیر (سالانه)' : 'Yearly'}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      {pieData.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs font-sans">
          {lang === 'fa' 
            ? 'داده‌ای برای نمایش در این بازه زمانی موجود نیست. فعالیت جدیدی ثبت کنید!'
            : 'No data logged for this time range.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Recharts Pie Chart */}
          <div className="md:col-span-7 h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${lang === 'fa' ? toPersianDigits(value) : value} ${t.hours}`, 'مجموع کارکرد']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    fontFamily: 'inherit'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Summary Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] text-slate-400 block font-medium">مجموع زمان</span>
              <span className="text-base font-bold font-mono text-purple-300">
                {lang === 'fa' ? toPersianDigits(totalHours) : totalHours}h
              </span>
            </div>
          </div>

          {/* Legend Breakdown List */}
          <div className="md:col-span-5 space-y-2 max-h-64 overflow-y-auto pr-1">
            <span className="text-xs font-bold text-slate-300 block mb-2 border-b border-slate-700/50 pb-1">
              {lang === 'fa' ? 'تفکیک اهداف و دسته‌ها:' : 'Category Breakdown:'}
            </span>
            {pieData.map((item, idx) => {
              const totalMins = pieData.reduce((s, p) => s + p.value, 0);
              const percent = totalMins > 0 ? Math.round((item.value / totalMins) * 100) : 0;
              return (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate pr-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-slate-400 text-[11px]">
                      {lang === 'fa' ? toPersianDigits(item.value) : item.value}h
                    </span>
                    <span className="text-purple-400 font-bold text-[11px] bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30">
                      {lang === 'fa' ? toPersianDigits(percent) : percent}٪
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
