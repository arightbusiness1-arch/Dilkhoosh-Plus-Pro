const fs = require('fs');
const path = require('path');

const replacements = {
  'ম্যানেজমেন্ট': 'Management',
  'সকাল ৯:০০ - সন্ধ্যা ৬:০০': '9:00 AM - 6:00 PM',
  'প্রধান শাখা \\(মতিঝিল\\)': 'Main Branch (Motijheel)',
  'প্রধান শাখা': 'Main Branch',
  'ক্যাশ ও একাউন্টস': 'Cash & Accounts',
  'সেলস ও কাউন্টার': 'Sales & Counter',
  'নিরাপত্তা ও হাইজিন': 'Safety & Hygiene',
  'কাস্টমার সার্ভিস': 'Customer Service',
  'প্রোডাকশন': 'Production',
  'ইনভেন্টরি': 'Inventory',
  'ডেলিভারি': 'Delivery',
  'আসসালামু আলাইকুম / স্বাগতম': 'Assalamu Alaikum / Welcome',
  'দিলখুশে আসার person\\(s\\)্য ধন্যবাদ, আবার আসবেন': 'Thank you for visiting Dilkhoosh, please come again',
  'দিলখুশে আসার': 'Visiting Dilkhoosh',
  'জন': 'Person',
  'টি': 'Items',
  'person\\(s\\)্য': 'for',
  'person\\(s\\)িত': 'generated',
  'মিষ্items': 'Sweets',
  'ছুitems': 'Leave',
  'প্রায়োরিitems': 'Priorities',
  'নোitemsফিকেশন': 'Notifications',
  'স্টাফের': 'Staff',
  'লজিস্itemsকস': 'Logistics',
  'Reportের': 'Report',
  'Tasksitems': 'Tasks',
  'Staffদের': 'Staff',
  'সেলস Reportের': 'Sales Report',
  'Tasks Completed': 'Tasks Completed',
  'Tasks মুছুন': 'Delete Task',
  'Tasks পাওয়া যায়নি': 'Tasks Not Found',
  'নতুন Tasks': 'New Tasks',
  'সকল Staffের': 'All Staffs',
  'স্টাফ হাজিরা খাতা ও চেক-ইন': 'Staff attendance log & check-in'
};

function fixAll(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [bn, en] of Object.entries(replacements)) {
    content = content.replace(new RegExp(bn, 'g'), en);
  }
  
  // Also any remaining stray Bengali chars, if they are isolated words, we can just remove or replace
  
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
console.log('Fixed rest');
