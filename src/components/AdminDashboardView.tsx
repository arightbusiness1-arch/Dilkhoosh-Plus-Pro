import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  CheckSquare, 
  FileSpreadsheet, 
  Bell, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowRight, 
  Lock,
  UserCheck,
  Building2,
  Activity,
  CalendarDays
} from 'lucide-react';
import { AppState, AppTab, AttendanceStatus } from '../types';
import { toBengaliNumber } from '../utils/dateUtils';

interface AdminDashboardViewProps {
  state: AppState;
  onNavigateTab: (tab: AppTab) => void;
  onRoleChange: (role: 'admin' | 'manager' | 'staff') => void;
  onOpenNewTask: () => void;
  onOpenNewStaff: () => void;
  onOpenNewDirective: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  state,
  onNavigateTab,
  onRoleChange,
  onOpenNewTask,
  onOpenNewStaff,
  onOpenNewDirective
}) => {
  const isAdmin = state.role === 'admin';
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Compute metrics
  const totalStaff = state.staffList.length;
  const activeStaff = state.staffList.filter(s => s.isActive).length;
  
  const allTasks = state.tasks;
  const pendingTasks = allTasks.filter(t => t.status !== 'complete');
  const urgentTasks = allTasks.filter(t => t.priority === 'urgent' && t.status !== 'complete');
  const completedTasks = allTasks.filter(t => t.status === 'complete');

  const today = state.selectedDate;
  const todayRecords = state.attendanceRecords.filter(r => r.date === today);
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;
  const leaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const unmarkedCount = Math.max(0, activeStaff - todayRecords.length);

  const totalDirectives = state.directives.length;
  const urgentDirectives = state.directives.filter(d => d.priority === 'urgent');

  // If not admin, show security barrier
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mx-auto shadow-2xl shadow-rose-950">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 uppercase tracking-widest">
            Restricted Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Admin Dashboard Protected
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto">
            This system-wide administration dashboard is specifically accessible only to users with the <span className="text-emerald-400 font-bold">'admin'</span> role.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-xl space-y-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase">Current Role:</span>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
              {state.role}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              Switch role to Administrator to unlock system-wide telemetry and activity aggregates:
            </p>
            <button
              type="button"
              id="switch-to-admin-btn"
              onClick={() => onRoleChange('admin')}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Admin Role</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => onNavigateTab('home')}
            className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center justify-center gap-1 mx-auto"
          >
            <span>Return to Home Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 w-full overflow-x-hidden animate-in fade-in duration-200">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-slate-950 border border-emerald-500/40 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-950 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
                System Administrator
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/30">
                v{state.settings.version}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Admin Control & Activity Aggregate
            </h1>
            <p className="text-xs text-gray-300">
              Real-time system telemetry, pending task counts, and attendance summaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            id="admin-add-task-btn"
            onClick={onOpenNewTask}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Create New Task (Ctrl+N)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
            <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 bg-emerald-800/80 text-emerald-200 rounded border border-emerald-400/40 ml-0.5">
              Ctrl+N
            </kbd>
          </button>
          <button
            type="button"
            id="admin-add-staff-btn"
            onClick={onOpenNewStaff}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Register New Staff (Ctrl+Shift+S)"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Add Staff</span>
            <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 bg-sky-800/80 text-sky-200 rounded border border-sky-400/40 ml-0.5">
              Ctrl+Shift+S
            </kbd>
          </button>
          <button
            type="button"
            id="admin-add-directive-btn"
            onClick={onOpenNewDirective}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            title="Post Directive (Ctrl+Shift+D)"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Directive</span>
            <kbd className="hidden sm:inline-block text-[9px] font-mono px-1 py-0.2 bg-purple-800/80 text-purple-200 rounded border border-purple-400/40 ml-0.5">
              Ctrl+Shift+D
            </kbd>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Staff KPI */}
        <div 
          onClick={() => onNavigateTab('staff')}
          className="bg-gray-900 border border-gray-800 hover:border-emerald-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">Total Staff</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white">{String(totalStaff)}</h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
              {String(activeStaff)} Active
            </span>
          </div>
        </div>

        {/* Pending Tasks KPI */}
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="bg-gray-900 border border-gray-800 hover:border-sky-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white">{String(pendingTasks.length)}</h3>
            {urgentTasks.length > 0 && (
              <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                {String(urgentTasks.length)} Urgent
              </span>
            )}
          </div>
        </div>

        {/* Today's Attendance KPI */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">Today's Attendance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white">{String(presentCount + lateCount)}/{String(activeStaff)}</h3>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">
              {unmarkedCount > 0 ? `${unmarkedCount} Unmarked` : 'All Marked'}
            </span>
          </div>
        </div>

        {/* Directives KPI */}
        <div 
          onClick={() => onNavigateTab('directives')}
          className="bg-gray-900 border border-gray-800 hover:border-purple-500/50 p-4 rounded-xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">Directives & Notes</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-white">{String(totalDirectives)}</h3>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded">
              {String(urgentDirectives.length)} Pinned/Urgent
            </span>
          </div>
        </div>

      </div>

      {/* Main Admin Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Attendance & Pending Tasks Aggregate */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Attendance Summary Card */}
          <div className="bg-gray-900 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Today's Attendance Summary ({today})</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Aggregated presence and status across all departments
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('attendance')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <span>Attendance Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attendance breakdown pills */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Present</span>
                <span className="text-lg font-black text-white">{String(presentCount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Late</span>
                <span className="text-lg font-black text-white">{String(lateCount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-center">
                <span className="text-[10px] text-rose-400 font-bold uppercase block">Absent</span>
                <span className="text-lg font-black text-white">{String(absentCount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 text-center">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">Leave</span>
                <span className="text-lg font-black text-white">{String(leaveCount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Unmarked</span>
                <span className="text-lg font-black text-white">{String(unmarkedCount)}</span>
              </div>
            </div>

            {/* Staff Attendance Mini List */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Staff Status Live List
              </span>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {state.staffList.filter(s => s.isActive).map(staff => {
                  const record = todayRecords.find(r => r.staffId === staff.id);
                  const status = record?.status || 'unmarked';
                  
                  return (
                    <div 
                      key={staff.id}
                      className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs ${staff.avatarColor}`}>
                          {staff.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate">{staff.name}</h4>
                          <p className="text-[10px] text-gray-400 truncate">{staff.role} • {staff.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {record?.checkInTime && (
                          <span className="text-[10px] font-mono text-gray-400">
                            In: {record.checkInTime}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          status === 'absent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          status === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                          'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Pending Tasks Aggregate Card */}
          <div className="bg-gray-900 border border-sky-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-sky-400" />
                  <span>Pending Tasks Aggregate ({pendingTasks.length} Active)</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Task queue and assignee distribution
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
              >
                <span>Tasks Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No pending tasks in the queue. All caught up!
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {pendingTasks.slice(0, 6).map(task => {
                  const assignedStaff = state.staffList.find(s => s.id === task.assignedStaffId);
                  const assignedStaff2 = task.assignedStaffId2 
                    ? state.staffList.find(s => s.id === task.assignedStaffId2) 
                    : undefined;
                  const staffNames = assignedStaff2 
                    ? `${assignedStaff?.name || 'Unassigned'} & ${assignedStaff2.name}`
                    : (assignedStaff?.name || 'Unassigned');
                  return (
                    <div 
                      key={task.id}
                      className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-bold text-white truncate">{task.title}</h4>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            task.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                            'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate">
                          Assigned to: <span className="text-emerald-400 font-semibold">{staffNames}</span> • Due: {task.dueDate}
                        </p>
                      </div>

                      <span className={`px-2 py-1 rounded font-mono text-[10px] border shrink-0 ${
                        task.status === 'complete' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                        task.status === 'failed' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        task.status === 'partial' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        task.status === 'attempting' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                        task.status === 'progress' ? 'bg-sky-500/10 text-sky-300 border-sky-500/30' :
                        'bg-gray-500/10 text-gray-300 border-gray-500/30'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Staff Task Feedbacks Stream Card */}
          <div className="bg-gray-900 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">💬</span>
                  <span>Staff Task Feedbacks & Remarks Stream</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Real-time feed of all feedback and remarks left by staff on tasks
                </p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {String(state.tasks.filter(t => t.feedback && t.feedback.trim() !== '').length)} Feedbacks
              </span>
            </div>

            {state.tasks.filter(t => t.feedback && t.feedback.trim() !== '').length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No task feedbacks or remarks submitted yet. Staff can add feedback under any task.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {state.tasks.filter(t => t.feedback && t.feedback.trim() !== '').map(task => {
                  const assignedStaff = state.staffList.find(s => s.id === task.assignedStaffId);
                  const assignedStaff2 = task.assignedStaffId2 
                    ? state.staffList.find(s => s.id === task.assignedStaffId2) 
                    : undefined;
                  const staffNames = assignedStaff2 
                    ? `${assignedStaff?.name || 'Staff'} & ${assignedStaff2.name}`
                    : (assignedStaff?.name || 'Staff Member');
                  return (
                    <div 
                      key={task.id}
                      className="p-3.5 rounded-xl bg-gray-950 border border-emerald-900/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${assignedStaff?.avatarColor || 'bg-gray-700'}`}>
                            {assignedStaff?.name?.slice(0, 1) || 'S'}
                          </div>
                          <span className="font-bold text-white truncate">
                            {staffNames}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ({assignedStaff?.role || 'Staff'})
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          task.status === 'complete' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                          task.status === 'failed' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                          task.status === 'partial' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          task.status === 'attempting' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                          task.status === 'progress' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' :
                          'bg-gray-500/20 text-gray-300 border-gray-500/40'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-gray-900 border border-gray-800">
                        <p className="text-[11px] font-bold text-sky-300 mb-0.5">Task: {task.title}</p>
                        <p className="text-xs text-emerald-200 font-medium italic">
                          "{task.feedback}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Col: Admin Quick Actions & Directives */}
        <div className="space-y-6">
          
          {/* Quick Admin Actions */}
          <div className="bg-gray-900 border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Admin Quick Shortcuts</span>
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => onNavigateTab('report')}
                className="w-full p-3 rounded-xl bg-gray-950 hover:bg-emerald-950/30 border border-gray-800 hover:border-emerald-500/50 flex items-center justify-between transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-emerald-300">System Reports & CSV</h4>
                    <p className="text-[10px] text-gray-400">Export attendance and activity logs</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('directives')}
                className="w-full p-3 rounded-xl bg-gray-950 hover:bg-purple-950/30 border border-gray-800 hover:border-purple-500/50 flex items-center justify-between transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-purple-300">Directives & Orders</h4>
                    <p className="text-[10px] text-gray-400">Broadcast notices & branch orders</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('staff')}
                className="w-full p-3 rounded-xl bg-gray-950 hover:bg-sky-950/30 border border-gray-800 hover:border-sky-500/50 flex items-center justify-between transition-all text-xs text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-sky-300">Staff Directory</h4>
                    <p className="text-[10px] text-gray-400">Manage employee accounts & shifts</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Active Directives Summary */}
          <div className="bg-gray-900 border border-purple-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                <span>Active Directives</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {state.directives.length} Total
              </span>
            </div>

            <div className="space-y-2.5">
              {state.directives.slice(0, 3).map(dir => (
                <div key={dir.id} className="p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white truncate max-w-[180px]">{dir.title}</h4>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      dir.priority === 'urgent' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {dir.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 line-clamp-2">{dir.content}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
