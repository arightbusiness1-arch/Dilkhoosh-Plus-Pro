import React from 'react';
import { X, Keyboard, Command, CheckSquare, BookOpenCheck, UserPlus, Settings, BarChart3, ShieldCheck } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      keyCombo: 'Ctrl + N',
      macCombo: '⌘ + N',
      title: 'নতুন টাস্ক এন্ট্রি (Open New Task Modal)',
      desc: 'এডমিন প্যানেলে দ্রুত নতুন টাস্ক তৈরি করার ডায়ালগ ওপেন করে।',
      icon: CheckSquare,
      category: 'Admin Actions'
    },
    {
      keyCombo: 'Ctrl + S',
      macCombo: '⌘ + S',
      title: 'ফরম সেভ ও সাবমিট (Save Active Form)',
      desc: 'যেকোনো ওপেন উইন্ডো বা ফরম ইন্টারফেসের তথ্য সরাসরি সেভ করে।',
      icon: Command,
      category: 'Global Forms'
    },
    {
      keyCombo: 'Ctrl + Shift + D',
      macCombo: '⌘ + Shift + D',
      title: 'নতুন নির্দেশিকা পোস্ট (New Directive Modal)',
      desc: 'জরুরি নির্দেশিকা বা SOP কাজের তালিকা জারি করার উইন্ডো ওপেন করে।',
      icon: BookOpenCheck,
      category: 'Admin Actions'
    },
    {
      keyCombo: 'Ctrl + Shift + S',
      macCombo: '⌘ + Shift + S',
      title: 'নতুন স্টাফ রেজিস্ট্রেশন (Register New Staff)',
      desc: 'নতুন স্টাফ আইডি ও ডিটেইলস রেজিস্ট্রেশন ফরম ওপেন করে।',
      icon: UserPlus,
      category: 'Admin Actions'
    },
    {
      keyCombo: 'Ctrl + Shift + R',
      macCombo: '⌘ + Shift + R',
      title: 'রিপোর্টস প্যানেল (Open Reports Modal)',
      desc: 'ডেইলি সামারি, হাজিরা এবং টাস্ক এক্সপোর্ট রিপোর্ট ওপেন করে।',
      icon: BarChart3,
      category: 'Analytics'
    },
    {
      keyCombo: 'Ctrl + Shift + K',
      macCombo: '⌘ + Shift + K',
      title: 'সেটিংস প্যানেল (System Settings & App Info)',
      desc: 'অ্যাপের সেটিংস ও অ্যাপ ইনফো ডায়ালগ অন করে।',
      icon: Settings,
      category: 'System'
    },
    {
      keyCombo: 'Ctrl + K',
      macCombo: '⌘ + K',
      title: 'কিবোর্ড শর্টকাট গাইড (Toggle Shortcuts)',
      desc: 'এই কিবোর্ড শর্টকাট গাইড প্যানেল ওপেন বা ক্লোজ করে।',
      icon: Keyboard,
      category: 'Help & Navigation'
    },
    {
      keyCombo: 'Esc',
      macCombo: 'Esc',
      title: 'উইন্ডো বন্ধ করুন (Close Modal)',
      desc: 'চলতি কোনো পপআপ বা মোডাল বন্ধ করে স্বাভাবিক ভিউতে ফিরে আসে।',
      icon: X,
      category: 'Global'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-sky-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <Keyboard className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>কিবোর্ড শর্টকাট গাইড (Keyboard Shortcuts)</span>
              </h3>
              <p className="text-[11px] text-sky-300">
                এডমিন প্যানেলে সুপার-ফাস্ট কাজের সুবিধার্থে ব্যবহৃত হট-কি
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 space-y-2.5 max-h-[75vh] overflow-y-auto">
          {shortcuts.map((sc, idx) => {
            const Icon = sc.icon;
            return (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-gray-950 border border-gray-800 hover:border-sky-500/40 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-gray-900 text-sky-400 border border-gray-800 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">{sc.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{sc.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right flex items-center gap-1">
                  <kbd className="px-2 py-1 rounded bg-sky-950 text-sky-300 border border-sky-500/40 text-[11px] font-mono font-black shadow-inner">
                    {sc.keyCombo}
                  </kbd>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-gray-950/80 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Shortcuts Active for Admin Panel</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
          >
            ঠিক আছে
          </button>
        </div>

      </div>
    </div>
  );
};
