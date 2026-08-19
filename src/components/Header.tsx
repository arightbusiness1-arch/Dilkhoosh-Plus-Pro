import React from 'react';
import { 
  Bell,
  Settings,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { AppState } from '../types';

interface HeaderProps {
  state: AppState;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts?: () => void;
  onGoHome?: () => void;
  onOpenProfile?: () => void;
  onOpenAiAssistant?: () => void;
  onSelectStaffUser?: (staffId: string) => void;
  cloudStatus?: 'connected' | 'connecting' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onOpenNotifications,
  onOpenSettings,
  onOpenShortcuts,
  onGoHome,
  onOpenProfile,
  onOpenAiAssistant,
  onSelectStaffUser,
  cloudStatus = 'connected'
}) => {
  const todayStr = state.selectedDate;

  const activeStaff = state.staffList.filter(
    s => s.isActive
  );

  // Notification count calculations (Professional Mode: Directives & Attendance notices)
  const unmarkedAttendanceCount = Math.max(
    0,
    activeStaff.length - state.attendanceRecords.filter(r => r.date === todayStr && activeStaff.some(s => s.id === r.staffId)).length
  );
  const unacknowledgedDirectivesCount = state.directives.filter(
    d => !d.acknowledgedStaffIds?.includes(state.currentUserId || '')
  ).length;
  const totalNotificationCount = (unmarkedAttendanceCount > 0 ? 1 : 0) + unacknowledgedDirectivesCount;

  return (
    <header className="sticky top-0 z-30 bg-[#021528]/95 backdrop-blur-md border-b border-sky-900/40 shadow-lg shadow-black/60 w-full overflow-x-hidden">
      {/* Top Banner / Header Container */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2.5 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left Side: App Name "Dilkhoosh Plus" & Logo - Active Home Button */}
          <button
            type="button"
            id="header-home-button"
            onClick={onGoHome}
            className="flex items-center gap-2 sm:gap-3 min-w-0 text-left cursor-pointer group hover:opacity-90 active:scale-95 transition-all outline-none"
            title="Go to Home Dashboard"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-700 flex items-center justify-center shadow-md shadow-emerald-950/80 text-white font-black text-sm sm:text-lg shrink-0 border border-emerald-500/40 ring-1 ring-sky-400/40 group-hover:bg-emerald-600 transition-colors">
              D+
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-lg font-black text-white tracking-tight truncate flex items-center gap-1 group-hover:text-sky-300 transition-colors">
                  <span>Dilkhoosh Plus</span>
                  <span className="text-[9px] sm:text-xs font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40">
                    PRO
                  </span>
                </h1>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-300 truncate flex items-center gap-1 font-medium">
                <span className="text-emerald-400 font-semibold">Attendance</span>
                <span className="text-gray-500">•</span>
                <span className="text-sky-400 font-semibold">
                  {state.role === 'admin' ? 'Admin Panel' : state.role === 'manager' ? 'Manager Portal' : 'Staff Portal'}
                </span>
                <span className="text-gray-500">•</span>
                <span 
                  className={`inline-flex items-center gap-1 font-bold ${
                    cloudStatus === 'connected' 
                      ? 'text-emerald-400' 
                      : cloudStatus === 'connecting' 
                        ? 'text-amber-400' 
                        : 'text-sky-300'
                  }`}
                  title={
                    cloudStatus === 'connected'
                      ? 'Cloud Synced - Online & Auto-saving to Firebase Cloud'
                      : cloudStatus === 'connecting'
                        ? 'Connecting to Cloud...'
                        : 'Offline Mode - 100% Active with Local Memory Storage'
                  }
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    cloudStatus === 'connected' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : cloudStatus === 'connecting' 
                        ? 'bg-amber-400' 
                        : 'bg-sky-400'
                  }`} />
                  <span className="hidden sm:inline">
                    {cloudStatus === 'connected' ? 'Cloud Synced' : cloudStatus === 'connecting' ? 'Connecting...' : 'Offline Ready'}
                  </span>
                </span>
              </p>
            </div>
          </button>

          {/* Right Side: Notification Bell & Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

            {/* Right Notification Bell Icon Button */}
            <button
              type="button"
              id="header-notification-bell-btn"
              onClick={onOpenNotifications}
              className={`relative p-2 rounded-xl transition-all shadow-md active:scale-95 group cursor-pointer border ${
                totalNotificationCount > 0
                  ? 'bg-slate-900/90 text-sky-300 border-sky-400/50 hover:border-sky-400 hover:bg-slate-850 hover:shadow-sky-950/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850 hover:border-slate-700'
              }`}
              title={state.settings.language === 'bn' ? 'নোটিফিকেশন ও অ্যালার্ট' : 'Notifications & Alerts'}
            >
              <Bell className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                totalNotificationCount > 0 
                  ? 'text-sky-400 group-hover:rotate-12 group-hover:scale-110' 
                  : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              {totalNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#021528] animate-pulse shadow-md shadow-rose-950/60">
                  {totalNotificationCount > 9 ? '9+' : String(totalNotificationCount)}
                </span>
              )}
            </button>

            {/* Quick Staff Switcher Dropdown */}
            {onSelectStaffUser && (
              <select
                id="header-quick-staff-select"
                value={state.currentUserId}
                onChange={(e) => onSelectStaffUser(e.target.value)}
                className="bg-slate-900 text-sky-300 text-[11px] font-bold rounded-xl px-2.5 py-1.5 border border-emerald-500/40 hover:border-sky-400 focus:outline-none cursor-pointer hidden sm:block shadow-sm"
                title={state.settings.language === 'bn' ? 'স্টাফ পরিবর্তন করুন' : 'Switch Active Staff'}
              >
                {state.staffList.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-950 text-white font-bold">
                    👤 {s.name} ({s.role})
                  </option>
                ))}
              </select>
            )}

            {/* Compact Profile Avatar Button */}
            {onOpenProfile && (
              <button
                type="button"
                id="header-profile-btn"
                onClick={onOpenProfile}
                className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-850 text-sky-300 border border-emerald-500/40 hover:border-sky-400 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 group cursor-pointer"
                title={state.settings.language === 'bn' ? 'প্রোফাইল ও গুগল অ্যাকাউন্ট' : 'Profile & Google Account'}
              >
                {(() => {
                  const currUser = state.staffList.find(s => s.id === state.currentUserId);
                  if (currUser?.googlePhotoUrl) {
                    return (
                      <img 
                        src={currUser.googlePhotoUrl} 
                        alt={currUser.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg object-cover border border-emerald-400" 
                      />
                    );
                  }
                  return (
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-white font-black text-[10px] sm:text-xs ${currUser?.avatarColor || 'bg-emerald-600'}`}>
                      {currUser?.name?.slice(0, 1) || 'Z'}
                    </div>
                  );
                })()}
              </button>
            )}

          </div>
        </div>

      </div>
    </header>
  );
};

