import React, { useState } from 'react';
import { 
  UserCheck, 
  BookOpenCheck, 
  Users, 
  ShieldCheck, 
  FileSpreadsheet, 
  Settings, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Database, 
  Info,
  Layers,
  Trash2
} from 'lucide-react';
import { AppState, AppTab, AppSettings } from '../types';
import { toBengaliNumber } from '../utils/dateUtils';
import { getAppTelemetry } from '../utils/appTelemetry';

interface MenuViewProps {
  state: AppState;
  onNavigateTab: (tab: AppTab) => void;
  onOpenNewStaff: () => void;
  onOpenNewTask: () => void;
  onOpenNewDirective: () => void;
  onOpenReports: () => void;
  onOpenSettings: (tab?: 'settings' | 'info') => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenRecycleBin?: () => void;
  onOpenDataCenter?: () => void;
  onOpenStaffProfile?: (staffId: string) => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  state,
  onNavigateTab,
  onOpenNewStaff,
  onOpenNewTask,
  onOpenNewDirective,
  onOpenReports,
  onOpenSettings,
  onUpdateSettings,
  onOpenRecycleBin,
  onOpenDataCenter,
  onOpenStaffProfile
}) => {
  const [isStaffHubOpen, setIsStaffHubOpen] = useState(false);
  const activeStaffCount = state.staffList.filter(s => s.isActive).length;
  const pendingTasksCount = state.tasks.filter(t => t.status !== 'complete').length;
  const directivesCount = state.directives.length;
  const isBn = state.settings.language === 'bn';
  const isDark = state.settings.theme === 'dark';
  const canViewReports = state.role !== 'staff' || state.settings.staffCanViewReports === true;
  const canManageHub = state.role === 'admin' || state.settings.staffCanManageHub === true;

  const currentUser = state.staffList.find(s => s.id === state.currentUserId) || state.staffList[0];

  return (
    <div className="space-y-2.5 sm:space-y-3.5 pb-24 w-full overflow-x-hidden animate-in fade-in duration-200">
      
      {/* Profile Section (Top of Menu) - Clickable to open Profile & Google Auth */}
      <div 
        onClick={() => {
          if (onOpenStaffProfile && currentUser) {
            onOpenStaffProfile(currentUser.id);
          } else {
            onNavigateTab('staff');
          }
        }}
        className={`p-2.5 sm:p-3 rounded-xl shadow-md flex items-center justify-between gap-3 cursor-pointer group transition-all active:scale-[0.99] border ${
          isDark
            ? 'bg-gradient-to-r from-gray-900 via-[#031c38] to-gray-900 border-emerald-900/40 hover:border-sky-400 hover:bg-gray-850'
            : 'bg-gradient-to-r from-emerald-50 via-sky-50 to-slate-50 border-emerald-200/80 hover:border-sky-400 hover:bg-sky-50 shadow-sm'
        }`}
        title={isBn ? 'প্রোফাইল ভিউ ও গুগল অ্যাকাউন্ট সেটিংস' : 'View Profile & Google Account Settings'}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            {currentUser?.googlePhotoUrl ? (
              <img 
                src={currentUser.googlePhotoUrl} 
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-xl object-cover border border-emerald-400 shrink-0" 
              />
            ) : (
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow shrink-0 ${currentUser?.avatarColor || 'bg-emerald-600'}`}>
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'ZA'}
              </div>
            )}
            {currentUser?.googleEmail && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-gray-900 shadow" title="Google Account Connected" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className={`text-xs font-black truncate transition-colors ${isDark ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-sky-700'}`}>
                {currentUser?.name || 'Zubayer Ahmed'}
              </h4>
              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border whitespace-nowrap ${isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                {state.role === 'admin' ? (isBn ? 'এডমিন' : 'Admin') : (isBn ? 'স্টাফ' : 'Staff')}
              </span>
            </div>
            <p className={`text-[10px] truncate whitespace-nowrap mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              {currentUser?.role || 'System Lead'} • <span className={isDark ? 'text-sky-400' : 'text-sky-600 font-semibold'}>{currentUser?.department || 'Admin'}</span>
              {currentUser?.googleEmail && <span className={isDark ? 'text-emerald-400 ml-1' : 'text-emerald-600 ml-1 font-semibold'}>• Google Sync</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenStaffProfile && currentUser) {
                onOpenStaffProfile(currentUser.id);
              } else {
                onNavigateTab('staff');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 transition-colors whitespace-nowrap shadow-sm border ${
              isDark 
                ? 'bg-sky-950/80 hover:bg-sky-900 text-sky-300 border-sky-500/40 group-hover:bg-sky-600 group-hover:text-white' 
                : 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-300 group-hover:bg-sky-600 group-hover:text-white'
            }`}
          >
            {currentUser?.googleEmail ? (isBn ? 'প্রোফাইল' : 'Profile') : (isBn ? 'প্রোফাইল ও গুগল' : 'Profile & Google')}
          </button>
        </div>
      </div>

      {/* Primary Modules Grid */}
      <div className="space-y-1.5">
        <h3 className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
          {isBn ? 'মূল মডিউলসমূহ' : 'Primary Modules'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          {/* Admin Dashboard - Only displayed when role is admin */}
          {state.role === 'admin' && (
            <button
              type="button"
              id="menu-admin-dashboard-btn"
              onClick={() => onNavigateTab('admin_dashboard')}
              className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all group shadow-sm sm:col-span-2 border ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-900 hover:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400'
                  : 'bg-gradient-to-r from-emerald-50 via-white to-slate-50 hover:bg-emerald-100/40 border-emerald-200 hover:border-emerald-400 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                  isDark ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`text-xs font-black transition-colors truncate ${isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      {isBn ? 'এডমিন ড্যাশবোর্ড ও টেলিমেন্ট্রি' : 'Admin Dashboard & Telemetry'}
                    </h4>
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ${isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                      {isBn ? 'শুধুমাত্র এডমিন' : 'Admin Only'}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>
                    {isBn ? 'পুরো সিস্টেমের বিবরণ, ঝুলে থাকা কাজ ও হাজিরা রিপোর্ট' : 'Activity summaries, pending tasks & attendance log'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
            </button>
          )}

          {/* Directives & SOP */}
          <button
            type="button"
            onClick={() => onNavigateTab('directives')}
            className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all group shadow-sm min-w-0 border ${
              isDark
                ? 'bg-gray-900 hover:bg-gray-850 border-gray-800 hover:border-sky-500/30'
                : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-100 text-sky-700 border-sky-200'
              }`}>
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className={`text-xs font-black transition-colors truncate ${isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-sky-600'}`}>
                  {isBn ? 'নির্দেশিকা ও এসওপি গাইডলাইন' : 'Directives & SOP Guidelines'}
                </h4>
                <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>
                  {isBn ? `অফিসিয়াল প্রোটোকল ও চেকলিস্ট (${directivesCount}টি)` : `Admin protocols & SOP check-lists (${directivesCount})`}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
          </button>

          {/* Staff Management Hub */}
          <div className={`p-2.5 rounded-xl shadow-sm sm:col-span-2 transition-all space-y-2 border ${
            isDark 
              ? 'bg-gradient-to-br from-emerald-950/20 to-gray-900 border-emerald-500/15' 
              : 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200/80 shadow-sm'
          }`}>
            <button
              type="button"
              onClick={() => setIsStaffHubOpen(!isStaffHubOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`p-1.5 rounded-lg border shrink-0 ${
                  isDark ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/25' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs sm:text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{isBn ? 'স্টাফ ম্যানেজমেন্ট হাব' : 'Staff Management Hub'}</h4>
                  <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>{isBn ? 'স্টাফ কার্যক্রম ও প্রোফাইল ব্যবস্থাপনা' : 'Staff operations & profiling'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border whitespace-nowrap ${
                  isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-400/20' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {toBengaliNumber(activeStaffCount)} {isBn ? 'জন সক্রিয়' : 'Active'}
                </span>
                <span className={`p-1 rounded border ${isDark ? 'bg-gray-950 border-gray-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-600 shadow-xs'}`}>
                  {isStaffHubOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>
            </button>

            {isStaffHubOpen && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t animate-in fade-in duration-150 ${isDark ? 'border-gray-850/80' : 'border-slate-200'}`}>
                {/* Action 1: Directory */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('staff')}
                  className={`p-2 rounded-lg text-left flex items-center justify-between transition-all group min-w-0 border ${
                    isDark ? 'bg-gray-950 hover:bg-gray-850 border-gray-800 hover:border-emerald-500/25' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📂</span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black group-hover:text-emerald-500 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{isBn ? 'স্টাফ ডিরেক্টরি' : 'Staff Directory'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'প্রোফাইল ও তালিকা' : 'Profile & List'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                </button>

                {/* Action 2: Add Staff */}
                <button
                  type="button"
                  onClick={() => {
                    if (state.role === 'staff') {
                      alert(isBn ? 'স্টাফ মেম্বারদের জন্য নতুন স্টাফ যুক্ত করা অনুমোদিত নয়! ❌' : 'Staff members are not permitted to add new staff! ❌');
                      return;
                    }
                    onOpenNewStaff();
                  }}
                  className={`p-2 rounded-lg text-left flex items-center justify-between transition-all group min-w-0 border ${
                    isDark ? 'bg-gray-950 hover:bg-gray-850 border-gray-800 hover:border-sky-500/25' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">➕</span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black group-hover:text-sky-500 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{isBn ? 'নতুন স্টাফ' : 'Add New Staff'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'স্টাফ মেম্বার যুক্ত করুন' : 'Register new employee'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                </button>

                {/* Action 3: Attendance Sheet */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('attendance')}
                  className={`p-2 rounded-lg text-left flex items-center justify-between transition-all group min-w-0 border ${
                    isDark ? 'bg-gray-950 hover:bg-gray-850 border-gray-800 hover:border-emerald-500/25' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📝</span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black group-hover:text-emerald-500 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{isBn ? 'দৈনিক হাজিরা' : 'Daily Attendance'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'উপস্থিতি ট্র্যাকিং লগ' : 'Daily attendance list'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                </button>

                {/* Action 4: Staff Reports */}
                <button
                  type="button"
                  onClick={() => {
                    if (state.role === 'staff') {
                      alert(isBn ? 'রিপোর্ট ও এক্সপোর্ট ডাউনলোড শুধুমাত্র এডমিন করতে পারবেন! 🔒' : 'Report downloading is restricted to admin only! 🔒');
                      return;
                    }
                    onNavigateTab('report');
                  }}
                  className={`p-2 rounded-lg border flex items-center justify-between transition-all group text-left min-w-0 ${
                    state.role === 'staff'
                      ? 'bg-gray-950 border-gray-900/50 opacity-55 cursor-not-allowed'
                      : isDark
                        ? 'bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-purple-500/25'
                        : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📊</span>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-black group-hover:text-purple-500 truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{isBn ? 'স্টাফ রিপোর্ট' : 'Staff Reports'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'এক্সেল ডাউনলোড ও তথ্য' : 'Excel & PDF exports'}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
                </button>
              </div>
            )}
          </div>

          {/* Data Center (ডাটা সেন্টার) Section */}
          <button
            type="button"
            id="menu-datacenter-btn"
            onClick={() => {
              if (onOpenDataCenter) onOpenDataCenter();
            }}
            className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between transition-all group shadow-md sm:col-span-2 min-w-0 ${
              isDark
                ? 'bg-gradient-to-r from-slate-950 via-[#031d36] to-slate-950 hover:from-emerald-950/40 hover:to-sky-950/40 border-emerald-500/40 hover:border-emerald-400'
                : 'bg-gradient-to-r from-emerald-50 via-white to-sky-50 hover:from-emerald-100/40 hover:to-sky-100/40 border-emerald-200 hover:border-emerald-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 shadow-sm ${
                isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}>
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs font-black transition-colors truncate ${isDark ? 'text-white group-hover:text-emerald-300' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                    {isBn ? 'ডাটা সেন্টার (Data Center)' : 'Data Center Hub'}
                  </h4>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 uppercase tracking-wider ${
                    isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {isBn ? 'পিডিএফ এক্সপোর্ট' : 'PDF Export'}
                  </span>
                </div>
                <p className={`text-[10px] truncate ${isDark ? 'text-gray-350' : 'text-slate-500'}`}>
                  {isBn ? 'রিপোর্ট ও যাবতীয় তথ্য সেকশন ওয়াইজ আলাদা পিডিএফ ডাউনলোড ও লাইভ ভিউ করুন' : 'Section-wise PDF downloads & instant data preview'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border hidden sm:inline-block ${
                isDark ? 'bg-gray-900 text-sky-300 border-sky-500/30' : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}>
                {isBn ? 'ভিউ ও পিডিএফ' : 'View & PDF'}
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${isDark ? 'text-emerald-400 group-hover:translate-x-0.5' : 'text-emerald-600 group-hover:translate-x-0.5'}`} />
            </div>
          </button>

          {/* Reports & Print Hub */}
          <button
            type="button"
            onClick={() => {
              if (state.role === 'staff') {
                alert(isBn ? 'রিপোর্ট ও প্রিন্ট হাব শুধুমাত্র এডমিনদের জন্য অনুমোদিত! 🔒' : 'Reports and Print hub is restricted to Admin only! 🔒');
                return;
              }
              onNavigateTab('report');
            }}
            className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all group shadow-sm border min-w-0 ${
              state.role === 'staff'
                ? 'bg-gray-950 border-gray-900/50 opacity-50 cursor-not-allowed'
                : isDark
                  ? 'bg-gray-900 hover:bg-gray-850 border-gray-800 hover:border-sky-500/30'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-sky-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                state.role === 'staff'
                  ? isDark ? 'bg-gray-900 text-gray-600 border-gray-850' : 'bg-slate-100 text-slate-400 border-slate-200'
                  : isDark ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-100 text-sky-700 border-sky-200'
              }`}>
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className={`text-xs font-black transition-colors truncate ${
                  state.role === 'staff' ? 'text-gray-500' : isDark ? 'text-white group-hover:text-sky-400' : 'text-slate-900 group-hover:text-sky-600'
                }`}>
                  {isBn ? 'রিপোর্ট ও প্রিন্ট হাব' : 'Reports & Print Hub'}
                </h4>
                <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>
                  {isBn ? 'এক্সেল ডাউনলোড, হোয়াটসঅ্যাপ সামারি ও প্রিন্ট' : 'Excel CSV, WhatsApp summary & print sheets'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
          </button>

          {/* Hub Management Section */}
          <button
            type="button"
            id="menu-hub-management-btn"
            onClick={() => {
              if (state.role !== 'admin') {
                alert(isBn ? 'হাব ম্যানেজমেন্ট শুধুমাত্র এডমিনদের জন্য অনুমোদিত! 🔒' : 'Hub Management is restricted to Administrators only! 🔒');
                return;
              }
              onNavigateTab('hub_management');
            }}
            className={`p-2.5 rounded-xl text-left flex items-center justify-between transition-all group shadow-sm border min-w-0 ${
              state.role !== 'admin'
                ? 'bg-gray-950 border-gray-900/50 opacity-50 cursor-not-allowed'
                : isDark
                  ? 'bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/20 hover:bg-indigo-950/15 border-indigo-500/20 hover:border-indigo-400'
                  : 'bg-gradient-to-r from-indigo-50/60 via-white to-slate-50 hover:bg-indigo-100/40 border-indigo-200 hover:border-indigo-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                state.role !== 'admin'
                  ? isDark ? 'bg-gray-900 text-gray-600 border-gray-850' : 'bg-slate-100 text-slate-400 border-slate-200'
                  : isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs font-black transition-colors truncate ${
                    state.role !== 'admin' ? 'text-gray-500' : isDark ? 'text-white group-hover:text-indigo-300' : 'text-slate-900 group-hover:text-indigo-700'
                  }`}>
                    {isBn ? 'হাব ম্যানেজমেন্ট' : 'Hub Management'}
                  </h4>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ${
                    state.role !== 'admin'
                      ? isDark ? 'bg-gray-900 text-gray-500 border-gray-800' : 'bg-slate-100 text-slate-500 border-slate-200'
                      : isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                  }`}>
                    {isBn ? 'এডমিন' : 'Admin'}
                  </span>
                </div>
                <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>
                  {isBn ? 'বিশেষ নির্দেশাবলী, রিমাইন্ডার এবং জরুরী কাজ সেট করুন' : 'Configure instructions, alerts, and emergency tasks'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
          </button>

          {/* Recycle Bin (মুছে ফেলা হিস্ট্রি) */}
          <button
            type="button"
            id="menu-recycle-bin-btn"
            onClick={() => {
              if (onOpenRecycleBin) onOpenRecycleBin();
            }}
            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group shadow-sm min-w-0 ${
              isDark
                ? 'bg-gradient-to-r from-gray-900 via-gray-900 to-rose-950/20 hover:bg-rose-950/15 border-rose-500/25 hover:border-rose-400'
                : 'bg-gradient-to-r from-rose-50/60 via-white to-slate-50 hover:bg-rose-100/40 border-rose-200 hover:border-rose-400 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                isDark ? 'bg-rose-500/15 text-rose-300 border-rose-500/20' : 'bg-rose-100 text-rose-700 border-rose-200'
              }`}>
                <Trash2 className="w-4 h-4 text-rose-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs font-black transition-colors truncate font-sans ${isDark ? 'text-white group-hover:text-rose-400' : 'text-slate-900 group-hover:text-rose-700'}`}>
                    {isBn ? 'রিসাইকেল বিন (মুছে ফেলা হিস্ট্রি)' : 'Recycle Bin (Deleted)'}
                  </h4>
                  {state.recycleBin && state.recycleBin.length > 0 && (
                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ${
                      isDark ? 'bg-rose-500/25 text-rose-300 border-rose-500/40' : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {toBengaliNumber(state.recycleBin.length)} {isBn ? 'টি আইটেম' : 'Items'}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] truncate ${isDark ? 'text-gray-450' : 'text-slate-500'}`}>
                  {isBn ? 'দুর্ঘটনাবশত ডিলিট হওয়া হিসাব বা লেনদেন উদ্ধার করুন' : 'Restore accidentally deleted accounts or entries'}
                </p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-colors shrink-0 ${isDark ? 'text-gray-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
          </button>

        </div>
      </div>

      {/* Bottom Action Grid: Settings & Logout Options */}
      <div className="space-y-2 pt-1">
        {/* Pinned Settings Option at Bottom */}
        <div className="sticky bottom-2 z-20 space-y-2">
          <div className="relative">
            <div className="absolute -top-2 right-4 px-1.5 py-0.5 bg-sky-600 text-white text-[7px] font-black uppercase tracking-wider rounded-full shadow border border-sky-400 whitespace-nowrap z-10">
              {isBn ? 'পিনড সেটিংস' : 'Pinned'}
            </div>
            <button
              type="button"
              id="btn-menu-open-settings"
              onClick={() => onOpenSettings('settings')}
              className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all group shadow-lg backdrop-blur-md min-w-0 cursor-pointer ${
                isDark
                  ? 'bg-gray-900/95 hover:bg-gray-900 border-sky-500/50 hover:border-sky-400'
                  : 'bg-white hover:bg-slate-50 border-sky-300 hover:border-sky-500 shadow-md'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                  isDark ? 'bg-sky-500/15 text-sky-300 border-sky-400/30' : 'bg-sky-100 text-sky-700 border-sky-200'
                }`}>
                  <Settings className="w-4 h-4 text-sky-500 animate-spin-slow" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-black transition-colors flex items-center gap-1.5 truncate ${
                    isDark ? 'text-white group-hover:text-sky-300' : 'text-slate-900 group-hover:text-sky-700'
                  }`}>
                    <span>{isBn ? 'সেটিংস ও প্রেফারেন্স' : 'Settings & Preferences'}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-bold shrink-0 border ${
                      isDark ? 'bg-sky-500/10 text-sky-300 border-sky-400/20' : 'bg-sky-100 text-sky-800 border-sky-200'
                    }`}>
                      {isBn ? 'কুইক' : 'Quick'}
                    </span>
                  </h4>
                  <p className={`text-[10px] truncate ${isDark ? 'text-gray-350' : 'text-slate-500'}`}>
                    {isBn ? 'থিম, ভাষা, নোটিফিকেশন ও সিস্টেম সেটআপ' : 'Manage theme, language, alerts & system setup'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${isDark ? 'text-sky-400 group-hover:translate-x-0.5' : 'text-sky-600 group-hover:translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Simple Developer Credit directly below Settings */}
        <p className={`text-center text-[10px] font-medium pt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
          Developed By{' '}
          <a
            href="https://www.facebook.com/iam.zubayerahmedr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 hover:text-emerald-400 font-extrabold transition-all hover:underline"
          >
            Zubayer Ahmed
          </a>
        </p>
      </div>

    </div>
  );
};
