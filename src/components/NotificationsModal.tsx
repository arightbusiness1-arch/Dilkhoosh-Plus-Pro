import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Clock, 
  BookOpenCheck, 
  CheckCircle2, 
  CheckCheck, 
  RotateCcw, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AppState, AppTab, AttendanceStatus } from '../types';
import { getCurrentTimeString, formatEnglishDate } from '../utils/dateUtils';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onNavigateTab?: (tab: AppTab) => void;
  onAcknowledgeDirective?: (directiveId: string, staffId: string) => void;
  onMarkAttendance?: (staffId: string, status: AttendanceStatus, checkIn?: string, checkOut?: string, note?: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  state,
  onNavigateTab,
  onAcknowledgeDirective,
  onMarkAttendance
}) => {
  if (!isOpen) return null;

  // Persistence for read notifications
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dilkhoosh_read_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const markAsRead = (id: string) => {
    const nextRead = Array.from(new Set([...readNotificationIds, id]));
    setReadNotificationIds(nextRead);
    try {
      localStorage.setItem('dilkhoosh_read_notifications', JSON.stringify(nextRead));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = (idsToMark: string[]) => {
    const nextRead = Array.from(new Set([...readNotificationIds, ...idsToMark]));
    setReadNotificationIds(nextRead);
    try {
      localStorage.setItem('dilkhoosh_read_notifications', JSON.stringify(nextRead));
    } catch (e) {
      console.error(e);
    }
  };

  const clearReadNotifications = () => {
    setReadNotificationIds([]);
    try {
      localStorage.removeItem('dilkhoosh_read_notifications');
    } catch (e) {
      console.error(e);
    }
  };

  const today = state.selectedDate;
  const isBn = state.settings.language === 'bn';
  const effectiveUserId = state.currentUserId || state.staffList[0]?.id || 'admin';
  const currentStaffMember = state.staffList.find(s => s.id === effectiveUserId);
  const activeStaff = state.staffList.filter(s => s.isActive);

  // Attendance Data
  const todayAttendance = state.attendanceRecords.filter(r => r.date === today);
  const myTodayRecord = todayAttendance.find(r => r.staffId === effectiveUserId);
  const isMyCheckInPending = !myTodayRecord || !myTodayRecord.checkInTime;

  // Unmarked staff list
  const unmarkedStaffList = activeStaff.filter(st => !todayAttendance.some(r => r.staffId === st.id));

  // Official Directives
  const allDirectives = state.directives || [];

  // Professional Notification Item Interface
  interface ProfessionalNotificationItem {
    id: string;
    badge: string;
    badgeColor: 'sky' | 'emerald' | 'indigo' | 'purple';
    title: string;
    description: string;
    dateOrTime: string;
    authorityOrMeta?: string;
    actionLabel?: string;
    actionTab?: AppTab;
    onAction?: () => void;
    isRead: boolean;
  }

  const items: ProfessionalNotificationItem[] = [];

  // 1. Shift & Check-In Official Notice (if user pending check-in)
  if (isMyCheckInPending) {
    const id = `prof-checkin-pending-${today}-${effectiveUserId}`;
    items.push({
      id,
      badge: 'শিফট নোটিশ',
      badgeColor: 'emerald',
      title: 'দৈনিক কর্মঘণ্টা ও শিফট চেক-ইন নির্দেশিকা',
      description: `${currentStaffMember?.name || 'স্টাফ'}-এর আজকের কর্মদিবসের উপস্থিতি ও চেক-ইন এখনো সম্পন্ন করা হয়নি। অনুগ্রহ করে সময়মতো আপনার হাজিরা নিশ্চিত করুন।`,
      dateOrTime: formatEnglishDate(today),
      authorityOrMeta: `স্টাফ সদস্য: ${currentStaffMember?.name || 'আপনি'} • স্ট্যাটাস: পেন্ডিং চেক-ইন`,
      actionLabel: 'চেক-ইন পেজে যান',
      actionTab: 'home',
      onAction: () => {
        if (onNavigateTab) {
          onNavigateTab('home');
        }
      },
      isRead: readNotificationIds.includes(id)
    });
  }

  // 2. Department Attendance Overview Notice (Admin / Staff summary)
  if (unmarkedStaffList.length > 0) {
    const id = `prof-unmarked-summary-${today}`;
    items.push({
      id,
      badge: 'উপস্থিতি স্ট্যাটাস',
      badgeColor: 'sky',
      title: `কর্মীদের উপস্থিতি আপডেট: ${unmarkedStaffList.length} জনের হাজিরা বাকি`,
      description: `আজকের কর্মদিবসে মোট ${activeStaff.length} জন সক্রিয় স্টাফের মধ্যে ${unmarkedStaffList.length} জনের হাজিরা এন্ট্রি এখনো প্রক্রিয়াধীন রয়েছে।`,
      dateOrTime: formatEnglishDate(today),
      authorityOrMeta: `সক্রিয় কর্মী সংখ্যা: ${activeStaff.length} জন • প্রশাসনিক পর্যবেক্ষণ`,
      actionLabel: 'হাজিরা শিট দেখুন',
      actionTab: 'attendance',
      isRead: readNotificationIds.includes(id)
    });
  }

  // 3. Official Directives & SOP Announcements
  allDirectives.forEach(dir => {
    const isAck = dir.acknowledgedStaffIds?.includes(effectiveUserId);
    const id = `prof-directive-${dir.id}`;
    items.push({
      id,
      badge: 'অফিসিয়াল নির্দেশনা',
      badgeColor: 'purple',
      title: dir.title,
      description: dir.content,
      dateOrTime: dir.createdAt ? formatEnglishDate(dir.createdAt.slice(0, 10)) : formatEnglishDate(today),
      authorityOrMeta: `কর্তৃপক্ষ: ${dir.createdBy || 'ম্যানেজমেন্ট'} • ${isAck ? 'স্বীকৃতি সম্পন্ন' : 'স্বীকৃতি প্রয়োজন'}`,
      actionLabel: isAck ? 'নির্দেশনা দেখুন' : 'স্বীকৃতি দিন',
      actionTab: 'directives',
      onAction: () => {
        if (!isAck && onAcknowledgeDirective) {
          onAcknowledgeDirective(dir.id, effectiveUserId);
        }
      },
      isRead: readNotificationIds.includes(id) || isAck
    });
  });

  // Counts
  const unreadItems = items.filter(i => !i.isRead);
  const unreadCount = unreadItems.length;

  const handleActionClick = (item: ProfessionalNotificationItem) => {
    markAsRead(item.id);
    if (item.onAction) {
      item.onAction();
    }
    if (item.actionTab && onNavigateTab) {
      onClose();
      onNavigateTab(item.actionTab);
    }
  };

  const getBadgeStyle = (color: ProfessionalNotificationItem['badgeColor']) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'sky':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'purple':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-700/30 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md w-full overflow-hidden animate-in fade-in duration-200">
      
      {/* Professional Modal Container - Strict single view, no horizontal overflow */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Sleek Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 bg-[#070D1F] flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-sky-400 shadow-sm shrink-0">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  সকল নোটিফিকেশন
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300 border border-slate-700">
                  প্রফেশনাল মোড
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/50">
                  {items.length} টি নোটিশ
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/50">
                    {unreadCount} নতুন
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                অফিসিয়াল নির্দেশনা ও উপস্থিতি সংক্রান্ত সকল বিজ্ঞপ্তি
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead(items.map(i => i.id))}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] sm:text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-750 active:scale-95 shadow-sm cursor-pointer"
                title="সবগুলো পঠিত চিহ্নিত করুন"
              >
                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">সব Mark as read</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Single-Page Notification Feed - Vertical scroll only, no horizontal scroll */}
        <div className="p-3.5 sm:p-5 space-y-3 overflow-y-auto overflow-x-hidden flex-1 w-full">
          
          {items.length > 0 ? (
            items.map(item => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 space-y-2.5 w-full ${
                  item.isRead
                    ? 'bg-slate-900/40 border-slate-850/80 opacity-75 hover:opacity-100 hover:border-slate-750'
                    : 'bg-slate-900/90 border-slate-800 hover:border-sky-500/40 shadow-sm'
                }`}
              >
                {/* Card Header: Badge & Date */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border tracking-wide uppercase ${getBadgeStyle(item.badgeColor)}`}>
                    {item.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.dateOrTime}
                  </span>
                </div>

                {/* Title & Body */}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug break-words">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed break-words">
                    {item.description}
                  </p>
                  {item.authorityOrMeta && (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium pt-0.5 break-words">
                      {item.authorityOrMeta}
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer with Mark as read explicitly written */}
                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
                  
                  {/* Mark as read button - explicitly written as Mark as read */}
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer border ${
                      item.isRead
                        ? 'bg-slate-950 text-emerald-400 border-emerald-900/40 hover:border-emerald-700/60'
                        : 'bg-slate-800 hover:bg-slate-750 text-sky-300 hover:text-white border-slate-700 shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${item.isRead ? 'text-emerald-400' : 'text-sky-400'}`} />
                    <span className="font-semibold">
                      {item.isRead ? 'Mark as read (সম্পন্ন)' : 'Mark as read'}
                    </span>
                  </button>

                  {/* Contextual Action Button (if any) */}
                  {item.actionLabel && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(item)}
                      className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer ml-auto"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="py-12 px-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2.5">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-white">
                সকল বিজ্ঞপ্তি আপ-টু-ডেট রয়েছে
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                বর্তমানে কোনো অপরিশোধিত বা পেন্ডিং অফিসিয়াল নোটিশ নেই।
              </p>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-[#070D1F] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div>
            {readNotificationIds.length > 0 && (
              <button
                type="button"
                onClick={clearReadNotifications}
                className="text-[11px] sm:text-xs text-slate-400 hover:text-sky-300 font-medium transition-colors flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>পঠিত হিস্ট্রি রিসেট করুন</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs sm:text-sm font-bold transition-all border border-slate-750 active:scale-95 cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
