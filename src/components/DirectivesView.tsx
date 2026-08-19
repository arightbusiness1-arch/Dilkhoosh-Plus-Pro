import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  Pin, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Building2, 
  Calendar,
  Sparkles,
  Bookmark,
  CheckCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AppState, Directive, PriorityLevel, TaskStatus, AppTab } from '../types';
import { toBengaliNumber, formatEnglishDate } from '../utils/dateUtils';
import { departmentsList } from '../data/initialData';
import { ViewBackButton } from './ViewBackButton';

interface DirectivesViewProps {
  state: AppState;
  onOpenNewDirective: () => void;
  onAcknowledgeDirective: (directiveId: string, staffId: string) => void;
  onToggleChecklistItem: (directiveId: string, itemId: string) => void;
  onTogglePinDirective: (directiveId: string) => void;
  onUpdateDirectiveStatus?: (directiveId: string, status: TaskStatus) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

export const DirectivesView: React.FC<DirectivesViewProps> = ({
  state,
  onOpenNewDirective,
  onAcknowledgeDirective,
  onToggleChecklistItem,
  onTogglePinDirective,
  onUpdateDirectiveStatus,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isUrgentCollapsed, setIsUrgentCollapsed] = useState<boolean>(false);
  const [isGeneralCollapsed, setIsGeneralCollapsed] = useState<boolean>(false);

  const categories = [
    'All Categories',
    'Safety & Hygiene',
    'Customer Service',
    'Production Rules',
    'Cash & Accounts',
    'Normal Notice'
  ];

  const filteredDirectives = state.directives
    .filter(dir => {
      const matchesSearch = dir.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dir.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            dir.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDeptFilter === 'all' || 
                          dir.targetDepartment === 'all' || 
                          dir.targetDepartment === selectedDeptFilter;

      const matchesCat = selectedCategoryFilter === 'all' || 
                         selectedCategoryFilter === 'All Categories' || 
                         dir.category === selectedCategoryFilter;

      return matchesSearch && matchesDept && matchesCat;
    })
    .sort((a, b) => {
      // Pinned first, then urgent
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      return 0;
    });

  const urgentCount = state.directives.filter(d => d.priority === 'urgent').length;

  const renderDirectiveCard = (dir: Directive) => {
    const isUserAck = dir.acknowledgedStaffIds.includes(state.currentUserId);
    const ackCount = dir.acknowledgedStaffIds.length;

    return (
      <div
        key={dir.id}
        className={`bg-gray-900 border rounded-xl p-3 sm:p-3.5 transition-all shadow-sm space-y-2.5 ${
          dir.isPinned ? 'border-amber-500/50 bg-gray-900 ring-1 ring-amber-500/30' : 'border-emerald-900/30 hover:border-emerald-700/50'
        }`}
      >
        {/* Directive Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {dir.isPinned && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                <Pin className="w-2.5 h-2.5" />
                <span>Pinned</span>
              </span>
            )}

            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
              dir.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              dir.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-sky-500/20 text-sky-300 border border-sky-500/40'
            }`}>
              {dir.priority === 'urgent' ? 'Urgent' : dir.priority === 'high' ? 'High Priority' : 'Routine'}
            </span>

            <span className="text-[10px] text-gray-200 px-1.5 py-0.2 rounded bg-gray-950 border border-gray-800 font-medium">
              {dir.category}
            </span>

            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Building2 className="w-2.5 h-2.5 text-sky-400" />
              <span>{dir.targetDepartment === 'all' ? 'All Depts' : dir.targetDepartment}</span>
            </span>

            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase tracking-wider ${
              dir.status === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
              dir.status === 'failed' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
              dir.status === 'partial' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
              dir.status === 'attempting' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
              dir.status === 'progress' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
              'bg-gray-700/50 text-gray-300 border-gray-600'
            }`}>
              {dir.status || 'pending'}
            </span>
          </div>

          <button
            type="button"
            id={`pin-dir-${dir.id}`}
            onClick={() => onTogglePinDirective(dir.id)}
            className={`p-1 rounded-lg transition-colors ${
              dir.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-gray-500 hover:text-gray-300'
            }`}
            title={dir.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title & Body Content */}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">
            {dir.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
            {dir.content}
          </p>
        </div>

        {/* SOP Checklist if provided */}
        {dir.checklist && dir.checklist.length > 0 && (
          <div className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
            <span className="text-[10px] font-bold text-sky-400 block mb-0.5">
              Action Checklist (SOP Steps):
            </span>
            {dir.checklist.map((item) => (
              <div 
                key={item.id}
                onClick={() => onToggleChecklistItem(dir.id, item.id)}
                className="flex items-center gap-1.5 text-[11px] text-gray-300 hover:text-white cursor-pointer py-0.5"
              >
                <input
                  type="checkbox"
                  checked={item.isDone}
                  onChange={() => onToggleChecklistItem(dir.id, item.id)}
                  className="rounded border-gray-700 text-emerald-600 focus:ring-0 w-3 h-3"
                />
                <span className={item.isDone ? 'line-through text-gray-500' : 'text-gray-200'}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Status Action Row - 1 Line, No Side Scroll */}
        <div className="pt-2 border-t border-gray-800">
          <div className="grid grid-cols-6 gap-1 w-full">
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'pending')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                (dir.status || 'pending') === 'pending'
                  ? 'bg-gray-700 text-white border-gray-500 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'progress')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                dir.status === 'progress'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-sky-900 hover:text-sky-400'
              }`}
            >
              Progress
            </button>
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'attempting')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                dir.status === 'attempting'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-purple-900 hover:text-purple-400'
              }`}
            >
              Attempting
            </button>
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'partial')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                dir.status === 'partial'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-amber-900 hover:text-amber-400'
              }`}
            >
              Partial
            </button>
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'complete')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                dir.status === 'complete'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-emerald-900 hover:text-emerald-400'
              }`}
            >
              Complete
            </button>
            <button
              type="button"
              onClick={() => onUpdateDirectiveStatus?.(dir.id, 'failed')}
              className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                dir.status === 'failed'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                  : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-rose-900 hover:text-rose-400'
              }`}
            >
              Failed
            </button>
          </div>
        </div>

        {/* Directive Footer: Staff Acknowledgement Status */}
        <div className="pt-1.5 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-gray-300">
            <Users className="w-3 h-3 text-sky-400" />
            <span>
              <strong className="text-emerald-400 font-bold">{String(ackCount)}</strong> staff acknowledged
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id={`btn-ack-dir-view-${dir.id}`}
              onClick={() => onAcknowledgeDirective(dir.id, state.currentUserId)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all text-[11px] active:scale-95 ${
                isUserAck
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm border border-emerald-500/40'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>{isUserAck ? 'Acknowledged ✅' : 'Read & Comply'}</span>
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
      
      {/* Top Navigation Back Bar */}
      <ViewBackButton
        onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
        title={state.settings.language === 'bn' ? 'অফিসিয়াল নির্দেশিকা ও এসওপি' : 'Official Directives & SOP'}
        badge="Directives & SOP"
        badgeColor="purple"
        isBn={state.settings.language === 'bn'}
      />

      {/* Top Banner */}
      <div className="bg-gray-900 border border-emerald-900/40 rounded-xl p-3 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                Official Directives & SOP
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                Protocols & Notices
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Work Guidelines & SOP
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
              Total: {String(state.directives.length)} | Urgent: <strong className="text-rose-400">{String(urgentCount)}</strong>
            </p>
          </div>

          {((state.role !== 'staff') || (state.settings.staffCanAddDirectives === true)) && (
            <button
              type="button"
              id="directives-add-new-btn"
              onClick={onOpenNewDirective}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 self-start sm:self-auto border border-emerald-500/40"
            >
              <Plus className="w-3.5 h-3.5 text-sky-300" />
              <span>Post Directive</span>
            </button>
          )}
        </div>

        {/* Category Horizontal Filter */}
        <div className="mt-2.5 pt-2 border-t border-gray-800 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              id={`cat-filter-${cat}`}
              onClick={() => setSelectedCategoryFilter(cat === 'All Categories' ? 'all' : cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                (selectedCategoryFilter === 'all' && cat === 'All Categories') || selectedCategoryFilter === cat
                  ? 'bg-emerald-700 text-white border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-white bg-gray-950/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Department Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
        <div className="sm:col-span-8 relative">
          <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="directive-search-input"
            placeholder="Search directives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl pl-8.5 pr-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            id="directive-dept-filter"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl px-2.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
          >
            <option value="all" className="bg-gray-950 text-white">All Departments</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept} className="bg-gray-950 text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Directives Cards List */}
      {filteredDirectives.length === 0 ? (
        <div className="text-center py-8 bg-gray-900 rounded-xl border border-gray-800 text-gray-400 text-xs">
          No directives found.
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Section 1: Urgent & Pinned Directives / Notices */}
          {(() => {
            const urgentPinned = filteredDirectives.filter(d => d.isPinned || d.priority === 'urgent' || d.priority === 'high');
            if (urgentPinned.length === 0) return null;

            return (
              <div className="space-y-2">
                <div 
                  onClick={() => setIsUrgentCollapsed(!isUrgentCollapsed)}
                  className="p-2.5 rounded-xl bg-gray-900 border border-rose-500/30 flex items-center justify-between cursor-pointer select-none hover:bg-gray-850 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>Urgent Directives & Pinned Notices ({urgentPinned.length})</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40">
                        {isUrgentCollapsed ? 'Collapsed ▾' : 'Priority ▴'}
                      </span>
                    </h3>
                  </div>

                  <div className="p-1 rounded-lg bg-gray-950 text-gray-300 border border-gray-800">
                    {isUrgentCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronUp className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </div>

                {!isUrgentCollapsed && (
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
                    {urgentPinned.map((dir) => renderDirectiveCard(dir))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Section 2: General Guidelines & Regular Notices */}
          {(() => {
            const generalList = filteredDirectives.filter(d => !d.isPinned && d.priority !== 'urgent' && d.priority !== 'high');
            if (generalList.length === 0) return null;

            return (
              <div className="space-y-2">
                <div 
                  onClick={() => setIsGeneralCollapsed(!isGeneralCollapsed)}
                  className="p-2.5 rounded-xl bg-gray-900 border border-emerald-900/40 flex items-center justify-between cursor-pointer select-none hover:bg-gray-850 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <BookOpenCheck className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <span>General Guidelines & Notices ({generalList.length})</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40">
                        {isGeneralCollapsed ? 'Collapsed ▾' : 'Standard ▴'}
                      </span>
                    </h3>
                  </div>

                  <div className="p-1 rounded-lg bg-gray-950 text-gray-300 border border-gray-800">
                    {isGeneralCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-sky-400" /> : <ChevronUp className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </div>

                {!isGeneralCollapsed && (
                  <div className="grid grid-cols-1 gap-2.5 sm:gap-3 w-full">
                    {generalList.map((dir) => renderDirectiveCard(dir))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
};
