import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  X,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Maximize2,
  Minimize2,
  Zap,
  Target,
  Brain,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import { toPersianDigits, formatMinutesToHours } from '../utils/jalali';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface GeminiChatbotWidgetProps {
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  username: string;
}

const SYSTEM_ROLES = [
  { id: 'mربی اهداف', title: '🎯 مربی اهداف و برنامه‌ریزی', desc: 'تمرکز روی دستیابی به اهداف و تحلیل روند' },
  { id: 'افزایش تمرکز', title: '⚡ مشاور افزایش تمرکز', desc: 'تکنیک‌های جلوگیری از حواس‌پرتی و پومودورو' },
  { id: 'عادت‌سازی', title: '📝 مربی ساخت عادت‌های روزانه', desc: 'تثبیت عادت‌های مثبت و ثبات قدم' },
  { id: 'تحلیل‌گر هوشمند', title: '💡 آنالیزور آمارهای پیشرفت', desc: 'تحلیل دقیق داده‌های فعالیت‌های ثبت‌شده' },
];

const GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', badge: 'عمومی و هوشمند' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', badge: 'تحلیل عمیق و پیشرفته' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'پاسخ فوق‌سریع' },
];

export const GeminiChatbotWidget: React.FC<GeminiChatbotWidgetProps> = ({
  activities,
  goals,
  activeTheme,
  username
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedRole, setSelectedRole] = useState(SYSTEM_ROLES[0].title);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [includeContext, setIncludeContext] = useState(true);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'model',
      text: `سلام ${username} عزیز! 👋\nمن مربی هوشمند توسعه فردی و دستیار Gemini شما هستم. چطور می‌توانم در برنامه‌ریزی اهداف، افزایش زمان تمرکز یا تحلیل روند فعالیت‌هایت به تو کمک کنم؟`,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Build context string from user activities & goals
  const buildUserDataContext = (): string => {
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const activeDays = new Set(activities.map(a => a.date)).size;

    let ctx = `کاربر: ${username}\n`;
    ctx += `مجموع زمان تمرکز ثبت‌شده: ${formatMinutesToHours(totalMinutes)} (${totalMinutes} دقیقه)\n`;
    ctx += `تعداد روزهای فعال ثبت‌شده: ${activeDays} روز\n`;

    if (goals.length > 0) {
      ctx += `اهداف فعال کاربر:\n`;
      goals.forEach(g => {
        const loggedMins = activities
          .filter(a => a.goalId === g.id)
          .reduce((s, a) => s + a.duration, 0);
        const loggedHours = (loggedMins / 60).toFixed(1);
        ctx += `- ${g.title}: هدف ${g.targetHours} ساعت (پیشرفت ثبت‌شده: ${loggedHours} ساعت) - دسته‌بندی: ${g.category}\n`;
      });
    } else {
      ctx += `هنوز هدفی ثبت نشده است.\n`;
    }

    if (activities.length > 0) {
      const recent = activities.slice(0, 5);
      ctx += `آخرین فعالیت‌های اخیر:\n`;
      recent.forEach(a => {
        ctx += `- ${a.title} (${a.duration} دقیقه در تاریخ ${a.date})\n`;
      });
    }

    return ctx;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const contextData = includeContext ? buildUserDataContext() : undefined;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          model: selectedModel,
          systemRole: selectedRole,
          userDataContext: contextData
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'پاسخی از سرور دریافت نشد.');
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ارتباط با هوش مصنوعی.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `گفتگو بازنشانی شد. چطور می‌توانم در ادامه به شما کمک کنم؟`,
        timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setErrorMsg(null);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'چطور زمان تمرکزم رو بالا ببرم؟',
    'با توجه به آمارهای من، پیشنهادت چیه؟',
    'یک برنامه برای اهداف هفتگی من تنظیم کن',
    'چطور پومودورو رو موثرتر اجرا کنم؟'
  ];

  return (
    <>
      {/* Floating Chat Launcher Button (Bottom-Left or Top Header trigger) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-12 px-4 rounded-full bg-slate-900 border ${activeTheme.borderAccent} shadow-2xl flex items-center gap-2.5 cursor-pointer text-slate-100 group relative overflow-hidden`}
        >
          {/* Subtle Glow */}
          <div className={`absolute inset-0 opacity-20 ${activeTheme.swatchBg} blur-md group-hover:opacity-35 transition-opacity`} />

          <div className={`w-8 h-8 rounded-full ${activeTheme.badgeBg} ${activeTheme.textPrimary} flex items-center justify-center relative z-10`}>
            <Bot className="w-5 h-5 animate-pulse" />
          </div>

          <div className="text-right z-10 hidden sm:block">
            <span className="block text-xs font-bold leading-none font-sans">مربی Gemini</span>
            <span className="text-[10px] text-slate-400 font-mono">هوش مصنوعی</span>
          </div>

          <Sparkles className="w-4 h-4 text-amber-400 z-10" />
        </motion.button>
      </div>

      {/* Chat Window Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`fixed ${
              isExpanded
                ? 'inset-4 sm:inset-10 z-50'
                : 'bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px]'
            } bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs font-sans`}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-2xl ${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder} flex items-center justify-center shadow-lg`}>
                  <Bot className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm font-sans flex items-center gap-1.5">
                    <span>مربی هوشمند Gemini</span>
                    <span className="text-[9px] font-mono font-normal bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full">
                      AI Coach
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    {selectedRole}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer ${
                    showSettings ? activeTheme.textPrimary : ''
                  }`}
                  title="تنظیمات مدل و نقش"
                >
                  <Sliders className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  title={isExpanded ? 'کوچک کردن' : 'بزرگ کردن'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="بستن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Settings Drawer */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-950 border-b border-slate-800 p-3.5 space-y-3 shrink-0 overflow-hidden text-[11px]"
                >
                  {/* Model Selector */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">انتخاب مدل Gemini:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                      {GEMINI_MODELS.map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedModel(m.id)}
                          className={`p-2 rounded-xl text-right border transition-all cursor-pointer ${
                            selectedModel === m.id
                              ? `${activeTheme.badgeBg} ${activeTheme.borderAccent} text-slate-100 font-bold`
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="block text-[11px] font-sans">{m.name}</span>
                          <span className="block text-[9px] font-mono text-slate-500 mt-0.5">{m.badge}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System Role Selector */}
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold block">نقش تخصصی دستیار:</label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-slate-600"
                    >
                      {SYSTEM_ROLES.map(r => (
                        <option key={r.id} value={r.title}>
                          {r.title} ({r.desc})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Include Context Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-300">ارسال آمارهای شخصی (اهداف و کارکردها) به AI:</span>
                    <button
                      type="button"
                      onClick={() => setIncludeContext(!includeContext)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        includeContext ? activeTheme.swatchBg : 'bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${
                          includeContext ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pr-2">
              {messages.map(msg => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                        isUser
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : `${activeTheme.badgeBg} ${activeTheme.textPrimary} border ${activeTheme.badgeBorder}`
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    {/* Message Content Bubble */}
                    <div
                      className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed font-sans space-y-1 relative group ${
                        isUser
                          ? `${activeTheme.btnPrimary} font-medium text-slate-950 shadow-md`
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                      <div className="flex justify-between items-center pt-1 text-[9px] opacity-70">
                        <span className="font-mono">{msg.timestamp}</span>

                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="p-1 hover:text-white transition-colors cursor-pointer"
                            title="کپی متن"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Loading Spinner Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                  <div className={`w-7 h-7 rounded-full ${activeTheme.badgeBg} ${activeTheme.textPrimary} flex items-center justify-center`}>
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-2xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[10px] text-slate-400 font-mono mr-1">در حال تفکر...</span>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-xl text-[11px] text-center">
                  {errorMsg}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions Chips */}
            <div className="p-2 px-3 bg-slate-950/60 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-full text-[10px] whitespace-nowrap transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="پاکسازی گفتگو"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="از مربی Gemini بپرسید (مثلاً: چطور زمان تمرکزم رو مدیریت کنم؟)..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600 disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className={`p-2 rounded-xl ${activeTheme.btnPrimary} font-bold transition-opacity disabled:opacity-40 cursor-pointer`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
