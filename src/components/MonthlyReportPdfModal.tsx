import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  X,
  Clock,
  Calendar,
  Target,
  Award,
  CheckCircle2,
  Sparkles,
  Printer,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Activity, Goal } from '../types/tracker';
import { ColorThemeConfig } from '../types/theme';
import {
  g2j,
  toPersianDigits,
  formatMinutesToHours,
  JALALI_MONTH_NAMES,
  formatDisplayDateWithMonth
} from '../utils/jalali';
import { Language, translations } from '../utils/translations';

interface MonthlyReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  goals: Goal[];
  activeTheme: ColorThemeConfig;
  userName?: string;
  lang?: Language;
}

export const MonthlyReportPdfModal: React.FC<MonthlyReportPdfModalProps> = ({
  isOpen,
  onClose,
  activities,
  goals,
  activeTheme,
  userName = 'کاربر گرامی',
  lang = 'fa'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const t = translations[lang] || translations.fa;

  // Determine current Jalali year & month
  const now = new Date();
  const [nowJy, nowJm] = g2j(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const [selectedJy, setSelectedJy] = useState<number>(nowJy);
  const [selectedJm, setSelectedJm] = useState<number>(nowJm);

  // Filter activities for selected Jalali month
  const monthlyActivities = activities.filter(act => {
    if (!act.date) return false;
    const d = new Date(act.date);
    if (isNaN(d.getTime())) return false;
    const [jy, jm] = g2j(d.getFullYear(), d.getMonth() + 1, d.getDate());
    return jy === selectedJy && jm === selectedJm;
  });

  // Calculate Monthly Metrics
  const totalMinutes = monthlyActivities.reduce((sum, a) => sum + (Number(a.duration) || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Active days count in this month
  const activeDaysSet = new Set(monthlyActivities.map(a => a.date));
  const activeDaysCount = activeDaysSet.size;

  // Average daily focus minutes for active days
  const avgDailyMins = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  monthlyActivities.forEach(a => {
    const cat = a.category || (lang === 'fa' ? 'عمومی' : 'General');
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(a.duration || 0);
  });
  const categoryList = Object.entries(categoryMap)
    .map(([cat, mins]) => ({
      category: cat,
      mins,
      hours: (mins / 60).toFixed(1),
      percent: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0
    }))
    .sort((a, b) => b.mins - a.mins);

  // Goals status for this month
  const goalProgressList = goals.map(g => {
    const monthMins = monthlyActivities
      .filter(a => a.goalId === g.id)
      .reduce((sum, a) => sum + Number(a.duration || 0), 0);
    const monthHours = monthMins / 60;
    const target = g.targetHours || 1;
    const percent = Math.min(Math.round((monthHours / target) * 100), 100);
    return {
      goal: g,
      monthMins,
      monthHours: monthHours.toFixed(1),
      percent
    };
  });

  // Recent 8 activities of the month
  const recentMonthlyActs = [...monthlyActivities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedJm === 1) {
      setSelectedJm(12);
      setSelectedJy(prev => prev - 1);
    } else {
      setSelectedJm(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedJm === 12) {
      setSelectedJm(1);
      setSelectedJy(prev => prev + 1);
    } else {
      setSelectedJm(prev => prev + 1);
    }
  };

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0F172A'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const monthName = JALALI_MONTH_NAMES[selectedJm - 1];
      const fileName = `گزارش_پیشرفت_ماهانه_${monthName}_${selectedJy}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const currentMonthName = JALALI_MONTH_NAMES[selectedJm - 1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl text-slate-950 font-bold shadow-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>گزارش پیشرفت ماهانه (PDF)</span>
                  <span className="text-xs bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                    {currentMonthName} {toPersianDigits(selectedJy)}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  پیش‌نمایش و دانلود گزارش خلاصه عملکرد ماهانه به همراه نمودارها و آمار
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>در حال ساخت PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>دانلود فایل PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Month Navigator Toolbar */}
          <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-300 shrink-0">
            <span className="font-medium text-slate-400">انتخاب ماه گزارش:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer flex items-center gap-1"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
                <span>ماه قبل</span>
              </button>

              <span className="font-bold text-teal-300 px-3 py-1 bg-slate-900 rounded-lg border border-slate-700/80 min-w-[120px] text-center">
                {currentMonthName} {toPersianDigits(selectedJy)}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer flex items-center gap-1"
                title="ماه بعد"
              >
                <span>ماه بعد</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Printable Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-950/40">
            {/* The printable document view */}
            <div
              ref={reportRef}
              className="bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl font-sans text-right dir-rtl max-w-3xl mx-auto"
            >
              {/* PDF Header Section */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-teal-400 inline-block shadow-sm" />
                    <h1 className="text-xl font-black text-slate-100 tracking-tight">
                      You Can Do It
                    </h1>
                  </div>
                  <h2 className="text-sm font-bold text-teal-300">
                    گزارش جامع پیشرفت و عملکرد ماهانه
                  </h2>
                </div>

                <div className="text-left font-mono text-[11px] text-slate-400 space-y-1">
                  <div>دوره: <span className="text-slate-200 font-bold">{currentMonthName} {toPersianDigits(selectedJy)}</span></div>
                  <div>تاریخ صدور: <span className="text-slate-200">{formatDisplayDateWithMonth(now, 'fa')}</span></div>
                  <div>کاربر: <span className="text-slate-200 font-bold">{userName}</span></div>
                </div>
              </div>

              {/* KPI Summary Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>مجموع زمان تمرکز</span>
                  </div>
                  <div className="text-base font-extrabold text-teal-300 font-mono">
                    {formatMinutesToHours(totalMinutes, 'fa')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    معادل {toPersianDigits(totalHours)} ساعت
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>روزهای فعال</span>
                  </div>
                  <div className="text-base font-extrabold text-amber-300 font-mono">
                    {toPersianDigits(activeDaysCount)} روز
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    ثبت فعالیت در ماه
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تعداد فعالیت‌ها</span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-300 font-mono">
                    {toPersianDigits(monthlyActivities.length)} رکورد
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    میانگین روزانه {toPersianDigits(avgDailyMins)} دقیقه
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-purple-400" />
                    <span>اهداف فعال</span>
                  </div>
                  <div className="text-base font-extrabold text-purple-300 font-mono">
                    {toPersianDigits(goals.length)} هدف
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    در برنامه‌ریزی ماه
                  </div>
                </div>
              </div>

              {/* Goals Progress Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Target className="w-4 h-4 text-teal-400" />
                  <span>وضعیت پیشرفت اهداف در {currentMonthName}</span>
                </h3>

                {goalProgressList.length > 0 ? (
                  <div className="space-y-2.5">
                    {goalProgressList.map(({ goal, monthHours, percent }) => (
                      <div key={goal.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: goal.color || '#06B6D4' }}
                            />
                            <span className="font-bold text-slate-100">{goal.title}</span>
                          </div>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {toPersianDigits(monthHours)} از {toPersianDigits(goal.targetHours || 0)} ساعت ({toPersianDigits(percent)}٪)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: goal.color || '#06B6D4'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-950/40 rounded-xl text-slate-500 text-xs">
                    هنوز هدفی تعریف نشده است.
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              {categoryList.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>توزیع زمان بر اساس دسته‌بندی‌ها</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categoryList.map(cat => (
                      <div key={cat.category} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{cat.category}</span>
                        <div className="text-left font-mono text-[11px] space-x-2 space-x-reverse">
                          <span className="text-teal-300 font-bold">{toPersianDigits(cat.hours)} ساعت</span>
                          <span className="text-slate-500">({toPersianDigits(cat.percent)}٪)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activities Logged */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>برخی از فعالیت‌های انجام‌شده در این ماه</span>
                </h3>

                {recentMonthlyActs.length > 0 ? (
                  <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                    {recentMonthlyActs.map(act => (
                      <div key={act.id} className="p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{act.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {formatDisplayDateWithMonth(act.date, 'fa')} • {act.category || 'عمومی'}
                          </div>
                        </div>
                        <span className="font-mono text-teal-400 font-bold text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {toPersianDigits(act.duration)} دقیقه
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-950/40 rounded-xl text-slate-500 text-xs">
                    هیچ فعالیتی برای این ماه ثبت نشده است.
                  </div>
                )}
              </div>

              {/* Motivational Footer Note */}
              <div className="bg-gradient-to-r from-teal-950/60 to-slate-950/80 p-3.5 rounded-xl border border-teal-500/20 flex items-center gap-3 text-xs text-teal-200">
                <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
                <p className="leading-relaxed">
                  تداوم و تمرکز کلید اصلی موفقیت پایدار است. با ثبت روزانه فعالیت‌ها و بررسی گزارش‌ها، هر روز یک گام به اهداف بزرگ خود نزدیک‌تر می‌شوید!
                </p>
              </div>

              {/* PDF Footer Timestamp */}
              <div className="pt-2 text-center text-[10px] text-slate-600 border-t border-slate-800/60 font-mono">
                تولید شده توسط سامانه You Can Do It • {now.toISOString()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
