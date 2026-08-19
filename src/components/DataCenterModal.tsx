import React, { useState, useRef } from 'react';
import { 
  X, 
  Database, 
  FileText, 
  Eye, 
  Download, 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  BookOpen, 
  Bell, 
  Cpu, 
  Search, 
  Copy, 
  CheckCircle2, 
  Sparkles,
  Upload,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { AppState } from '../types';
import { generateSectionPDF } from '../utils/pdfGenerator';
import { toBengaliNumber } from '../utils/dateUtils';
import { exportAllDataJSON } from '../utils/storage';

interface DataCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onRestoreData?: (jsonStr: string) => void;
}

type SectionCategory = 'master' | 'attendance' | 'tasks' | 'directives' | 'hub' | 'telemetry';

export const DataCenterModal: React.FC<DataCenterModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreData
}) => {
  const [inspectCategory, setInspectCategory] = useState<SectionCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Backup & Restore states
  const [restoreText, setRestoreText] = useState('');
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isBn = state.settings.language === 'bn';

  const totalStaffCount = state.staffList.length;
  const totalAttendanceCount = state.attendanceRecords.length;
  const totalTasksCount = state.tasks.length;
  const totalDirectivesCount = state.directives.length;
  const totalHubItems = (state.hubData?.instructions?.length || 0) +
                        (state.hubData?.reminders?.length || 0) +
                        (state.hubData?.ideas?.length || 0) +
                        (state.hubData?.emergencies?.length || 0);

  // Helper to trigger PDF download
  const handleDownloadPDF = (category: SectionCategory, title: string, subtitle: string) => {
    generateSectionPDF({
      sectionTitle: title,
      sectionSubtitle: subtitle,
      category,
      state
    });
  };

  const handleCopyJSON = (dataObj: any) => {
    navigator.clipboard?.writeText(JSON.stringify(dataObj, null, 2));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const todayStr = new Date().toISOString().split('T')[0];
    link.download = `dilkhoosh_backup_${todayStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = (file: File) => {
    setDragError('');
    setImportSuccess(false);
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setDragError(isBn ? 'অনুগ্রহ করে শুধুমাত্র একটি বৈধ .json ফাইল আপলোড করুন! ❌' : 'Please select a valid .json backup file! ❌');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.staffList && parsed.attendanceRecords && parsed.directives && parsed.tasks) {
          if (onRestoreData) {
            onRestoreData(text);
            setImportSuccess(true);
            setTimeout(() => setImportSuccess(false), 3000);
          }
        } else {
          setDragError(isBn ? 'অকার্যকর ব্যাকআপ ফাইল ফরম্যাট! ❌' : 'Invalid backup file format. ❌');
        }
      } catch (err) {
        setDragError(isBn ? 'ফাইলটি পড়তে বা পার্স করতে ব্যর্থ হয়েছে! ❌' : 'Failed to read or parse backup file! ❌');
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileImport(files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-gray-950 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-[#031d36] to-slate-950 border-b border-sky-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-sky-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>{isBn ? 'ডাটা সেন্টার (Data Center)' : 'Data Center Hub'}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest">
                    PRO PDF export
                  </span>
                </h3>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                {isBn 
                  ? 'সকল ডাটা ও তথ্য সেকশন ওয়াইজ পিডিএফ (PDF) ডাউনলোড ও লাইভ ভিউ করুন' 
                  : 'Section-wise structured data inspection & high-fidelity PDF downloads'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-datacenter"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Master Complete Export Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-950 to-sky-950/80 border border-emerald-500/40 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    <span>{isBn ? '১. সকল তথ্যের মাস্টার পিডিএফ (Master System Archive)' : 'Master All-Data Complete Archive'}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      FULL PDF
                    </span>
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {isBn 
                      ? 'একটি ক্লিকে অ্যাপের ১০০% ডাটা (স্টাফ, হাজিরা, টাস্ক, নির্দেশিকা, হাব) সম্পূর্ণ ডাউনলোড করুন' 
                      : 'Download 100% complete application database in a unified PDF report'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="btn-view-master-data"
                  onClick={() => setInspectCategory('master')}
                  className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা (View)' : 'View Data'}</span>
                </button>

                <button
                  type="button"
                  id="btn-download-master-pdf"
                  onClick={() => handleDownloadPDF('master', 'Dilkhoosh Plus Master System Archive', 'সকল মডিউলের ১০০% ডাটা')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 border border-emerald-400/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডাউনলোড পিডিএফ' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800">
                <p className="text-[9px] text-gray-400 font-bold">{isBn ? 'মোট স্টাফ' : 'Staff'}</p>
                <p className="text-xs font-black text-emerald-400">{toBengaliNumber(totalStaffCount)} {isBn ? 'জন' : 'Members'}</p>
              </div>
              <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800">
                <p className="text-[9px] text-gray-400 font-bold">{isBn ? 'হাজিরা রেকর্ড' : 'Attendance'}</p>
                <p className="text-xs font-black text-sky-400">{toBengaliNumber(totalAttendanceCount)} {isBn ? 'টি' : 'Logs'}</p>
              </div>
              <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800">
                <p className="text-[9px] text-gray-400 font-bold">{isBn ? 'মোট কাজের তালিকা' : 'Tasks'}</p>
                <p className="text-xs font-black text-amber-400">{toBengaliNumber(totalTasksCount)} {isBn ? 'টি' : 'Tasks'}</p>
              </div>
              <div className="p-2 rounded-xl bg-gray-900/80 border border-gray-800">
                <p className="text-[9px] text-gray-400 font-bold">{isBn ? 'নির্দেশিকা ও হাব' : 'Directives'}</p>
                <p className="text-xs font-black text-purple-400">{toBengaliNumber(totalDirectivesCount + totalHubItems)} {isBn ? 'টি' : 'Items'}</p>
              </div>
            </div>
          </div>

          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider px-1 pt-2">
            {isBn ? 'সেকশন ওয়াইজ ডাটা এক্সপোর্ট (Section-Wise Data Center)' : 'Section-Wise Data Exports'}
          </h4>

          {/* Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Section 1: Staff Directory & Attendance */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gray-900/90 border border-emerald-500/25 hover:border-emerald-400/40 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {isBn ? '১. উপস্থিতি ও স্টাফ ডিরেক্টরি' : '1. Attendance & Staff Directory'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isBn ? `${toBengaliNumber(totalStaffCount)} জন স্টাফ • ${toBengaliNumber(totalAttendanceCount)}টি হাজিরা রেকর্ড` : `${totalStaffCount} staff • ${totalAttendanceCount} attendance logs`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInspectCategory('attendance')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা' : 'View Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF('attendance', 'Staff Directory & Attendance Log Report', 'স্টাফ তালিকা ও দৈনিক হাজিরা খাতা')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Daily Tasks & Progress */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gray-900/90 border border-sky-500/25 hover:border-sky-400/40 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {isBn ? '২. দৈনন্দিন টাস্ক ও প্রোগ্রেস' : '2. Tasks & Progress Subtasks'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isBn ? `মোট ${toBengaliNumber(totalTasksCount)}টি কাজ, সাব-টাস্ক ও এডমিন ফিডব্যাক` : `${totalTasksCount} tasks with subtasks & feedback`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInspectCategory('tasks')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা' : 'View Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF('tasks', 'Daily Tasks & Subtasks Report', 'দৈনন্দিন কাজ ও উপ-কাজের বিস্তারিত')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                </button>
              </div>
            </div>

            {/* Section 3: Directives & Official SOP */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gray-900/90 border border-purple-500/25 hover:border-purple-400/40 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {isBn ? '৩. অফিসিয়াল নির্দেশিকা ও এসওপি' : '3. Directives & SOP Protocols'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isBn ? `${toBengaliNumber(totalDirectivesCount)}টি নির্দেশিকা, প্রোটোকল ও একনলেজমেন্ট` : `${totalDirectivesCount} official directives & protocols`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInspectCategory('directives')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা' : 'View Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF('directives', 'Official Directives & SOP Report', 'সরকারি ও অফিসিয়াল নির্দেশিকা')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                </button>
              </div>
            </div>

            {/* Section 4: Central Hub & Emergency Contacts */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gray-900/90 border border-amber-500/25 hover:border-amber-400/40 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {isBn ? '৪. সেন্ট্রাল হাব ও জরুরি অ্যালার্ট' : '4. Central Hub & Emergency Alerts'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isBn ? `${toBengaliNumber(totalHubItems)}টি রিমাইন্ডার, নিয়ম ও যোগাযোগের তথ্য` : `${totalHubItems} instructions, ideas & emergency contacts`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInspectCategory('hub')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা' : 'View Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF('hub', 'Central Hub & Emergency Logs Report', 'সেন্ট্রাল হাব ও নোটিশের তথ্য')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                </button>
              </div>
            </div>

            {/* Section 5: Telemetry, Recycle Bin & Audit */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-gray-900/90 border border-indigo-500/25 hover:border-indigo-400/40 transition-all space-y-2.5 md:col-span-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">
                      {isBn ? '৫. সিস্টেম অডিট, রিসাইকেল বিন ও টেলিমোট্রি' : '5. System Audit, Recycle Bin & Telemetry'}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {isBn ? `মুছে ফেলা ${toBengaliNumber(state.recycleBin?.length || 0)}টি আইটেম, সেটিং ও ক্লাউড সিঙ্ক ডাটা` : `System configurations & ${state.recycleBin?.length || 0} deleted items history`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setInspectCategory('telemetry')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ভিউ ডাটা (View Audit)' : 'View Audit Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF('telemetry', 'System Audit & Telemetry Report', 'সিস্টেম অডিট ও মুছে ফেলা ফাইল')}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Backup & Disaster Recovery Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border border-sky-500/20 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/30">
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    {isBn ? 'সিস্টেম ব্যাকআপ ও রিস্টোর সেন্টার (Disaster Recovery)' : 'System Data Backup & Disaster Recovery'}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {isBn 
                      ? 'সম্পূর্ণ সিস্টেমের ১০০% ডাটা ব্যাকআপ ডাউনলোড করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন' 
                      : 'Export 100% full database state to JSON backup or import/restore existing archives'}
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-block text-[9px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase tracking-widest">
                Safe Storage
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Column 1: Export/Download */}
              <div className="md:col-span-5 p-3 rounded-xl bg-gray-900/40 border border-gray-800/60 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isBn ? '১. ডাটা ব্যাকআপ ডাউনলোড' : '1. Secure Data Export'}</span>
                  </h5>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed">
                    {isBn 
                      ? 'একটি সুরক্ষিত ক্রিপ্টোগ্রাফিক JSON ব্যাকআপ ফাইল ডাউনলোড হবে যা আপনি অন্য ডিভাইসে ব্যবহার করতে পারবেন।' 
                      : 'Generate and download a comprehensive JSON backup containing all current database collections.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 border border-emerald-400/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ব্যাকআপ ডাউনলোড করুন (JSON)' : 'Download Backup File (JSON)'}</span>
                </button>
              </div>

              {/* Column 2: Restore/Import with drag and drop */}
              <div className="md:col-span-7 p-3 rounded-xl bg-gray-900/40 border border-gray-800/60 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h5 className="text-xs font-black text-white flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isBn ? '২. ব্যাকআপ রিস্টোর সেন্টার' : '2. Disaster Data Restore'}</span>
                  </h5>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 leading-relaxed">
                    {isBn 
                      ? 'পূর্বে ডাউনলোড করা .json ফাইল ড্র্যাগ এন্ড ড্রপ করুন বা কপি-পেস্ট করে সিস্টেমের পুরোনো ডাটা রিস্টোর করুন।' 
                      : 'Drag & drop your backup file below, or click to upload, to perform a complete state rollback.'}
                  </p>
                </div>

                {/* Upload & Drag Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-sky-400 bg-sky-500/10'
                      : dragError
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : importSuccess
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : 'border-gray-800 hover:border-sky-500/30 hover:bg-gray-850/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files[0]) {
                        handleFileImport(files[0]);
                      }
                    }}
                    accept=".json"
                    className="hidden"
                  />

                  {importSuccess ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />
                      <p className="text-[11px] font-black text-emerald-400">
                        {isBn ? 'ডাটা সফলভাবে রিস্টোর হয়েছে! ✅' : 'System Restored Successfully! ✅'}
                      </p>
                    </>
                  ) : dragError ? (
                    <>
                      <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
                      <p className="text-[10px] font-bold text-rose-400">{dragError}</p>
                      <p className="text-[9px] text-gray-500">{isBn ? 'পুনরায় চেষ্টা করুন' : 'Click to retry'}</p>
                    </>
                  ) : (
                    <>
                      <Upload className={`w-6 h-6 ${isDragging ? 'text-sky-300 animate-bounce' : 'text-gray-500'}`} />
                      <p className="text-[11px] font-bold text-gray-300">
                        {isBn ? 'ব্যাকআপ ফাইলটি এখানে ড্রপ করুন অথবা ব্রাউজ করতে ক্লিক করুন' : 'Drag & Drop JSON file or click to browse'}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {isBn ? 'শুধুমাত্র অফিসিয়াল .json ব্যাকআপ ফাইল সমর্থিত' : 'Supports only official .json backup files'}
                      </p>
                    </>
                  )}
                </div>

                {/* Paste Area Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRestoreBox(!showRestoreBox)}
                    className="text-[10px] text-sky-400 hover:text-sky-300 underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-sky-400" />
                    <span>{showRestoreBox ? (isBn ? 'রিস্টোর বক্স লুকান' : 'Hide JSON paste input') : (isBn ? 'JSON কোড পেস্ট করে রিস্টোর করতে চান?' : 'Prefer to paste JSON text code directly?')}</span>
                  </button>

                  {showRestoreBox && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={3}
                        placeholder='{"staffList": [...], "attendanceRecords": [...], "directives": [...], "tasks": [...]}'
                        value={restoreText}
                        onChange={(e) => setRestoreText(e.target.value)}
                        className="w-full bg-gray-950 text-white text-[10px] rounded-xl p-2.5 border border-emerald-900/40 font-mono focus:outline-none focus:border-sky-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!restoreText.trim()) return;
                          if (onRestoreData) {
                            onRestoreData(restoreText.trim());
                            setRestoreText('');
                            setShowRestoreBox(false);
                            setImportSuccess(true);
                            setTimeout(() => setImportSuccess(false), 3000);
                          }
                        }}
                        className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black border border-sky-400/30 shadow-md transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-200" />
                        <span>{isBn ? 'কোড দিয়ে রিস্টোর করুন' : 'Execute Paste Restore'}</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-900/90 border-t border-gray-850 flex items-center justify-between text-[10px] text-gray-400">
          <span>🔒 Dilkhoosh Plus PRO Verified Encryption Data Export</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg font-bold"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>

      {/* ================= DATA INSPECTOR INTERACTIVE MODAL (ভিউ ডাটা উইন্ডো) ================= */}
      {inspectCategory && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-gray-950 border border-sky-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Inspector Modal Header */}
            <div className="p-3.5 sm:p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate">
                    {inspectCategory === 'master' && (isBn ? 'সমগ্র সিস্টেম মাস্টার ডাটা অডিট' : 'Master Database Inspector')}
                    {inspectCategory === 'attendance' && (isBn ? 'স্টাফ উপস্থিতি ও ডিরেক্টরি তথ্য' : 'Staff Attendance Inspector')}
                    {inspectCategory === 'tasks' && (isBn ? 'দৈনন্দিন কাজ ও প্রোগ্রেস ডাটা' : 'Tasks & Progress Inspector')}
                    {inspectCategory === 'directives' && (isBn ? 'অফিসিয়াল নির্দেশিকা ও এসওপি' : 'Directives & SOP Inspector')}
                    {inspectCategory === 'hub' && (isBn ? 'সেন্ট্রাল হাব ও জরুরি তথ্য' : 'Central Hub Inspector')}
                    {inspectCategory === 'telemetry' && (isBn ? 'সিস্টেম অডিট ও মুছে ফেলা ফাইল' : 'Audit Log & Telemetry Inspector')}
                  </h3>
                  <p className="text-[10px] text-gray-400 truncate">
                    {isBn ? 'লাইভ ডাটা রিড-অনলি ভিউয়ার • কোনো তথ্য বাদ দেওয়া হয়নি' : 'Live full schema inspection reader'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyJSON(
                    inspectCategory === 'master' ? state :
                    inspectCategory === 'attendance' ? { staffList: state.staffList, attendance: state.attendanceRecords } :
                    inspectCategory === 'tasks' ? state.tasks :
                    inspectCategory === 'directives' ? state.directives :
                    inspectCategory === 'hub' ? state.hubData :
                    { settings: state.settings, recycleBin: state.recycleBin }
                  )}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1"
                >
                  {copiedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSuccess ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : (isBn ? 'কপি JSON' : 'Copy JSON')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF(
                    inspectCategory,
                    `${inspectCategory.toUpperCase()} Report Export`,
                    'লাইভ ডাটা হাব রিপোর্ট'
                  )}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isBn ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectCategory(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="px-4 py-2.5 bg-gray-900/60 border-b border-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isBn ? "ডাটা খুঁজুন (নাম, আইডি, টাস্ক টাইটেল...)" : "Search within this data category..."}
                className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="text-xs text-gray-500 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            {/* Content Display */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* CATEGORY: ATTENDANCE & STAFF */}
              {(inspectCategory === 'master' || inspectCategory === 'attendance') && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-gray-900 border border-emerald-900/40">
                    <h4 className="font-black text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>Staff Members Directory ({state.staffList.length})</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400 font-bold">
                            <th className="py-1.5 px-2">ID</th>
                            <th className="py-1.5 px-2">Name</th>
                            <th className="py-1.5 px-2">Role</th>
                            <th className="py-1.5 px-2">Department</th>
                            <th className="py-1.5 px-2">Phone</th>
                            <th className="py-1.5 px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850">
                          {state.staffList
                            .filter(s => !searchTerm || s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.department.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(s => (
                              <tr key={s.id} className="hover:bg-gray-850/50">
                                <td className="py-1.5 px-2 font-mono text-gray-400">{s.id}</td>
                                <td className="py-1.5 px-2 font-bold text-white">{s.name}</td>
                                <td className="py-1.5 px-2 text-gray-300">{s.role}</td>
                                <td className="py-1.5 px-2 text-sky-400">{s.department}</td>
                                <td className="py-1.5 px-2 text-gray-400">{s.phone || '-'}</td>
                                <td className="py-1.5 px-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${s.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                    {s.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900 border border-emerald-900/40">
                    <h4 className="font-black text-emerald-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Attendance Logs ({state.attendanceRecords.length})</span>
                    </h4>
                    <div className="overflow-x-auto max-h-60">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-gray-800 text-gray-400 font-bold">
                            <th className="py-1.5 px-2">Date</th>
                            <th className="py-1.5 px-2">Staff</th>
                            <th className="py-1.5 px-2">Status</th>
                            <th className="py-1.5 px-2">Time</th>
                            <th className="py-1.5 px-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-850">
                          {state.attendanceRecords
                            .filter(r => !searchTerm || r.date.includes(searchTerm) || r.staffId.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map(r => {
                              const st = state.staffList.find(s => s.id === r.staffId);
                              return (
                                <tr key={r.id} className="hover:bg-gray-850/50">
                                  <td className="py-1.5 px-2 font-mono text-gray-300">{r.date}</td>
                                  <td className="py-1.5 px-2 font-bold text-white">{st ? st.name : r.staffId}</td>
                                  <td className="py-1.5 px-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                      r.status === 'present' ? 'bg-emerald-500/20 text-emerald-300' :
                                      r.status === 'late' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                                    }`}>
                                      {r.status}
                                    </span>
                                  </td>
                                  <td className="py-1.5 px-2 text-gray-400">{r.checkInTime || '-'}</td>
                                  <td className="py-1.5 px-2 text-gray-400">{r.note || '-'}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY: TASKS */}
              {(inspectCategory === 'master' || inspectCategory === 'tasks') && (
                <div className="p-3 rounded-xl bg-gray-900 border border-sky-900/40 space-y-2">
                  <h4 className="font-black text-sky-400 mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>Tasks & Subtask Checklists ({state.tasks.length})</span>
                  </h4>
                  
                  <div className="space-y-2">
                    {state.tasks
                      .filter(t => !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())))
                      .map(t => (
                        <div key={t.id} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-white text-xs">{t.title}</p>
                              {t.description && <p className="text-[11px] text-gray-400">{t.description}</p>}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${t.status === 'complete' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                              {t.status.toUpperCase()}
                            </span>
                          </div>
                          
                          {t.subtasks && t.subtasks.length > 0 && (
                            <div className="pl-2 pt-1 border-l-2 border-sky-500/30 text-[10px] space-y-0.5 text-gray-300">
                              <p className="font-bold text-sky-400">Subtasks:</p>
                              {t.subtasks.map((st, sIdx) => (
                                <p key={st.id || sIdx}>
                                  {st.completed ? '✓' : '•'} {st.title}
                                </p>
                              ))}
                            </div>
                          )}

                          {(t.feedback || t.remarks) && (
                            <p className="text-[10px] text-amber-300 italic pt-1">
                              💬 Feedback / Remarks: {t.feedback || t.remarks}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* CATEGORY: DIRECTIVES */}
              {(inspectCategory === 'master' || inspectCategory === 'directives') && (
                <div className="p-3 rounded-xl bg-gray-900 border border-purple-900/40 space-y-2">
                  <h4 className="font-black text-purple-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Directives & Official SOP Guidelines ({state.directives.length})</span>
                  </h4>

                  <div className="space-y-2">
                    {state.directives
                      .filter(d => !searchTerm || d.title.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(d => (
                        <div key={d.id} className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-white text-xs">{d.title}</h5>
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-black">
                              Dept: {d.targetDepartment}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-300">{d.content}</p>
                          <p className="text-[10px] text-gray-500">
                            Acknowledged by <strong>{d.acknowledgedStaffIds?.length || 0}</strong> staff members.
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* CATEGORY: HUB */}
              {(inspectCategory === 'master' || inspectCategory === 'hub') && (
                <div className="p-3 rounded-xl bg-gray-900 border border-amber-900/40 space-y-2">
                  <h4 className="font-black text-amber-400 mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4" />
                    <span>Central Hub, Reminders & Emergency Logs</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-gray-950 border border-gray-800">
                      <p className="font-bold text-amber-300 mb-1">📌 Rules & Instructions:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                        {state.hubData?.instructions?.map(i => <li key={i.id}>{i.text} ({i.status})</li>) || <li>None</li>}
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-gray-950 border border-gray-800">
                      <p className="font-bold text-sky-300 mb-1">⏰ Active Reminders:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                        {state.hubData?.reminders?.map(r => <li key={r.id}>[{r.time}] {r.title}</li>) || <li>None</li>}
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-gray-950 border border-gray-800">
                      <p className="font-bold text-emerald-300 mb-1">💡 Ideas:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                        {state.hubData?.ideas?.map(idea => <li key={idea.id}>{idea.text}</li>) || <li>None</li>}
                      </ul>
                    </div>

                    <div className="p-2 rounded bg-gray-950 border border-gray-800">
                      <p className="font-bold text-rose-300 mb-1">☎️ Emergency Contacts:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                        {state.hubData?.emergencies?.map(ec => <li key={ec.id}>{ec.title}: {ec.phone || ec.description || '-'}</li>) || <li>None</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY: TELEMETRY */}
              {(inspectCategory === 'master' || inspectCategory === 'telemetry') && (
                <div className="p-3 rounded-xl bg-gray-900 border border-indigo-900/40 space-y-2">
                  <h4 className="font-black text-indigo-400 mb-2 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>System Telemetry & Recycle Bin History</span>
                  </h4>

                  <div className="p-2 rounded bg-gray-950 border border-gray-800 space-y-1">
                    <p className="font-bold text-gray-300">⚙️ Settings Audit:</p>
                    <p className="text-gray-400 text-[11px]">App Version: <strong>v{state.settings.version}</strong> | Notification Mode: <strong>{state.settings.notificationMode}</strong></p>
                  </div>

                  <div className="p-2 rounded bg-gray-950 border border-gray-800 space-y-1">
                    <p className="font-bold text-rose-400">🗑️ Recycle Bin Deleted History ({state.recycleBin?.length || 0}):</p>
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                      {state.recycleBin?.map(rb => (
                        <li key={rb.id}>
                          <strong>[{rb.type.toUpperCase()}]</strong> {rb.name || rb.details} (Deleted: {rb.deletedAt || '-'})
                        </li>
                      )) || <li>No deleted items in recycle bin.</li>}
                    </ul>
                  </div>
                </div>
              )}

            </div>

            {/* Inspector Modal Footer */}
            <div className="p-3 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[10px] text-gray-400">Dilkhoosh Plus Real-Time Schema Inspector</span>
              <button
                type="button"
                onClick={() => setInspectCategory(null)}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold text-xs"
              >
                {isBn ? 'ব্যাক (Back to Data Center)' : 'Back to Data Center'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
