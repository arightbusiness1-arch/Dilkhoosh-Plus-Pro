import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ListOrdered, 
  Kanban, 
  Trash2, 
  User,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Send,
  AlertTriangle,
  X,
  Lock,
  ShieldAlert,
  Pencil
} from 'lucide-react';
import { AppState, TaskItem, TaskStatus, PriorityLevel, SubTask, AttendanceStatus, AppTab } from '../types';
import { toBengaliNumber, formatEnglishDate, getCurrentTimeString } from '../utils/dateUtils';
import { ViewBackButton } from './ViewBackButton';
import { EditTaskModal } from './EditTaskModal';
import { AttendanceConfirmModal } from './AttendanceConfirmModal';

interface TasksViewProps {
  state: AppState;
  onOpenNewTask: () => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask?: (task: TaskItem) => void;
  onUpdateTaskFeedback?: (taskId: string, feedback: string) => void;
  onMarkAttendance?: (staffId: string, status: AttendanceStatus, checkIn?: string) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  state,
  onOpenNewTask,
  onUpdateTaskStatus,
  onToggleSubtask,
  onDeleteTask,
  onEditTask,
  onUpdateTaskFeedback,
  onMarkAttendance,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [activeTabStatus, setActiveTabStatus] = useState<string>('all'); // all, todo, in_progress, completed
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<{ [taskId: string]: string }>({});
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskItem | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [completedBoxOpen, setCompletedBoxOpen] = useState<boolean>(false);
  const [isAttendanceConfirmOpen, setIsAttendanceConfirmOpen] = useState<boolean>(false);

  const isBn = state.settings.language === 'bn';
  const isStaffRole = state.role === 'staff';
  const effectiveUserId = state.currentUserId;

  // Check if current staff member is checked in today (present or late)
  const todayAttendance = state.attendanceRecords.find(
    r => r.staffId === effectiveUserId && r.date === state.selectedDate
  );
  const isCheckedIn = !isStaffRole || Boolean(
    todayAttendance && (todayAttendance.status === 'present' || todayAttendance.status === 'late')
  );

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    if (isStaffRole && !isCheckedIn) {
      alert(isBn 
        ? '⚠️ টাস্ক নিয়ে কাজ করার পূর্বে অবশ্যই আপনার আজকের হাজিরা ও চেক-ইন (Check-in) সম্পন্ন করুন! 🔒' 
        : '⚠️ You must complete your daily Check-in before working on tasks! 🔒');
      return;
    }
    if (isStaffRole && state.settings.staffCanChangeTaskStatus === false) {
      alert(isBn ? 'দুঃখিত, এডমিন দ্বারা আপনার টাস্ক স্ট্যাটাস পরিবর্তন বন্ধ করা হয়েছে! 🔒' : 'Sorry, task progress updates are disabled for staff by the Administrator! 🔒');
      return;
    }

    if (status === 'complete') {
      const confirmed = window.confirm(isBn 
        ? 'আপনি কি এই টাস্কটি সম্পন্ন করে Completed Tasks বক্সে অটো হাইড (আর্কাইভ) করতে চান?' 
        : 'Are you sure you want to complete and auto-hide this task into the Completed Tasks box?');
      if (!confirmed) {
        return;
      }
    }

    onUpdateTaskStatus(taskId, status);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (isStaffRole && !isCheckedIn) {
      alert(isBn 
        ? '⚠️ সাব-টাস্কে কাজ করার পূর্বে অবশ্যই আপনার আজকের হাজিরা ও চেক-ইন (Check-in) সম্পন্ন করুন! 🔒' 
        : '⚠️ You must complete your daily Check-in before working on subtasks! 🔒');
      return;
    }
    if (isStaffRole && state.settings.staffCanChangeTaskStatus === false) {
      alert(isBn ? 'দুঃখিত, এডমিন দ্বারা আপনার সাব-টাস্ক স্ট্যাটাস পরিবর্তন বন্ধ করা হয়েছে! 🔒' : 'Sorry, sub-task updates are disabled for staff by the Administrator! 🔒');
      return;
    }
    onToggleSubtask(taskId, subtaskId);
  };

  const handleSaveFeedback = (taskId: string) => {
    if (isStaffRole && !isCheckedIn) {
      alert(isBn 
        ? '⚠️ টাস্ক ফিডব্যাক দেওয়ার পূর্বে অবশ্যই আপনার আজকের হাজিরা ও চেক-ইন (Check-in) সম্পন্ন করুন! 🔒' 
        : '⚠️ You must complete your daily Check-in before submitting feedback! 🔒');
      return;
    }
    const val = feedbackInputs[taskId] !== undefined ? feedbackInputs[taskId] : (state.tasks.find(t => t.id === taskId)?.feedback || '');
    if (onUpdateTaskFeedback) {
      onUpdateTaskFeedback(taskId, val);
    }
    setEditingFeedbackId(null);
  };

  const handleNewTaskClick = () => {
    if (isStaffRole && !isCheckedIn) {
      alert(isBn 
        ? '⚠️ নতুন টাস্ক তৈরি করার পূর্বে অবশ্যই আপনার আজকের হাজিরা ও চেক-ইন (Check-in) সম্পন্ন করুন! 🔒' 
        : '⚠️ You must complete your daily Check-in before creating tasks! 🔒');
      return;
    }
    onOpenNewTask();
  };

  // Filter tasks
  const filteredTasks = state.tasks.filter(task => {
    // If Staff role, they ONLY see their assigned tasks (where they are either main or second assignee)
    if (isStaffRole && task.assignedStaffId !== effectiveUserId && task.assignedStaffId2 !== effectiveUserId) {
      return false;
    }

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          task.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStaff = selectedStaffFilter === 'all' || 
                         task.assignedStaffId === selectedStaffFilter || 
                         task.assignedStaffId2 === selectedStaffFilter;
                         
    const matchesPriority = selectedPriorityFilter === 'all' || task.priority === selectedPriorityFilter;
    
    // Auto-hide completed tasks from main list when viewing 'all'
    if (activeTabStatus === 'all' && task.status === 'complete') {
      return false;
    }

    const matchesStatus = activeTabStatus === 'all' || task.status === activeTabStatus;

    return matchesSearch && matchesStaff && matchesPriority && matchesStatus;
  });

  const allCompletedTasks = state.tasks.filter(task => {
    if (isStaffRole && task.assignedStaffId !== effectiveUserId && task.assignedStaffId2 !== effectiveUserId) {
      return false;
    }
    return task.status === 'complete';
  });

  const staffTasks = isStaffRole 
    ? state.tasks.filter(t => t.assignedStaffId === effectiveUserId || t.assignedStaffId2 === effectiveUserId) 
    : state.tasks;
  const todoCount = staffTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = staffTasks.filter(t => t.status === 'progress').length;
  const completedCount = staffTasks.filter(t => t.status === 'complete').length;

  const toggleExpand = (id: string) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
      
      {/* Top Navigation Back Bar */}
      <ViewBackButton
        onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
        title={isStaffRole ? (isBn ? 'আমার ব্যক্তিগত টাস্ক বোর্ড' : 'My Personal Tasks') : (isBn ? 'দৈনন্দিন টাস্ক ট্র্যাকার' : 'Daily Tasks Tracker')}
        badge={isStaffRole ? 'Staff Tasks' : 'All Tasks'}
        badgeColor="sky"
        isBn={isBn}
      />

      {/* Top Banner */}
      <div className="bg-gray-900 border border-emerald-900/40 rounded-xl p-3 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                {isStaffRole ? "My Tasks Board" : "Daily Tasks Tracker"}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {isStaffRole ? "আমার ব্যক্তিগত কাজের দায়িত্বসমূহ" : "Goals & Accountability"}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              {isStaffRole ? "My Tasks & Duties" : "Tasks & To-Do List"}
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
              Total: {String(staffTasks.length)} | Done: <strong className="text-emerald-400">{String(completedCount)}</strong> | Remaining: <strong className="text-sky-400">{String(staffTasks.length - completedCount)}</strong>
            </p>
          </div>

          {(!isStaffRole || state.settings.staffCanAddTasks === true) && (
            <button
              type="button"
              id="tasks-add-new-btn"
              onClick={handleNewTaskClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 self-start sm:self-auto border ${
                !isCheckedIn 
                  ? 'bg-gray-800 border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500/40'
              }`}
            >
              {!isCheckedIn ? (
                <Lock className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-sky-300" />
              )}
              <span>New Task</span>
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="mt-2.5 pt-2 border-t border-gray-800 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            id="task-tab-all"
            onClick={() => setActiveTabStatus('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              activeTabStatus === 'all'
                ? 'bg-gray-800 text-white border border-gray-750 shadow-sm'
                : 'text-gray-400 hover:text-white bg-gray-950/60'
            }`}
          >
            All ({String(state.tasks.length)})
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('pending')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'pending'
                ? 'bg-gray-700 text-white border border-gray-500 shadow-sm'
                : 'text-gray-400 hover:bg-gray-950/30 bg-gray-950/60'
            }`}
          >
            <span>Pending</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('progress')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'progress'
                ? 'bg-sky-600 text-white border border-sky-400/40 shadow-sm'
                : 'text-sky-400 hover:bg-sky-950/30 bg-gray-950/60'
            }`}
          >
            <span>Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('attempting')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'attempting'
                ? 'bg-purple-600 text-white border border-purple-400/40 shadow-sm'
                : 'text-purple-400 hover:bg-purple-950/30 bg-gray-950/60'
            }`}
          >
            <span>Attempting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('partial')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'partial'
                ? 'bg-amber-600 text-white border border-amber-400/40 shadow-sm'
                : 'text-amber-400 hover:bg-amber-950/30 bg-gray-950/60'
            }`}
          >
            <span>Partial</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('complete')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'complete'
                ? 'bg-emerald-700 text-white border border-emerald-500/40 shadow-sm'
                : 'text-emerald-400 hover:bg-emerald-950/30 bg-gray-950/60'
            }`}
          >
            <span>Complete</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabStatus('failed')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeTabStatus === 'failed'
                ? 'bg-rose-600 text-white border border-rose-400/40 shadow-sm'
                : 'text-rose-400 hover:bg-rose-950/30 bg-gray-950/60'
            }`}
          >
            <span>Failed</span>
          </button>
        </div>
      </div>

      {/* Lock Notice Banner when Staff has NOT checked in */}
      {isStaffRole && !isCheckedIn && (
        <div className="bg-gradient-to-r from-rose-950/90 via-amber-950/80 to-rose-950/90 border-2 border-rose-500/50 rounded-2xl p-4 sm:p-5 shadow-xl text-white space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
              <Lock className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-rose-200 tracking-tight">
                  🔒 {isBn ? 'টাস্কে কাজ করতে প্রথমে চেক-ইন করুন' : 'Tasks Locked: Check-in Required'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/30 text-rose-200 border border-rose-400/40 uppercase tracking-wide">
                  {isBn ? 'হাজিরা ও চেক-ইন আবশ্যক' : 'Check-in Required'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-200 mt-1 leading-relaxed">
                {isBn 
                  ? 'স্টাফদের টাস্ক সম্পন্ন করা, স্ট্যাটাস পরিবর্তন, সাব-টাস্কে টিক দেওয়া বা ফিডব্যাক লেখার পূর্বে আজকের উপস্থিতি চেক-ইন (Check-in) করা বাধ্যতামূলক।' 
                  : 'You must complete your daily check-in before working on tasks, changing status, or updating subtasks.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-rose-500/20">
            <div className="flex items-center gap-2 text-xs text-rose-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isBn ? 'তারিখ:' : 'Date:'} <strong>{formatEnglishDate(state.selectedDate)}</strong> • {isBn ? 'স্ট্যাটাস:' : 'Status:'} <span className="text-rose-400 font-bold">{isBn ? 'চেক-ইন করা হয়নি' : 'Not Checked In'}</span>
              </span>
            </div>

            {onMarkAttendance && (
              <button
                type="button"
                id="tasks-check-in-btn"
                onClick={() => {
                  setIsAttendanceConfirmOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-emerald-400/40"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{isBn ? '⚡ এখনই চেক-ইন করুন (Check-in Now)' : '⚡ Check-in Now'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search & Staff Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="task-search-input"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl pl-8.5 pr-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            id="task-staff-filter"
            value={selectedStaffFilter}
            onChange={(e) => setSelectedStaffFilter(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl px-2.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
          >
            <option value="all" className="bg-gray-950 text-white">All Staff</option>
            {state.staffList.map(st => (
              <option key={st.id} value={st.id} className="bg-gray-950 text-white">
                {st.name} ({st.role})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            id="task-priority-filter"
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl px-2.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
          >
            <option value="all" className="bg-gray-950 text-white">All Priorities</option>
            <option value="urgent" className="bg-gray-950 text-white">Urgent</option>
            <option value="high" className="bg-gray-950 text-white">High</option>
            <option value="medium" className="bg-gray-950 text-white">Medium</option>
            <option value="normal" className="bg-gray-950 text-white">Normal</option>
            <option value="low" className="bg-gray-950 text-white">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 bg-gray-900 rounded-xl border border-gray-800 text-gray-400 text-xs">
          No tasks found. Click the button to create new tasks.
        </div>
      ) : (
        <div className="space-y-2.5 w-full">
          {filteredTasks.map((task) => {
            const assignedStaff = state.staffList.find(s => s.id === task.assignedStaffId);
            const assignedStaff2 = task.assignedStaffId2
              ? state.staffList.find(s => s.id === task.assignedStaffId2)
              : undefined;
            const isCompleted = task.status === 'complete';
            const completedSubCount = task.subtasks.filter(s => s.completed).length;
            const subtaskProgress = task.subtasks.length > 0 
              ? Math.round((completedSubCount / task.subtasks.length) * 100)
              : (isCompleted ? 100 : 0);
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`bg-gray-900 border rounded-xl p-3 sm:p-3.5 transition-all shadow-sm ${
                  isCompleted 
                    ? 'border-gray-800 bg-gray-950/80' 
                    : 'border-emerald-900/30 hover:border-emerald-700/50'
                }`}
              >
                {/* Task Main Content */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  
                  {/* Left: Checkbox + Title + Meta */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      id={`task-check-circle-${task.id}`}
                      onClick={() => handleUpdateStatus(task.id, isCompleted ? 'pending' : 'complete')}
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-sky-400'
                          : 'border border-gray-700 hover:border-sky-400 text-transparent'
                      }`}
                      title={isCompleted ? 'Uncheck' : 'Mark Task as Completed'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                          task.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          task.priority === 'normal' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {task.priority === 'urgent' ? 'Urgent' : 
                           task.priority === 'high' ? 'High' : 
                           task.priority === 'medium' ? 'Medium' : 
                           task.priority === 'normal' ? 'Normal' : 'Low'}
                        </span>

                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-950 text-gray-300 border border-gray-800 font-medium">
                          {task.category}
                        </span>

                        {task.dueTime && (
                          <span className="text-[10px] font-mono text-sky-400 flex items-center gap-0.5 font-semibold">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{task.dueTime}</span>
                          </span>
                        )}
                      </div>

                      <h3 className={`text-sm sm:text-base font-black ${
                        isCompleted ? 'line-through text-gray-500' : 'text-white'
                      }`}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-gray-300 mt-1 leading-snug font-bold">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Staff Avatar & Status Selector */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                    {/* Assigned Staff Tag */}
                    <div className="flex flex-wrap items-center gap-1">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px]">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${assignedStaff?.avatarColor || 'bg-gray-700'}`}>
                          {assignedStaff?.name.slice(0, 1) || 'S'}
                        </div>
                        <span className="text-white font-medium truncate max-w-[100px]">
                          {assignedStaff?.name || 'All Staff'}
                        </span>
                      </div>
                      {assignedStaff2 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-950 border border-gray-800 text-[11px]">
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${assignedStaff2?.avatarColor || 'bg-gray-700'}`}>
                            {assignedStaff2?.name.slice(0, 1) || 'S'}
                          </div>
                          <span className="text-white font-medium truncate max-w-[100px]">
                            {assignedStaff2?.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {state.role === 'admin' && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id={`edit-task-btn-${task.id}`}
                          onClick={() => setTaskToEdit(task)}
                          className="p-1 text-gray-400 hover:text-sky-400 transition-colors"
                          title={isBn ? "টাস্ক এডিট করুন" : "Edit Task"}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`delete-task-${task.id}`}
                          onClick={() => setTaskToDelete(task)}
                          className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
                          title={isBn ? "টাস্ক মুছুন" : "Delete Task"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Status Action Row - Exactly 1 Line, No Side Scroll */}
                <div className="mt-3 pt-2 border-t border-gray-800">
                  <div className="grid grid-cols-6 gap-1 w-full">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'pending')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'pending'
                          ? 'bg-gray-700 text-white border-gray-500 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-gray-600 hover:text-gray-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'progress')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'progress'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-sky-900 hover:text-sky-400'
                      }`}
                    >
                      Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'attempting')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'attempting'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-purple-900 hover:text-purple-400'
                      }`}
                    >
                      Attempting
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'partial')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'partial'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-amber-900 hover:text-amber-400'
                      }`}
                    >
                      Partial
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'complete')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'complete'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-emerald-900 hover:text-emerald-400'
                      }`}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'failed')}
                      className={`py-1 px-0.5 rounded text-[9px] sm:text-[10px] font-bold text-center border truncate transition-all ${
                        task.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                          : 'bg-gray-950 text-gray-400 border-gray-800/80 hover:border-rose-900 hover:text-rose-400'
                      }`}
                    >
                      Failed
                    </button>
                  </div>
                </div>

                {/* Subtasks Section & Progress Bar */}
                {task.subtasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-800">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <button
                        type="button"
                        onClick={() => toggleExpand(task.id)}
                        className="text-gray-300 hover:text-sky-300 font-semibold flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        <span>Sub-tasks ({String(completedSubCount)}/{String(task.subtasks.length)})</span>
                      </button>
                      <span className="text-emerald-400 font-bold font-mono text-[10px]">
                        {String(subtaskProgress)}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-950 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${subtaskProgress}%` }}
                      />
                    </div>

                    {/* Expanded Subtask Items */}
                    {isExpanded && (
                      <div className="mt-2 space-y-1 pl-1.5">
                        {task.subtasks.map((st) => (
                          <div 
                            key={st.id}
                            onClick={() => handleToggleSubtask(task.id, st.id)}
                            className="flex items-center gap-1.5 text-[11px] text-gray-300 hover:text-white cursor-pointer py-0.5"
                          >
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => handleToggleSubtask(task.id, st.id)}
                              className="rounded border-gray-700 text-emerald-600 focus:ring-0 w-3 h-3"
                            />
                            <span className={st.completed ? 'line-through text-gray-500 font-bold' : 'text-gray-200 font-bold'}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Task Feedback & Remarks Section */}
                <div className="mt-3 pt-2.5 border-t border-gray-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setEditingFeedbackId(editingFeedbackId === task.id ? null : task.id)}
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{task.feedback ? 'Edit Feedback' : 'Feedback'}</span>
                    </button>
                    {task.feedback && (
                      <span className="text-[10px] font-medium text-gray-400">Feedback Saved</span>
                    )}
                  </div>

                  {task.feedback && editingFeedbackId !== task.id && (
                    <div className="p-2.5 rounded-xl bg-gray-950 border border-emerald-900/40 text-xs text-gray-300">
                      <p className="text-[10px] font-bold text-emerald-400 mb-0.5">Staff & Management Feedback:</p>
                      <p className="font-bold">{task.feedback}</p>
                    </div>
                  )}

                  {(editingFeedbackId === task.id || !task.feedback) && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Write feedback, remarks or progress note..."
                        value={feedbackInputs[task.id] !== undefined ? feedbackInputs[task.id] : (task.feedback || '')}
                        onChange={(e) => setFeedbackInputs({ ...feedbackInputs, [task.id]: e.target.value })}
                        className="flex-1 bg-gray-950 text-white text-xs rounded-lg px-3 py-1.5 border border-emerald-900/40 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveFeedback(task.id)}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 shadow-sm transition-all ${
                          !isCheckedIn
                            ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {!isCheckedIn ? <Lock className="w-3 h-3 text-rose-400" /> : <Send className="w-3 h-3" />}
                        <span>Save</span>
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Completed Tasks Collapsible Box at the Bottom */}
      {allCompletedTasks.length > 0 && activeTabStatus === 'all' && (
        <div className="mt-6 bg-gray-900 border border-emerald-900/40 rounded-2xl p-4 shadow-xl space-y-3">
          <button
            type="button"
            onClick={() => setCompletedBoxOpen(!completedBoxOpen)}
            className="w-full flex items-center justify-between text-left text-white font-bold cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                  {isBn ? 'সম্পন্ন টাস্কসমূহ (Completed Tasks)' : 'Completed Tasks'}
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  {isBn ? 'স্বয়ংক্রিয়ভাবে হাইড হওয়া সম্পন্ন কাজগুলোর তালিকা' : 'Archived completed tasks list'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {toBengaliNumber(allCompletedTasks.length)}
              </span>
              <span className="text-gray-400 group-hover:text-white text-xs transition-transform duration-200">
                {completedBoxOpen ? '▼' : '▶'}
              </span>
            </div>
          </button>

          {completedBoxOpen && (
            <div className="space-y-2.5 pt-3 border-t border-gray-800 animate-in fade-in duration-200">
              {allCompletedTasks.map(task => {
                const assignedStaff = state.staffList.find(s => s.id === task.assignedStaffId);
                const assignedStaff2 = task.assignedStaffId2
                  ? state.staffList.find(s => s.id === task.assignedStaffId2)
                  : undefined;
                const staffNames = assignedStaff2
                  ? `${assignedStaff?.name || 'All Staff'} + ${assignedStaff2.name}`
                  : (assignedStaff?.name || 'All Staff');
                return (
                  <div key={task.id} className="bg-gray-950 border border-emerald-900/30 rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-gray-300 line-through truncate">{task.title}</h5>
                        <span className="text-[10px] text-gray-500 font-medium">{task.category} • {staffNames}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(task.id, 'pending')}
                      className="text-[11px] font-bold text-sky-400 hover:text-sky-300 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 shrink-0 transition-colors"
                    >
                      {isBn ? 'পুনরুদ্ধার (Restore)' : 'Restore'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Professional Square Task Progress Graph Card (Compact) */}
      <div className="mt-6 max-w-sm sm:max-w-md mx-auto sm:mx-0 bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl space-y-3.5">
        <h3 className="text-xs font-black text-white flex items-center justify-between">
          <span>{isBn ? 'টাস্ক অগ্রগতি' : 'Task Progress'}</span>
          <span className="text-[10px] font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
            {toBengaliNumber(state.tasks.length)} {isBn ? 'টি টাস্ক' : 'Total'}
          </span>
        </h3>

        {/* Donut Chart Center */}
        {(() => {
          const completedCount = state.tasks.filter(t => t.status === 'complete').length;
          const progressCount = state.tasks.filter(t => t.status === 'progress').length;
          const attemptingCount = state.tasks.filter(t => t.status === 'attempting').length;
          const partialCount = state.tasks.filter(t => t.status === 'partial').length;
          const pendingCount = state.tasks.filter(t => t.status === 'pending' || !t.status).length;
          const failedCount = state.tasks.filter(t => t.status === 'failed').length;

          const totalTasks = state.tasks.length;
          const completedPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

          const total = Math.max(totalTasks, 1);
          const deg1 = (pendingCount / total) * 360;
          const deg2 = deg1 + (progressCount / total) * 360;
          const deg3 = deg2 + (attemptingCount / total) * 360;
          const deg4 = deg3 + (partialCount / total) * 360;
          const deg5 = deg4 + (completedCount / total) * 360;

          const conicGradient = `conic-gradient(
            #f59e0b 0deg ${deg1}deg,
            #3b82f6 ${deg1}deg ${deg2}deg,
            #06b6d4 ${deg2}deg ${deg3}deg,
            #a855f7 ${deg3}deg ${deg4}deg,
            #10b981 ${deg4}deg ${deg5}deg,
            #ef4444 ${deg5}deg 360deg
          )`;

          return (
            <>
              <div className="flex flex-col items-center justify-center py-1">
                <div className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner" style={{ background: conicGradient }}>
                  <div className="absolute w-18 h-18 bg-gray-900 rounded-full flex flex-col items-center justify-center shadow-md">
                    <span className="text-lg font-black text-white font-mono tracking-tight">{toBengaliNumber(completedPercentage)}%</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{isBn ? 'সম্পন্ন' : 'Done'}</span>
                  </div>
                </div>
              </div>

              {/* Total Tasks Count Banner */}
              <div className="bg-gradient-to-r from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-500/30 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
                <span className="text-[11px] font-bold text-sky-300">
                  {isBn ? '📊 মোট টাস্ক সংখ্যা (Total Tasks)' : '📊 Total Tasks Count'}
                </span>
                <span className="text-sm font-black text-white font-mono bg-sky-500/20 px-2 py-0.5 rounded-lg border border-sky-500/40">
                  {toBengaliNumber(totalTasks)}
                </span>
              </div>

              {/* Status Stat Cards Grid (3 columns per row, 2 rows total for 6 cards) */}
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                {/* 1. Pending */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-amber-400 font-mono">{toBengaliNumber(pendingCount)}</span>
                  <span className="text-[10px] font-bold text-amber-300/90 mt-0.5">{isBn ? 'Pending (অপেক্ষমাণ)' : 'Pending'}</span>
                </div>

                {/* 2. Progress */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-blue-400 font-mono">{toBengaliNumber(progressCount)}</span>
                  <span className="text-[10px] font-bold text-blue-300/90 mt-0.5">{isBn ? 'Progress (চলমান)' : 'Progress'}</span>
                </div>

                {/* 3. Attempting */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-cyan-400 font-mono">{toBengaliNumber(attemptingCount)}</span>
                  <span className="text-[10px] font-bold text-cyan-300/90 mt-0.5">{isBn ? 'Attempting (চেষ্টা)' : 'Attempting'}</span>
                </div>

                {/* 4. Partially */}
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-purple-400 font-mono">{toBengaliNumber(partialCount)}</span>
                  <span className="text-[10px] font-bold text-purple-300/90 mt-0.5">{isBn ? 'Partially (আংশিক)' : 'Partially'}</span>
                </div>

                {/* 5. Completed */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-emerald-400 font-mono">{toBengaliNumber(completedCount)}</span>
                  <span className="text-[10px] font-bold text-emerald-300/90 mt-0.5">{isBn ? 'Completed (সম্পন্ন)' : 'Completed'}</span>
                </div>

                {/* 6. Failed */}
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="text-base font-black text-rose-400 font-mono">{toBengaliNumber(failedCount)}</span>
                  <span className="text-[10px] font-bold text-rose-300/90 mt-0.5">{isBn ? 'Failed (ব্যর্থ)' : 'Failed'}</span>
                </div>
              </div>
            </>
          );
        })()}

        <div className="border-t border-gray-800 pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setActiveTabStatus('all');
              setSelectedStaffFilter('all');
              setSelectedPriorityFilter('all');
              setSearchQuery('');
            }}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1 w-full py-1 transition-colors group cursor-pointer"
          >
            <span>{isBn ? 'সকল টাস্ক দেখুন' : 'View All Tasks'}</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-gray-900 border border-rose-500/40 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Task Confirmation</h3>
                  <p className="text-xs text-rose-300">টাস্ক মুছে ফেলার বিষয়টি নিশ্চিত করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-950/80 rounded-xl border border-gray-800 space-y-1">
              <p className="text-xs font-bold text-gray-400">Task Title:</p>
              <p className="text-sm font-bold text-white">{taskToDelete.title}</p>
              {taskToDelete.category && (
                <p className="text-[11px] text-sky-400">Category: {taskToDelete.category}</p>
              )}
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to delete this task? This action cannot be undone and will permanently remove all associated subtasks and notes.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs rounded-xl transition-all"
              >
                Cancel (বাতিল)
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(taskToDelete.id);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Task (মুছে ফেলুন)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {taskToEdit && (
        <EditTaskModal
          isOpen={!!taskToEdit}
          onClose={() => setTaskToEdit(null)}
          staffList={state.staffList}
          task={taskToEdit}
          onEditTask={(updated) => {
            if (onEditTask) onEditTask(updated);
            setTaskToEdit(null);
          }}
          isBn={isBn}
        />
      )}

      {/* Attendance Confirmation Modal */}
      <AttendanceConfirmModal
        isOpen={isAttendanceConfirmOpen}
        actionType="checkin"
        staffName={state.staffList.find(s => s.id === effectiveUserId)?.name || 'স্টাফ'}
        onConfirm={() => {
          if (onMarkAttendance) {
            onMarkAttendance(effectiveUserId, 'present', getCurrentTimeString());
          }
          setIsAttendanceConfirmOpen(false);
        }}
        onClose={() => setIsAttendanceConfirmOpen(false)}
        isBn={isBn}
      />

    </div>
  );
};
