import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Calendar, Trash2, Plus } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  date: string;
  goalId?: string;
  createdAt: string;
}

interface Props {
  activities: any[];
  goals: any[];
  activeTheme: any;
  username: string;
  lang: 'fa' | 'en';
}

export const DailyChecklistWidget: React.FC<Props> = ({ username, lang }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const checklistKey = `daily_checklist_${username.toLowerCase()}`;

  useEffect(() => {
    const saved = localStorage.getItem(checklistKey);
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch {}
    }
  }, [username]);

  useEffect(() => {
    localStorage.setItem(checklistKey, JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}`,
      text: newItemText.trim(),
      done: false,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const moveToTomorrow = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, date: tomorrow.toISOString().split('T')[0] } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const doneItems = items.filter(i => i.done);
  const pendingItems = items.filter(i => !i.done);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <CheckSquare className="w-4 h-4 text-teal-400" />
        <span>{lang === 'fa' ? 'چک‌لیست روزانه' : 'Daily Checklist'}</span>
        <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full text-[10px]">
          {pendingItems.length}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-slate-200 text-sm">
              {lang === 'fa' ? 'چک‌لیست روزانه' : 'Daily Checklist'}
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
          </div>

          {/* Add new item */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder={lang === 'fa' ? 'کار جدید...' : 'New task...'}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            />
            <button
              onClick={addItem}
              className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Pending items */}
          {pendingItems.length > 0 && (
            <div className="mb-3">
              <h5 className="text-[10px] font-bold text-amber-400 mb-1">
                {lang === 'fa' ? '⏳ انجام نشده' : '⏳ Pending'}
              </h5>
              {pendingItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-lg mb-1">
                  <button onClick={() => toggleItem(item.id)} className="text-slate-400 hover:text-teal-400">
                    <Square className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-200 flex-1">{item.text}</span>
                  <button onClick={() => moveToTomorrow(item.id)} className="text-cyan-400 hover:text-cyan-300" title={lang === 'fa' ? 'انتقال به فردا' : 'Move to tomorrow'}>
                    <Calendar className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Done items */}
          {doneItems.length > 0 && (
            <div>
              <h5 className="text-[10px] font-bold text-emerald-400 mb-1">
                {lang === 'fa' ? '✅ انجام شده' : '✅ Done'}
              </h5>
              {doneItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-lg mb-1 opacity-60">
                  <button onClick={() => toggleItem(item.id)} className="text-emerald-400">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-slate-300 line-through flex-1">{item.text}</span>
                  <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {items.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              {lang === 'fa' ? 'هیچ کاری در لیست امروز نیست' : 'No tasks for today'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};