import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Share2, 
  Download, 
  Clock, 
  UserX, 
  UserCheck,
  CheckSquare,
  TrendingUp, 
  Search,
  Eye,
  FileText,
  X,
  Award,
  CheckCircle2
} from 'lucide-react';
import { AppState, AppTab, StaffMember } from '../types';
import { formatEnglishDate, toBengaliNumber, getDayNameEnglish, parseTimeStrToMinutes } from '../utils/dateUtils';
import { exportAllDataJSON } from '../utils/storage';
import { ViewBackButton } from './ViewBackButton';

interface ReportsViewProps {
  state: AppState;
  onOpenNewTask: () => void;
  onRestoreData: (jsonStr: string) => void;
  onNavigateTab?: (tab: AppTab) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  state,
  onOpenNewTask,
  onRestoreData,
  onNavigateTab
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [restoreText, setRestoreText] = useState('');
  const [showRestoreBox, setShowRestoreBox] = useState(false);
  const [selectedPerfStaff, setSelectedPerfStaff] = useState<StaffMember | null>(null);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(state.selectedDate.substring(0, 7)); // 'YYYY-MM'

  const today = state.selectedDate;

  // Print / Export PDF function for Staff Performance
  const handlePrintMonthlySummaryPDF = () => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      alert('Please allow popups in your browser to download/print PDF reports!');
      return;
    }

    const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const rowsHtml = activeStaff.map((st, index) => {
      // Tasks for this month
      const staffTasks = state.tasks.filter(t => 
        (t.assignedStaffId === st.id || t.assignedStaffId2 === st.id) && 
        (t.dueDate || '').startsWith(selectedMonth)
      );
      const completedTasks = staffTasks.filter(t => t.status === 'complete').length;

      // Attendance for this month
      const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id && r.date.startsWith(selectedMonth));
      const presentDays = staffAtt.filter(r => r.status === 'present').length;
      const lateDays = staffAtt.filter(r => r.status === 'late').length;
      const totalAttended = presentDays + lateDays;
      const totalAttRecords = staffAtt.length;
      const attendancePercentage = totalAttRecords > 0 ? Math.round((totalAttended / totalAttRecords) * 100) : 0;

      // Hours worked
      let totalMinutes = 0;
      staffAtt.forEach(r => {
        if (r.checkInTime && r.checkOutTime) {
          const inMins = parseTimeStrToMinutes(r.checkInTime);
          const outMins = parseTimeStrToMinutes(r.checkOutTime);
          if (outMins > inMins) {
            totalMinutes += (outMins - inMins);
          }
        }
      });
      const totalHours = (totalMinutes / 60).toFixed(1);

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">${index + 1}. ${st.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${st.role}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${completedTasks} / ${staffTasks.length}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #0284c7;">${totalAttended} / ${totalAttRecords} Days</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #16a34a;">${attendancePercentage}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #9333ea;">${totalHours} hrs</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dilkhoosh Plus - Monthly Summary - ${monthName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 25px; color: #0f172a; background: #ffffff; }
            .header { text-align: center; padding-bottom: 15px; border-bottom: 3px solid #0284c7; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #0369a1; }
            .header p { margin: 5px 0 0; font-size: 13px; color: #64748b; font-weight: 500; }
            .badge { display: inline-block; padding: 5px 12px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 10px; border: 1px solid #bae6fd; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0f172a; color: white; padding: 10px; font-size: 12px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
            th.center, td.center { text-align: center; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .print-btn-bar { margin-bottom: 20px; text-align: right; }
            .print-btn { padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            @media print {
              body { margin: 10mm; }
              .print-btn-bar { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar">
            <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Sheet</button>
          </div>
          <div class="header">
            <h1>Dilkhoosh Plus Pro</h1>
            <p>Monthly Staff Summary Report (মাসিক রিপোর্ট)</p>
            <div class="badge">Month: ${monthName} • Generated Time: ${new Date().toLocaleTimeString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Designation</th>
                <th class="center">Completed Tasks</th>
                <th class="center">Days Attended</th>
                <th class="center">Attendance Rate</th>
                <th class="center">Total Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Dilkhoosh Plus Pro Management System • Monthly Summary PDF
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Print / Export PDF function for Staff Performance
  const handlePrintPerformancePDF = (targetStaff?: StaffMember | null) => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Please allow popups in your browser to download/print PDF reports!');
      return;
    }

    const staffToPrint = targetStaff ? [targetStaff] : activeStaff;

    const rowsHtml = staffToPrint.map((st, index) => {
      const staffTasks = state.tasks.filter(t => t.assignedStaffId === st.id || t.assignedStaffId2 === st.id);
      const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
      const taskRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;

      const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id);
      const presentDays = staffAtt.filter(r => r.status === 'present').length;
      const totalAtt = staffAtt.length;
      const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;
      const ackDirectives = state.directives.filter(d => d.acknowledgedStaffIds?.includes(st.id)).length;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; font-size: 13px;">${index + 1}. ${st.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${st.role} (${st.department || 'Dilkhoosh'})</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold;">${completedTasks} / ${staffTasks.length} (${taskRate}%)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #0284c7;">${presentDays} / ${totalAtt} Days</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #16a34a;">${punctualityRate}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #9333ea;">${ackDirectives}</td>
        </tr>
      `;
    }).join('');

    const titleText = targetStaff ? `Individual Performance Sheet - ${targetStaff.name}` : `Full Staff Performance Report`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dilkhoosh Plus - ${titleText}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 25px; color: #0f172a; background: #ffffff; }
            .header { text-align: center; padding-bottom: 15px; border-bottom: 3px solid #0284c7; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #0369a1; }
            .header p { margin: 5px 0 0; font-size: 13px; color: #64748b; font-weight: 500; }
            .badge { display: inline-block; padding: 5px 12px; background: #e0f2fe; color: #0369a1; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 10px; border: 1px solid #bae6fd; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #0f172a; color: white; padding: 10px; font-size: 12px; text-align: left; text-transform: uppercase; letter-spacing: 0.5px; }
            th.center, td.center { text-align: center; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .print-btn-bar { margin-bottom: 20px; text-align: right; }
            .print-btn { padding: 10px 20px; background: #0284c7; color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            @media print {
              body { margin: 10mm; }
              .print-btn-bar { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar">
            <button class="print-btn" onclick="window.print()">🖨️ Save as PDF / Print Sheet</button>
          </div>
          <div class="header">
            <h1>Dilkhoosh Plus Pro</h1>
            <p>Individual Staff Performance Report (কর্মীদের পারফরম্যান্স রিপোর্ট)</p>
            <div class="badge">Date: ${formatEnglishDate(today)} • Generated Time: ${new Date().toLocaleTimeString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Designation</th>
                <th class="center">Completed Tasks</th>
                <th class="center">On-Time Checkins</th>
                <th class="center">Punctuality Rate</th>
                <th class="center">Directives Ack</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            Dilkhoosh Plus Pro Management System • Verified Official Performance Report
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

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
  const unmarkedCount = Math.max(0, activeStaff.length - todayRecords.length);

  const attendanceRate = activeStaff.length > 0 
    ? Math.round(((presentCount + lateCount) / activeStaff.length) * 100) 
    : 0;

  // Task stats
  const activeTasksCount = state.tasks.filter(t => t.status !== 'complete').length;
  const completedTasksCount = state.tasks.filter(t => t.status === 'complete').length;

  // Filtered staff list for the table
  const filteredStaff = activeStaff.filter(st => {
    const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'unmarked') return !rec;
    return rec?.status === selectedStatusFilter;
  });

  // Export Attendance CSV
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

  // Export Staff Performance CSV
  const handleExportPerformanceCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Staff Name,Role,Department,Completed Tasks,Total Tasks,Task Completion Rate (%),On-Time Checkins,Late Checkins,Total Attendance Days,Punctuality Rate (%),Acknowledged Directives\r\n';

    activeStaff.forEach(st => {
      const staffTasks = state.tasks.filter(t => t.assignedStaffId === st.id || t.assignedStaffId2 === st.id);
      const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
      const taskCompletionRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;
      
      const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id);
      const presentDays = staffAtt.filter(r => r.status === 'present').length;
      const lateDays = staffAtt.filter(r => r.status === 'late').length;
      const totalAtt = staffAtt.length;
      const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;
      
      const ackDirectives = state.directives.filter(d => d.acknowledgedStaffIds?.includes(st.id)).length;

      csvContent += `"${st.name}","${st.role}","${st.department}","${completedTasks}","${staffTasks.length}","${taskCompletionRate}%","${presentDays}","${lateDays}","${totalAtt}","${punctualityRate}%","${ackDirectives}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dilkhoosh_staff_performance_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy WhatsApp summary
  const handleCopySummary = () => {
    const summaryText = `*Dilkhoosh Plus - Daily Report*\n` +
      `📅 Date: ${formatEnglishDate(today)} (${getDayNameEnglish(today)})\n` +
      `📊 Attendance Rate: ${String(attendanceRate)}%\n\n` +
      `👥 *Attendance Summary:*\n` +
      `• Total Staff: ${String(activeStaff.length)} persons\n` +
      `• Present: ${String(presentCount)} persons\n` +
      `• Late: ${String(lateCount)} persons\n` +
      `• Leave: ${String(leaveCount)} persons\n` +
      `• Absent: ${String(absentCount)} persons\n` +
      `• Unmarked: ${String(unmarkedCount)} persons\n\n` +
      `📋 *Staff Attendance Details:*\n` +
      activeStaff.map((st, idx) => {
        const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
        const stat = rec ? (rec.status === 'present' ? '✅ Present' : rec.status === 'late' ? '⏱️ Late' : rec.status === 'leave' ? '🏖️ Leave' : '❌ Absent') : '⚪ Unmarked';
        const time = rec?.checkInTime ? ` (${rec.checkInTime})` : '';
        return `${idx + 1}. ${st.name} - ${stat}${time}`;
      }).join('\n') +
      `\n\n_Generated via Dilkhoosh Plus Pro_`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="space-y-3 sm:space-y-4 pb-20 md:pb-6 w-full max-w-full overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Navigation Back Bar */}
      <ViewBackButton
        onBack={() => onNavigateTab ? onNavigateTab('home') : undefined}
        title={state.settings.language === 'bn' ? 'ডেইলি রিপোর্ট ও এক্সপোর্ট সেন্টার' : 'Daily Report & Export Center'}
        badge="Analytics & Reports"
        badgeColor="sky"
        isBn={state.settings.language === 'bn'}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gray-900 border border-emerald-900/50 p-3 sm:p-4 rounded-xl shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-emerald-700/30 text-emerald-400 border border-emerald-500/40 shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Daily Report & Export
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40">
                {formatEnglishDate(today)}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-gray-300 truncate">
              Analysis, Excel CSV export, WhatsApp summary & print
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm border border-emerald-500/40 flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-300" />
            <span>{copied ? 'Copied! ✅' : 'WhatsApp Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-950 hover:bg-gray-850 text-sky-300 border border-sky-400/40 text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 w-full">
        {/* Card 1: Present */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gray-900 border border-emerald-500/30 space-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold">
            <span>Present</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(presentCount)}
          </p>
          <p className="text-[10px] text-emerald-400 font-medium">
            On-time entries
          </p>
        </div>

        {/* Card 2: Late */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gray-900 border border-amber-500/30 space-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold">
            <span>Late</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(lateCount)}
          </p>
          <p className="text-[10px] text-amber-400 font-medium">
            Delayed entries
          </p>
        </div>

        {/* Card 3: Leave / Absent */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gray-900 border border-rose-500/30 space-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold">
            <span>Leave / Absent</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(leaveCount + absentCount)}
          </p>
          <p className="text-[10px] text-rose-400 font-medium truncate">
            Leave: {String(leaveCount)} | Absent: {String(absentCount)}
          </p>
        </div>

        {/* Card 4: Tasks Overview */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-gray-900 border border-sky-500/30 space-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold">
            <span>Tasks</span>
            <CheckSquare className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(activeTasksCount)}
          </p>
          <p className="text-[10px] text-sky-400 font-medium">
            Active • Done: {String(completedTasksCount)}
          </p>
        </div>

        {/* Card 5: Attendance Rate */}
        <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-xl bg-gray-900 border border-emerald-500/40 space-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-bold">
            <span>Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {String(attendanceRate)}%
          </p>
          <p className="text-[10px] text-gray-300 font-medium">
            Present: {String(presentCount + lateCount)}/{String(activeStaff.length)}
          </p>
        </div>
      </div>

      {/* Quick Export Downloads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full">
        <button
          type="button"
          onClick={handleExportAttendanceCSV}
          className="p-2.5 sm:p-3 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/50 text-left flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-700/30 text-emerald-400 border border-emerald-500/40 group-hover:scale-105 transition-transform shrink-0">
              <Download className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                Attendance CSV
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                Daily attendance sheet
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950 rounded-md border border-emerald-500/30 shrink-0 ml-2">
            CSV
          </span>
        </button>

        <button
          type="button"
          onClick={handleExportTasksCSV}
          className="p-2.5 sm:p-3 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/50 text-left flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 group-hover:scale-105 transition-transform shrink-0">
              <FileSpreadsheet className="w-4 h-4 text-sky-300" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                Tasks & To-Do List
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                Full tasks list & status
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-sky-400 px-2 py-0.5 bg-sky-950 rounded-md border border-sky-500/30 shrink-0 ml-2">
            CSV
          </span>
        </button>

        <button
          type="button"
          onClick={handleExportPerformanceCSV}
          className="p-2.5 sm:p-3 rounded-xl bg-gray-900 hover:bg-gray-850 border border-gray-800 hover:border-purple-500/50 text-left flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40 group-hover:scale-105 transition-transform shrink-0">
              <TrendingUp className="w-4 h-4 text-purple-300" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                Staff Performance Metrics
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                Individual task & punctuality CSV
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-purple-300 px-2 py-0.5 bg-purple-950 rounded-md border border-purple-500/30 shrink-0 ml-2">
            CSV
          </span>
        </button>
      </div>

      {/* Monthly Summary PDF Generator */}
      <div className="bg-gray-900 border border-fuchsia-900/50 rounded-xl p-3.5 sm:p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Monthly Summary Report
            </h3>
            <p className="text-[11px] text-gray-400">
              Generate a PDF summary of total hours, attendance & tasks for a selected month
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-950 text-white text-xs rounded-lg px-2 py-1.5 border border-gray-800 focus:outline-none focus:border-fuchsia-400 font-mono"
          />
          <button
            type="button"
            onClick={() => setShowMonthlyView(true)}
            className="px-3 py-1.5 rounded-lg bg-sky-900/50 hover:bg-sky-800/80 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-sky-300" />
            <span>View</span>
          </button>
          <button
            type="button"
            onClick={handlePrintMonthlySummaryPDF}
            className="px-3 py-1.5 rounded-lg bg-fuchsia-900/50 hover:bg-fuchsia-800/80 text-fuchsia-200 border border-fuchsia-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      {/* Individual Staff Performance Metrics Section */}
      <div className="bg-gray-900 border border-indigo-900/50 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Individual Staff Performance Summary (কর্মীদের পারফরম্যান্স রিপোর্ট)
              </h3>
              <p className="text-[11px] text-gray-400">
                Completed tasks, task completion rates & punctuality metrics for every staff member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handlePrintPerformancePDF(null)}
              className="px-3 py-1.5 rounded-lg bg-sky-900/60 hover:bg-sky-800/80 text-sky-200 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-300" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportPerformanceCSV}
              className="px-3 py-1.5 rounded-lg bg-indigo-900/50 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Mobile View: Performance Cards */}
        <div className="space-y-2 sm:hidden">
          {activeStaff.map(st => {
            const staffTasks = state.tasks.filter(t => t.assignedStaffId === st.id || t.assignedStaffId2 === st.id);
            const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
            const taskRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;

            const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id);
            const presentDays = staffAtt.filter(r => r.status === 'present').length;
            const totalAtt = staffAtt.length;
            const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;

            return (
              <div key={st.id} className="bg-gray-950/90 border border-gray-800/80 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0 ${st.avatarColor || 'bg-emerald-600'}`}>
                      {st.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{st.name}</h4>
                      <p className="text-[10px] text-gray-400 truncate">{st.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPerfStaff(st)}
                      className="p-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="View individual performance sheet & PDF"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-300" />
                      <span>View</span>
                    </button>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      punctualityRate >= 80 && taskRate >= 70
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : punctualityRate >= 60
                          ? 'bg-sky-950 text-sky-300 border-sky-500/40'
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                    }`}>
                      {punctualityRate >= 80 && taskRate >= 70 ? '🌟 High' : '🟢 Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-900">
                  <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-800/60 space-y-0.5">
                    <span className="text-[10px] text-gray-400 block font-medium">Completed Tasks</span>
                    <span className="font-bold text-white">{completedTasks} / {staffTasks.length}</span>
                    <span className="text-[10px] text-emerald-400 block font-semibold">{taskRate}% Done</span>
                  </div>

                  <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-800/60 space-y-0.5">
                    <span className="text-[10px] text-gray-400 block font-medium">Punctuality Rate</span>
                    <span className="font-bold text-white">{presentDays} / {totalAtt} Days</span>
                    <span className="text-[10px] text-sky-400 block font-semibold">{punctualityRate}% On-Time</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View: Full Width Clean Metrics Table */}
        <div className="hidden sm:block overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-300 border-b border-gray-800 font-bold">
              <tr>
                <th className="py-2.5 px-3">Staff Member</th>
                <th className="py-2.5 px-3">Designation</th>
                <th className="py-2.5 px-3 text-center">Completed Tasks</th>
                <th className="py-2.5 px-3 text-center">Task Completion Rate</th>
                <th className="py-2.5 px-3 text-center">On-Time Checkins</th>
                <th className="py-2.5 px-3 text-center">Punctuality Rate</th>
                <th className="py-2.5 px-3 text-center">Directives Ack</th>
                <th className="py-2.5 px-3 text-center">View / PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {activeStaff.map(st => {
                const staffTasks = state.tasks.filter(t => t.assignedStaffId === st.id || t.assignedStaffId2 === st.id);
                const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
                const taskRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;

                const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id);
                const presentDays = staffAtt.filter(r => r.status === 'present').length;
                const totalAtt = staffAtt.length;
                const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;
                const ackDirectives = state.directives.filter(d => d.acknowledgedStaffIds?.includes(st.id)).length;

                return (
                  <tr key={st.id} className="hover:bg-gray-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${st.avatarColor || 'bg-emerald-600'}`}>
                          {st.name.slice(0, 1)}
                        </div>
                        <span>{st.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-300">{st.role}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-white">
                      {completedTasks} <span className="text-gray-500 font-normal">/ {staffTasks.length}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-gray-950 rounded-full h-1.5 overflow-hidden border border-gray-800">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${taskRate}%` }}></div>
                        </div>
                        <span className="font-bold text-emerald-400 font-mono text-[11px]">{taskRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-300">
                      {presentDays} <span className="text-gray-500 font-normal">/ {totalAtt} Days</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-[11px] font-mono ${
                        punctualityRate >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        punctualityRate >= 60 ? 'bg-sky-950 text-sky-300 border border-sky-500/30' :
                        'bg-amber-950 text-amber-300 border border-amber-500/30'
                      }`}>
                        {punctualityRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-purple-300 font-bold">
                      {ackDirectives}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPerfStaff(st)}
                        className="p-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                        title="View Individual Performance Sheet"
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

      {/* Attendance Detail Section (Responsive, Zero Horizontal Dragging) */}
      <div className="bg-gray-900 border border-emerald-900/40 rounded-xl overflow-hidden shadow-sm space-y-2.5 p-3 w-full max-w-full">
        
        {/* Table Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search staff, role, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-950 text-white text-xs rounded-xl pl-8.5 pr-3 py-1.5 border border-gray-800 focus:outline-none focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] pb-0.5">
            {['all', 'present', 'late', 'leave', 'absent', 'unmarked'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedStatusFilter === status
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {status === 'all' ? 'All' : status === 'present' ? 'Present' : status === 'late' ? 'Late' : status === 'leave' ? 'Leave' : status === 'absent' ? 'Absent' : 'Unmarked'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile View: Compact Full-Width Cards (No Horizontal Drag Required) */}
        <div className="space-y-1.5 sm:hidden w-full">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((st) => {
              const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
              return (
                <div 
                  key={st.id} 
                  className="bg-gray-950/80 border border-gray-800/80 rounded-xl p-2.5 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 ${st.avatarColor || 'bg-emerald-600'}`}>
                        {st.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate leading-tight">
                          {st.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate">
                          {st.role} • <span className="text-sky-400">{st.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {rec ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          rec.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          rec.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          rec.status === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {rec.status === 'present' ? 'Present' : rec.status === 'late' ? 'Late' : rec.status === 'leave' ? 'Leave' : 'Absent'}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[10px] px-2 py-0.5 rounded-md bg-gray-900 border border-gray-800">
                          Unmarked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Meta: Check-in and Note */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-gray-900 text-gray-400">
                    <div className="flex items-center gap-1 font-mono text-sky-300">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>In: {rec?.checkInTime || '-'}</span>
                      {rec?.checkOutTime && <span>• Out: {rec.checkOutTime}</span>}
                    </div>

                    {rec?.note && (
                      <span className="text-gray-300 truncate max-w-[140px] italic">
                        "{rec.note}"
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-gray-400 text-xs">
              No staff records match filter
            </div>
          )}
        </div>

        {/* Desktop View: Full Width Clean Table */}
        <div className="hidden sm:block w-full overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950 text-gray-300 border-b border-gray-800 font-bold">
              <tr>
                <th className="py-2 px-3">Staff Name</th>
                <th className="py-2 px-3">Designation & Department</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Check-In</th>
                <th className="py-2 px-3">Comment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((st) => {
                  const rec = state.attendanceRecords.find(r => r.staffId === st.id && r.date === today);
                  return (
                    <tr key={st.id} className="hover:bg-gray-850/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] text-white font-bold ${st.avatarColor || 'bg-emerald-600'}`}>
                            {st.name.slice(0, 1)}
                          </div>
                          <span>{st.name}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-300">
                        {st.role} • <span className="text-sky-400">{st.department}</span>
                      </td>
                      <td className="py-2 px-3">
                        {rec ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            rec.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            rec.status === 'leave' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                            'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {rec.status === 'present' ? 'Present' : rec.status === 'late' ? 'Late' : rec.status === 'leave' ? 'Leave' : 'Absent'}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Unmarked</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-sky-300 text-xs">
                        {rec?.checkInTime || '-'}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-400">
                        {rec?.note || '-'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400 text-xs">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Individual Staff Performance Modal */}
      {selectedPerfStaff && (() => {
        const staffTasks = state.tasks.filter(t => t.assignedStaffId === selectedPerfStaff.id || t.assignedStaffId2 === selectedPerfStaff.id);
        const completedTasks = staffTasks.filter(t => t.status === 'complete').length;
        const taskRate = staffTasks.length > 0 ? Math.round((completedTasks / staffTasks.length) * 100) : 100;

        const staffAtt = state.attendanceRecords.filter(r => r.staffId === selectedPerfStaff.id);
        const presentDays = staffAtt.filter(r => r.status === 'present').length;
        const totalAtt = staffAtt.length;
        const punctualityRate = totalAtt > 0 ? Math.round((presentDays / totalAtt) * 100) : 100;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-900 border border-sky-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 space-y-4 p-4 sm:p-5">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  {selectedPerfStaff.googlePhotoUrl ? (
                    <img
                      src={selectedPerfStaff.googlePhotoUrl}
                      alt={selectedPerfStaff.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-sky-400 shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${selectedPerfStaff.avatarColor || 'bg-emerald-600'}`}>
                      {selectedPerfStaff.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <span>{selectedPerfStaff.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                        ID: {selectedPerfStaff.id.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-xs text-sky-300 font-medium">{selectedPerfStaff.role} • {selectedPerfStaff.department || 'Dilkhoosh Staff'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Joined: {formatEnglishDate(selectedPerfStaff.joiningDate)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPerfStaff(null)}
                  className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Performance Metrics Breakdown Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>Task Completion</span>
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-mono font-bold text-white">
                    {completedTasks} / {staffTasks.length}
                  </p>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${taskRate}%` }}></div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold block">{taskRate}% Completion Rate</span>
                </div>

                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-bold">
                    <span>Punctuality Rate</span>
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  </div>
                  <p className="text-xl font-mono font-bold text-sky-300">
                    {presentDays} / {totalAtt} Days
                  </p>
                  <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden border border-gray-800">
                    <div className="bg-sky-400 h-full rounded-full" style={{ width: `${punctualityRate}%` }}></div>
                  </div>
                  <span className="text-[10px] text-sky-400 font-bold block">{punctualityRate}% On-Time</span>
                </div>
              </div>

              {/* Tasks Summary List */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Assigned Tasks Overview ({staffTasks.length})</span>
                  <span className="text-[10px] text-gray-400 font-normal">Recent Tasks</span>
                </h4>
                {staffTasks.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic py-1">No tasks assigned yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
                    {staffTasks.slice(0, 5).map(t => (
                      <div key={t.id} className="flex items-center justify-between text-[11px] bg-gray-900 p-2 rounded-lg border border-gray-800">
                        <span className="text-gray-200 font-medium truncate max-w-[200px]">{t.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'complete' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          t.status === 'in_progress' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {t.status === 'complete' ? 'Done ✓' : t.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => handlePrintPerformancePDF(selectedPerfStaff)}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Download / Print PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPerfStaff(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Monthly Summary View Modal */}
      {showMonthlyView && (() => {
        const monthName = new Date(`${selectedMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gray-900 border border-fuchsia-500/40 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 space-y-4 p-4 sm:p-5">
              
              <div className="flex items-start justify-between gap-3 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/20 flex items-center justify-center border border-fuchsia-500/40 shrink-0">
                    <FileText className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Monthly Summary: {monthName}
                    </h2>
                    <p className="text-xs text-gray-400">Total Hours, Attendance & Completed Tasks</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMonthlyView(false)}
                  className="p-2 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-x-auto no-scrollbar max-h-[60vh] border border-gray-800 rounded-xl bg-gray-950">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 font-bold">Staff Member</th>
                      <th className="p-3 font-bold text-center">Completed Tasks</th>
                      <th className="p-3 font-bold text-center">Days Attended</th>
                      <th className="p-3 font-bold text-center">Attendance Rate</th>
                      <th className="p-3 font-bold text-center">Total Hours Worked</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-300">
                    {activeStaff.map(st => {
                      // Tasks for this month
                      const staffTasks = state.tasks.filter(t => 
                        (t.assignedStaffId === st.id || t.assignedStaffId2 === st.id) && 
                        (t.dueDate || '').startsWith(selectedMonth)
                      );
                      const completedTasks = staffTasks.filter(t => t.status === 'complete').length;

                      // Attendance for this month
                      const staffAtt = state.attendanceRecords.filter(r => r.staffId === st.id && r.date.startsWith(selectedMonth));
                      const presentDays = staffAtt.filter(r => r.status === 'present').length;
                      const lateDays = staffAtt.filter(r => r.status === 'late').length;
                      const totalAttended = presentDays + lateDays;
                      const totalAttRecords = staffAtt.length;
                      const attendancePercentage = totalAttRecords > 0 ? Math.round((totalAttended / totalAttRecords) * 100) : 0;

                      // Hours worked
                      let totalMinutes = 0;
                      staffAtt.forEach(r => {
                        if (r.checkInTime && r.checkOutTime) {
                          const inMins = parseTimeStrToMinutes(r.checkInTime);
                          const outMins = parseTimeStrToMinutes(r.checkOutTime);
                          if (outMins > inMins) {
                            totalMinutes += (outMins - inMins);
                          }
                        }
                      });
                      const totalHours = (totalMinutes / 60).toFixed(1);

                      return (
                        <tr key={st.id} className="hover:bg-gray-900/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0 ${st.avatarColor || 'bg-emerald-600'}`}>
                                {st.name.slice(0, 1)}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{st.name}</p>
                                <p className="text-[10px] text-gray-500">{st.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center font-bold text-sky-400">
                            {completedTasks} / {staffTasks.length}
                          </td>
                          <td className="p-3 text-center font-bold text-fuchsia-400">
                            {totalAttended} / {totalAttRecords}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-400">
                            {attendancePercentage}%
                          </td>
                          <td className="p-3 text-center font-bold text-amber-400">
                            {totalHours} hrs
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={handlePrintMonthlySummaryPDF}
                  className="px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Download / Print PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMonthlyView(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
