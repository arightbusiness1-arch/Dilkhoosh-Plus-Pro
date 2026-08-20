import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Quote,
  Share2,
  CalendarDays,
  CheckSquare,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  LogOut,
  CheckCheck
} from 'lucide-react';
import { AppState, StaffMember, AttendanceStatus, TaskItem, Directive } from '../types';
import { toBengaliNumber, getCurrentTimeString, formatEnglishDate, getDayNameEnglish, parseTimeStrToMinutes } from '../utils/dateUtils';
import { MotivationalQuoteBanner } from './MotivationalQuoteBanner';
import { AttendanceConfirmModal } from './AttendanceConfirmModal';

interface DashboardViewProps {
  state: AppState;
  onNavigateTab: (tab: any) => void;
  onOpenNewTask: () => void;
  onOpenNewDirective: () => void;
  onMarkAttendance: (staffId: string, status: AttendanceStatus, checkIn?: string, checkOut?: string, note?: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onAcknowledgeDirective: (directiveId: string, staffId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  state,
  onNavigateTab,
  onOpenNewTask,
  onOpenNewDirective,
  onMarkAttendance,
  onToggleTaskStatus,
  onAcknowledgeDirective
}) => {
  const [quickStaffId, setQuickStaffId] = useState<string>(state.staffList[0]?.id || '');
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [doubleClickConfirmed, setDoubleClickConfirmed] = useState<'checkin' | 'checkout' | null>(null);
  
  // Attendance Confirmation Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [confirmActionType, setConfirmActionType] = useState<'checkin' | 'checkout'>('checkin');

  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState<boolean>(false);
  const [isDirectivesCollapsed, setIsDirectivesCollapsed] = useState<boolean>(false);
  const [isTasksCollapsed, setIsTasksCollapsed] = useState<boolean>(true);
  const [isStaffActivityCollapsed, setIsStaffActivityCollapsed] = useState<boolean>(true);

  const isBn = state.settings.language === 'bn';

  const activeStaffList = state.staffList.filter(
    s => s.isActive
  );

  const totalStaffCount = activeStaffList.length;

  // Attendance stats for today
  const todayRecords = state.attendanceRecords.filter(
    r => r.date === state.selectedDate && activeStaffList.some(s => s.id === r.staffId)
  );

  const targetStaffId = state.currentUserId || quickStaffId || activeStaffList[0]?.id || 'admin';
  const myRecord = todayRecords.find(r => r.staffId === targetStaffId);
  const hasCheckedIn = Boolean(myRecord && myRecord.checkInTime);
  const hasCheckedOut = Boolean(myRecord && myRecord.checkOutTime);

  // Trigger Confirmation Modal for Check-In or Check-Out
  const handleOpenAttendanceConfirm = (type: 'checkin' | 'checkout') => {
    if (state.role === 'staff' && state.settings.staffCanSubmitAttendance === false) {
      alert(isBn ? 'দুঃখিত, এডমিন দ্বারা স্টাফদের হাজিরা সাবমিশন বন্ধ রাখা হয়েছে! 🔒' : 'Sorry, staff attendance submission is disabled by the Administrator! 🔒');
      return;
    }

    // Safety constraint: Check-In request will STRICTLY stay Check-In even if triple-clicked!
    setConfirmActionType(type);
    setIsConfirmModalOpen(true);
  };

  const executeAttendanceAction = (type: 'checkin' | 'checkout') => {
    if (state.role === 'staff' && state.settings.staffCanSubmitAttendance === false) {
      alert(isBn ? 'দুঃখিত, এডমিন দ্বারা স্টাফদের হাজিরা সাবমিশন বন্ধ রাখা হয়েছে! 🔒' : 'Sorry, staff attendance submission is disabled by the Administrator! 🔒');
      return;
    }

    if (type === 'checkin') {
      // Strictly perform Check-In and ensure Check-Out is preserved or untouched
      onMarkAttendance(
        targetStaffId, 
        'present', 
        getCurrentTimeString(), 
        myRecord?.checkOutTime, 
        myRecord?.note
      );
      setDoubleClickConfirmed('checkin');
      setTimeout(() => setDoubleClickConfirmed(null), 4000);
    } else {
      // Check-Out Action
      if (myRecord?.checkInTime) {
        const inMinutes = parseTimeStrToMinutes(myRecord.checkInTime);
        const nowMinutes = parseTimeStrToMinutes(getCurrentTimeString());
        if (nowMinutes - inMinutes < 1) {
          alert(isBn 
            ? '⚠️ আপনি মাত্র চেক-ইন করেছেন! চেক-আউট করার জন্য অন্তত ১ মিনিট অপেক্ষা করুন।' 
            : '⚠️ You just checked in! Please wait at least 1 minute before checking out.');
          return;
        }
      }

      onMarkAttendance(
        targetStaffId,
        myRecord?.status || 'present',
        myRecord?.checkInTime || getCurrentTimeString(),
        getCurrentTimeString(),
        myRecord?.note
      );
      setDoubleClickConfirmed('checkout');
      setTimeout(() => setDoubleClickConfirmed(null), 4000);
    }
  };

  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const leaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;
  const unmarkedCount = Math.max(0, totalStaffCount - todayRecords.length);

  const attendanceRate = totalStaffCount > 0 
    ? Math.round(((presentCount + lateCount) / totalStaffCount) * 100) 
    : 0;

  // Tasks stats
  const activeTasks = state.tasks.filter(t => t.status !== 'complete');
  const completedTasks = state.tasks.filter(t => t.status === 'complete');
  const todayTasks = state.tasks.slice(0, 5);

  // Urgent Directives
  const urgentDirectives = state.directives.filter(d => d.priority === 'urgent' || d.isPinned);

  // Quick WhatsApp summary copy
  const handleCopyWhatsAppSummary = () => {
    const summaryText = `*Dilkhoosh Plus - Daily Summary*\n` +
      `Date: ${state.selectedDate}\n` +
      `📊 *Attendance Report:*\n` +
      `• Total Staff: ${totalStaffCount} persons\n` +
      `• Present: ${presentCount} persons\n` +
      `• Late: ${lateCount} persons\n` +
      `• Leave: ${leaveCount} persons\n` +
      `• Absent: ${absentCount} persons\n` +
      `• Attendance Rate: ${attendanceRate}%\n\n` +
      `✅ *Tasks Updates:*\n` +
      `• Total Tasks: ${state.tasks.length}tasks\n` +
      `• Completed: ${completedTasks.length}tasks\n` +
      `• Ongoing/Remaining: ${activeTasks.length}tasks\n\n` +
      `_Sent from Dilkhoosh Plus System_`;

    navigator.clipboard.writeText(summaryText);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const selectedStaffRecord = todayRecords.find(r => r.staffId === quickStaffId);
  const currentStaff = state.staffList.find(s => s.id === state.currentUserId);
  const currentUserName = currentStaff?.name || 'Abdullah';
  const isStaffRole = state.role === 'staff';

  return (
    <div className="space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
      
      {/* 15-Second Non-Repeating Motivational Quote Banner */}
      <MotivationalQuoteBanner />

      {/* Welcome Greeting Header */}
      <div className="pt-1 px-0.5">
        <p className="text-xs sm:text-sm font-medium text-gray-400">
          {isStaffRole ? "Welcome back, Staff Portal Mode" : "Welcome back, Admin Panel"}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>{currentUserName}</span>
          <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-400/30">
            {currentStaff?.department || 'Dilkhoosh'}
          </span>
        </h1>
      </div>

      {/* Admin Panel Control Overview Card (When Admin Mode is Active) */}
      {!isStaffRole ? (
        <div className="bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-purple-900/40 border border-sky-500/30 rounded-2xl sm:rounded-3xl p-5 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-black">
                👑
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  {isBn ? 'সিস্টেম অ্যাডমিন কন্ট্রোল প্যানেল' : 'System Admin Control Panel'}
                </h2>
                <p className="text-xs text-sky-200/80">
                  {isBn ? 'সম্পূর্ণ সিস্টেম ও টাস্ক ম্যানেজমেন্ট নিয়ন্ত্রণে রয়েছে' : 'Full system and task management is active'}
                </p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              {isBn ? 'অনলাইন' : 'Online'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Staff Members</p>
              <p className="text-base font-black text-white mt-0.5">{totalStaffCount}</p>
            </div>
            <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Total Tasks</p>
              <p className="text-base font-black text-sky-400 mt-0.5">{state.tasks.length}</p>
            </div>
            <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Directives</p>
              <p className="text-base font-black text-amber-400 mt-0.5">{state.directives.length}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Daily Status Card (Dynamic Check-in / Check-Out flow for Staff) */
        <div className={`border rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden transition-all ${
            !hasCheckedIn
              ? 'bg-[#008BEB] bg-gradient-to-br from-[#0082FB] via-[#0070F3] to-[#0052FF] border-sky-400/30 shadow-blue-950/40'
              : !hasCheckedOut
              ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 border-amber-400/40 shadow-orange-950/50'
              : 'bg-gradient-to-br from-emerald-800 via-teal-900 to-gray-950 border-emerald-500/40 shadow-emerald-950/40'
          }`}
        >
          {/* Subtle Decorative Glow Circle */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header Row: Icon + Daily Status & Date Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
              <div className="p-1 rounded-lg bg-white/20 backdrop-blur-sm">
                {!hasCheckedIn ? (
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                ) : !hasCheckedOut ? (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
                )}
              </div>
              <span>
                {!hasCheckedIn 
                  ? (isBn ? 'দৈনিক হাজিরা ও শিফট' : 'Daily Status') 
                  : !hasCheckedOut 
                  ? (isBn ? 'ডিউটি চলমান ⚡' : 'Duty in Progress ⚡') 
                  : (isBn ? 'ডিউটি সমাপ্ত 🎉' : 'Duty Completed 🎉')}
              </span>
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold text-white border border-white/20 font-mono">
              {getDayNameEnglish(state.selectedDate).slice(0, 3)}, {formatEnglishDate(state.selectedDate)}
            </div>
          </div>

          {/* Card Content Title & Subtitle */}
          <div className="mt-3.5 sm:mt-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {!hasCheckedIn 
                ? (isBn ? 'আজকের শিফট শুরু করতে প্রস্তুত?' : 'Ready to start your shift?') 
                : !hasCheckedOut 
                ? (isBn ? 'ডিউটি চলমান (Shift in Progress)' : 'Shift in Progress') 
                : (isBn ? 'আজকের ডিউটি সমাপ্ত (Shift Finished)' : 'Shift Completed for Today')}
            </h2>

            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 font-medium">
              {state.role === 'staff' && state.settings.staffCanSubmitAttendance === false ? (
                <span className="text-rose-200 font-bold bg-black/45 px-2.5 py-1 rounded-md border border-rose-500/40">
                  🔒 {isBn ? 'এডমিন আপনার হাজিরা সাবমিশন অপশনটি বন্ধ করেছে!' : 'Self-attendance is locked by Admin!'}
                </span>
              ) : !hasCheckedIn ? (
                isBn ? 'নিরাপদ চেক-ইন করতে নিচের বাটনে ক্লিক করে নিশ্চিত করুন' : 'Click the button below to safely Check-In'
              ) : !hasCheckedOut ? (
                isBn 
                  ? `হাজিরা সম্পন্ন হয়েছে (${myRecord?.checkInTime})। ডিউটি শেষ হলে Check-Out করতে বাটনে ক্লিক করুন।`
                  : `Checked in at ${myRecord?.checkInTime}. Click below to Check-Out when your duty ends.`
              ) : (
                isBn 
                  ? `ইন: ${myRecord?.checkInTime} • আউট: ${myRecord?.checkOutTime} | আজকের ডিউটি সফলভাবে সমাপ্ত হয়েছে! 🎉`
                  : `Check-in: ${myRecord?.checkInTime} • Check-Out: ${myRecord?.checkOutTime} | Great job today! 🎉`
              )}
            </p>
          </div>

          {/* Action Buttons Row */}
          {!hasCheckedIn ? (
            /* 1. CHECK-IN BUTTON (Before checking in - Triple click safe) */
            <button
              type="button"
              id="check-in-now-btn"
              onClick={() => handleOpenAttendanceConfirm('checkin')}
              onDoubleClick={() => handleOpenAttendanceConfirm('checkin')}
              disabled={state.role === 'staff' && state.settings.staffCanSubmitAttendance === false}
              className={`w-full mt-4 sm:mt-5 py-3.5 px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.98] ${
                state.role === 'staff' && state.settings.staffCanSubmitAttendance === false
                  ? 'bg-gray-800 text-gray-500 border border-gray-700/80 cursor-not-allowed opacity-60'
                  : doubleClickConfirmed === 'checkin'
                  ? 'bg-emerald-500 text-white shadow-emerald-950/50 ring-2 ring-emerald-300'
                  : 'bg-white hover:bg-sky-50 text-[#0066FF] shadow-blue-950/30'
              }`}
            >
              <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${
                state.role === 'staff' && state.settings.staffCanSubmitAttendance === false ? 'text-gray-500' :
                doubleClickConfirmed === 'checkin' ? 'text-white' : 'text-[#0066FF]'
              }`} />
              <span>
                {state.role === 'staff' && state.settings.staffCanSubmitAttendance === false
                  ? (isBn ? '🔒 হাজিরা অপশন বন্ধ আছে' : '🔒 ATTENDANCE SYSTEM LOCKED')
                  : doubleClickConfirmed === 'checkin'
                  ? (isBn ? 'চেক-ইন সম্পন্ন হয়েছে! ✅' : 'CHECKED IN SUCCESSFULLY! ✅')
                  : (isBn ? 'CHECK-IN করুন (কনফার্মেশন নিন)' : 'CHECK-IN NOW (CONFIRM)')}
              </span>
            </button>
          ) : !hasCheckedOut ? (
            /* 2. CHECK-OUT BUTTON (When already checked in, duty in progress) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 sm:mt-5">
              <button
                type="button"
                id="check-in-already-done-btn"
                onClick={() => handleOpenAttendanceConfirm('checkin')}
                className="py-3 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 cursor-pointer"
                title="Strictly Check-In Only"
              >
                <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">
                  {isBn ? `চেক-ইন সম্পন্ন (${myRecord?.checkInTime})` : `Checked In (${myRecord?.checkInTime})`}
                </span>
              </button>

              <button
                type="button"
                id="check-out-now-btn"
                onClick={() => handleOpenAttendanceConfirm('checkout')}
                onDoubleClick={() => handleOpenAttendanceConfirm('checkout')}
                disabled={state.role === 'staff' && state.settings.staffCanSubmitAttendance === false}
                className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer active:scale-[0.98] ${
                  state.role === 'staff' && state.settings.staffCanSubmitAttendance === false
                    ? 'bg-gray-800 text-gray-500 border border-gray-700/80 cursor-not-allowed opacity-60'
                    : doubleClickConfirmed === 'checkout'
                    ? 'bg-emerald-500 text-white shadow-emerald-950/50 ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-rose-50 text-rose-700 shadow-rose-950/40 border border-rose-200'
                }`}
              >
                <LogOut className={`w-4 h-4 ${
                  doubleClickConfirmed === 'checkout' ? 'text-white' : 'text-rose-700'
                }`} />
                <span>
                  {doubleClickConfirmed === 'checkout'
                    ? (isBn ? 'চেক-আউট সম্পন্ন! 🎉' : 'CHECKED OUT! 🎉')
                    : (isBn ? '🛑 CHECK-OUT (ডিউটি শেষ)' : '🛑 CHECK-OUT (DUTY END)')}
                </span>
              </button>
            </div>
          ) : (
            /* 3. COMPLETED DUTY STATE */
            <button
              type="button"
              id="duty-completed-btn"
              onClick={() => handleOpenAttendanceConfirm('checkout')}
              className="w-full mt-4 sm:mt-5 py-3 px-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 shadow-inner transition-all cursor-pointer active:scale-[0.98]"
            >
              <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>
                {doubleClickConfirmed === 'checkout'
                  ? (isBn ? 'চেক-আউট সময় আপডেট হয়েছে! ✅' : 'CHECK-OUT UPDATED! ✅')
                  : (isBn ? `আজকের ডিউটি সমাপ্ত (আউট: ${myRecord?.checkOutTime}) ✅` : `DUTY COMPLETED (Checked Out: ${myRecord?.checkOutTime}) ✅`)}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Staff Activity Section or My Shift Log depending on role */}
      <div className="pt-1">
        {isStaffRole ? (
          // STAFF MODE: Show only their own shift activity and custom task progress
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  My Daily Work & Status
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  আপনার ব্যক্তিগত উপস্থিতি ও আজকের কাজের বিবরণী
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-md">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-gray-950 border border-gray-850/60 text-center">
                  <p className="text-[10px] text-gray-450 font-bold uppercase">Today's Status</p>
                  {(() => {
                    const myRec = state.attendanceRecords.find(r => r.staffId === state.currentUserId && r.date === state.selectedDate);
                    const status = myRec?.status || 'unmarked';
                    return (
                      <p className={`text-sm font-black mt-1 uppercase ${
                        status === 'present' ? 'text-emerald-400' :
                        status === 'late' ? 'text-rose-400' :
                        status === 'leave' ? 'text-purple-400' : 'text-gray-400'
                      }`}>
                        {status === 'present' ? 'Present (উপস্থিত)' :
                         status === 'late' ? 'Late (বিলম্ব)' :
                         status === 'leave' ? 'Leave (ছুটি)' : 'Not Marked Yet'}
                      </p>
                    );
                  })()}
                </div>

                <div className="p-3 rounded-xl bg-gray-950 border border-gray-850/60 text-center">
                  <p className="text-[10px] text-gray-450 font-bold uppercase">My Pending Tasks</p>
                  <p className="text-lg font-black text-sky-400 mt-0.5">
                    {String(state.tasks.filter(t => (t.assignedStaffId === state.currentUserId || t.assignedStaffId2 === state.currentUserId) && t.status !== 'complete').length)} Tasks
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-900/40 text-xs text-sky-300 leading-relaxed">
                📢 <strong>স্টাফ নোটিশ:</strong> আপনার জন্য বরাদ্দকৃত দৈনিক কাজের প্রোগ্রেস ও ফিডব্যাক আপডেট করতে নিচের <strong>"Tasks"</strong> ট্যাবটি ব্যবহার করুন।
              </div>
            </div>
          </div>
        ) : (
          // ADMIN MODE: Show Admin Profile only, NO staff names on home page
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isBn ? 'এডমিন প্রোফাইল' : 'Admin Profile'}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর কন্ট্রোল প্যানেল' : 'System Administrator Control Center'}
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg border border-sky-400/40">
                  👑
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {isBn ? 'সিস্টেম অ্যাডমিন' : 'System Administrator'}
                  </h4>
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                    <span>✨ {isBn ? 'ফুল অ্যাক্সেস ও কন্ট্রোল মোড' : 'Full Access & Control Mode'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-xl bg-gray-950 border border-emerald-900/30 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{isBn ? 'ম্যানেজড স্টাফ' : 'Managed Staff'}</p>
                  <p className="text-base font-black text-white mt-0.5 font-mono">
                    {toBengaliNumber(activeStaffList.length)} {isBn ? 'জন' : 'Staff'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-gray-950 border border-emerald-900/30 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{isBn ? 'স্ট্যাটাস' : 'Status'}</p>
                  <p className="text-xs font-black text-emerald-400 mt-1 uppercase">
                    {isBn ? 'সক্রিয় (Active)' : 'Active'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-900/40 text-xs text-sky-300 leading-relaxed">
                🛡️ <strong>{isBn ? 'এডমিন নোটিশ:' : 'Admin Notice:'}</strong> {isBn ? 'এডমিন মোডে স্টাফদের ব্যক্তিগত তালিকা হোম পেজে গোপন রাখা হয়েছে।' : 'Staff names are hidden on the home page in Admin mode.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Professional Attendance Confirmation Popup Modal */}
      <AttendanceConfirmModal
        isOpen={isConfirmModalOpen}
        actionType={confirmActionType}
        staffName={currentStaff?.name || currentUserName}
        checkInTime={myRecord?.checkInTime}
        onConfirm={() => executeAttendanceAction(confirmActionType)}
        onClose={() => setIsConfirmModalOpen(false)}
        isBn={isBn}
      />

    </div>
  );
};
