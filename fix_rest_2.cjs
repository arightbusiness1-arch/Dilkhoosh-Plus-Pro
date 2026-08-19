const fs = require('fs');
const path = require('path');

const replacements = {
  '_Dilkhoosh Plus সিস্টেম থেকে প্রেরিত_': '_Sent from Dilkhoosh Plus System_',
  'লাইভ ড্যাশবোর্ড': 'Live Dashboard',
  'আজকের Presentি ও কার্যক্রমের হালচাল': 'Today\'s Attendance & Activity Overview',
  'আজকের মোট Presentি হার': 'Today\'s Total Attendance Rate',
  'কপি হয়েছে! ✅': 'Copied! ✅',
  'হোয়াটসঅ্যাপে পাঠান': 'Send via WhatsApp',
  'আজকের হাজিরা প্রগ্রেস': 'Today\'s Attendance Progress',
  'সময়মতো এন্ট্রি:': 'On-time Entry:',
  'দেরিতে Presentি রেকর্ড': 'Late Attendance Record',
  'চলমান Tasks': 'Ongoing Tasks',
  'Completed হয়েছে:': 'Completed:',
  'কুইক হাজিরা এন্ট্রি': 'Quick Attendance Entry',
  'সব দেখুন': 'See All',
  'Staff নির্বাচন করে এক ক্লিকে Presentি বা বর্তমান সময় চেক-ইন মার্ক করুন:': 'Select staff and mark attendance or check-in with one click:',
  'Staff মেম্বার নির্বাচন করুন': 'Select Staff Member',
  'চিহ্নিত হয়নি': 'Not Marked',
  'বর্তান Status:': 'Current Status:',
  'ইন:': 'In:',
  'দেরিতে (Late)': 'Late',
  'Urgent কাজের নির্দেশনা ও নোitemsশ': 'Urgent Directives & Notices',
  'সকল নির্দেশনা': 'All Directives',
  'Urgent প্রটোকল': 'Urgent Protocol',
  'High Priority': 'High Priority',
  'পড়েছেন': 'read',
  'বিভাগ:': 'Department:',
  'সকল বিভাগ': 'All Departments',
  'পড়েছি ✅': 'Read ✅',
  'পড়েছি ও মেনে চলব': 'Read and will comply',
  'নতুন নির্দেশনা / নোitemsশ পোস্ট করুন': 'Post New Directive / Notice',
  'আজকের দৈনিক Tasksসমূহ': 'Today\'s Daily Tasks',
  'সক্রিয়': 'Active',
  'Staff নির্দিষ্ট দায়িত্ব ও কাজের বাস্তব অগ্রগতি': 'Staff specific responsibilities and actual work progress',
  'Tasks বোর্ড': 'Tasks Board',
  'আজকের কোনো Tasks Not Found। New Tasks Add।': 'No tasks found today. Add new tasks.',
  'অনির্ধারিত': 'Unassigned',
  'সময়:': 'Time:',
  'ডেলি Tasks ট্র্যাকার': 'Daily Tasks Tracker',
  'দৈনিক কাজের লক্ষ্য ও জবাবদিহিতা': 'Daily work goals and accountability',
  'দৈনিক কাজের তালিকা ও ট্র্যাকিং': 'Daily work list & tracking',
  'মোট Tasks:': 'Total Tasks:',
  'New Tasks অ্যাসাইন করুন': 'Assign New Tasks',
  'সকল Tasks': 'All Tasks',
  'মাঝারি \\(Medium\\)': 'Medium',
  'সফলভাবে আপডেট হয়েছে': 'successfully updated',
  'রোল পরিবর্তন করা হয়েছে:': 'Role changed:',
  'বর্তমান ভিউয়ার:': 'Current Viewer:',
  'এর হাজিরা': 'attendance',
  'সেভ হয়েছে': 'saved',
  'এক ক্লিকে Presentি Completed': 'Attendance completed with one click',
  'সবাইকে Present মার্ক করা হয়েছে': 'Everyone marked present',
  'New Tasks সফলভাবে Assigned To': 'New tasks successfully assigned',
  'Tasks Status আপডেট হয়েছে': 'Task status updated',
  'Tasks মুছে ফেলা হয়েছে': 'Task deleted',
  'নতুন কাজের নির্দেশনা পোস্ট করা হয়েছে': 'New directive posted',
  'নির্দেশনা স্বীকৃতি আপডেট করা হয়েছে': 'Directive acknowledgement updated',
  'সফলভাবে নিবন্ধিত হয়েছেন': 'successfully registered',
  'ডাটা সফলভাবে রিস্টোর হয়েছে!': 'Data successfully restored!',
  'ভুল ফরম্যাটের ব্যাকআপ ফাইল।': 'Invalid backup file format.',
  'JSON পার্স করতে ব্যর্থ হয়েছে। সঠিক ফাইল বা কোড প্রদান করুন।': 'Failed to parse JSON. Provide valid file or code.',
  'রবিবার': 'Sunday', 'সোমবার': 'Monday', 'মঙ্গলবার': 'Tuesday', 'বুধবার': 'Wednesday', 'বৃহস্পতিবার': 'Thursday', 'শুক্রবার': 'Friday', 'শনিবার': 'Saturday',
  'জানুয়ারি': 'January', 'ফেব্রুয়ারি': 'February', 'মার্চ': 'March', 'এপ্রিল': 'April', 'মে': 'May', 'জুন': 'June',
  'জুলাই': 'July', 'আগস্ট': 'August', 'সেপ্টেম্বর': 'September', 'অক্টোবর': 'October', 'নভেম্বর': 'November', 'ডিসেম্বর': 'December',
  'সেলস': 'Sales',
  'বিলম্ব': 'Late',
  'Report ও এক্সপোর্ট': 'Report & Export',
  'নোitemsফিকেশন ও রিমাইন্ডার': 'Notifications & Reminders',
  'অ্যাপ Settings ও প্রিফারেন্স': 'App Settings & Preferences',
  'আপনি কি ডিফল্ট স্যাম্পল ডাটায় রিসেট করতে চান\\?': 'Are you sure you want to reset to default sample data?',
  'রিসেট ডাটা': 'Reset Data',
  'Presentি': 'Attendance',
  'Present': 'Present',
  'Leave': 'Leave',
  'Absent': 'Absent'
};

function fixAll(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [bn, en] of Object.entries(replacements)) {
    content = content.replace(new RegExp(bn, 'g'), en);
  }
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
console.log('Fixed rest 2');
