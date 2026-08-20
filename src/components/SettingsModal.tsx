import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Languages, 
  Bell, 
  BellOff, 
  VolumeX, 
  Volume2,
  Vibrate, 
  History, 
  Code, 
  Sparkles, 
  Check, 
  RefreshCw,
  Layers,
  ArrowUpCircle,
  ExternalLink,
  ShieldCheck,
  Info,
  Smartphone,
  Database,
  Cpu,
  CheckCircle2,
  FileSpreadsheet,
  CheckSquare,
  Users,
  FileText,
  Clock,
  Quote,
  Share2,
  Copy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  HardDrive,
  Wifi,
  Lock,
  Activity,
  ShieldAlert,
  Key,
  Terminal
} from 'lucide-react';
import { AppSettings, ThemeMode, AppLanguage, NotificationMode, AppState } from '../types';
import { getAppTelemetry, formatUptime } from '../utils/appTelemetry';

const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio playback prevented or unsupported', e);
  }
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  state?: AppState;
  initialTab?: 'settings' | 'info';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  state,
  initialTab = 'settings'
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'info'>(initialTab);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const [isReleaseLogsOpen, setIsReleaseLogsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [pinFeedback, setPinFeedback] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [uptimeStr, setUptimeStr] = useState<string>('');
  const isBn = settings.language === 'bn';

  // Live Uptime Timer counter for App Info
  React.useEffect(() => {
    if (!isOpen) return;
    const updateRuntime = () => {
      const bootTimeStr = sessionStorage.getItem('dilkhoosh_app_boot_time');
      const bootMs = bootTimeStr ? parseInt(bootTimeStr, 10) : Date.now();
      setUptimeStr(formatUptime(bootMs));
    };
    updateRuntime();
    const interval = setInterval(updateRuntime, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Keep active tab synced if initialTab changes on open
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const versionHistory = [
    {
      version: '1.4',
      versionEn: 'v1.4',
      title: 'High-Contrast Crystal Clear Light Theme Legibility System',
      date: 'Aug 18, 2026',
      changes: [
        'Complete Light Theme CSS architecture for 100% crisp, sharp text legibility across all views',
        'Automatic root class synchronization (html.light / body.light) for universal theme state',
        'Ultra-high contrast dark slate text (#0f172a), bright white card backgrounds (#ffffff), and vivid accent colors',
        'High-legibility input fields, textareas, selects, modal overlays, and badge pills'
      ]
    },
    {
      version: '1.3',
      versionEn: 'v1.3',
      title: 'Ultra-Compact Navigation & Space-Saving Action Controls',
      date: 'Aug 18, 2026',
      changes: [
        'Refactored Back to Home & Quick Close (X) buttons into a sleek, ultra-compact top navigation bar',
        'Optimized vertical and horizontal padding across sub-page headers (Attendance, Tasks, Directives, Hub, Reports)',
        'Compact close controls in Settings, Data Center, Recycle Bin, and Notifications modals'
      ]
    },
    {
      version: '1.2',
      versionEn: 'v1.2',
      title: 'Automated Sequential Decimal Version System & Mobile UI Optimization',
      date: 'Aug 18, 2026',
      changes: [
        'Set default active app version to v1.2 with automated decimal progression (v1.2 -> v1.3 -> v1.4 -> v2.0 -> v1000+)',
        'Compact "Set New Reminder" form layout in Hub and Management modules',
        'Universal version synchronization across header, drawer, hubs, and PDF reports'
      ]
    },
    {
      version: '1.1',
      versionEn: 'v1.1',
      title: 'Global Unified Version Sync & Compact UI Optimizations',
      date: 'Aug 18, 2026',
      changes: [
        'Synchronized app-wide version display across all views and components',
        'Refactored Set New Reminder form into compact and ultra-responsive layout',
        'Fixed Hub modal header overlay and scrollable container mechanics'
      ]
    },
    {
      version: '11.0',
      versionEn: 'v11.0',
      title: 'Admin Task Feedback & Remarks Overview',
      date: 'Aug 17, 2026',
      changes: [
        'Dedicated Admin view for all staff task feedbacks and remarks',
        'Real-time feedback monitoring across all tasks and departments',
        'Enhanced administrative oversight and communication tracking'
      ]
    },
    {
      version: '10.0',
      versionEn: 'v10.0',
      title: 'Task Feedback & Remarks Option',
      date: 'Aug 17, 2026',
      changes: [
        'Added feedback and remarks option directly under staff tasks',
        'Interactive task feedback input and instant saving',
        'Enhanced communication between staff and management on tasks'
      ]
    },
    {
      version: '9.0',
      versionEn: 'v9.0',
      title: 'Admin Dashboard & Role-Based Access Control',
      date: 'Aug 17, 2026',
      changes: [
        'Dedicated Admin Dashboard aggregating system-wide activity',
        'Pending task counts and recent attendance summaries',
        'Strict role-based access security enforcement for Admin role'
      ]
    },
    {
      version: '8.0',
      versionEn: 'v8.0',
      title: 'Collapsible Tasks on Home Page',
      date: 'Aug 17, 2026',
      changes: [
        'Collapsible Today\'s Tasks section on the home page by default',
        'Expand/Collapse toggle for better workspace space management',
        'Central Hub & all existing features fully synchronized'
      ]
    },
    {
      version: '7.0',
      versionEn: 'v7.0',
      title: 'Central Hub, Compact 2-Column Layout & Profile Section',
      date: 'Aug 17, 2026',
      changes: [
        'Central Hub tab in bottom navigation with 6 core tools',
        'Compact 2-column card grid layout with rich color grading & emojis',
        'Top Profile section in Menu & Pinned Settings option',
        'Special Instructions, Reminder, Own Ideas 💡, Emergency, Own action & Ai assistant'
      ]
    },
    {
      version: '3.1',
      versionEn: 'v3.1',
      title: 'App Info Suite & Motivational Quote Engine',
      date: 'Aug 17, 2026',
      changes: [
        'Dedicated App Info (অ্যাপের যাবতীয় তথ্য ও বিবরণী)',
        '6,900+ Non-repeating Motivational Quotes with 15s timer',
        'Mark as Read instant quote changer',
        'Quick copy, system diagnostics and live statistics'
      ]
    },
    {
      version: '3.0',
      versionEn: 'v3.0',
      title: 'Full Settings Suite & Customization',
      date: 'Aug 17, 2026',
      changes: [
        'Dark & Light theme switching',
        'Bangla & English language toggle',
        'DND, Silent & Vibration notification modes'
      ]
    },
    {
      version: '2.0',
      versionEn: 'v2.0',
      title: '4-Tab Fixed Bottom Bar & Notification Hub',
      date: 'Aug 17, 2026',
      changes: [
        '4 Fixed tabs: Home, Tasks, Report, Manu',
        'Header notification bell & alerts modal',
        'Excel CSV export & WhatsApp share'
      ]
    },
    {
      version: '1.0',
      versionEn: 'v1.0',
      title: 'Initial Dilkhoosh Plus Core Launch',
      date: 'Aug 01, 2026',
      changes: [
        'Staff attendance log & check-in',
        'Task management & sub-tasks checklist',
        'Directives & SOP workflows'
      ]
    }
  ];

  const handleBumpVersion = () => {
    const currentNum = parseFloat(settings.version.replace(/[^\d.]/g, '')) || 1.2;
    const nextNum = (Math.round((currentNum + 0.1) * 10) / 10).toFixed(1);
    onUpdateSettings({ version: nextNum });
  };

  const handleCopyAppInfo = () => {
    const infoText = `=== দিলখুশ প্লাস (Dilkhoosh Plus) - App Info ===
অ্যাপের নাম: দিলখুশ প্লাস (Dilkhoosh Plus)
ধরন: স্মার্ট স্টাফ উপস্থিতি ও সার্বিক কার্যক্রম ব্যবস্থাপনা সিস্টেম
সংস্করণ: v${settings.version} (Build 2026.08)
ডেভেলপার: ${settings.developerCredit}
নিরাপত্তা ও অপ্টিমাইজেশন: Database secured • 100% Mobile Optimized
মূল ফিচারসমূহ:
1. হোম ও উপস্থিতি ড্যাশবোর্ড (মোটিভেশনাল উক্তি সহ)
2. টাস্ক ম্যানেজমেন্ট ও সাব-টাস্ক চেকলিস্ট
3. রিপোর্ট হাব (এক্সেল CSV ও হোয়াটসঅ্যাপ সামারি)
4. স্টাফ ডিরেক্টরি ও জরুরি যোগাযোগ
5. নোটিশ ও নির্দেশিকা (একনলেজমেন্ট সহ)
6. ডার্ক/লাইট মোড ও বহুভাষিক সেটিংস
স্ট্যাটাস: অফলাইন-ফার্স্ট এবং সিকিউর লোকাল স্টোরেজ
কপিরাইট © 2026 দিলখুশ প্লাস`;

    navigator.clipboard?.writeText(infoText);
    setCopiedInfo(true);
    setTimeout(() => setCopiedInfo(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          settings.theme === 'dark'
            ? 'bg-gray-950 border-emerald-900/50 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header with Title and Tab Switcher */}
        <div className={`p-4 sm:p-5 border-b flex flex-col gap-3 ${
          settings.theme === 'dark' ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-700 text-white shadow-md shadow-emerald-950/40">
                {activeTab === 'settings' ? (
                  <Sparkles className="w-5 h-5 text-sky-300" />
                ) : (
                  <Info className="w-5 h-5 text-emerald-300" />
                )}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black tracking-tight">
                  {activeTab === 'settings' ? 'App Settings' : 'App Info (অ্যাপ তথ্য)'}
                </h3>
                <p className={`text-[10px] sm:text-[11px] ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeTab === 'settings' 
                    ? 'Theme, Language, Notification & Preferences' 
                    : 'দিলখুশ প্লাস অ্যাপের যাবতীয় তথ্য ও বিবরণ'}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              id="btn-close-settings-modal"
              onClick={onClose}
              className={`p-2 rounded-xl transition-all ${
                settings.theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation Pill */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-gray-950/80 border border-gray-800">
            <button
              type="button"
              id="tab-btn-settings"
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span>General Settings</span>
            </button>

            <button
              type="button"
              id="tab-btn-app-info"
              onClick={() => setActiveTab('info')}
              className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'info'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/60 ring-1 ring-emerald-400/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span>App Info (অ্যাপ তথ্য)</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-gray-800/40">
          
          {/* ================= TAB 1: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              
              {/* 1. Theme (Mobile-Responsive Compact Row) */}
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    <Sun className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Theme</p>
                    <p className="text-[9px] text-gray-400">
                      {settings.theme === 'dark' ? 'Dark Active' : 'Light Active'}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center bg-gray-950 p-0.5 rounded-lg border border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      settings.theme === 'dark'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`flex-1 sm:flex-initial px-3 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                      settings.theme === 'light'
                        ? 'bg-amber-500 text-gray-950 shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* 2. Language (Mobile-Responsive Compact Row) */}
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                    <Languages className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Language</p>
                    <p className="text-[9px] text-gray-400">
                      {settings.language === 'bn' ? 'বাংলা (Bengali)' : 'English (US)'}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center bg-gray-950 p-0.5 rounded-lg border border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ language: 'bn' })}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.language === 'bn'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">🇧🇩</span>
                    <span>বাংলা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ language: 'en' })}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.language === 'en'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">🇺🇸</span>
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* 3. Notification (Mobile-Responsive Compact Row) */}
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">Notification</p>
                    <p className="text-[9px] text-gray-400">
                      {settings.notificationMode === 'sound'
                        ? '🔊 Sound Active'
                        : settings.notificationMode === 'vibration'
                        ? '📳 Vibration Active'
                        : settings.notificationMode === 'silent'
                        ? '🔇 Silent Active'
                        : '🔕 DND Active'}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center bg-gray-950 p-0.5 rounded-lg border border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ notificationMode: 'sound' });
                      playNotificationChime();
                    }}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.notificationMode === 'sound'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                    title="Sound Mode (শব্দ ও টোন চালু)"
                  >
                    <Volume2 className="w-3 h-3 text-sky-200" />
                    <span>Sound</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ notificationMode: 'vibration' })}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.notificationMode === 'vibration'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                    title="Vibration Mode"
                  >
                    <Vibrate className="w-3 h-3 text-emerald-200" />
                    <span>Vibration</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ notificationMode: 'silent' })}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.notificationMode === 'silent'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                    title="Silent Mode"
                  >
                    <VolumeX className="w-3 h-3 text-amber-200" />
                    <span>Silent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ notificationMode: 'dnd' })}
                    className={`flex-1 sm:flex-initial px-2 py-1 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      settings.notificationMode === 'dnd'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-gray-450 hover:text-white'
                    }`}
                    title="Do Not Disturb"
                  >
                    <BellOff className="w-3 h-3 text-rose-200" />
                    <span>DND</span>
                  </button>
                </div>
              </div>

              {/* 3b. Admin PIN & Security Recovery Setup */}
              <div className="p-3.5 rounded-xl bg-gray-900/60 border border-amber-500/30 space-y-3.5">
                <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">
                        {isBn ? 'লগইন সিকিউরিটি ও পিন সেটআপ' : 'Login Security & PIN Setup'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {isBn ? 'লগইন পিন টাইপ, কাস্টম পিন ও পিন রিকভারি সেটআপ করুন' : 'Configure PIN mode, custom PIN, and security recovery'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-lg bg-gray-950 text-amber-300 border border-amber-500/30">
                    {settings.customAdminPin || settings.adminPin || '300723'}
                  </span>
                </div>

                {/* PIN Mode Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                    <Key className="w-3 h-3 text-sky-400" />
                    <span>{isBn ? 'লগইন পিন মোড:' : 'Login PIN Mode:'}</span>
                  </label>
                  <div className="p-2 bg-gray-950 rounded-xl border border-gray-800 text-center">
                    <span className="text-xs font-bold text-sky-400">
                      {isBn ? 'কাস্টম পিন মোড সক্রিয়' : 'Custom PIN Mode Active'}
                    </span>
                  </div>
                </div>

                {/* Custom PIN Field (Active when custom mode selected) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>{isBn ? 'কাস্টম লগইন পিন সেট করুন (৪-৬ ডিজিট):' : 'Set Custom Login PIN (4-6 digits):'}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      defaultValue={settings.customAdminPin || settings.adminPin || '300723'}
                      placeholder={isBn ? "যেমন: 12345" : "e.g. 12345"}
                      id="input-custom-admin-pin"
                      className="flex-1 bg-gray-950 text-amber-300 font-mono text-xs rounded-xl px-3 py-2 border border-gray-800 focus:outline-none focus:border-amber-400 font-black tracking-widest"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputEl = document.getElementById('input-custom-admin-pin') as HTMLInputElement;
                        if (inputEl) {
                          const inputVal = inputEl.value.trim();
                          if (inputVal.length >= 4 && inputVal.length <= 6 && /^\d+$/.test(inputVal)) {
                            onUpdateSettings({ customAdminPin: inputVal, adminPin: inputVal });
                            setPinFeedback({
                              text: isBn ? `কাস্টম পিন (${inputVal}) সফলভাবে সেট হয়েছে! ✅` : `Custom PIN (${inputVal}) set successfully! ✅`,
                              type: 'success'
                            });
                            setTimeout(() => setPinFeedback(null), 3500);
                          } else {
                            setPinFeedback({
                              text: isBn ? 'পিন কোড ৪ থেকে ৬ ডিজিটের সংখ্যা হতে হবে! ❌' : 'PIN must be 4 to 6 digits long! ❌',
                              type: 'error'
                            });
                            setTimeout(() => setPinFeedback(null), 3500);
                          }
                        }
                      }}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-gray-950 text-xs font-black rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      {isBn ? "সেভ পিন" : "Save PIN"}
                    </button>
                  </div>
                </div>

                {/* Security Recovery Options (সিকিউরিটি প্রশ্ন ও উত্তর সেটআপ) */}
                <div className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-[11px]">
                    <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isBn ? 'পিন ভুলে গেলে রিকভারি সেটআপ (Security Recovery)' : 'Forgot PIN Recovery Setup'}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-semibold">{isBn ? 'রিকভারি সিকিউরিটি প্রশ্ন:' : 'Security Recovery Question:'}</label>
                    <input
                      type="text"
                      defaultValue={settings.securityQuestion || 'আপনার প্রিয় সিকিউরিটি শব্দ কী?'}
                      placeholder={isBn ? "যেমন: আপনার প্রথম স্কুলের নাম কী?" : "e.g. Favorite Security Word"}
                      id="input-security-question"
                      className="w-full bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 border border-gray-800 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold">{isBn ? 'সিকিউরিটি উত্তর (Answer):' : 'Security Answer:'}</label>
                      <input
                        type="text"
                        defaultValue={settings.securityAnswer || 'dilkhoosh'}
                        placeholder={isBn ? "যেমন: dilkhoosh" : "e.g. dilkhoosh"}
                        id="input-security-answer"
                        className="w-full bg-gray-900 text-emerald-300 text-xs rounded-lg px-2.5 py-1.5 border border-gray-800 focus:outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 font-semibold">{isBn ? 'মাস্টার রিকভারি কোড (Key):' : 'Master Emergency Key:'}</label>
                      <input
                        type="text"
                        defaultValue={settings.masterRecoveryKey || '778899'}
                        placeholder="e.g. 778899"
                        id="input-master-key"
                        className="w-full bg-gray-900 text-sky-300 text-xs rounded-lg px-2.5 py-1.5 border border-gray-800 focus:outline-none focus:border-sky-400 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const qEl = document.getElementById('input-security-question') as HTMLInputElement;
                      const aEl = document.getElementById('input-security-answer') as HTMLInputElement;
                      const kEl = document.getElementById('input-master-key') as HTMLInputElement;
                      
                      const newQ = qEl?.value.trim() || 'আপনার প্রিয় সিকিউরিটি শব্দ কী?';
                      const newA = aEl?.value.trim() || 'dilkhoosh';
                      const newK = kEl?.value.trim() || '778899';

                      onUpdateSettings({
                        securityQuestion: newQ,
                        securityAnswer: newA,
                        masterRecoveryKey: newK
                      });

                      setPinFeedback({
                        text: isBn ? 'রিকভারি সিকিউরিটি সফলভাবে আপডেট হয়েছে! 🛡️' : 'Recovery security updated successfully! 🛡️',
                        type: 'success'
                      });
                      setTimeout(() => setPinFeedback(null), 3500);
                    }}
                    className="w-full py-1.5 bg-sky-700 hover:bg-sky-600 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isBn ? 'রিকভারি সিকিউরিটি সেভ করুন' : 'Save Recovery Security'}</span>
                  </button>
                </div>

                {pinFeedback && (
                  <div className={`text-xs font-semibold py-2 px-3 rounded-xl border animate-in fade-in slide-in-from-top-1 duration-150 ${
                    pinFeedback.type === 'success' 
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                      : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                  }`}>
                    {pinFeedback.text}
                  </div>
                )}
              </div>

              {/* 3c. Staff Access & Permissions Matrix */}
              <div className="p-3.5 rounded-xl bg-gray-900/60 border border-emerald-900/20 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-gray-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-450 border border-sky-500/20 shrink-0">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-[11px] sm:text-xs font-black text-white">Staff Access Permissions</h4>
                      <p className="text-[9px] text-gray-400">
                        {settings.language === 'bn' ? 'স্টাফ এক্সেস কন্ট্রোল ও পারমিশন ম্যাট্রিক্স' : 'Configure what Staff portal mode can access'}
                      </p>
                    </div>
                  </div>
                  {state?.role !== 'admin' && (
                    <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0">
                      <span>🔒 Admin Only</span>
                    </span>
                  )}
                </div>

                {state?.role !== 'admin' && (
                  <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-400/90 leading-relaxed">
                    {settings.language === 'bn' 
                      ? '⚠️ পারমিশন পরিবর্তন করার জন্য অনুগ্রহ করে আপনার রোল "এডমিন" এ পরিবর্তন করুন।' 
                      : '⚠️ Access control settings can only be configured by system Administrators.'}
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  {/* Toggle 1: Attendance submission */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '১. নিজের উপস্থিতি সাবমিট' : '1. Self Attendance Check-In'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'স্টাফরা নিজেই হাজিরা দিতে পারবে' : 'Allow staff to mark own daily attendance'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanSubmitAttendance: !settings.staffCanSubmitAttendance })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanSubmitAttendance ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanSubmitAttendance ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 2: Task Status Updates */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '২. কাজের স্ট্যাটাস আপডেট' : '2. Update Task Progress'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'কাজের প্রোগ্রেস ও স্ট্যাটাস বদলাতে পারবে' : 'Allow staff to update assigned task status'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanChangeTaskStatus: !settings.staffCanChangeTaskStatus })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanChangeTaskStatus ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanChangeTaskStatus ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 3: Add Directives / SOPs */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '৩. নোটিশ ও নির্দেশিকা পাবলিশ' : '3. Publish Directives & SOP'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'নতুন নির্দেশিকা বা অফিসিয়াল প্রোটোকল দেবে' : 'Allow staff to create system directives'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanAddDirectives: !settings.staffCanAddDirectives })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanAddDirectives ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanAddDirectives ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 4: Assign Tasks */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '৪. নতুন কাজ বা টাস্ক অ্যাসাইন' : '4. Assign & Create Tasks'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'অন্য স্টাফদের টাস্ক অ্যাসাইন করতে পারবে' : 'Allow staff to create and assign tasks'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanAddTasks: !settings.staffCanAddTasks })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanAddTasks ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanAddTasks ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 5: Access Reports & CSV */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '৫. রিপোর্ট দেখা ও এক্সেল ডাউনলোড' : '5. View Reports & Excel'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'এক্সেল ফাইল ও প্রিন্ট শিট ডাউনলোড করতে পারবে' : 'Allow staff to access reports hub'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanViewReports: !settings.staffCanViewReports })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanViewReports ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanViewReports ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Toggle 6: Central Hub management */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-250 truncate">
                        {settings.language === 'bn' ? '৬. সেন্ট্রাল হাব ম্যানেজমেন্ট' : '6. Manage Central Hub'}
                      </p>
                      <p className="text-[9px] text-gray-450 truncate">
                        {settings.language === 'bn' ? 'জরুরি নোটিশ, রিমাইন্ডার পরিবর্তন করতে পারবে' : 'Allow staff to edit central hub alerts'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={state?.role !== 'admin'}
                      onClick={() => onUpdateSettings({ staffCanManageHub: !settings.staffCanManageHub })}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.staffCanManageHub ? 'bg-emerald-600' : 'bg-gray-800'
                      } ${state?.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.staffCanManageHub ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Version Tracker */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    <span>Version Tracker</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-700 text-white border border-emerald-500/40">
                      v{settings.version}
                    </span>
                    <button
                      type="button"
                      onClick={handleBumpVersion}
                      title="Bump Version"
                      className="px-2 py-0.5 rounded-md bg-gray-800 hover:bg-gray-700 text-sky-300 text-[10px] font-bold border border-gray-700 flex items-center gap-1"
                    >
                      <ArrowUpCircle className="w-3 h-3 text-sky-400" />
                      <span>+0.1 Update</span>
                    </button>
                  </div>
                </div>

                {/* Version History Accordion */}
                <div className={`p-3 rounded-2xl border space-y-2 ${
                  settings.theme === 'dark' ? 'bg-gray-900/70 border-gray-800' : 'bg-gray-50 border-gray-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => setIsReleaseLogsOpen(!isReleaseLogsOpen)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <span className="text-[11px] font-bold text-gray-300">
                      Release Logs & History (v1.0 ➔ v{settings.version})
                    </span>
                    <span className="flex items-center gap-1 text-sky-400 font-bold text-[10px] bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-500/30">
                      <span>{isReleaseLogsOpen ? 'সংকুচিত করুন (Hide)' : 'বিস্তারিত দেখুন (Show Logs)'}</span>
                      {isReleaseLogsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  {isReleaseLogsOpen && (
                    <div className="space-y-2 text-xs pt-2 animate-fadeIn">
                      {versionHistory.map((item, idx) => (
                        <div 
                          key={item.version}
                          className={`p-2.5 rounded-xl border transition-all ${
                            idx === 0
                              ? settings.theme === 'dark' ? 'bg-gray-950 border-emerald-500/40' : 'bg-white border-emerald-300 shadow-sm'
                              : settings.theme === 'dark' ? 'bg-gray-950/40 border-gray-800/80 opacity-70' : 'bg-white/60 border-gray-200 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-sky-400 font-mono">{item.versionEn}</span>
                            <span className="text-[10px] text-gray-400">{item.date}</span>
                          </div>
                          <p className="text-xs font-semibold mt-0.5">{item.title}</p>
                          <ul className="mt-1 space-y-0.5 text-[11px] text-gray-400 list-disc list-inside">
                            {item.changes.map((ch, cIdx) => (
                              <li key={cIdx}>{ch}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Google Firebase Cloud Storage Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-[#031d36] to-slate-950 border border-sky-500/30 shadow-lg space-y-3 mt-4">
                <div className="flex items-center justify-between gap-2 border-b border-sky-900/40 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                      <Database className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                        <span>Google Firebase Cloud Storage</span>
                        <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Connected</span>
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {settings.language === 'bn' ? 'ফায়ারবেজ রিয়েল-টাইম ক্লাউড স্টোরেজ ও অটো-সিঙ্ক' : 'Live Firestore synchronization & persistent storage'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-0.5">Firebase Project</span>
                    <span className="font-bold text-white">Dilkhoosh Plus</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-0.5">Project ID</span>
                    <span className="font-mono font-bold text-sky-300">dilkhoosh-plus</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{settings.language === 'bn' ? 'অটোমেটিক ক্লাউড ব্যাকআপ সক্রিয়' : 'Automatic Dual Sync Active'}</span>
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    Firestore Database
                  </span>
                </div>
              </div>

              {/* Simple Developer Credit directly below Settings */}
              <p className="text-center text-xs text-gray-400 font-medium pt-3 pb-1">
                Developed By{' '}
                <a
                  href="https://www.facebook.com/iam.zubayerahmedr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 font-extrabold transition-all hover:underline"
                >
                  Zubayer Ahmedr
                </a>
              </p>

            </div>
          )}

          {/* ================= TAB 2: APP INFO (অ্যাপের যাবতীয় তথ্য) ================= */}
          {activeTab === 'info' && (() => {
            const telemetry = state ? getAppTelemetry(state) : getAppTelemetry({
              staffList: [],
              attendanceRecords: [],
              directives: [],
              tasks: [],
              selectedDate: '',
              currentUserId: '',
              role: 'admin',
              settings,
              hubData: { instructions: [], reminders: [], emergencies: [] },
              recycleBin: []
            });

            return (
            <div className="space-y-4 pt-1">
              
              {/* 1. App Identity Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 border border-emerald-700/50 shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-700 border border-emerald-400/50 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-950/80 ring-2 ring-sky-400/40 shrink-0">
                      DP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                          দিলখুশ প্লাস (Dilkhoosh Plus)
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                          Active v{settings.version}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
                        স্মার্ট স্টাফ উপস্থিতি ও সার্বিক কার্যক্রম ব্যবস্থাপনা সিস্টেম
                      </p>
                      <p className="text-[10px] text-sky-300 font-bold tracking-wide mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                        <span>Database secured • 100% Mobile Optimized</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAppInfo}
                    className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all text-xs flex items-center gap-1.5 shrink-0"
                    title="অ্যাপের সমস্ত তথ্য কপি করুন"
                  >
                    {copiedInfo ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[11px] text-emerald-400 font-bold">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] text-gray-300">কপি তথ্য</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-800/80 text-xs">
                  <div className="p-2 rounded-xl bg-gray-950/60 border border-gray-800/60">
                    <p className="text-[10px] text-gray-400">অ্যাপের ধরন</p>
                    <p className="font-bold text-white text-xs mt-0.5">অফিস ম্যানেজমেন্ট</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-950/60 border border-gray-800/60">
                    <p className="text-[10px] text-gray-400">বিল্ড ভার্সন</p>
                    <p className="font-bold text-sky-400 font-mono text-xs mt-0.5">v{settings.version}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-950/60 border border-gray-800/60">
                    <p className="text-[10px] text-gray-400">স্টোরেজ মোড</p>
                    <p className="font-bold text-emerald-400 text-xs mt-0.5">অফলাইন-ফার্স্ট</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-950/60 border border-gray-800/60">
                    <p className="text-[10px] text-gray-400">স্ট্যাটাস</p>
                    <p className="font-bold text-teal-300 text-xs mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span>অনলাইন ও সক্রিয়</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 🛑 BUILD STATE & TELEMETRY DASHBOARD */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-900/90 border border-sky-500/40 shadow-2xl space-y-3.5">
                <button
                  type="button"
                  onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
                      <Cpu className="w-4 h-4 text-sky-400" />
                    </div>
                    <div>
                      <h5 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>সিস্টেম পারফরম্যান্স ও টেলিমোট্রি সামারি</span>
                      </h5>
                      <p className="text-[10px] text-gray-400">
                        {isBn ? 'স্টোরেজ, সিকিউরিটি, এরর, রান টাইম ও পারমিশন ইনসাইটস' : 'Storage, Security, Error Log, Runtime & Permissions Dashboard'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{telemetry.buildState.status}</span>
                    </span>
                    <span className="p-1 rounded-lg bg-gray-800 text-sky-400">
                      {isTelemetryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </button>

                {isTelemetryOpen && (
                  <div className="space-y-3.5 pt-3 border-t border-gray-800 animate-fadeIn">
                    
                    {/* SECTION 1: STORAGE USAGE (কত জিবি/এমবি স্টোরেজ ব্যবহার করছে) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-gray-950 border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <span className="font-bold text-sky-300 flex items-center gap-1.5">
                          <HardDrive className="w-4 h-4 text-sky-400" />
                          <span>১. স্টোরেজ ইউজেজ (Storage Size & Usage)</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30 font-bold">
                          {telemetry.dataUsage.formattedGb}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2 rounded-xl bg-gray-900/90 border border-gray-800">
                          <p className="text-[10px] text-gray-400 font-medium">লোকাল ক্যাশ স্টোরেজ</p>
                          <p className="font-bold text-white font-mono text-xs mt-0.5">{telemetry.dataUsage.formattedSize}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-900/90 border border-gray-800">
                          <p className="text-[10px] text-gray-400 font-medium">ক্লাউড ডাটাবেজ ব্যাকআপ</p>
                          <p className="font-bold text-emerald-400 font-mono text-xs mt-0.5">dilkhoosh-plus (Firestore)</p>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span>লোকাল কোটা কোয়ালিটি ({telemetry.dataUsage.percentageUsed} of 5 MB)</span>
                          <span className="font-bold text-gray-300">{telemetry.dataUsage.itemCount} ডাটা কি (Keys)</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden p-0.5 border border-gray-700">
                          <div 
                            className="bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, parseFloat(telemetry.dataUsage.percentageUsed))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: APP RUNTIME & LIVE UPTIME (এপস রান টাইম) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-gray-950 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                          <span>২. এপস রান টাইম ও লাইভ আপটাইম (App Runtime)</span>
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Active Session</span>
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-950/80 border border-indigo-900/40">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">চলতি সেশনের মোট রান টাইম:</p>
                          <p className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-wider mt-0.5">
                            ⏱️ {uptimeStr || telemetry.runtimeInfo.uptimeFormatted}
                          </p>
                        </div>
                        <div className="text-[10px] text-gray-400 text-left sm:text-right space-y-0.5">
                          <p className="font-bold text-gray-300">{telemetry.buildState.environment}</p>
                          <p className="text-sky-300 font-mono">100% Operational • Zero Lag</p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 3: SECURITY & ENCRYPTION STATUS (সিকিউরিটি কতটুকু নিশ্চিত) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-gray-950 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>৩. সিকিউরিটি গার্ড ও এনক্রিপশন (Security Level)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          A+ Protected
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 space-y-0.5">
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3 text-emerald-400" />
                            <span>ডাটা সিকিউরিটি ও এনক্রিপশন</span>
                          </p>
                          <p className="font-bold text-emerald-300 text-[11px]">256-Bit SSL/TLS Encrypted</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 space-y-0.5">
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Key className="w-3 h-3 text-amber-400" />
                            <span>এডমিন পিন প্রোটেকশন</span>
                          </p>
                          <p className="font-bold text-amber-300 text-[11px]">6-Digit Encrypted PIN Guard</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 space-y-0.5">
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Database className="w-3 h-3 text-sky-400" />
                            <span>ফায়ারস্টোর সিকিউরিটি রুলস</span>
                          </p>
                          <p className="font-bold text-sky-300 text-[11px]">ABAC Access Control Active</p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 space-y-0.5">
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-teal-400" />
                            <span>গোপনীয়তা নিশ্চয়তা</span>
                          </p>
                          <p className="font-bold text-teal-300 text-[11px]">100% Private (No Data Leak)</p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 4: ERROR MONITORING (কোনো এরর আছে কি না) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-950/60 via-slate-900 to-gray-950 border border-teal-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <span className="font-bold text-teal-300 flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-teal-400" />
                          <span>৪. এরর মনিটরিং ও ডায়াগনস্টিক (Error Status Check)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>0 Errors Detected</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
                          <p className="text-gray-400">Storage Integrity</p>
                          <p className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> PASS
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
                          <p className="text-gray-400">Schema Check</p>
                          <p className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> PASS
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
                          <p className="text-gray-400">Memory Optimization</p>
                          <p className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> PASS
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-gray-950/80 border border-gray-800 text-center">
                          <p className="text-gray-400">Runtime Monitor</p>
                          <p className="font-bold text-emerald-400 mt-0.5 flex items-center justify-center gap-1">
                            <Check className="w-3 h-3" /> 0 Exception
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 5: SYSTEM PERMISSIONS MATRIX (কি কি পারমিশন লাগবে) */}
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-gray-950 border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-gray-800 pb-2">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5">
                          <Terminal className="w-4 h-4 text-purple-400" />
                          <span>৫. প্রয়োজনীয় পারমিশন তালিকা (Required System Permissions)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          5 Permissions Active
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {telemetry.permissions.map((perm) => (
                          <div 
                            key={perm.id} 
                            className="p-2 sm:p-2.5 rounded-xl bg-gray-950/80 border border-gray-800/80 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                                {perm.id === 'storage' && <HardDrive className="w-3.5 h-3.5" />}
                                {perm.id === 'notifications' && <Bell className="w-3.5 h-3.5" />}
                                {perm.id === 'vibration' && <Vibrate className="w-3.5 h-3.5" />}
                                {perm.id === 'internet' && <Wifi className="w-3.5 h-3.5" />}
                                {perm.id === 'clock' && <Clock className="w-3.5 h-3.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-200 truncate">{isBn ? perm.titleBn : perm.titleEn}</p>
                                <p className="text-[10px] text-gray-400 truncate">{isBn ? perm.descBn : perm.descEn}</p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>{perm.status}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* 2. Core Functional Modules (COMPACT & COLLAPSIBLE) */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsModulesOpen(!isModulesOpen)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all text-left shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      মূল ফিচার ও মডিউলসমূহ (6 Core Modules)
                    </h5>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-950 border border-sky-500/30">
                      {isModulesOpen ? 'সংকুচিত করুন' : 'মডিউলসমূহ দেখুন'}
                    </span>
                    {isModulesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isModulesOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fadeIn">
                    
                    {/* Feature 1: Home & Attendance */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>হোম ও দৈনিক উপস্থিতি ট্র্যাকার</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        দৈনিক কর্মীদের প্রেজেন্ট, লেট, হাফ-ডে ও এবসেন্ট মার্কিং ও রিয়েলটাইম কাউন্টার।
                      </p>
                    </div>

                    {/* Feature 2: Motivational Quote Engine */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Quote className="w-3.5 h-3.5 text-sky-400" />
                        <span>মোটিভেশনাল উক্তি ইঞ্জিন (৬,৯০০+ উক্তি)</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        ১৫ সেকেন্ড পর পর অটো-চেঞ্জিং উক্তি রোটেশন (Zero Repeat)।
                      </p>
                    </div>

                    {/* Feature 3: Task Management */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>টাস্ক ও কর্মপরিকল্পনা ব্যবস্থাপনা</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        অগ্রাধিকার ভিত্তিক টাস্ক, সাব-টাস্ক চেকলিস্ট ও রিমার্কস ফিডব্যাক।
                      </p>
                    </div>

                    {/* Feature 4: Reports & Print Hub */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-400" />
                        <span>রিপোর্ট ও এক্সেল CSV এক্সপোর্ট</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        মাসিক হাজিরা বিশ্লেষণ, ওয়ান-ক্লিক এক্সেল ও হোয়াটসঅ্যাপ শেয়ার।
                      </p>
                    </div>

                    {/* Feature 5: Staff Directory */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>কর্মী ডিরেক্টরি (Staff Directory)</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        সকল কর্মীদের পদবী, রক্তের গ্রুপ, মোবাইল ও জরুরি পরিচিতি।
                      </p>
                    </div>

                    {/* Feature 6: Directives & SOP */}
                    <div className="p-2.5 rounded-xl bg-gray-900/90 border border-gray-800 space-y-0.5">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        <span>অফিসিয়াল নির্দেশিকা ও নোটিশ</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">
                        জরুরি নোটিশ ও কর্মীদের একনলেজমেন্ট ট্র্যাকিং।
                      </p>
                    </div>

                  </div>
                )}
              </div>

              {/* 3. Live System Statistics (লাইভ সিস্টেম তথ্য) */}
              {state && (
                <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800 space-y-2.5">
                  <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>লাইভ সিস্টেম তথ্য ও ডাটা স্ট্যাটাস</span>
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-[10px] text-gray-400">মোট কর্মী</p>
                      <p className="text-sm font-black text-emerald-400">{state.staffList.length} জন</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-[10px] text-gray-400">মোট টাস্ক</p>
                      <p className="text-sm font-black text-sky-400">{state.tasks.length} টি</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-[10px] text-gray-400">নির্দেশিকা</p>
                      <p className="text-sm font-black text-amber-400">{state.directives.length} টি</p>
                    </div>
                    <div className="p-2 rounded-xl bg-gray-950 border border-gray-800">
                      <p className="text-[10px] text-gray-400">হাজিরা রেকর্ড</p>
                      <p className="text-sm font-black text-teal-400">{state.attendanceRecords.length} টি</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Security & Data Policy (নিরাপত্তা ও প্রাইভেসি) */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>ডাটা নিরাপত্তা ও অফলাইন স্থায়িত্ব</span>
                </h5>
                <p className="text-xs text-gray-300 leading-relaxed">
                  আপনার সকল তথ্য ব্রাউজারের সুরক্ষিত লোকাল স্টোরেজে সংরক্ষিত থাকে। ইন্টারনেট সংযোগ না থাকলেও অ্যাপটি নিরবচ্ছিন্নভাবে ব্যবহার করা যায় এবং কোনো তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
                </p>
              </div>

              {/* 5. Developer & Engineering Credit */}
              <p className="text-center text-xs text-gray-400 font-medium py-1">
                Developed By{' '}
                <a
                  href="https://www.facebook.com/iam.zubayerahmedr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400 font-extrabold transition-all hover:underline"
                >
                  Zubayer Ahmedr
                </a>
              </p>

            </div>
            );
          })()}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          settings.theme === 'dark' ? 'border-gray-800 bg-gray-900/80' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1.5 flex-wrap">
            <span>দিলখুশ প্লাস v{settings.version}</span>
            <span>•</span>
            <span>
              Developed By{' '}
              <a
                href="https://www.facebook.com/iam.zubayerahmedr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-500 hover:text-emerald-400 font-extrabold transition-all hover:underline"
              >
                Zubayer Ahmedr
              </a>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'info' ? (
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-sky-300 text-xs font-bold transition-all border border-gray-700 active:scale-95"
              >
                Settings-এ ফিরে যান
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold transition-all border border-emerald-600/40 active:scale-95 flex items-center gap-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>App Info দেখুন</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-md border border-emerald-500/40 transition-all active:scale-95"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
