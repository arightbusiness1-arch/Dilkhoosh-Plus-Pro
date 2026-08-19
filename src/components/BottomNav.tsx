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
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
  urgentDirectivesCount,
  unmarkedAttendanceCount
}) => {
  const tabs = [
    {
      id: 'home' as AppTab,
      label: 'Home',
      subLabel: 'Home',
      icon: Home,
      badge: unmarkedAttendanceCount > 0 ? unmarkedAttendanceCount : null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'tasks' as AppTab,
      label: 'Tasks',
      subLabel: 'Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-sky-500'
    },
    {
      id: 'hub' as AppTab,
      label: 'Hub',
      subLabel: 'Hub',
      icon: Compass,
      badge: null,
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'report' as AppTab,
      label: 'Report',
      subLabel: 'Report',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: 'bg-emerald-600'
    },
    {
      id: 'menu' as AppTab,
      label: 'Manu',
      subLabel: 'Menu',
      icon: Menu,
      badge: null,
      badgeColor: 'bg-rose-600'
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
      <div className="hidden md:block bg-[#021528]/95 border-b border-sky-900/40 w-full overflow-x-hidden">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-emerald-800/60 text-white border border-emerald-500/60 shadow-lg shadow-emerald-950/60 ring-1 ring-sky-400/40'
                      : 'text-gray-400 hover:text-white hover:bg-sky-950/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-sky-400' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  <span className="text-xs text-gray-500">({tab.subLabel})</span>
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
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#021528]/98 backdrop-blur-xl border-t border-sky-900/50 px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.85)] w-full overflow-x-hidden md:hidden"
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
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all active:scale-90 ${
                  active
                    ? 'text-white font-bold'
                    : 'text-gray-400 hover:text-gray-200 font-medium'
                }`}
              >
                {/* Active Top Glow Line */}
                {active && (
                  <span className="absolute -top-1.5 w-8 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-400 rounded-full shadow-sm shadow-sky-400" />
                )}

                <div className="relative">
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      active 
                        ? 'bg-emerald-900/80 text-sky-300 ring-1 ring-sky-400/50 shadow-md shadow-emerald-950/80' 
                        : 'text-gray-400'
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

                <span className={`text-[11px] mt-0.5 tracking-tight font-bold ${active ? 'text-sky-300' : 'text-gray-400'}`}>
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
