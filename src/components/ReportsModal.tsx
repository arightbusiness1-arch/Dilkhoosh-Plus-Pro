import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileSpreadsheet, 
  Download, 
  Share2
} from 'lucide-react';
import { AppState } from '../types';
import { formatEnglishDate, toBengaliNumber } from '../utils/dateUtils';
import { exportAllDataJSON } from '../utils/storage';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onRestoreData: (jsonStr: string) => void;
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreData
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [showRestoreBox, setShowRestoreBox] = useState(false);

  const today = state.selectedDate;

  const activeStaff = state.staffList.filter(
    s => s.isActive
  );

  const todayRecords = state.attendanceRecords.filter(
    r => r.date === today && activeStaff.some(s => s.id === r.staffId)
  );

  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const leaveCount = todayRecords.filter(r => r.status === 'leave').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;

  // Export CSV
  const handleExportAttendanceCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Staff Name,Designation,Department,Shift,Status,Check In,Check Out,Notes\r\n';

    activeStaff.forEach(st => {
      const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
      const status = rec?.status || 'Unmarked';
      const checkIn = rec?.checkInTime || '';
      const checkOut = rec?.checkOutTime || '';
      const note = (rec?.note || '').replace(/,/g, ' ');

      csvContent += `"${st.name}","${st.role}","${st.department}","${st.shift}","${status}","${checkIn}","${checkOut}","${note}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dilkhoosh_attendance_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Tasks CSV
  const handleExportTasksCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Task Title,Assigned Staff,Category,Priority,Status,Due Date,Due Time,Description\r\n';

    state.tasks.forEach(task => {
      const staff = state.staffList.find(s => s.id === task.assignedStaffId);
      const staff2 = task.assignedStaffId2 ? state.staffList.find(s => s.id === task.assignedStaffId2) : undefined;
      const staffNames = staff2 ? `${staff?.name || 'Unassigned'} + ${staff2.name}` : (staff?.name || 'Unassigned');
      csvContent += `"${task.title}","${staffNames}","${task.category}","${task.priority}","${task.status}","${task.dueDate}","${task.dueTime || ''}","${(task.description || '').replace(/,/g, ' ')}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dilkhoosh_tasks_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON Backup
  const handleDownloadBackup = () => {
    const jsonStr = exportAllDataJSON(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dilkhoosh_backup_${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print Daily Sheet
  const handlePrint = () => {
    window.print();
  };

  // Copy WhatsApp summary
  const handleCopySummary = () => {
    const summaryText = `*Dilkhoosh Plus - Daily Attendance Daily  & & Report Work Report*\n` +
      `📅 Date: ${formatEnglishDate(today)}\n` +
      `👥 *Attendance Summary:*\n` +
      `•  Staff: ${String(activeStaff.length)} persons\n` +
      `• Present: ${String(presentCount)} persons\n` +
      `• Late: ${String(lateCount)} persons\n` +
      `• Leave: ${String(leaveCount)} persons\n` +
      `• Absent: ${String(absentCount)} persons\n\n` +
      `📋 *Staff List:*\n` +
      activeStaff.map(st => {
        const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
        const stat = rec ? (rec.status === 'present' ? '✅ Present' : rec.status === 'late' ? '⏱️ Late' : rec.status === 'leave' ? '🏖️ Leave' : '❌ Absent') : '⚪ Unmarked';
        const time = rec?.checkInTime ? ` (${rec.checkInTime})` : '';
        return `• ${st.name} (${st.role}) - ${stat}${time}`;
      }).join('\n') +
      `\n\n_Dilkhoosh Plus Attendance System_`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-700/30 text-emerald-400 border border-emerald-500/40">
              <FileSpreadsheet className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Report, Export & Print Center
              </h3>
              <p className="text-xs text-gray-400">
                Export all attendance and task data of Dilkhoosh Plus
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Summary Box */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Date: <strong className="text-emerald-400">{formatEnglishDate(today)}</strong></span>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30">
                <span className="text-gray-300 block text-[10px]">Present</span>
                <span className="text-emerald-400 font-bold font-mono text-base">{String(presentCount)}</span>
              </div>
              <div className="bg-amber-950/60 p-2 rounded-xl border border-amber-500/30">
                <span className="text-gray-300 block text-[10px]">Late</span>
                <span className="text-amber-400 font-bold font-mono text-base">{String(lateCount)}</span>
              </div>
              <div className="bg-purple-950/60 p-2 rounded-xl border border-purple-500/30">
                <span className="text-gray-300 block text-[10px]">Leave</span>
                <span className="text-purple-400 font-bold font-mono text-base">{String(leaveCount)}</span>
              </div>
              <div className="bg-rose-950/60 p-2 rounded-xl border border-rose-500/30">
                <span className="text-gray-300 block text-[10px]">Absent</span>
                <span className="text-rose-400 font-bold font-mono text-base">{String(absentCount)}</span>
              </div>
            </div>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* 1. WhatsApp Summary Copy */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-4 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/50 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-700/30 text-emerald-400 border border-emerald-500/40 group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-xs font-semibold text-sky-400">
                  {copied ? 'Copied! ✅' : 'Click Here'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                WhatsApp Summary
              </h4>
              <p className="text-xs text-gray-400">
                Copy attendance summary in a nice format to send to groups.
              </p>
            </button>

            {/* 2. Print Sheet */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-4 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/50 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 group-hover:scale-110 transition-transform">
                  <Printer className="w-5 h-5 text-sky-300" />
                </div>
                <span className="text-xs font-semibold text-sky-400">Print</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Daily Attendance Sheet Print
              </h4>
              <p className="text-xs text-gray-400">
                Print today's entire staff attendance sheet or save as PDF.
              </p>
            </button>

            {/* 3. CSV Attendance */}
            <button
              type="button"
              onClick={handleExportAttendanceCSV}
              className="p-4 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/50 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-emerald-700/30 text-emerald-400 border border-emerald-500/40 group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-xs font-semibold text-emerald-400">CSV Excel</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Download Attendance CSV
              </h4>
              <p className="text-xs text-gray-400">
                Download attendance database to open in Excel.
              </p>
            </button>

            {/* 4. CSV Tasks */}
            <button
              type="button"
              onClick={handleExportTasksCSV}
              className="p-4 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/50 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-5 h-5 text-sky-300" />
                </div>
                <span className="text-xs font-semibold text-sky-400">CSV Tasks</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Tasks Report CSV
              </h4>
              <p className="text-xs text-gray-400">
                Save list of all tasks and status in Excel file.
              </p>
            </button>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
