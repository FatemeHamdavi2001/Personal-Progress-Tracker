import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  ListTodo,
  Calendar,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits, g2j, JALALI_MONTH_NAMES } from '../utils/jalali';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isAuto?: boolean;
  category?: string;
}

interface DailyChecklistWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  username: string;
}

export const DailyChecklistWidget: React.FC<DailyChecklistWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  username
}) => {
  const todayObj = new Date();
  const todayIso = todayObj.toISOString().split('T')[0];
  const [jy, jm, jd] = g2j(todayObj.getFullYear(), todayObj.getMonth() + 1, todayObj.getDate());
  const todayPersianStr = `${toPersianDigits(jd)} ${JALALI_MONTH_NAMES[jm - 1]}`;

  const storageKey = `progress_daily_checklist_${username}_${todayIso}`;

  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);
  const [completedAutoIds, setCompletedAutoIds] = useState<Record<string, boolean>>({});
  const [deletedAutoIds, setDeletedAutoIds] = useState<Record<string, boolean>>({});
  const [newInputText, setNewInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Load custom items & check states from localStorage on mount or date/username change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomItems(parsed.customItems || []);
        setCompletedAutoIds(parsed.completedAutoIds || {});
        setDeletedAutoIds(parsed.deletedAutoIds || {});
      } else {
        setCustomItems([]);
        setCompletedAutoIds({});
        setDeletedAutoIds({});
      }
    } catch {
      setCustomItems([]);
      setCompletedAutoIds({});
      setDeletedAutoIds({});
    }
  }, [storageKey]);

  // Save changes to localStorage
  const saveState = (
    updatedCustoms: ChecklistItem[],
    updatedAutos: Record<string, boolean>,
    updatedDeletedAutos: Record<string, boolean>
  ) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          customItems: updatedCustoms,
          completedAutoIds: updatedAutos,
          deletedAutoIds: updatedDeletedAutos
        })
      );
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  };

  // Generate dynamic auto items based on user's registered goals and activities
  const todayActivities = activities.filter(a => a.date === todayIso);
  const todayTotalMins = todayActivities.reduce((sum, a) => sum + a.duration, 0);

  const rawAutoItems: ChecklistItem[] = [];

  // Item 1: General activity logging
  const hasLoggedToday = todayActivities.length > 0;
  rawAutoItems.push({
    id: 'auto-logged-today',
    text: 'ثبت حداقل یک فعالیت جدید برای امروز',
    completed: hasLoggedToday || !!completedAutoIds['auto-logged-today'],
    isAuto: true,
    category: 'عمومی'
  });

  // Item 2: Minimum focus target
  const reached30Mins = todayTotalMins >= 30;
  rawAutoItems.push({
    id: 'auto-target-30m',
    text: 'رسیدن به حداقل ۳۰ دقیقه زمان تمرکز',
    completed: reached30Mins || !!completedAutoIds['auto-target-30m'],
    isAuto: true,
    category: 'تمرکز'
  });

  // Items derived from user goals
  goals.forEach(goal => {
    const goalLoggedMins = todayActivities
      .filter(a => a.goalId === goal.id)
      .reduce((sum, a) => sum + a.duration, 0);
    const isGoalCompletedToday = goalLoggedMins > 0;
    rawAutoItems.push({
      id: `auto-goal-${goal.id}`,
      text: `پیشبرد هدف: «${goal.title}»`,
      completed: isGoalCompletedToday || !!completedAutoIds[`auto-goal-${goal.id}`],
      isAuto: true,
      category: goal.category || 'اهداف'
    });
  });

  // Filter out deleted auto items
  const autoItems = rawAutoItems.filter(item => !deletedAutoIds[item.id]);

  const allItems = [...autoItems, ...customItems];
  const completedCount = allItems.filter(i => i.completed).length;
  const totalCount = allItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleItem = (id: string, isAuto?: boolean) => {
    if (isAuto) {
      const nextAutos = { ...completedAutoIds, [id]: !completedAutoIds[id] };
      setCompletedAutoIds(nextAutos);
      saveState(customItems, nextAutos, deletedAutoIds);
    } else {
      const nextCustoms = customItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setCustomItems(nextCustoms);
      saveState(nextCustoms, completedAutoIds, deletedAutoIds);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInputText.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newInputText.trim(),
      completed: false,
      isAuto: false
    };

    const updated = [...customItems, newItem];
    setCustomItems(updated);
    saveState(updated, completedAutoIds, deletedAutoIds);
    setNewInputText('');
  };

  const handleDeleteItem = (id: string, isAuto?: boolean) => {
    if (isAuto) {
      const nextDeletedAutos = { ...deletedAutoIds, [id]: true };
      setDeletedAutoIds(nextDeletedAutos);
      saveState(customItems, completedAutoIds, nextDeletedAutos);
    } else {
      const updatedCustoms = customItems.filter(i => i.id !== id);
      setCustomItems(updatedCustoms);
      saveState(updatedCustoms, completedAutoIds, deletedAutoIds);
    }
  };

  const handleRestoreAutoItems = () => {
    setDeletedAutoIds({});
    saveState(customItems, completedAutoIds, {});
  };

  return (
    <div className="relative">
      {/* Compact Top Corner Widget Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border ${
          progressPercent === 100
            ? 'border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
            : activeTheme.badgeBorder
        } rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-xs font-sans`}
      >
        <div className="relative flex items-center justify-center">
          <ListTodo className={`w-4 h-4 ${activeTheme.textPrimary}`} />
          {progressPercent === 100 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
          )}
        </div>

        <span className="font-bold text-slate-200 hidden sm:inline">چک‌لیست روزانه</span>

        {/* Badge Pill */}
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            progressPercent === 100
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : `${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.badgeBorder}`
          }`}
        >
          {toPersianDigits(completedCount)} / {toPersianDigits(totalCount)}
        </span>

        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        )}
      </motion.button>

      {/* Popover / Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for easy closing */}
            <div
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-50 p-4 space-y-4 text-xs overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${activeTheme.badgeBg} ${activeTheme.textPrimary} flex items-center justify-center font-bold`}>
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 font-sans text-sm flex items-center gap-1.5">
                      <span>چک‌لیست امروز</span>
                      <span className="text-[10px] font-normal text-slate-400 font-mono">
                        ({todayPersianStr})
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      بر اساس اهداف و فعالیت‌های شخصی شما
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold text-slate-300">
                  ٪{toPersianDigits(progressPercent)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-300 ${
                      progressPercent === 100
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                        : activeTheme.btnPrimary
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {progressPercent === 100 && (
                  <p className="text-[10px] text-emerald-400 font-medium text-center flex items-center justify-center gap-1 pt-0.5">
                    <Sparkles className="w-3 h-3" />
                    <span>عالی بود! تمام چک‌لیست امروز تکمیل شد.</span>
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/50">
                {allItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id, item.isAuto)}
                    className={`pt-2 first:pt-0 flex items-start gap-2.5 p-1.5 rounded-xl cursor-pointer transition-colors group ${
                      item.completed ? 'opacity-70 bg-slate-950/40' : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 group-hover:text-slate-200 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </button>

                    <div className="flex-1 text-right space-y-0.5">
                      <p
                        className={`text-xs font-sans transition-all leading-relaxed ${
                          item.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-200 font-medium'
                        }`}
                      >
                        {item.text}
                      </p>
                      {item.category && (
                        <span className="inline-block text-[9px] text-slate-500 font-mono">
                          {item.isAuto ? '⚡ هوشمند' : '📌 شخصی'} • {item.category}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteItem(item.id, item.isAuto);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 transition-opacity cursor-pointer shrink-0"
                      title="حذف این مورد از چک‌لیست"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {allItems.length === 0 && (
                  <div className="text-center py-4 text-slate-500 text-[11px] space-y-1">
                    <p>هیچ آیتمی در چک‌لیست امروز وجود ندارد.</p>
                  </div>
                )}
              </div>

              {Object.keys(deletedAutoIds).length > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleRestoreAutoItems}
                    className="text-[10px] text-teal-400 hover:underline cursor-pointer flex items-center gap-1 font-sans"
                  >
                    <span>بازیابی آیتم‌های حذف‌شده هوشمند</span>
                  </button>
                </div>
              )}

              {/* Add Custom Checklist Item Input Form */}
              <form onSubmit={handleAddCustom} className="flex gap-2 pt-2 border-t border-slate-800">
                <input
                  type="text"
                  value={newInputText}
                  onChange={e => setNewInputText(e.target.value)}
                  placeholder="افزودن آیتم شخصی به چک‌لیست..."
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
                <button
                  type="submit"
                  disabled={!newInputText.trim()}
                  className={`px-3 py-1.5 ${activeTheme.btnPrimary} rounded-xl font-bold flex items-center justify-center transition-opacity disabled:opacity-40 cursor-pointer`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
