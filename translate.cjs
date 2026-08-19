const fs = require('fs');
const path = require('path');

function replaceBengali(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Common replacements
  const dict = {
    'দিলখুশ প্লাস': 'Dilkhoosh Plus',
    'দ\\+': 'D+',
    'স্টাফ হাজিরা': 'Staff Attendance',
    'কাজের নির্দেশনা ও টাস্ক': 'Directives & Tasks',
    'সব শাখা \\(All Branches\\)': 'All Branches',
    'অ্যাডমিন': 'Admin',
    'ম্যানেজার': 'Manager',
    'স্টাফ': 'Staff',
    'রিপোর্ট ও প্রিন্ট': 'Reports & Print',
    'নোটিফিকেশন ও অ্যালার্ট': 'Notifications & Alerts',
    'হোম': 'Home',
    'টাস্ক': 'Tasks',
    'রিপোর্ট': 'Report',
    'মেনু': 'Menu',
    'জরুরি': 'Urgent',
    'আজকের ড্যাশবোর্ড ওভারভিউ': 'Today\'s Dashboard Overview',
    'হাজিরা সারসংক্ষেপ': 'Attendance Summary',
    'রিয়েল-টাইম পরিসংখ্যান': 'Real-time Stats',
    'স্টাফ চেক-ইন ও হাজিরা স্ট্যাটাস': 'Staff Check-in & Attendance Status',
    'হাজিরা দিন': 'Mark Attendance',
    'চেক-ইন করুন': 'Check In',
    'উপস্থিত': 'Present',
    'বিলম্বে': 'Late',
    'ছুটিতে': 'Leave',
    'অনুপস্থিত': 'Absent',
    'অ্যাক্টিভ টাস্ক ও অ্যাসাইনমেন্ট': 'Active Tasks & Assignments',
    'নতুন টাস্ক দিন': 'Assign New Task',
    'সাব-টাস্ক': 'Sub-tasks',
    'সম্পন্ন': 'Completed',
    'বাকি': 'Pending',
    'স্ট্যাটাস পরিবর্তন': 'Change Status',
    'জরুরি কাজের নির্দেশনা': 'Urgent Directives',
    'নতুন নির্দেশনা দিন': 'New Directive',
    'আমি বুঝেছি': 'I Understand',
    'চেকলিস্ট': 'Checklist',
    'হোয়াটসঅ্যাপে শেয়ার': 'Share via WhatsApp',
    'কপি করা হয়েছে': 'Copied',
    'মোট স্টাফ': 'Total Staff',
    'উপস্থিতি হার': 'Attendance Rate',
    'মোট টাস্ক': 'Total Tasks',
    'চলমান/বাকি': 'Ongoing/Pending',
    'রিপোর্ট ও এক্সপোর্ট': 'Reports & Export',
    'স্টাফ ডিরেক্টরি': 'Staff Directory',
    'সেটিংস': 'Settings',
    'অ্যাপ সেটিংস': 'App Settings',
    'ভাষা নির্বাচন': 'Language Selection',
    'থিম নির্বাচন': 'Theme Selection',
    'নোটিফিকেশন মোড': 'Notification Mode',
    'ভার্সন ট্র্যাকার': 'Version Tracker',
    'সেটিংস সেভ ও বন্ধ': 'Save & Close',
    'ফুল সেটিংস স্যুট ও কাস্টমাইজেশন': 'Full Settings Suite & Customization',
    'ডার্ক ও লাইট থিম মোড সুইচিং': 'Dark & Light theme switching',
    'বাংলা ও ইংরেজি ভাষা সাপোর্ট': 'Bangla & English language support',
    '৪-ট্যাব বটম নেভিগেশন ও নোটিফিকেশন বেল': '4-Tab Bottom Navigation & Notification Bell',
    'এক্সেল CSV এক্সপোর্ট ও হোয়াটসঅ্যাপ সারসংক্ষেপ': 'Excel CSV export & WhatsApp summary',
    'ইনিশিয়াল দিলখুশ প্লাস কোর রিলিজ': 'Initial Dilkhoosh Plus Core Release',
    'স্টাফ হাজিরা খাতা ও চেক-ইন': 'Staff attendance log & check-in',
    'টাস্ক অ্যাসাইনমেন্ট ও সাব-টাস্ক চেকলিস্ট': 'Task assignment & sub-task checklist',
    'কাজের নির্দেশনা ও SOP ম্যানেজমেন্ট': 'Directives & SOP management',
    'ডিফল্ট ভাষা': 'Default Language',
    'ডার্ক মোড সক্রিয়': 'Dark Mode Active',
    'লাইট মোড সক্রিয়': 'Light Mode Active',
    'ভাইব্রেশন সক্রিয়': 'Vibration Active',
    'সাইলেন্ট সক্রিয়': 'Silent Active',
    'DND সক্রিয়': 'DND Active',
    'সব অ্যালার্ট বন্ধ': 'All Alerts Off',
    'শুধু স্ক্রিন ব্যানার': 'Screen Banner Only',
    'ভাইব্রেশন \\+ অ্যালার্ট': 'Vibration + Alert',
    'রিলিজ লগ ও ভার্সন হিস্ট্রি': 'Release Log & Version History',
    'সফটওয়্যার ডেভেলপার ও ইঞ্জিনিয়ার': 'Software Developer & Engineer',
    'দিলখুশ প্লাস কন্ট্রোল মেনু': 'Dilkhoosh Plus Control Menu',
    'সকল মডিউল, সেটিংস, পারমিশন ও স্টাফ পরিচালনা': 'All modules, settings, permissions & staff management',
    'প্রধান কাজের মডিউলসমূহ': 'Primary Functional Modules',
    'স্টাফ হাজিরা খাতা': 'Staff Attendance Log',
    'দৈনিক চেক-ইন, চেক-আউট, বিলম্ব ও ছুটি মার্কিং': 'Daily check-in, check-out, late & leave marking',
    'কাজের নির্দেশনা ও SOP': 'Directives & SOP Guidelines',
    'স্টাফ ডিরেক্টরি ও টিম': 'Staff Directory & Team',
    'মোট সক্রিয় কর্মী': 'Total Active Staff',
    'রিপোর্ট ও প্রিন্ট হাব': 'Reports & Print Hub',
    'এক্সেল CSV, হোয়াটসঅ্যাপ সারসংক্ষেপ ও প্রিন্ট': 'Excel CSV, WhatsApp summaries & print sheets',
    'অ্যাপ কনফিগারেশন ও প্রিফারেন্স \\(Settings\\)': 'App Configuration & Preferences (Settings)',
    'সম্পূর্ণ সেটিংস': 'Full Settings',
    'থিম': 'Theme',
    'ভাষা': 'Language',
    'অ্যালার্ট মোড': 'Alert Mode',
    'শাখা ও ভূমিকা সেটিংস': 'Branch & Role Configuration',
    'পোস্টিং শাখা \\(Active Branch\\)': 'Active Branch',
    'অ্যাপ ভিউ ভূমিকা \\(Role Switch\\)': 'Role Switch',
    'সফটওয়্যার ইঞ্জিনিয়ারিং ও ডেভেলপমেন্ট': 'Software Engineering & Development',
    'হিস্ট্রি': 'History',
    'কোর ডাটাবেজ সুরক্ষিত • মোবাইল ওয়েব-ভিউ ১০০% অপ্টিমাইজড': 'Core database secured • Mobile web-view 100% optimized',
    'ফ্যাক্টরি ডাটা রিসেট': 'Factory Data Reset',
    'আপনি কি নিশ্চিত যে সকল ডেমো ডাটা রিসেট করতে চান?': 'Are you sure you want to reset all demo data?',
    'অ্যাডমিন প্রটোকল, চেকলিস্ট ও নোটিশ': 'Admin protocols, checklists & notices',
    'টি': 'items',
    'জন': 'person(s)',
    'আজকের হাজিরা ও চেক-ইন প্যানেল': 'Today\'s Attendance & Check-in Panel',
    'উপস্থিতি স্ট্যাটাস': 'Attendance Status',
    'বাকি': 'Remaining',
    'সব চেক-ইন করুন': 'Check In All',
    'স্টাফের নাম বা রোল খুঁজুন': 'Search staff name or role',
    'চেক-ইন সময়:': 'Check-in Time:',
    'হাজিরা স্ট্যাটাস আপডেট': 'Update Attendance Status',
    'সময় সেট করুন': 'Set Time',
    'বাতিল করুন': 'Cancel',
    'সেভ করুন': 'Save',
    'আজকের কাজের তালিকা': 'Today\'s Task List',
    'নতুন টাস্ক': 'New Task',
    'সব টাস্ক': 'All Tasks',
    'অ্যাক্টিভ': 'Active',
    'অগ্রাধিকার': 'Priority',
    'সাধারণ': 'Normal',
    'উচ্চ': 'High',
    'জরুরি': 'Urgent',
    'টাস্ক ম্যানেজমেন্ট ও সাব-টাস্ক': 'Task Management & Sub-tasks',
    'টাস্ক টাইটেল': 'Task Title',
    'টাস্কের বিবরণ': 'Task Description',
    'অ্যাসাইন করা হয়েছে': 'Assigned To',
    'ডেডলাইন': 'Deadline',
    'নতুন সাব-টাস্ক যোগ করুন': 'Add new sub-task',
    'যোগ করুন': 'Add',
    'মুছে ফেলুন': 'Delete',
    'টাস্ক ডিলিট': 'Delete Task',
    'আপনি কি নিশ্চিত যে এই টাস্কটি মুছে ফেলতে চান?': 'Are you sure you want to delete this task?',
    'নির্দেশনা ও SOP': 'Directives & SOP',
    'স্ট্যাটাস:': 'Status:',
    'অ্যাডমিন ডিরেক্টিভ ও নোটিশ বোর্ড': 'Admin Directive & Notice Board',
    'পিন করা': 'Pinned',
    'নতুন নির্দেশনা যোগ করুন': 'Add New Directive',
    'নির্দেশনার টাইটেল': 'Directive Title',
    'বিস্তারিত বিবরণ': 'Detailed Description',
    'চেকলিস্ট আইটেম যোগ করুন': 'Add checklist item',
    'কাদের জন্য প্রযোজ্য?': 'Applicable For?',
    'সব স্টাফ': 'All Staff',
    'ম্যানেজার লেভেল': 'Manager Level',
    'রোল বা পজিশন': 'Role or Position',
    'কন্টাক্ট নম্বর': 'Contact Number',
    'স্ট্যাটাস': 'Status',
    'নতুন স্টাফ যোগ করুন': 'Add New Staff',
    'স্টাফের নাম': 'Staff Name',
    'স্টাফ আইডি': 'Staff ID',
    'স্টাফ সেভ করুন': 'Save Staff',
    'দৈনিক রিপোর্ট ও ডেটা এক্সপোর্ট': 'Daily Reports & Data Export',
    'ডাউনলোড CSV': 'Download CSV',
    'প্রিন্ট ভিউ': 'Print View',
    'রিপোর্ট প্যানেল': 'Report Panel',
    'আজকের রিপোর্ট ডাউনলোড করুন': 'Download Today\'s Report',
    'অ্যালার্ট ও নোটিফিকেশন': 'Alerts & Notifications',
    'নতুন নোটিফিকেশন নেই': 'No new notifications',
    'চিহ্নিত করুন': 'Mark',
    'আজকের হাজিরা ও কাজ': 'Today\'s Attendance & Work',
    'তারিখ:': 'Date:',
    'শাখা:': 'Branch:',
    'হাজিরা রিপোর্ট:': 'Attendance Report:',
    'টাস্ক আপডেট:': 'Task Update:',
    'দিলখুশ প্লাস সিস্টেম থেকে প্রেরিত': 'Sent from Dilkhoosh Plus System',
    'ডিপ গ্রিন ও স্কাই ব্লু': 'Deep Green & Sky Blue',
    'উজ্জ্বল ও পরিচ্ছন্ন': 'Bright & Clean'
  };

  for (const [bn, en] of Object.entries(dict)) {
    const regex = new RegExp(bn, 'g');
    content = content.replace(regex, en);
  }

  // Handle getDayNameBengali and formatBengaliDate by just using English
  content = content.replace(/toBengaliNumber\(/g, 'String(');
  content = content.replace(/getDayNameBengali\(/g, 'getDayNameEnglish(');
  content = content.replace(/formatBengaliDate\(/g, 'formatEnglishDate(');

  // remove the isBn ternaries and just keep English
  content = content.replace(/isBn \? '[^']+' : '([^']+)'/g, "'$1'");
  content = content.replace(/isBn \? `[^`]+` : `([^`]+)`/g, "`$1`");
  
  // Another pass for double quotes
  content = content.replace(/isBn \? "[^"]+" : "([^"]+)"/g, '"$1"');

  fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceBengali(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));

// Also update dateUtils.ts to add English functions
const dateUtilsPath = path.join(__dirname, 'src/utils/dateUtils.ts');
let dateUtils = fs.readFileSync(dateUtilsPath, 'utf8');
if (!dateUtils.includes('getDayNameEnglish')) {
  dateUtils += `
export const getDayNameEnglish = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

export const formatEnglishDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};
`;
  fs.writeFileSync(dateUtilsPath, dateUtils, 'utf8');
}

console.log('Replacement done');
