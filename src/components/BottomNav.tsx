import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Compass,
  FileSpreadsheet, 
  Menu
} from 'lucide-react';
import { AppTab } from '../types';
import { toBengaliNumber } from '../utils/dateUtils';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  pendingTasksCount: number;
  urgentDirectivesCount: number;
  unmarkedAttendanceCount: number;
  theme?: 'light' | 'dark';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  urgentDirectivesCount,
  unmarkedAttendanceCount,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  const tabs = [
    {
      id: 'home' as AppTab,
      label: 'Home',
      subLabel: 'Home',
      icon: Home,
      badge: unmarkedAttendanceCount > 0 ? unmarkedAttendanceCount : null,
      badgeColor: 'bg-emerald-600',
      activeGradient: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-300 shadow-lg shadow-emerald-950/80 scale-105',
      inactiveColor: isLight 
        ? 'text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 hover:bg-emerald-100'
        : 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40',
      textActive: isLight ? 'text-emerald-700 font-black' : 'text-emerald-300 font-black',
      glowColor: 'from-emerald-400 via-teal-300 to-emerald-400 shadow-emerald-400'
    },
    {
      id: 'tasks' as AppTab,
      label: 'Tasks',
      subLabel: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-sky-500',
      activeGradient: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white ring-2 ring-sky-300 shadow-lg shadow-sky-950/80 scale-105',
      inactiveColor: isLight
        ? 'text-sky-700 bg-sky-50/90 border border-sky-200/80 hover:bg-sky-100'
        : 'text-sky-400 bg-sky-950/60 border border-sky-800/40',
      textActive: isLight ? 'text-sky-700 font-black' : 'text-sky-300 font-black',
      glowColor: 'from-sky-400 via-blue-300 to-sky-400 shadow-sky-400'
    },
    {
      id: 'hub' as AppTab,
      label: 'Hub',
      subLabel: 'Hub',
      icon: Compass,
      badge: null,
      badgeColor: 'bg-purple-600',
      activeGradient: 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white ring-2 ring-purple-300 shadow-lg shadow-purple-950/80 scale-105',
      inactiveColor: isLight
        ? 'text-purple-700 bg-purple-50/90 border border-purple-200/80 hover:bg-purple-100'
        : 'text-purple-400 bg-purple-950/60 border border-purple-800/40',
      textActive: isLight ? 'text-purple-700 font-black' : 'text-purple-300 font-black',
      glowColor: 'from-purple-400 via-fuchsia-300 to-purple-400 shadow-purple-400'
    },
    {
      id: 'report' as AppTab,
      label: 'Report',
      subLabel: 'Report',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: 'bg-amber-600',
      activeGradient: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-2 ring-amber-300 shadow-lg shadow-amber-950/80 scale-105',
      inactiveColor: isLight
        ? 'text-amber-700 bg-amber-50/90 border border-amber-200/80 hover:bg-amber-100'
        : 'text-amber-400 bg-amber-950/60 border border-amber-800/40',
      textActive: isLight ? 'text-amber-700 font-black' : 'text-amber-300 font-black',
      glowColor: 'from-amber-400 via-orange-300 to-amber-400 shadow-amber-400'
    },
    {
      id: 'menu' as AppTab,
      label: 'Menu',
      subLabel: 'Menu',
      icon: Menu,
      badge: null,
      badgeColor: 'bg-rose-600',
      activeGradient: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white ring-2 ring-rose-300 shadow-lg shadow-rose-950/80 scale-105',
      inactiveColor: isLight
        ? 'text-rose-700 bg-rose-50/90 border border-rose-200/80 hover:bg-rose-100'
        : 'text-rose-400 bg-rose-950/60 border border-rose-800/40',
      textActive: isLight ? 'text-rose-700 font-black' : 'text-rose-300 font-black',
      glowColor: 'from-rose-400 via-pink-300 to-rose-400 shadow-rose-400'
    }
  ];

  // Helper to determine if a bottom tab is active
  const isTabActive = (tabId: AppTab) => {
    if (tabId === 'home') return activeTab === 'home' || activeTab === 'dashboard';
    if (tabId === 'tasks') return activeTab === 'tasks';
    if (tabId === 'hub') return activeTab === 'hub';
    if (tabId === 'report') return activeTab === 'report';
    if (tabId === 'menu') return activeTab === 'menu' || activeTab === 'attendance' || activeTab === 'directives' || activeTab === 'staff';
    return activeTab === tabId;
  };

  return (
    <>
      {/* Desktop / Tablet Navigation Header Bar */}
      <div className={`hidden md:block w-full overflow-x-hidden ${
        isLight 
          ? 'bg-white/95 border-b border-slate-200 shadow-xs' 
          : 'bg-[#021528]/95 border-b border-sky-900/40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-2 py-2" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  id={`desktop-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    active
                      ? tab.activeGradient
                      : `${tab.inactiveColor} hover:brightness-105`
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
                  <span>{tab.label}</span>
                  <span className={`text-xs ${active ? 'text-white/80' : isLight ? 'text-slate-500' : 'text-gray-400'}`}>({tab.subLabel})</span>
                  {tab.badge && (
                    <span className={`px-2 py-0.5 text-[10px] rounded-full text-white font-bold leading-none ${tab.badgeColor}`}>
                      {typeof tab.badge === 'number' ? String(tab.badge) : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Android WebView and Touch optimized) */}
      <nav 
        id="fixed-bottom-navigation-bar" 
        className={`fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl px-2 py-1.5 w-full overflow-x-hidden md:hidden ${
          isLight
            ? 'bg-white/98 border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]'
            : 'bg-[#021528]/98 border-t border-sky-900/50 shadow-[0_-8px_24px_rgba(0,0,0,0.85)]'
        }`}
        style={{ paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="grid grid-cols-5 gap-1 items-center w-full max-w-lg mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.id);
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 cursor-pointer"
              >
                {/* Active Top Glow Line */}
                {active && (
                  <span className={`absolute -top-1.5 w-8 h-1 bg-gradient-to-r ${tab.glowColor} rounded-full shadow-md`} />
                )}

                <div className="relative">
                  <div
                    className={`p-2 rounded-xl transition-all ${
                      active 
                        ? tab.activeGradient
                        : tab.inactiveColor
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tab.badge && (
                    <span
                      className={`absolute -top-1 -right-2 min-w-[17px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-md border border-gray-950 ${
                        tab.badgeColor
                      }`}
                    >
                      {typeof tab.badge === 'number' ? String(tab.badge) : tab.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[11px] mt-1 tracking-tight ${active ? tab.textActive : isLight ? 'text-slate-600 font-semibold' : 'text-gray-400 font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
