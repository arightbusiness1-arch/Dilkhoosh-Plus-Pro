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
  Trash2,
  Bot,
  Sparkles
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
  onOpenAiAssistant?: () => void;
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
  onOpenStaffProfile,
  onOpenAiAssistant
}) => {
  const [isStaffHubOpen, setIsStaffHubOpen] = useState(false);
  const activeStaffCount = state.staffList.filter(s => s.isActive).length;
  const pendingTasksCount = state.tasks.filter(t => t.status !== 'complete').length;
  const directivesCount = state.directives.length;
  const isBn = state.settings.language === 'bn';
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
        className="bg-gradient-to-r from-gray-900 via-[#031c38] to-gray-900 border border-emerald-900/40 hover:border-sky-400 p-2.5 sm:p-3 rounded-xl shadow-md flex items-center justify-between gap-3 cursor-pointer group hover:bg-gray-850 transition-all active:scale-[0.99]"
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
              <h4 className="text-xs font-black text-white truncate group-hover:text-sky-300 transition-colors">
                {currentUser?.name || 'Zubayer Ahmed'}
              </h4>
              <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 whitespace-nowrap">
                {state.role === 'admin' ? (isBn ? 'এডমিন' : 'Admin') : state.role === 'manager' ? (isBn ? 'ম্যানেজার' : 'Manager') : (isBn ? 'স্টাফ' : 'Staff')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate whitespace-nowrap mt-0.5">
              {currentUser?.role || 'System Lead'} • <span className="text-sky-400">{currentUser?.department || 'Admin'}</span>
              {currentUser?.googleEmail && <span className="text-emerald-400 ml-1">• Google Sync</span>}
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
            className="px-2.5 py-1 bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-lg text-[10px] font-black shrink-0 transition-colors whitespace-nowrap shadow-sm group-hover:bg-sky-600 group-hover:text-white"
          >
            {currentUser?.googleEmail ? (isBn ? 'প্রোফাইল' : 'Profile') : (isBn ? 'প্রোফাইল ও গুগল' : 'Profile & Google')}
          </button>
        </div>
      </div>

      {/* Primary Modules Grid */}
      <div className="space-y-1.5">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
          {isBn ? 'মূল মডিউলসমূহ' : 'Primary Modules'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          
          {/* Admin Dashboard - Only displayed when role is admin */}
          {state.role === 'admin' && (
            <button
              type="button"
              id="menu-admin-dashboard-btn"
              onClick={() => onNavigateTab('admin_dashboard')}
              className="p-2.5 rounded-xl text-left flex items-center justify-between transition-all group shadow-sm sm:col-span-2 border bg-gradient-to-r from-emerald-950/40 via-gray-900 to-gray-900 hover:bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-400"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 bg-emerald-600/20 text-emerald-300 border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black transition-colors truncate text-white group-hover:text-emerald-300">
                      {isBn ? 'এডমিন ড্যাশবোর্ড ও টেলিমেন্ট্রি' : 'Admin Dashboard & Telemetry'}
                    </h4>
                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 bg-emerald-500/10 text-emerald-300 border-emerald-400/20">
                      {isBn ? 'শুধুমাত্র এডমিন' : 'Admin Only'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-450 truncate">
                    {isBn ? 'পুরো সিস্টেমের বিবরণ, ঝুলে থাকা কাজ ও হাজিরা রিপোর্ট' : 'Activity summaries, pending tasks & attendance log'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
            </button>
          )}

          {/* Directives & SOP */}
          <button
            type="button"
            onClick={() => onNavigateTab('directives')}
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/30 text-left flex items-center justify-between transition-all group shadow-sm min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
                <BookOpenCheck className="w-4 h-4 text-sky-300" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white group-hover:text-sky-400 transition-colors truncate">
                  {isBn ? 'নির্দেশিকা ও এসওপি গাইডলাইন' : 'Directives & SOP Guidelines'}
                </h4>
                <p className="text-[10px] text-gray-450 truncate">
                  {isBn ? `অফিসিয়াল প্রোটোকল ও চেকলিস্ট (${directivesCount}টি)` : `Admin protocols & SOP check-lists (${directivesCount})`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
          </button>

          {/* Staff Management Hub */}
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-950/20 to-gray-900 border border-emerald-500/15 shadow-sm sm:col-span-2 transition-all space-y-2">
            <button
              type="button"
              onClick={() => setIsStaffHubOpen(!isStaffHubOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none min-w-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/25 shrink-0">
                  <Users className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-black text-white truncate">{isBn ? 'স্টাফ ম্যানেজমেন্ট হাব' : 'Staff Management Hub'}</h4>
                  <p className="text-[10px] text-gray-450 truncate">{isBn ? 'স্টাফ কার্যক্রম ও প্রোফাইল ব্যবস্থাপনা' : 'Staff operations & profiling'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-400/20 whitespace-nowrap">
                  {toBengaliNumber(activeStaffCount)} {isBn ? 'জন সক্রিয়' : 'Active'}
                </span>
                <span className="p-1 rounded bg-gray-950 border border-gray-800 text-emerald-400">
                  {isStaffHubOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </div>
            </button>

            {isStaffHubOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-850/80 animate-in fade-in duration-150">
                {/* Action 1: Directory */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('staff')}
                  className="p-2 rounded-lg bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/25 text-left flex items-center justify-between transition-all group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📂</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white group-hover:text-emerald-400 truncate">{isBn ? 'স্টাফ ডিরেক্টরি' : 'Staff Directory'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'প্রোফাইল ও তালিকা' : 'Profile & List'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" />
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
                  className="p-2 rounded-lg bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/25 text-left flex items-center justify-between transition-all group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">➕</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white group-hover:text-sky-400 truncate">{isBn ? 'নতুন স্টাফ' : 'Add New Staff'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'স্টাফ মেম্বার যুক্ত করুন' : 'Register new employee'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" />
                </button>

                {/* Action 3: Attendance Sheet */}
                <button
                  type="button"
                  onClick={() => onNavigateTab('attendance')}
                  className="p-2 rounded-lg bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/25 text-left flex items-center justify-between transition-all group min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📝</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white group-hover:text-emerald-400 truncate">{isBn ? 'দৈনিক হাজিরা' : 'Daily Attendance'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'উপস্থিতি ট্র্যাকিং লগ' : 'Daily attendance list'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" />
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
                      : 'bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-purple-500/25'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">📊</span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white group-hover:text-purple-400 truncate">{isBn ? 'স্টাফ রিপোর্ট' : 'Staff Reports'}</p>
                      <p className="text-[9px] text-gray-500 truncate">{isBn ? 'এক্সেল ডাউনলোড ও তথ্য' : 'Excel & PDF exports'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" />
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
            className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-slate-950 via-[#031d36] to-slate-950 hover:from-emerald-950/40 hover:to-sky-950/40 border border-emerald-500/40 hover:border-emerald-400 text-left flex items-center justify-between transition-all group shadow-md sm:col-span-2 min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                <Database className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors truncate">
                    {isBn ? 'ডাটা সেন্টার (Data Center)' : 'Data Center Hub'}
                  </h4>
                  <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0 uppercase tracking-wider">
                    {isBn ? 'পিডিএফ এক্সপোর্ট' : 'PDF Export'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-350 truncate">
                  {isBn ? 'রিপোর্ট ও যাবতীয় তথ্য সেকশন ওয়াইজ আলাদা পিডিএফ ডাউনলোড ও লাইভ ভিউ করুন' : 'Section-wise PDF downloads & instant data preview'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-900 text-sky-300 border border-sky-500/30 hidden sm:inline-block">
                {isBn ? 'ভিউ ও পিডিএফ' : 'View & PDF'}
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </button>

          {/* Dilkhoosh AI Assistant Card */}
          {onOpenAiAssistant && (
            <button
              type="button"
              id="menu-ai-assistant-card-btn"
              onClick={onOpenAiAssistant}
              className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/80 via-gray-900 to-indigo-950/80 hover:from-purple-900/90 hover:to-indigo-900/90 border border-purple-500/40 hover:border-purple-400 text-left flex items-center justify-between transition-all group shadow-md shadow-purple-950/20 active:scale-[0.99] min-w-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-white border border-purple-400/40 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-purple-100 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-white group-hover:text-purple-200 transition-colors truncate">
                      {isBn ? 'দিলখুশ এআই সহকারী' : 'Dilkhoosh AI Assistant'}
                    </h4>
                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30 whitespace-nowrap">
                      Gemini 3.7
                    </span>
                  </div>
                  <p className="text-[10px] text-purple-300/80 truncate">
                    {isBn ? 'সম্পূর্ণ অ্যাপ ও আজকের কাজের লাইভ প্রশ্ন-উত্তর' : 'Ask anything about the app, tasks & attendance'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 hidden sm:inline-block">
                  {isBn ? 'প্রশ্ন করুন' : 'Ask AI'}
                </span>
                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </button>
          )}

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
                : 'bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/30'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                state.role === 'staff'
                  ? 'bg-gray-900 text-gray-600 border-gray-850'
                  : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
              }`}>
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className={`text-xs font-black transition-colors truncate ${
                  state.role === 'staff' ? 'text-gray-500' : 'text-white group-hover:text-sky-400'
                }`}>
                  {isBn ? 'রিপোর্ট ও প্রিন্ট হাব' : 'Reports & Print Hub'}
                </h4>
                <p className="text-[10px] text-gray-450 truncate">
                  {isBn ? 'এক্সেল ডাউনলোড, হোয়াটসঅ্যাপ সামারি ও প্রিন্ট' : 'Excel CSV, WhatsApp summary & print sheets'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
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
                : 'bg-gradient-to-r from-gray-900 via-gray-900 to-indigo-950/20 hover:bg-indigo-950/15 border-indigo-500/20 hover:border-indigo-400'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-lg border group-hover:scale-105 transition-transform shrink-0 ${
                state.role !== 'admin'
                  ? 'bg-gray-900 text-gray-600 border-gray-850'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className={`text-xs font-black transition-colors truncate ${
                    state.role !== 'admin' ? 'text-gray-500' : 'text-white group-hover:text-indigo-300'
                  }`}>
                    {isBn ? 'হাব ম্যানেজমেন্ট' : 'Hub Management'}
                  </h4>
                  <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border shrink-0 ${
                    state.role !== 'admin'
                      ? 'bg-gray-900 text-gray-500 border-gray-800'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20'
                  }`}>
                    {isBn ? 'এডমিন' : 'Admin'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-450 truncate">
                  {isBn ? 'বিশেষ নির্দেশাবলী, রিমাইন্ডার এবং জরুরী কাজ সেট করুন' : 'Configure instructions, alerts, and emergency tasks'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
          </button>

          {/* Recycle Bin (মুছে ফেলা হিস্ট্রি) */}
          <button
            type="button"
            id="menu-recycle-bin-btn"
            onClick={() => {
              if (onOpenRecycleBin) onOpenRecycleBin();
            }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-gray-900 via-gray-900 to-rose-950/20 hover:bg-rose-950/15 border border-rose-500/25 hover:border-rose-400 text-left flex items-center justify-between transition-all group shadow-sm min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Trash2 className="w-4 h-4 text-rose-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-white group-hover:text-rose-400 transition-colors truncate font-sans">
                    {isBn ? 'রিসাইকেল বিন (মুছে ফেলা হিস্ট্রি)' : 'Recycle Bin (Deleted)'}
                  </h4>
                  {state.recycleBin && state.recycleBin.length > 0 && (
                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-rose-500/25 text-rose-300 border border-rose-500/40 shrink-0">
                      {toBengaliNumber(state.recycleBin.length)} {isBn ? 'টি আইটেম' : 'Items'}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-450 truncate">
                  {isBn ? 'দুর্ঘটনাবশত ডিলিট হওয়া হিসাব বা লেনদেন উদ্ধার করুন' : 'Restore accidentally deleted accounts or entries'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors shrink-0" />
          </button>

        </div>
      </div>

      {/* Bottom Action Grid: Settings & Preferences Option */}
      <div className="space-y-2 pt-1">
        {/* Pinned Settings Option at Bottom */}
        <div className="sticky bottom-2 z-20">
          <div className="absolute -top-2 right-4 px-1.5 py-0.5 bg-sky-600 text-white text-[7px] font-black uppercase tracking-wider rounded-full shadow border border-sky-400 whitespace-nowrap">
            {isBn ? 'পিনড সেটিংস' : 'Pinned'}
          </div>
          <button
            type="button"
            id="btn-menu-open-settings"
            onClick={() => onOpenSettings('settings')}
            className="w-full p-2.5 rounded-xl bg-gray-900/95 hover:bg-gray-900 border border-sky-500/50 hover:border-sky-400 text-left flex items-center justify-between transition-all group shadow-lg backdrop-blur-md min-w-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-400/30 group-hover:scale-105 transition-transform shrink-0">
                <Settings className="w-4 h-4 text-sky-450 animate-spin-slow" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5 truncate">
                  <span>{isBn ? 'সেটিংস ও প্রেফারেন্স' : 'Settings & Preferences'}</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-400/20 font-bold shrink-0">
                    {isBn ? 'কুইক' : 'Quick'}
                  </span>
                </h4>
                <p className="text-[10px] text-gray-350 truncate">
                  {isBn ? 'থিম, ভাষা, নোটিফিকেশন ও সিস্টেম সেটআপ' : 'Manage theme, language, alerts & system setup'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Simple Developer Credit directly below Settings */}
        <p className="text-center text-[10px] text-gray-500 font-medium pt-1">
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
