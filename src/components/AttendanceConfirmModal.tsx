import React from 'react';
import { 
  UserCheck, 
  LogOut, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ShieldCheck
} from 'lucide-react';
import { getCurrentTimeString, getTodayDateString, formatEnglishDate } from '../utils/dateUtils';

interface AttendanceConfirmModalProps {
  isOpen: boolean;
  actionType: 'checkin' | 'checkout';
  staffName: string;
  checkInTime?: string;
  onConfirm: () => void;
  onClose: () => void;
  isBn?: boolean;
}

export const AttendanceConfirmModal: React.FC<AttendanceConfirmModalProps> = ({
  isOpen,
  actionType,
  staffName,
  checkInTime,
  onConfirm,
  onClose,
  isBn = true
}) => {
  if (!isOpen) return null;

  const currentTime = getCurrentTimeString();
  const todayDate = formatEnglishDate(getTodayDateString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#03182e] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl text-white space-y-4 relative z-10 overflow-hidden">
        
        {/* Subtle Decorative Ambient Background Glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
          actionType === 'checkin' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl border ${
              actionType === 'checkin'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/40'
            }`}>
              {actionType === 'checkin' ? (
                <UserCheck className="w-5 h-5" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                {actionType === 'checkin'
                  ? (isBn ? 'চেক-ইন নিশ্চিতকরণ' : 'Check-In Confirmation')
                  : (isBn ? 'চেক-আউট নিশ্চিতকরণ' : 'Check-Out Confirmation')}
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {isBn ? 'অনুগ্রহ করে অ্যাকশন কনফার্ম করুন' : 'Please confirm your action'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Card */}
        <div className="bg-[#010d1a] p-3.5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
            <span className="text-slate-400 font-bold">{isBn ? 'কর্মীর নাম:' : 'Staff Name:'}</span>
            <span className="font-extrabold text-amber-300">👤 {staffName}</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-850 pb-2">
            <span className="text-slate-400 font-bold">{isBn ? 'আজকের তারিখ:' : 'Date:'}</span>
            <span className="font-mono font-bold text-slate-200">📅 {todayDate}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">
              {actionType === 'checkin'
                ? (isBn ? 'চেক-ইন সময়:' : 'Check-In Time:')
                : (isBn ? 'চেক-আউট সময়:' : 'Check-Out Time:')}
            </span>
            <span className="font-mono font-black text-emerald-400 text-sm">⏰ {currentTime}</span>
          </div>

          {actionType === 'checkout' && checkInTime && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-850 text-sky-300">
              <span className="text-slate-400 font-bold">{isBn ? 'চেক-ইন হয়েছিল:' : 'Checked In At:'}</span>
              <span className="font-mono font-bold">In: {checkInTime}</span>
            </div>
          )}
        </div>

        {/* Safety Note */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10.5px] text-slate-300 leading-relaxed font-medium flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            {actionType === 'checkin'
              ? (isBn 
                  ? 'নিরাপত্তা নিশ্চিত করা হয়েছে: একাধিকবার ট্রিপল/ডাবল ক্লিক করলেও এটি সবসময় চেক-ইন হিসেবেই সংরক্ষিত থাকবে।' 
                  : 'Safety Guaranteed: Multiple clicks will strictly remain as Check-In and will never toggle to Check-Out.')
              : (isBn 
                  ? 'আজকের শিফট সমাপ্তি নিশ্চিত করুন। চেক-আউট সম্পন্ন করার পর আজকের কাজের সময় হিসাব করা হবে।' 
                  : 'Confirm end of today’s shift. Duty time will be finalized.')}
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs text-slate-950 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider ${
              actionType === 'checkin'
                ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-950/60'
                : 'bg-amber-400 hover:bg-amber-300 shadow-amber-950/60'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {actionType === 'checkin'
                ? (isBn ? 'হ্যাঁ, চেক-ইন করুন' : 'Confirm Check-In')
                : (isBn ? 'হ্যাঁ, চেক-আউট করুন' : 'Confirm Check-Out')}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
