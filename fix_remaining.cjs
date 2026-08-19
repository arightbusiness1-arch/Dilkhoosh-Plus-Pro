const fs = require('fs');
const path = require('path');

const replacements = {
  "Staff Attendance Staff Attendance ও সময় লগ Time Log": "Staff Attendance & Time Log",
  "Post New Directives নতুন Directives & SOP Guidelines পোস্ট SOP Guidelines": "Post New Directives & SOP Guidelines",
  "Cash ক্যাশ ও হিসাব Accounts": "Cash & Accounts",
  "Cleaning ক্লিনিং ও হাইজিন Hygiene": "Cleaning & Hygiene",
  "Notifications Notifications ও রিমাইন্ডার সেন্টার Reminder Center": "Notifications & Reminder Center",
  "s Tasks, Punctual Attendance আজকের কাজ, সময়মতো হাজিরা ও Urgent Directives Urgent Directives": "Today's Tasks, Punctual Attendance & Urgent Directives",
  "Punctual Attendance Reminder ও Status": "Punctual Attendance Reminder & Status",
  "⚠️ স্বীকৃতি প্রয়োpersons": "⚠️ Acknowledgement Required",
  "কোনো Urgent Directives পোস্ট করা হয়নি": "No Urgent Directives Posted",
  "Report, Export Report, এক্সপোর্ট ও Print সেন্টার Print Center": "Report, Export & Print Center",
  "Data Backup ডাটা ব্যাকআপ ও রিস্টোর (Netlify / GitHub Safe) Restore (Netlify / GitHub Safe)": "Data Backup & Restore (Netlify / GitHub Safe)",
  "আপনার সমস্ত ডাটা ব্রাউজারের লোকাল স্টোরেজে সুরক্ষিত আছে। অন্য ডিভাইসে নিতে JSON Backup ডাউনলোড করুন অথবা রিস্টোর করুন।": "All your data is secure in the browser local storage. Download JSON backup to take it to another device or restore.",
  "JSON Backup কোড এখানে পেস্ট করুন...": "Paste JSON backup code here...",
  "Daily Report দৈনিক Report & Export Export": "Daily Report & Export",
  "Attendance analysis, Excel CSV export, WhatsApp summary হাজিরা বিশ্লেষণ, এক্সেল CSV এক্সপোর্ট, হোয়াটসঅ্যাপ সারসংক্ষেপ ও প্রিন্ট print": "Attendance analysis, Excel CSV export, WhatsApp summary & print",
  "Tasks Tasks ও কাজের তালিকা (CSV) Work List (CSV)": "Tasks & Work List (CSV)",
  "Export full tasks list, priority সম্পূর্ণ Tasks লিস্ট, Priority ও Status এক্সপোর্ট status": "Export full tasks list, priority & status",
  "Designation পদবী ও বিভাগ Department": "Designation & Department",
  "System Data Backup সিস্টেম ডাটা ব্যাকআপ ও রিস্টোর Restore": "System Data Backup & Restore",
  "আপনার সমস্ত রেকর্ড ব্রাউজারের লোকাল স্টোরেজে সুরক্ষিত আছে। অন্য ডিভাইসে নিতে JSON Backup ডাউনলোড করুন অথবা রিস্টোর করুন।": "All your records are safe in local storage. Download JSON backup or restore on another device.",
  "DND, Silent DND, Silent ও Vibration Notification Mode Vibration Notification Mode": "DND, Silent & Vibration Notification Mode",
  "Header Notifications bell হেডার Notifications বেল ও অ্যালার্ট মডাল alert modal": "Header Notifications bell & alert modal",
  "Staff Attendance log Staff Attendance খাতা ও চেক-ইন check-in": "Staff Attendance log & check-in",
  "Task assignment Tasks অ্যাসাইনMayন্ট ও সাব-Tasks Checklist sub-task checklist": "Task assignment & sub-task checklist",
  "\\+1.0 আপডেট": "+1.0 Update",
  "List of Officers কর্মকর্তা ও কর্মচারীদের তালিকা Employees": "List of Officers & Employees",
  "Staff Profile Staff প্রোফাইল ও দায়িত্ববন্টন Responsibilities": "Staff Profile & Responsibilities",
  "ও": "&",
  "হিসাব": "Accounts",
  "ক্লিনিং": "Cleaning",
  "হাইজিন": "Hygiene",
  "রিমাইন্ডার সেন্টার": "Reminder Center",
  "আজকের কাজ": "Today's Tasks",
  "সময়মতো হাজিরা": "Punctual Attendance",
  "স্বীকৃতি প্রয়োpersons": "Acknowledgement Required",
  "কোনো": "No",
  "পোস্ট করা হয়নি": "Posted",
  "এক্সপোর্ট": "Export",
  "সেন্টার": "Center",
  "ডাটা ব্যাকআপ": "Data Backup",
  "রিস্টোর": "Restore",
  "আপনার সমস্ত ডাটা ব্রাউজারের লোকাল স্টোরেজে সুরক্ষিত আছে। অন্য ডিভাইসে নিতে JSON Backup ডাউনলোড করুন অথবা রিস্টোর করুন।": "All your data is secure in the browser local storage. Download JSON backup to take it to another device or restore.",
  "কোড এখানে পেস্ট করুন...": "code here...",
  "দৈনিক": "Daily",
  "হাজিরা বিশ্লেষণ": "Attendance analysis",
  "এক্সেল CSV এক্সপোর্ট": "Excel CSV export",
  "হোয়াটসঅ্যাপ সারসংক্ষেপ": "WhatsApp summary",
  "প্রিন্ট": "print",
  "কাজের তালিকা": "Work List",
  "সম্পূর্ণ": "Full",
  "লিস্ট": "list",
  "পদবী": "Designation",
  "বিভাগ": "Department",
  "সিস্টেম ডাটা ব্যাকআপ": "System Data Backup",
  "আপনার সমস্ত রেকর্ড ব্রাউজারের লোকাল স্টোরেজে সুরক্ষিত আছে। অন্য ডিভাইসে নিতে JSON Backup ডাউনলোড করুন অথবা রিস্টোর করুন।": "All your records are safe in local storage. Download JSON backup or restore on another device.",
  "হেডার": "Header",
  "বেল": "bell",
  "অ্যালার্ট মডাল": "alert modal",
  "খাতা": "log",
  "চেক-ইন": "check-in",
  "অ্যাসাইনMayন্ট": "assignment",
  "সাব-Tasks Checklist": "sub-task checklist",
  "আপডেট": "Update",
  "কর্মকর্তা": "Officers",
  "কর্মচারীদের তালিকা": "Employees",
  "প্রোফাইল": "Profile",
  "দায়িত্ববন্টন": "Responsibilities",
  "নতুন": "New",
  "পোস্ট": "Post",
  "ক্যাশ": "Cash",
  "Tasks": "Tasks",
  "স্ট্যাটাস": "Status"
};

function fixAll(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [bn, en] of Object.entries(replacements)) {
    content = content.replace(new RegExp(bn, 'g'), en);
  }
  // catch-all to remove stray Bengali chars
  content = content.replace(/[\u0980-\u09FF]/g, '');
  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      fixAll(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
