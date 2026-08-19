import React from 'react';
import { ArrowLeft, Home, X } from 'lucide-react';

interface ViewBackButtonProps {
  onBack: () => void;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'sky' | 'purple' | 'amber' | 'indigo' | 'rose';
  isBn?: boolean;
}

export const ViewBackButton: React.FC<ViewBackButtonProps> = ({
  onBack,
  title,
  subtitle,
  badge,
  badgeColor = 'sky',
  isBn = true
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    sky: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  }[badgeColor];

  return (
    <div className="flex items-center justify-between gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 mb-2.5 rounded-lg bg-slate-900/90 border border-sky-900/40 shadow-sm backdrop-blur-md">
      {/* Left Back to Home button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#041c38] hover:bg-[#072a54] text-sky-300 hover:text-white border border-sky-500/40 text-xs font-bold transition-all active:scale-95 shadow-sm group cursor-pointer shrink-0"
        title={isBn ? 'হোম ড্যাশবোর্ডে ফিরুন' : 'Back to Home Dashboard'}
      >
        <ArrowLeft className="w-3.5 h-3.5 text-sky-400 group-hover:-translate-x-0.5 transition-transform" />
        <Home className="w-3.5 h-3.5 text-sky-300 shrink-0" />
        <span className="text-xs">{isBn ? 'হোম' : 'Home'}</span>
      </button>

      {/* Center Section Title & Badge */}
      {title && (
        <div className="flex items-center gap-1.5 min-w-0 px-1">
          <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-none">{title}</span>
          {badge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 hidden sm:inline-block ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Right Quick Close (X) button */}
      <button
        type="button"
        onClick={onBack}
        className="p-1 rounded-md bg-gray-950 hover:bg-rose-950/50 text-gray-400 hover:text-rose-300 border border-gray-800 hover:border-rose-500/40 transition-all active:scale-95 cursor-pointer shrink-0 group"
        title={isBn ? 'এই সেকশন বন্ধ করুন (হোমে যান)' : 'Close this view'}
      >
        <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-300" />
      </button>
    </div>
  );
};
