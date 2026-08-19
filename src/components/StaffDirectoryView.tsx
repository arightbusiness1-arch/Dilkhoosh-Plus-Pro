import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  MessageCircle, 
  Clock, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Briefcase,
  Sparkles,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  CheckSquare,
  Eye,
  Printer
} from 'lucide-react';
import { AppState, StaffMember, AppTab } from '../types';
import { toBengaliNumber, formatEnglishDate } from '../utils/dateUtils';
import { departmentsList } from '../data/initialData';
import { ViewBackButton } from './ViewBackButton';

interface StaffDirectoryViewProps {
  state: AppState;
  onOpenNewStaff: () => void;
  onSelectStaffUser: (staffId: string) => void;
  onUpdateStaff?: (oldId: string, staff: StaffMember) => void;
  onDeleteStaff?: (staffId: string) => void;
  onToggleStaffActive?: (staffId: string) => void;
  onNavigateTab?: (tab: AppTab) => void;
  onOpenStaffProfile?: (staffId: string) => void;
}

const colorOptions = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-teal-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-cyan-600'
];

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  state,
  onOpenNewStaff,
  onSelectStaffUser,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStaffActive,
  onNavigateTab,
  onOpenStaffProfile
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [directoryViewMode, setDirectoryViewMode] = useState<'grid' | 'performance'>('grid');
  
  // Modals / Dialog state
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null);

  // Form states for Editing
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editAvatarColor, setEditAvatarColor] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const getStaffDisplayId = (id: string) => {
    return id.toUpperCase();
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setEditId(staff.id);
    setEditName(staff.name);
    setEditNameEn(staff.nameEn || '');
    setEditRole(staff.role);
    setEditPhone(staff.phone);
    setEditShift(staff.shift);
    setEditAvatarColor(staff.avatarColor);
    setEditJoiningDate(staff.joiningDate);
    setEditIsActive(staff.isActive);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    const cleanId = editId.trim().toLowerCase();
    if (!cleanId) {
      alert(state.settings.language === 'bn' ? 'স্টাফ আইডি খালি রাখা যাবে না! ❌' : 'Staff ID cannot be empty! ❌');
      return;
    }

    // Check if the new ID is taken by some other staff member
    if (cleanId !== editingStaff.id.toLowerCase()) {
      const isTaken = state.staffList.some(
        s => s.id.toLowerCase() === cleanId && s.id.toLowerCase() !== editingStaff.id.toLowerCase()
      );
      if (isTaken) {
        alert(
          state.settings.language === 'bn'
            ? `এই স্টাফ আইডি "${editId}" ইতিমধ্যে অন্য স্টাফের জন্য ব্যবহৃত হয়েছে! অনুগ্রহ করে একটি অনন্য আইডি দিন। ❌`
            : `This Staff ID "${editId}" is already taken by another staff member! Please choose a unique ID. ❌`
        );
        return;
      }
    }

    if (onUpdateStaff) {
      onUpdateStaff(editingStaff.id, {
        ...editingStaff,
        id: cleanId,
        name: editName.trim(),
        nameEn: editNameEn.trim(),
        role: editRole.trim(),
        department: '',
        phone: editPhone.trim(),
        shift: editShift.trim(),
        avatarColor: editAvatarColor,
        joiningDate: editJoiningDate,
        isActive: editIsActive
      });
    }
    setEditingStaff(null);
  };

  const confirmDelete = () => {
    if (deletingStaffId && onDeleteStaff) {
      onDeleteStaff(deletingStaffId);
    }
    setDeletingStaffId(null);
  };

  const filteredStaff = state.staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (staff.nameEn && staff.nameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.phone.includes(searchQuery);

    return matchesSearch;
  });

  const deletingStaffName = state.staffList.find(s => s.id === deletingStaffId)?.name || '';

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
      
      {/* Top Navigation Back Bar */}
      <ViewBackButton
        onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
        title={state.settings.language === 'bn' ? 'স্টাফ ডিরেক্টরি ও টিম প্রোফাইল' : 'Staff Profile & Directory'}
        badge="Staff Directory"
        badgeColor="indigo"
        isBn={state.settings.language === 'bn'}
      />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-slate-950 border border-emerald-900/40 rounded-xl p-3 sm:p-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                Staff Directory
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                Team & Responsibilities
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Staff Profile & Directory
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
              Total Registered Staff: <strong className="text-emerald-400">{String(state.staffList.length)} persons</strong> • Active: <strong className="text-sky-300">{String(state.staffList.filter(s => s.isActive).length)}</strong>
            </p>
          </div>

          <button
            type="button"
            id="staff-add-new-btn"
            onClick={onOpenNewStaff}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/50 active:scale-95 shrink-0 self-start sm:self-auto border border-emerald-500/40"
          >
            <Plus className="w-3.5 h-3.5 text-sky-300" />
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Search & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 w-full">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="staff-dir-search-input"
            placeholder="Search by name, role or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl pl-8.5 pr-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-900 rounded-xl border border-gray-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setDirectoryViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              directoryViewMode === 'grid'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setDirectoryViewMode('performance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              directoryViewMode === 'performance'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-sky-300" />
            <span>Performance Summary</span>
          </button>
        </div>
      </div>

      {/* View Mode 1: Performance Metrics Table */}
      {directoryViewMode === 'performance' ? (
        <div className="bg-gray-900 border border-indigo-900/40 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Staff Performance & Punctuality Metrics</span>
              </h3>
              <p className="text-[11px] text-gray-400">
                Individual performance breakdown for task completion and check-in punctuality
              </p>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('reports')}
                className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800/50 text-[11px] font-bold transition-all cursor-pointer"
              >
                Full Report Section →
              </button>
            )}
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-300 border-b border-gray-800 font-bold">
                <tr>
                  <th className="py-2 px-2.5">Staff Name</th>
                  <th className="py-2 px-2.5">Designation</th>
                  <th className="py-2 px-2.5 text-center">Completed Tasks</th>
                  <th className="py-2 px-2.5 text-center">Task Completion Rate</th>
                  <th className="py-2 px-2.5 text-center">On-Time Checkins</th>
                  <th className="py-2 px-2.5 text-center">Punctuality Rate</th>
                  <th className="py-2 px-2.5 text-center">View Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-200">
                {filteredStaff.map(st => {
                  const staffTasks = state.tasks.filter(t => t.assignedStaffId === st.id || t.assignedStaffId2 === st.id);
                  const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
                  const taskRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;

                  const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id);
                  const presentDays = staffAtt.filter(r => r.status === 'present').length;
                  const totalAtt = staffAtt.length;
                  const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;

                  return (
                    <tr key={st.id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="py-2.5 px-2.5 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${st.avatarColor || 'bg-emerald-600'}`}>
                            {st.name.slice(0, 1)}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 text-gray-300">{st.role}</td>
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-white">
                        {completedTasks} <span className="text-gray-500 font-normal">/ {staffTasks.length}</span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-emerald-400">
                        {taskRate}%
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-mono font-bold text-sky-300">
                        {presentDays} <span className="text-gray-500 font-normal">/ {totalAtt} Days</span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] font-mono ${
                          punctualityRate >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          punctualityRate >= 60 ? 'bg-sky-950 text-sky-300 border border-sky-500/30' :
                          'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}>
                          {punctualityRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (onNavigateTab) {
                              onNavigateTab('reports');
                            } else if (onOpenStaffProfile) {
                              onOpenStaffProfile(st.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="View detailed performance report in Report section"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-300" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode 2: Staff Cards Grid */
        filteredStaff.length === 0 ? (
          <div className="text-center py-8 bg-gray-900 rounded-xl border border-gray-800 text-gray-400 text-xs">
            No staff data found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 w-full">
            {filteredStaff.map((staff) => {
              const todayRecord = state.attendanceRecords.find(
                r => r.staffId === staff.id && r.date === state.selectedDate
              );
              const staffTasks = state.tasks.filter(t => t.assignedStaffId === staff.id || t.assignedStaffId2 === staff.id);
              const completedTasksCount = staffTasks.filter(t => t.status === 'complete').length;
              const activeStaffTasks = staffTasks.filter(t => t.status !== 'complete');
              
              const staffAtt = state.attendanceRecords.filter(r => r.staffId === staff.id);
              const presentDays = staffAtt.filter(r => r.status === 'present').length;
              const punctualityRate = staffAtt.length > 0 ? Math.round((presentDays / staffAtt.length) * 100) : 100;
              const isCurrentUser = state.currentUserId === staff.id;

            return (
              <div
                key={staff.id}
                className={`bg-gray-900 border rounded-xl p-3 sm:p-3.5 transition-all shadow-sm flex flex-col justify-between space-y-2.5 ${
                  !staff.isActive 
                    ? 'opacity-60 border-gray-800 bg-gray-950/60' 
                    : isCurrentUser 
                      ? 'border-emerald-500 ring-1 ring-sky-400' 
                      : 'border-emerald-900/30 hover:border-emerald-700/50'
                }`}
              >
                <div>
                  {/* Top info - Clickable to open Profile */}
                  <div 
                    onClick={() => onOpenStaffProfile ? onOpenStaffProfile(staff.id) : onSelectStaffUser(staff.id)}
                    className="flex items-start justify-between gap-2 cursor-pointer group hover:opacity-90 transition-opacity"
                    title="Click to view detailed profile and Google Account"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {staff.googlePhotoUrl ? (
                        <img 
                          src={staff.googlePhotoUrl} 
                          alt={staff.name} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-xl object-cover border border-emerald-400 shrink-0 shadow-md"
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md ${staff.avatarColor}`}>
                          {staff.name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1 group-hover:text-sky-300 transition-colors">
                          <span>{staff.name}</span>
                          {staff.googleEmail && (
                            <span className="text-[9px] text-emerald-400 font-normal" title="Google Connected">✓</span>
                          )}
                        </h3>
                        {staff.nameEn && (
                          <p className="text-[10px] text-gray-400 font-medium truncate font-sans">
                            {staff.nameEn}
                          </p>
                        )}
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-gray-950 text-sky-300 border border-gray-800">
                          {staff.role}
                        </span>
                      </div>
                    </div>

                    {/* Today Status Pill */}
                    <div>
                      {todayRecord ? (
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          todayRecord.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          todayRecord.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          todayRecord.status === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {todayRecord.status === 'present' ? 'Present' :
                           todayRecord.status === 'late' ? 'Late' :
                           todayRecord.status === 'leave' ? 'Leave' : 'Absent'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-gray-950 text-gray-400 border border-gray-800">
                          Unmarked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="mt-2.5 space-y-1.5 text-[11px] text-gray-200 bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-sky-400" />
                        Staff ID:
                      </span>
                      <strong className="text-sky-300 font-mono font-bold tracking-wider">{getStaffDisplayId(staff.id)}</strong>
                    </div>



                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        Shift:
                      </span>
                      <span className="font-mono text-gray-300 font-medium">{staff.shift}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-sky-400" />
                        Tasks Performance:
                      </span>
                      <span className="text-sky-300 font-mono text-[11px] font-bold">
                        {completedTasksCount}/{staffTasks.length} Done ({staffTasks.length > 0 ? Math.round((completedTasksCount / staffTasks.length) * 100) : 100}%)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        Punctuality Rate:
                      </span>
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">
                        {punctualityRate}% On-Time
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        Joined:
                      </span>
                      <span className="text-gray-300 font-medium">{formatEnglishDate(staff.joiningDate)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Status:
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        staff.isActive 
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                      }`}>
                        {staff.isActive ? 'Active (চলতি)' : 'Inactive (বন্ধ)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Management Panel inside Card */}
                {state.role === 'admin' && (
                  <div className="pt-2 border-t border-gray-800 flex flex-col gap-1.5 bg-gray-950/40 p-2 rounded-lg border border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider flex items-center gap-0.5">
                        👑 Admin Controls
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {/* Active/Inactive Toggle */}
                      <button
                        type="button"
                        disabled={staff.id === 'admin'}
                        onClick={() => onToggleStaffActive && onToggleStaffActive(staff.id)}
                        className={`py-1 rounded text-[9px] font-black flex items-center justify-center transition-all border ${
                          staff.id === 'admin'
                            ? 'bg-gray-950 text-gray-500 border-gray-800 cursor-not-allowed opacity-40'
                            : staff.isActive
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/30'
                              : 'bg-amber-950/40 text-amber-400 border-amber-500/30 hover:bg-amber-900/30'
                        }`}
                        title={staff.id === 'admin' ? "System Admin cannot be deactivated" : staff.isActive ? "Deactivate Staff" : "Activate Staff"}
                      >
                        {staff.id === 'admin' ? "Protected" : (staff.isActive ? "Deactivate" : "Activate")}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(staff)}
                        className="py-1 bg-sky-950/40 text-sky-400 border border-sky-500/30 hover:bg-sky-900/30 rounded text-[9px] font-black flex items-center justify-center gap-1 transition-all"
                        title="Edit Details"
                      >
                        <Edit2 className="w-2.5 h-2.5 text-sky-400" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        disabled={staff.id === 'admin'}
                        onClick={() => setDeletingStaffId(staff.id)}
                        className={`py-1 rounded text-[9px] font-black flex items-center justify-center gap-1 transition-all border ${
                          staff.id === 'admin'
                            ? 'bg-gray-950 text-gray-500 border-gray-800 cursor-not-allowed opacity-40'
                            : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/30'
                        }`}
                        title={staff.id === 'admin' ? "System Admin cannot be deleted" : "Delete Staff"}
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Quick Action Buttons (Call, WhatsApp, Active user view) */}
                <div className="pt-2 border-t border-gray-800 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${staff.phone.replace(/[^0-9]/g, '')}`}
                      className="p-1.5 rounded-lg bg-gray-950 hover:bg-gray-850 text-white hover:text-sky-400 transition-colors border border-gray-800"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-700/30 hover:bg-emerald-700/50 text-emerald-300 transition-colors border border-emerald-500/40"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <button
                    type="button"
                    id={`select-user-${staff.id}`}
                    onClick={() => {
                      if (onOpenStaffProfile) {
                        onOpenStaffProfile(staff.id);
                      } else {
                        onSelectStaffUser(staff.id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                      isCurrentUser
                        ? 'bg-emerald-700 text-white shadow-sm border border-emerald-500/40 ring-1 ring-sky-400'
                        : 'bg-gray-950 hover:bg-gray-850 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    <span>{isCurrentUser ? 'Active • View Profile' : 'View Profile'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ))}

      {/* ================= EDIT STAFF MODAL ================= */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-700/30 text-sky-400 border border-sky-500/40">
                  <Edit2 className="w-5 h-5 text-sky-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Edit Staff Profile Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              
               {/* Staff ID (Customizable & Editable) */}
              <div>
                <label className="block text-[10px] uppercase font-black tracking-wider text-sky-400 mb-1 flex items-center justify-between">
                  <span>Staff ID Code (Custom & Editable) *</span>
                  {editingStaff.id === 'admin' ? (
                    <span className="text-amber-500 font-bold text-[9px] lowercase">system protected</span>
                  ) : (
                    <span className="text-gray-500 font-bold text-[9px] lowercase">must be unique</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  disabled={editingStaff.id === 'admin'}
                  value={editId}
                  onChange={(e) => setEditId(e.target.value)}
                  className={`w-full bg-gray-950 text-sky-400 font-mono font-bold text-sm rounded-xl px-3.5 py-2.5 border ${
                    editingStaff.id === 'admin'
                      ? 'border-gray-800 cursor-not-allowed opacity-60 text-gray-400'
                      : 'border-emerald-900/40 focus:outline-none focus:border-sky-400'
                  }`}
                />
              </div>

              {/* Staff Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Staff Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanvir Hasan"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-bold"
                />
              </div>

              {/* Designation (Role) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Designation (Role) *
                </label>
                <select
                  value={editRole === 'System Administrator' ? 'Admin' : editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-bold"
                >
                  <option value="Staff">{state.settings.language === 'bn' ? 'স্টাফ (Staff)' : 'Staff'}</option>
                  <option value="Admin">{state.settings.language === 'bn' ? 'এডমিন (Admin)' : 'Admin'}</option>
                </select>
              </div>

              {/* Phone & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01712-345678"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Shift Time & Active status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Working Hours / Shift
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9:00 AM - 6:00 PM"
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Status (কর্মী সক্রিয়তা)
                  </label>
                  <div className="flex items-center gap-4 py-2.5">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-white text-xs">
                      <input
                        type="radio"
                        checked={editIsActive === true}
                        onChange={() => setEditIsActive(true)}
                        className="text-emerald-500 focus:ring-emerald-500 bg-gray-950 border-gray-800"
                      />
                      <span>Active (চলতি)</span>
                    </label>

                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-white text-xs">
                      <input
                        type="radio"
                        checked={editIsActive === false}
                        onChange={() => setEditIsActive(false)}
                        className="text-amber-500 focus:ring-amber-500 bg-gray-950 border-gray-800"
                      />
                      <span>Inactive (নিষ্ক্রিয়)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Profile Color Theme
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditAvatarColor(c)}
                      className={`w-7 h-7 rounded-full ${c} transition-all ${
                        editAvatarColor === c ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95 border border-emerald-500/40"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM DELETE DIALOG ================= */}
      {deletingStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95 backdrop-blur-sm">
          <div className="bg-gray-900 border border-rose-900/40 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in fade-in scale-in duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">কর্মী ডিলিট নিশ্চিত করুন</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">Confirm Deletion</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              আপনি কি নিশ্চিত যে কর্মী <strong className="text-white font-bold">"{deletingStaffName}"</strong>-এর সমস্ত বিবরণ ডিলিট করতে চান? এই অ্যাকশনটি অপরিবর্তনযোগ্য।
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingStaffId(null)}
                className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-950 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
