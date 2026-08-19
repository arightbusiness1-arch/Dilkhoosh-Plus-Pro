import React, { useState } from 'react';
import { 
  UserCheck, 
  Clock, 
  UserX, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  FileSpreadsheet, 
  Printer, 
  Plus, 
  Sparkles,
  Edit3,
  Building2,
  CheckCheck
} from 'lucide-react';
import { AppState, StaffMember, AttendanceStatus, AttendanceRecord, AppTab } from '../types';
import { toBengaliNumber, formatEnglishDate, getCurrentTimeString, getTodayDateString, parseTimeStrToMinutes } from '../utils/dateUtils';
import { departmentsList } from '../data/initialData';
import { ViewBackButton } from './ViewBackButton';

interface AttendanceViewProps {
  state: AppState;
  onMarkAttendance: (staffId: string, status: AttendanceStatus, checkIn?: string, checkOut?: string, note?: string) => void;
  onBulkMarkPresent: () => void;
  onOpenNewStaff: () => void;
  onOpenReports: () => void;
  onNavigateTab?: (tab: AppTab) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  state,
  onMarkAttendance,
  onBulkMarkPresent,
  onOpenNewStaff,
  onOpenReports,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All Departments');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');

  const today = state.selectedDate;

  const activeStaffList = state.staffList.filter(
    s => s.isActive
  );

  // Filter by department and search
  const filteredStaff = activeStaffList.filter(staff => {
    const matchesDept = selectedDept === 'All Departments' || staff.department === selectedDept;
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          staff.phone.includes(searchQuery);

    const record = state.attendanceRecords.find(r => r.staffId === staff.id && r.date === today);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unmarked' && !record) ||
      (record && record.status === statusFilter);

    return matchesDept && matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const todayRecords = state.attendanceRecords.filter(
    r => r.date === today && activeStaffList.some(s => s.id === r.staffId)
  );
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const leaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;
  const unmarkedCount = Math.max(0, activeStaffList.length - todayRecords.length);

  const handleOpenNote = (staffId: string, currentNote?: string) => {
    setEditingStaffId(staffId);
    setNoteInput(currentNote || '');
  };

  const handleSaveNote = (staffId: string) => {
    const rec = state.attendanceRecords.find(r => r.staffId === staffId && r.date === today);
    const currentStatus = rec ? rec.status : 'present';
    const checkIn = rec ? rec.checkInTime : getCurrentTimeString();
    const checkOut = rec ? rec.checkOutTime : '';
    onMarkAttendance(staffId, currentStatus, checkIn, checkOut, noteInput);
    setEditingStaffId(null);
  };

  const getDayNameEnglish = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      return '';
    }
  };

  const isStaffRole = state.role === 'staff';
  const myStaffId = state.currentUserId;
  const currentStaffDetails = state.staffList.find(s => s.id === myStaffId);

  // If in staff mode, render their beautiful personal attendance summary and history
  if (isStaffRole) {
    const myRecords = state.attendanceRecords.filter(r => r.staffId === myStaffId);
    const myPresent = myRecords.filter(r => r.status === 'present').length;
    const myLate = myRecords.filter(r => r.status === 'late').length;
    const myLeave = myRecords.filter(r => r.status === 'leave').length;
    const myAbsent = myRecords.filter(r => r.status === 'absent').length;

    return (
      <div className="space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
        
        {/* Top Navigation Back Bar */}
        <ViewBackButton
          onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
          title={state.settings.language === 'bn' ? 'আমার হাজিরা ও উপস্থিতি প্রোফাইল' : 'My Attendance Profile'}
          badge="Staff Log"
          badgeColor="amber"
          isBn={state.settings.language === 'bn'}
        />

        {/* Top Banner */}
        <div className="bg-gray-900 border border-sky-950 rounded-2xl p-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Personal Attendance Log
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  আমার হাজিরা ও উপস্থিতির খাতা
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Attendance Profile: {currentStaffDetails?.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5">
                Department: <strong className="text-sky-300">{currentStaffDetails?.department}</strong> | ID: <strong className="text-gray-300">{currentStaffDetails?.id}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <div className="p-3 rounded-2xl bg-gray-900 border border-gray-850 text-center shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Present</span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 block mt-1">{String(myPresent)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-900 border border-gray-850 text-center shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Late</span>
            <span className="text-lg sm:text-xl font-black text-amber-400 block mt-1">{String(myLate)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-900 border border-gray-850 text-center shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Leave</span>
            <span className="text-lg sm:text-xl font-black text-purple-400 block mt-1">{String(myLeave)}</span>
          </div>
          <div className="p-3 rounded-2xl bg-gray-900 border border-gray-850 text-center shadow-inner">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Absent</span>
            <span className="text-lg sm:text-xl font-black text-rose-500 block mt-1">{String(myAbsent)}</span>
          </div>
        </div>

        {/* Attendance Entries List */}
        <div className="bg-gray-900 border border-gray-850 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-white mb-3">Attendance History (হাজিরা রেকর্ডসমূহ)</h3>
          
          {myRecords.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">কোনো হাজিরা রেকর্ড পাওয়া যায়নি।</p>
          ) : (
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {[...myRecords].reverse().map((r, i) => (
                <div key={i} className="bg-gray-950 p-3 rounded-xl border border-gray-850 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-gray-300 font-mono block">
                      {formatEnglishDate(r.date)} ({getDayNameEnglish(r.date)})
                    </span>
                    {r.checkInTime && (
                      <span className="text-[10px] text-sky-400 font-medium font-mono mt-0.5 inline-block">
                        Check-in: {r.checkInTime}
                      </span>
                    )}
                    {r.note && (
                      <span className="text-[10px] text-gray-450 block italic mt-0.5">
                        Note: {r.note}
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide shrink-0 ${
                    r.status === 'present' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                    r.status === 'late' ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30' :
                    r.status === 'leave' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' :
                    'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6 w-full overflow-x-hidden">
      
      {/* Top Navigation Back Bar */}
      <ViewBackButton
        onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
        title={state.settings.language === 'bn' ? 'স্টাফ উপস্থিতি ও হাজিরা খাতা' : 'Staff Attendance & Time Log'}
        badge="Attendance Log"
        badgeColor="emerald"
        isBn={state.settings.language === 'bn'}
      />

      {/* Top Header & Fast Action Bar */}
      <div className="bg-gray-900 border border-emerald-900/40 rounded-xl p-3 sm:p-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
                Daily Attendance Log
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                {formatEnglishDate(today)}
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
              Staff Attendance & Time Log
            </h2>
            <p className="text-[11px] sm:text-xs text-gray-300 mt-0.5">
              Staff: {String(activeStaffList.length)} persons | Present: <strong className="text-emerald-400">{String(presentCount + lateCount)}</strong> persons
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <button
              type="button"
              id="bulk-mark-present-btn"
              onClick={onBulkMarkPresent}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 border border-emerald-500/40"
              title="Mark All Remaining Staff Present"
            >
              <CheckCheck className="w-3.5 h-3.5 text-sky-300" />
              <span>Mark All Present</span>
            </button>

            <button
              type="button"
              id="attendance-print-btn"
              onClick={onOpenReports}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-850 text-white border border-gray-800 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Report</span>
            </button>

            <button
              type="button"
              id="add-staff-from-att-btn"
              onClick={onOpenNewStaff}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-850 text-sky-400 border border-sky-500/40 text-xs font-bold transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Staff</span>
            </button>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="mt-2.5 pt-2 border-t border-gray-800 flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            id="filter-status-all"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-gray-800 text-white border border-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-white bg-gray-950/60'
            }`}
          >
            All ({String(activeStaffList.length)})
          </button>

          <button
            type="button"
            id="filter-status-present"
            onClick={() => setStatusFilter('present')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'present'
                ? 'bg-emerald-700 text-white border border-emerald-500/40 shadow-sm'
                : 'text-emerald-400 hover:bg-emerald-950/30 bg-gray-950/60'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            <span>Present ({String(presentCount)})</span>
          </button>

          <button
            type="button"
            id="filter-status-late"
            onClick={() => setStatusFilter('late')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'late'
                ? 'bg-amber-600 text-white border border-amber-500/40 shadow-sm'
                : 'text-amber-400 hover:bg-amber-950/30 bg-gray-950/60'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Late ({String(lateCount)})</span>
          </button>

          <button
            type="button"
            id="filter-status-leave"
            onClick={() => setStatusFilter('leave')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'leave'
                ? 'bg-purple-700 text-white border border-purple-500/40 shadow-sm'
                : 'text-purple-400 hover:bg-purple-950/30 bg-gray-950/60'
            }`}
          >
            <span>Leave ({String(leaveCount)})</span>
          </button>

          <button
            type="button"
            id="filter-status-absent"
            onClick={() => setStatusFilter('absent')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              statusFilter === 'absent'
                ? 'bg-rose-700 text-white border border-rose-500/40 shadow-sm'
                : 'text-rose-400 hover:bg-rose-950/30 bg-gray-950/60'
            }`}
          >
            <UserX className="w-3 h-3" />
            <span>Absent ({String(absentCount)})</span>
          </button>

          <button
            type="button"
            id="filter-status-unmarked"
            onClick={() => setStatusFilter('unmarked')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              statusFilter === 'unmarked'
                ? 'bg-gray-800 text-white border border-gray-750 shadow-sm'
                : 'text-gray-400 hover:text-white bg-gray-950/60'
            }`}
          >
            Unmarked ({String(unmarkedCount)})
          </button>
        </div>
      </div>

      {/* Search & Department Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 w-full">
        <div className="sm:col-span-8 relative">
          <Search className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="staff-search-input"
            placeholder="Search by staff name, role or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl pl-8.5 pr-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            id="dept-select-filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-gray-900 text-white text-xs rounded-xl px-2.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
          >
            {departmentsList.map(dept => (
              <option key={dept} value={dept} className="bg-gray-950 text-white">
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Attendance Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="text-center py-8 bg-gray-900 rounded-xl border border-gray-800 text-gray-400 text-xs">
          No staff records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 w-full">
          {filteredStaff.map((staff) => {
            const record = state.attendanceRecords.find(r => r.staffId === staff.id && r.date === today);
            const currentStatus = record?.status;
            const checkInTime = record?.checkInTime;
            const checkOutTime = record?.checkOutTime;
            const note = record?.note;

            return (
              <div 
                key={staff.id}
                className="bg-gray-900 border border-emerald-900/30 hover:border-emerald-700/60 rounded-xl p-3 sm:p-3.5 shadow-sm transition-all space-y-2"
              >
                {/* Staff Top Info Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${staff.avatarColor}`}>
                      {staff.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {staff.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate">
                        {staff.role} • <span className="text-sky-300 font-medium">{staff.department}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                        <span>Shift: {staff.shift}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {currentStatus ? (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                        currentStatus === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                        currentStatus === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        currentStatus === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {currentStatus === 'present' && <UserCheck className="w-3 h-3" />}
                        {currentStatus === 'late' && <Clock className="w-3 h-3" />}
                        {currentStatus === 'present' ? 'Present' :
                         currentStatus === 'late' ? 'Late' :
                         currentStatus === 'leave' ? 'Leave' : 'Absent'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-950 text-gray-400 border border-gray-800">
                        Unmarked
                      </span>
                    )}
                  </div>
                </div>

                {/* Check-in / Check-Out Time Details */}
                <div className="bg-gray-950 rounded-lg p-2 border border-gray-800 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">In:</span>
                    <strong className={checkInTime ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                      {checkInTime || '--:--'}
                    </strong>
                    {!checkInTime && (
                      <button
                        type="button"
                        id={`check-in-btn-${staff.id}`}
                        onClick={() => onMarkAttendance(staff.id, currentStatus || 'present', getCurrentTimeString(), checkOutTime, note)}
                        className="text-[9px] px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-sans font-bold transition-all ml-0.5"
                      >
                        Check-in
                      </button>
                    )}
                  </div>

                  <div className="h-2.5 w-px bg-gray-800" />

                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Out:</span>
                    <strong className={checkOutTime ? 'text-sky-400 font-bold' : 'text-gray-400'}>
                      {checkOutTime || '--:--'}
                    </strong>
                    {!checkOutTime && checkInTime && (
                      <button
                        type="button"
                        id={`check-out-btn-${staff.id}`}
                        onClick={() => {
                          const nowMinutes = parseTimeStrToMinutes(getCurrentTimeString());
                          const inMinutes = parseTimeStrToMinutes(checkInTime);
                          
                          // Prevent check-out if less than 1 minute has passed
                          if (nowMinutes - inMinutes < 1) {
                            alert(state.settings.language === 'bn' 
                              ? '⚠️ আপনি মাত্র চেক-ইন করেছেন! চেক-আউট করার জন্য অন্তত ১ মিনিট অপেক্ষা করুন।' 
                              : '⚠️ You just checked in! Please wait at least 1 minute before checking out.');
                            return;
                          }
                          
                          onMarkAttendance(staff.id, currentStatus || 'present', checkInTime, getCurrentTimeString(), note);
                        }}
                        className="text-[9px] px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-sans font-bold transition-all ml-0.5"
                      >
                        Check-Out
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    id={`edit-note-btn-${staff.id}`}
                    onClick={() => handleOpenNote(staff.id, note)}
                    className="text-gray-400 hover:text-sky-400 p-0.5 transition-all"
                    title="Add Note or Comment"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Note Display if exists */}
                {note && (
                  <div className="text-[10px] text-gray-200 bg-gray-950 p-1.5 rounded-lg border border-gray-800 flex items-start gap-1">
                    <span className="text-sky-400 font-bold shrink-0">Note:</span>
                    <span className="line-clamp-2">{note}</span>
                  </div>
                )}

                {/* Status Action Buttons Grid */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  <button
                    type="button"
                    id={`btn-mark-present-${staff.id}`}
                    onClick={() => onMarkAttendance(staff.id, 'present', checkInTime || getCurrentTimeString(), checkOutTime, note)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-0.5 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-sky-400'
                        : 'bg-gray-950 hover:bg-emerald-950/40 text-gray-300 hover:text-emerald-400 border border-gray-800'
                    }`}
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-mark-late-${staff.id}`}
                    onClick={() => onMarkAttendance(staff.id, 'late', checkInTime || getCurrentTimeString(), checkOutTime, note)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-0.5 ${
                      currentStatus === 'late'
                        ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                        : 'bg-gray-950 hover:bg-amber-950/40 text-gray-300 hover:text-amber-400 border border-gray-800'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Late</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-mark-leave-${staff.id}`}
                    onClick={() => onMarkAttendance(staff.id, 'leave', '', '', note || 'Leave')}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-0.5 ${
                      currentStatus === 'leave'
                        ? 'bg-purple-700 text-white shadow-sm ring-1 ring-purple-400'
                        : 'bg-gray-950 hover:bg-purple-950/40 text-gray-300 hover:text-purple-400 border border-gray-800'
                    }`}
                  >
                    <span>Leave</span>
                  </button>

                  <button
                    type="button"
                    id={`btn-mark-absent-${staff.id}`}
                    onClick={() => onMarkAttendance(staff.id, 'absent', '', '', note || 'Absent')}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-0.5 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-700 text-white shadow-sm ring-1 ring-rose-400'
                        : 'bg-gray-950 hover:bg-rose-950/40 text-gray-300 hover:text-rose-400 border border-gray-800'
                    }`}
                  >
                    <UserX className="w-3 h-3" />
                    <span>Absent</span>
                  </button>
                </div>

                {/* Inline Note Editor if active */}
                {editingStaffId === staff.id && (
                  <div className="pt-1.5 border-t border-gray-800 space-y-1.5">
                    <input
                      type="text"
                      placeholder="Write note or reason for leave..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="w-full bg-gray-950 text-white text-xs rounded-lg px-2.5 py-1.5 border border-emerald-900/50 focus:outline-none focus:border-sky-400"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingStaffId(null)}
                        className="px-2 py-0.5 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(staff.id)}
                        className="px-2.5 py-0.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
