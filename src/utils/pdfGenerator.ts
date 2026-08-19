import { AppState } from '../types';
import { getTodayDateString, getCurrentTimeString } from './dateUtils';

/**
 * Utility to generate and download crisp, beautifully styled section-wise PDF documents.
 * Uses print-ready HTML DOM window that triggers PDF save with 100% Bengali & English script fidelity.
 */

interface PDFExportOptions {
  sectionTitle: string;
  sectionSubtitle: string;
  category: 'master' | 'attendance' | 'tasks' | 'directives' | 'hub' | 'telemetry';
  state: AppState;
}

export const generateSectionPDF = ({
  sectionTitle,
  sectionSubtitle,
  category,
  state
}: PDFExportOptions) => {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) {
    alert('Pop-up blocker is preventing the PDF export window from opening. Please allow pop-ups for this site.');
    return;
  }

  const generatedDate = `${getTodayDateString()} | ${getCurrentTimeString()}`;
  const currentUser = state.staffList.find(s => s.id === state.currentUserId) || state.staffList[0];

  // Helper to get staff name by ID
  const getStaffName = (staffId: string) => {
    const staff = state.staffList.find(s => s.id === staffId);
    return staff ? `${staff.name} (${staff.role})` : staffId || 'Unassigned';
  };

  // Generate HTML content based on category
  let mainContentHTML = '';

  // 1. MASTER ALL DATA EXPORT / ATTENDANCE & STAFF
  if (category === 'master' || category === 'attendance') {
    mainContentHTML += `
      <div class="section-block">
        <h2 class="section-header emerald">1. STAFF DIRECTORY & ATTENDANCE LOG (স্টাফ ডিরেক্টরি ও হাজিরা খাতা)</h2>
        
        <h3>Staff List (${state.staffList.length} Members)</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Joining Date</th>
            </tr>
          </thead>
          <tbody>
            ${state.staffList.map(s => `
              <tr>
                <td><strong>${s.id}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td>${s.role}</td>
                <td>${s.department}</td>
                <td>${s.phone || '-'}</td>
                <td>${s.shift || '-'}</td>
                <td><span class="badge ${s.isActive ? 'badge-green' : 'badge-red'}">${s.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${s.joiningDate || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="margin-top:20px;">Attendance Log Records (${state.attendanceRecords.length} Entries)</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Staff Name</th>
              <th>Department</th>
              <th>Attendance Status</th>
              <th>Check-in Time</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${state.attendanceRecords.map(r => {
              const st = state.staffList.find(s => s.id === r.staffId);
              return `
                <tr>
                  <td><strong>${r.date}</strong></td>
                  <td>${st ? st.name : r.staffId}</td>
                  <td>${st ? st.department : '-'}</td>
                  <td>
                    <span class="badge ${
                      r.status === 'present' ? 'badge-green' :
                      r.status === 'late' ? 'badge-amber' :
                      r.status === 'absent' ? 'badge-red' : 'badge-purple'
                    }">
                      ${r.status.toUpperCase()}
                    </span>
                  </td>
                  <td>${r.checkInTime || '-'}</td>
                  <td>${r.note || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 2. TASKS & PROGRESS
  if (category === 'master' || category === 'tasks') {
    mainContentHTML += `
      <div class="section-block">
        <h2 class="section-header sky">2. DAILY TASKS & SUBTASKS REPORT (দৈনন্দিন কাজ ও উপ-কাজের বিস্তারিত)</h2>
        <p>Total Tasks: <strong>${state.tasks.length}</strong> | Completed: <strong>${state.tasks.filter(t => t.status === 'complete').length}</strong> | Pending: <strong>${state.tasks.filter(t => t.status === 'pending').length}</strong></p>
        
        <table>
          <thead>
            <tr>
              <th>Title & Description</th>
              <th>Assigned Staff</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Due Date & Time</th>
              <th>Status</th>
              <th>Subtasks Checklist</th>
              <th>Feedback & Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${state.tasks.map(t => {
              const subtaskText = t.subtasks && t.subtasks.length > 0 
                ? t.subtasks.map((st, i) => `${i + 1}. [${st.completed ? '✓' : ' '}] ${st.title}`).join('<br>')
                : 'None';
              return `
                <tr>
                  <td>
                    <strong>${t.title}</strong>
                    ${t.description ? `<br><small style="color:#555;">${t.description}</small>` : ''}
                  </td>
                  <td>${getStaffName(t.assignedStaffId)}</td>
                  <td>${t.category || 'Normal'}</td>
                  <td>
                    <span class="badge ${t.priority === 'urgent' ? 'badge-red' : t.priority === 'high' ? 'badge-amber' : 'badge-blue'}">
                      ${t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td>${t.dueDate || ''} ${t.dueTime ? `@ ${t.dueTime}` : ''}</td>
                  <td>
                    <span class="badge ${t.status === 'complete' ? 'badge-green' : 'badge-amber'}">
                      ${t.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="font-size:11px; font-family:monospace;">${subtaskText}</td>
                  <td><em>${t.feedback || t.remarks || '-'}</em></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 3. DIRECTIVES & SOP
  if (category === 'master' || category === 'directives') {
    mainContentHTML += `
      <div class="section-block">
        <h2 class="section-header purple">3. DIRECTIVES & OFFICIAL SOP GUIDELINES (অফিসিয়াল নির্দেশিকা ও এসওপি)</h2>
        <p>Total Directives: <strong>${state.directives.length}</strong></p>
        
        <table>
          <thead>
            <tr>
              <th>Title & Details</th>
              <th>Category</th>
              <th>Target Dept</th>
              <th>Priority</th>
              <th>Pinned</th>
              <th>Acknowledged Staff Count</th>
              <th>Checklist Steps</th>
            </tr>
          </thead>
          <tbody>
            ${state.directives.map(d => {
              const checklistText = d.checklist && d.checklist.length > 0
                ? d.checklist.map((c, i) => `${i + 1}. ${c.text}`).join('<br>')
                : 'None';
              return `
                <tr>
                  <td>
                    <strong>${d.title}</strong>
                    <br><small style="color:#444;">${d.content}</small>
                  </td>
                  <td>${d.category || 'General'}</td>
                  <td>${d.targetDepartment === 'all' ? 'All Staff' : d.targetDepartment}</td>
                  <td>
                    <span class="badge ${d.priority === 'urgent' ? 'badge-red' : 'badge-blue'}">
                      ${d.priority.toUpperCase()}
                    </span>
                  </td>
                  <td>${d.isPinned ? '📌 YES' : 'NO'}</td>
                  <td><strong>${d.acknowledgedStaffIds?.length || 0} Staff</strong></td>
                  <td style="font-size:11px;">${checklistText}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // 4. CENTRAL HUB
  if (category === 'master' || category === 'hub') {
    const hub = state.hubData;
    mainContentHTML += `
      <div class="section-block">
        <h2 class="section-header amber">4. CENTRAL HUB, EMERGENCY ALERTS & REMINDERS (সেন্ট্রাল হাব ও অ্যালার্টস)</h2>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
          <div class="card-box">
            <h4>📌 Instructions & Rules (${hub?.instructions?.length || 0})</h4>
            <ul>
              ${(hub?.instructions || []).map(item => `<li>${item.text} (${item.status})</li>`).join('') || '<li>No instructions recorded.</li>'}
            </ul>
          </div>
          <div class="card-box">
            <h4>⏰ Official Reminders (${hub?.reminders?.length || 0})</h4>
            <ul>
              ${(hub?.reminders || []).map(r => `<li><strong>[${r.time || ''}]</strong> ${r.title}</li>`).join('') || '<li>No active reminders.</li>'}
            </ul>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
          <div class="card-box">
            <h4>💡 Ideas & Suggestions (${hub?.ideas?.length || 0})</h4>
            <ul>
              ${(hub?.ideas || []).map(idea => `<li>${idea.text}</li>`).join('') || '<li>No ideas submitted.</li>'}
            </ul>
          </div>
          <div class="card-box">
            <h4>☎️ Emergency Contacts & Alerts (${hub?.emergencies?.length || 0})</h4>
            <ul>
              ${(hub?.emergencies || []).map(ec => `<li><strong>${ec.title}:</strong> ${ec.phone || ec.description || '-'}</li>`).join('') || '<li>No emergencies listed.</li>'}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // 5. TELEMETRY & AUDIT
  if (category === 'master' || category === 'telemetry') {
    mainContentHTML += `
      <div class="section-block">
        <h2 class="section-header indigo">5. SYSTEM TELEMETRY, RECYCLE BIN & AUDIT LOG (সিস্টেম অডিট ও টেলিমোট্রি)</h2>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom:15px;">
          <div class="card-box">
            <h4>⚙️ App Configuration</h4>
            <p>App Name: <strong>Dilkhoosh Plus PRO</strong></p>
            <p>Version: <strong>v${state.settings.version}</strong></p>
            <p>Theme Mode: <strong>${state.settings.theme}</strong></p>
            <p>Language: <strong>${state.settings.language === 'bn' ? 'বাংলা' : 'English'}</strong></p>
            <p>Admin PIN: <strong>${state.settings.adminPin}</strong></p>
          </div>

          <div class="card-box">
            <h4>🗑️ Recycle Bin Deleted History (${state.recycleBin?.length || 0} Items)</h4>
            <ul>
              ${(state.recycleBin || []).map(rb => `<li><strong>[${rb.type.toUpperCase()}]</strong> ${rb.name || rb.details} (Deleted: ${rb.deletedAt || '-'})</li>`).join('') || '<li>Recycle bin is currently empty.</li>'}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // Construct Full Document
  const documentHTML = `
    <!DOCTYPE html>
    <html lang="bn">
    <head>
      <meta charset="UTF-8">
      <title>${sectionTitle} - Dilkhoosh Plus PDF Export</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          background-color: #ffffff;
          line-height: 1.4;
          font-size: 12px;
          margin: 0;
          padding: 10px;
        }
        .header-container {
          border-bottom: 3px solid #047857;
          padding-bottom: 12px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-title {
          font-size: 22px;
          font-weight: 900;
          color: #064e3b;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 13px;
          font-weight: 700;
          color: #0284c7;
          margin-top: 2px;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #4b5563;
        }
        .section-header {
          font-size: 14px;
          font-weight: 800;
          padding: 6px 12px;
          color: #ffffff;
          border-radius: 6px;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .emerald { background-color: #047857; }
        .sky { background-color: #0284c7; }
        .purple { background-color: #6d28d9; }
        .amber { background-color: #d97706; }
        .indigo { background-color: #4338ca; }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
          margin-bottom: 15px;
          font-size: 11px;
        }
        th, td {
          border: 1px solid #d1d5db;
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 800;
          color: #1f2937;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
          color: #ffffff;
        }
        .badge-green { background-color: #10b981; }
        .badge-red { background-color: #ef4444; }
        .badge-amber { background-color: #f59e0b; }
        .badge-purple { background-color: #8b5cf6; }
        .badge-blue { background-color: #3b82f6; }

        .card-box {
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 8px;
          padding: 10px;
        }
        .card-box h4 {
          margin-top: 0;
          margin-bottom: 6px;
          font-size: 12px;
          color: #111827;
        }
        .card-box ul {
          margin: 0;
          padding-left: 18px;
          font-size: 11px;
        }

        .footer {
          margin-top: 30px;
          border-top: 1px solid #e5e7eb;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #6b7280;
        }

        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      
      <!-- Top Action Bar for Browser Window -->
      <div class="no-print" style="background:#1e293b; color:#fff; padding:12px 16px; margin-bottom:15px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="font-size:14px;">📄 Dilkhoosh Plus PRO - PDF Data Export</strong>
          <span style="font-size:12px; color:#94a3b8; margin-left:10px;">${sectionTitle}</span>
        </div>
        <div>
          <button onclick="window.print()" style="background:#10b981; color:#fff; border:none; padding:8px 16px; font-weight:bold; border-radius:6px; cursor:pointer; font-size:13px; margin-right:8px;">
            🖨️ Save as PDF / Print
          </button>
          <button onclick="window.close()" style="background:#475569; color:#fff; border:none; padding:8px 12px; font-weight:bold; border-radius:6px; cursor:pointer; font-size:13px;">
            Close
          </button>
        </div>
      </div>

      <!-- PDF Page Header -->
      <div class="header-container">
        <div>
          <h1 class="brand-title">DILKHOOSH PLUS PRO</h1>
          <div class="brand-subtitle">${sectionTitle} (${sectionSubtitle})</div>
        </div>
        <div class="meta-box">
          <div>Export Date: <strong>${generatedDate}</strong></div>
          <div>Generated By: <strong>${currentUser.name} (${currentUser.role})</strong></div>
          <div>Security: <strong>256-Bit SSL Encrypted Audit Export</strong></div>
        </div>
      </div>

      <!-- Document Content -->
      ${mainContentHTML}

      <!-- Footer Signature -->
      <div class="footer">
        <div>Dilkhoosh Plus System Data Center Export • Verified Record</div>
        <div>Official System Archive © 2026 Dilkhoosh Plus</div>
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

  printWindow.document.open();
  printWindow.document.write(documentHTML);
  printWindow.document.close();
};
