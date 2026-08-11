import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ListTodo,
  X,
  RotateCcw,
  Edit2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits, formatDisplayDateWithMonth } from '../utils/jalali';
import { Language, translations } from '../utils/translations';

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
  lang?: Language;
}

export const DailyChecklistWidget: React.FC<DailyChecklistWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  username,
  lang = 'fa'
}) => {
  const t = translations[lang] || translations.fa;
  const todayObj = new Date();
  const todayIso = todayObj.toISOString().split('T')[0];
  const dateStr = formatDisplayDateWithMonth(todayObj, lang as 'fa' | 'en');

  const storageKey = `progress_daily_checklist_${username}_${todayIso}`;

  const [customItems, setCustomItems] = useState<ChecklistItem[]>([]);
  const [completedAutoIds, setCompletedAutoIds] = useState<Record<string, boolean>>({});
  const [deletedAutoIds, setDeletedAutoIds] = useState<Record<string, boolean>>({});
  const [editedAutoTexts, setEditedAutoTexts] = useState<Record<string, string>>({});
  const [newInputText, setNewInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState('');

  // Load custom items & check states from localStorage on mount or date/username change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomItems(parsed.customItems || []);
        setCompletedAutoIds(parsed.completedAutoIds || {});
        setDeletedAutoIds(parsed.deletedAutoIds || {});
        setEditedAutoTexts(parsed.editedAutoTexts || {});
      } else {
        setCustomItems([]);
        setCompletedAutoIds({});
        setDeletedAutoIds({});
        setEditedAutoTexts({});
      }
    } catch {
      setCustomItems([]);
      setCompletedAutoIds({});
      setDeletedAutoIds({});
      setEditedAutoTexts({});
    }
  }, [storageKey]);

  // Save changes to localStorage
  const saveState = (
    updatedCustoms: ChecklistItem[],
    updatedAutos: Record<string, boolean>,
    updatedDeletedAutos: Record<string, boolean>,
    updatedEditedTexts: Record<string, string> = editedAutoTexts
  ) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          customItems: updatedCustoms,
          completedAutoIds: updatedAutos,
          deletedAutoIds: updatedDeletedAutos,
          editedAutoTexts: updatedEditedTexts
        })
      );
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  };

  // Generate dynamic auto items based on user's registered goals and activities
  const todayActivities = activities.filter(a => a.date === todayIso);
  const todayTotalMins = todayActivities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);

  const rawAutoItems: ChecklistItem[] = [];

  // Item 1: General activity logging
  const hasLoggedToday = todayActivities.length > 0;
  const auto1Text = editedAutoTexts['auto-logged-today'] || (lang === 'fa' ? 'ثبت حداقل یک فعالیت جدید برای امروز' : 'Log at least one activity for today');
  rawAutoItems.push({
    id: 'auto-logged-today',
    text: auto1Text,
    completed: hasLoggedToday || !!completedAutoIds['auto-logged-today'],
    isAuto: true,
    category: lang === 'fa' ? 'عمومی' : 'General'
  });

  // Item 2: Minimum focus target
  const reached30Mins = todayTotalMins >= 30;
  const auto2Text = editedAutoTexts['auto-target-30m'] || (lang === 'fa' ? 'رسیدن به حداقل ۳۰ دقیقه زمان تمرکز' : 'Reach at least 30 minutes of focus time');
  rawAutoItems.push({
    id: 'auto-target-30m',
    text: auto2Text,
    completed: reached30Mins || !!completedAutoIds['auto-target-30m'],
    isAuto: true,
    category: lang === 'fa' ? 'تمرکز' : 'Focus'
  });

  // Items derived from user goals
  goals.forEach(goal => {
    const goalLoggedMins = todayActivities
      .filter(a => a.goalId === goal.id)
      .reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
    const isGoalCompletedToday = goalLoggedMins > 0;
    const autoGoalText = editedAutoTexts[`auto-goal-${goal.id}`] || (lang === 'fa' ? `پیشبرد هدف: «${goal.title}»` : `Advance goal: "${goal.title}"`);
    rawAutoItems.push({
      id: `auto-goal-${goal.id}`,
      text: autoGoalText,
      completed: isGoalCompletedToday || !!completedAutoIds[`auto-goal-${goal.id}`],
      isAuto: true,
      category: goal.category || (lang === 'fa' ? 'اهداف' : 'Goals')
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
      saveState(customItems, nextAutos, deletedAutoIds, editedAutoTexts);
    } else {
      const nextCustoms = customItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setCustomItems(nextCustoms);
      saveState(nextCustoms, completedAutoIds, deletedAutoIds, editedAutoTexts);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInputText.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      text: newInputText.trim(),
      completed: false,
      isAuto: false,
      category: lang === 'fa' ? 'شخصی' : 'Personal'
    };

    const updated = [...customItems, newItem];
    setCustomItems(updated);
    saveState(updated, completedAutoIds, deletedAutoIds, editedAutoTexts);
    setNewInputText('');
  };

  const handleDeleteItem = (id: string, isAuto?: boolean) => {
    if (isAuto) {
      const nextDeletedAutos = { ...deletedAutoIds, [id]: true };
      setDeletedAutoIds(nextDeletedAutos);
      saveState(customItems, completedAutoIds, nextDeletedAutos, editedAutoTexts);
    } else {
      const updatedCustoms = customItems.filter(i => i.id !== id);
      setCustomItems(updatedCustoms);
      saveState(updatedCustoms, completedAutoIds, deletedAutoIds, editedAutoTexts);
    }
  };

  const handleStartEdit = (item: ChecklistItem) => {
    setEditingItemId(item.id);
    setEditingItemText(item.text);
  };

  const handleSaveEdit = (item: ChecklistItem) => {
    if (!editingItemText.trim()) return;
    const newText = editingItemText.trim();

    if (item.isAuto) {
      const nextEdited = { ...editedAutoTexts, [item.id]: newText };
      setEditedAutoTexts(nextEdited);
      saveState(customItems, completedAutoIds, deletedAutoIds, nextEdited);
    } else {
      const nextCustoms = customItems.map(i =>
        i.id === item.id ? { ...i, text: newText } : i
      );
      setCustomItems(nextCustoms);
      saveState(nextCustoms, completedAutoIds, deletedAutoIds, editedAutoTexts);
    }
    setEditingItemId(null);
  };

  const handleRestoreAutoItems = () => {
    setDeletedAutoIds({});
    saveState(customItems, completedAutoIds, {}, editedAutoTexts);
  };

  const formatNum = (num: number) => (lang === 'fa' ? toPersianDigits(num) : String(num));

  return (
    <>
      {/* High contrast, prominent widget trigger button in Header */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className={`px-3.5 py-2 bg-slate-900 border ${
          progressPercent === 100
            ? 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : activeTheme.badgeBorder
        } rounded-xl shadow-md transition-all flex items-center gap-2.5 cursor-pointer text-xs font-sans font-bold text-slate-100 hover:text-white hover:border-slate-500`}
      >
        <div className="relative flex items-center justify-center">
          <ListTodo className={`w-4 h-4 ${activeTheme.textPrimary}`} />
          {progressPercent === 100 && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
          )}
        </div>

        <span className="font-bold hidden sm:inline">
          {lang === 'fa' ? 'چک‌لیست روزانه' : 'Daily Checklist'}
        </span>

        {/* Badge Pill */}
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
            progressPercent === 100
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : `${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.badgeBorder}`
          }`}
        >
          {formatNum(completedCount)} / {formatNum(totalCount)}
        </span>

        <ChevronDown className="w-4 h-4 text-slate-300" />
      </motion.button>

      {/* FULL SCREEN MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Click-away Backdrop */}
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 text-xs overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder} flex items-center justify-center font-bold shadow-md`}>
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 font-sans text-base flex items-center gap-2">
                      <span>{lang === 'fa' ? 'چک‌لیست و کارهای امروز' : 'Today Daily Checklist'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      📅 {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${
                    progressPercent === 100
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                  }`}>
                    %{formatNum(progressPercent)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>{lang === 'fa' ? 'میزان پیشرفت کارهای امروز:' : 'Today Progress:'}</span>
                  <span className="font-mono">{formatNum(completedCount)} {lang === 'fa' ? 'از' : 'of'} {formatNum(totalCount)}</span>
                </div>
                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-300 ${
                      progressPercent === 100
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                        : activeTheme.btnPrimary
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {progressPercent === 100 && (
                  <p className="text-xs text-emerald-400 font-bold text-center flex items-center justify-center gap-1.5 pt-1">
                    <Sparkles className="w-4 h-4 animate-bounce" />
                    <span>{lang === 'fa' ? 'عالی بود! تمام کارهای امروز با موفقیت تکمیل شد.' : 'Awesome! All items completed today.'}</span>
                  </p>
                )}
              </div>

              {/* Add Custom Daily Task Form */}
              <form onSubmit={handleAddCustom} className="space-y-2 pt-1">
                <label className="block text-slate-300 font-semibold text-xs">
                  {lang === 'fa' ? 'افزودن آیتم جدید به چک‌لیست امروز:' : 'Add new item to today checklist:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInputText}
                    onChange={e => setNewInputText(e.target.value)}
                    placeholder={lang === 'fa' ? 'مثلاً: ۱۰ صفحه مطالعه کتاب، ورزش صبحگاهی...' : 'e.g. Read 10 pages, Morning exercise...'}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={!newInputText.trim()}
                    className={`px-4 py-2 ${activeTheme.btnPrimary} text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-md shrink-0`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'fa' ? 'افزودن' : 'Add'}</span>
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="space-y-2 pt-2">
                <h4 className="text-slate-300 font-bold text-xs flex items-center justify-between">
                  <span>{lang === 'fa' ? 'لیست کارهای امروز:' : 'Today Tasks:'}</span>
                  {allItems.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-normal">
                      {lang === 'fa' ? 'روی کارها کلیک کنید تا انجام‌شده شوند' : 'Click task to mark done'}
                    </span>
                  )}
                </h4>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {allItems.map(item => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => !isEditing && toggleItem(item.id, item.isAuto)}
                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all group ${
                          !isEditing ? 'cursor-pointer' : ''
                        } ${
                          item.completed
                            ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            className="text-slate-400 group-hover:text-slate-200 transition-colors shrink-0"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-500 group-hover:text-slate-300" />
                            )}
                          </button>

                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingItemText}
                                onChange={e => setEditingItemText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveEdit(item);
                                  if (e.key === 'Escape') setEditingItemId(null);
                                }}
                                autoFocus
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-teal-400"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item)}
                                className="p-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg cursor-pointer"
                                title={lang === 'fa' ? 'ذخیره' : 'Save'}
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingItemId(null)}
                                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                                title={lang === 'fa' ? 'انصراف' : 'Cancel'}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs font-sans transition-all leading-relaxed truncate ${
                                  item.completed
                                    ? 'line-through text-slate-500'
                                    : 'text-slate-100 font-medium'
                                }`}
                              >
                                {item.text}
                              </p>
                              {item.category && (
                                <span className="inline-block text-[9px] text-slate-400 font-mono mt-0.5">
                                  {item.isAuto ? '⚡ هوشمند' : '📌 شخصی'} • {item.category}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleStartEdit(item);
                              }}
                              className="text-slate-500 hover:text-amber-300 p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                              title={lang === 'fa' ? 'ویرایش عنوان' : 'Edit item'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteItem(item.id, item.isAuto);
                              }}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer shrink-0"
                              title={lang === 'fa' ? 'حذف از لیست' : 'Remove item'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {allItems.length === 0 && (
                    <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/80 text-slate-400 text-xs space-y-1">
                      <p>{lang === 'fa' ? 'هیچ آیتمی در چک‌لیست امروز وجود ندارد.' : 'No items in today checklist.'}</p>
                      <p className="text-[11px] text-slate-500">{lang === 'fa' ? 'یک آیتم جدید از کادر بالا اضافه کنید.' : 'Add a new item from input above.'}</p>
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(deletedAutoIds).length > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleRestoreAutoItems}
                    className="text-[11px] text-teal-400 hover:underline cursor-pointer flex items-center gap-1 font-sans font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'fa' ? 'بازیابی آیتم‌های هوشمند حذف‌شده' : 'Restore deleted smart items'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
