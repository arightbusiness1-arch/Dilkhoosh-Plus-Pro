import { StaffMember, AttendanceRecord, Directive, TaskItem } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

const today = getTodayDateString();

export const initialStaffList: StaffMember[] = [
  {
    id: 'admin',
    name: 'Administrator',
    nameEn: 'System Administrator',
    role: 'System Administrator',
    department: 'Management',
    phone: '01700000000',
    email: 'admin@dilkhoosh.com',
    avatarColor: 'bg-indigo-600',
    shift: 'General Shift',
    joiningDate: '2024-01-01',
    isActive: true
  },
  {
    id: 'st-1',
    name: 'মোহাম্মদ রহিম',
    nameEn: 'Mohammad Rahim',
    role: 'Head Chef (প্রধান শেফ)',
    department: 'Kitchen & Production',
    phone: '01711223344',
    email: 'rahim@dilkhoosh.com',
    avatarColor: 'bg-emerald-600',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    joiningDate: '2024-02-15',
    isActive: true
  },
  {
    id: 'st-2',
    name: 'আব্দুল করিম',
    nameEn: 'Abdul Karim',
    role: 'Senior Cashier (ক্যাশিয়ার)',
    department: 'Sales & Counter',
    phone: '01822334455',
    email: 'karim@dilkhoosh.com',
    avatarColor: 'bg-blue-600',
    shift: 'Day Shift (09:00 AM - 06:00 PM)',
    joiningDate: '2024-03-01',
    isActive: true
  },
  {
    id: 'st-3',
    name: 'হাবিবুর রহমান',
    nameEn: 'Habibur Rahman',
    role: 'Store Keeper (স্টোর কিপার)',
    department: 'Store & Supply',
    phone: '01933445566',
    email: 'habib@dilkhoosh.com',
    avatarColor: 'bg-amber-600',
    shift: 'General Shift (08:30 AM - 05:30 PM)',
    joiningDate: '2024-03-10',
    isActive: true
  },
  {
    id: 'st-4',
    name: 'মো: তানভীর আলম',
    nameEn: 'Md. Tanveer Alam',
    role: 'Delivery Officer (ডেলিভারি এক্সিকিউটিভ)',
    department: 'Delivery & Logistics',
    phone: '01644556677',
    email: 'tanveer@dilkhoosh.com',
    avatarColor: 'bg-rose-600',
    shift: 'Evening Shift (12:00 PM - 09:00 PM)',
    joiningDate: '2024-04-05',
    isActive: true
  },
  {
    id: 'st-5',
    name: 'সাজ্জাদ হোসেন',
    nameEn: 'Sazzad Hossain',
    role: 'Assistant Chef (সহকারী শেফ)',
    department: 'Kitchen & Production',
    phone: '01555667788',
    email: 'sazzad@dilkhoosh.com',
    avatarColor: 'bg-purple-600',
    shift: 'Morning Shift (08:00 AM - 04:00 PM)',
    joiningDate: '2024-05-12',
    isActive: true
  },
  {
    id: 'st-6',
    name: 'মো: জসীম উদ্দিন',
    nameEn: 'Md. Jashim Uddin',
    role: 'Accountant (হিসাবরক্ষক)',
    department: 'Cash & Accounts',
    phone: '01366778899',
    email: 'jashim@dilkhoosh.com',
    avatarColor: 'bg-teal-600',
    shift: 'General Shift (09:00 AM - 06:00 PM)',
    joiningDate: '2024-06-01',
    isActive: true
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
  {
    id: `att-1-${today}`,
    staffId: 'st-1',
    date: today,
    status: 'present',
    checkInTime: '08:15 AM',
    checkOutTime: '',
    note: 'সময়মতো প্রবেশ',
    markedAt: `${today}T08:15:00`
  },
  {
    id: `att-2-${today}`,
    staffId: 'st-2',
    date: today,
    status: 'present',
    checkInTime: '08:50 AM',
    checkOutTime: '',
    note: 'কাউন্টার ওপেনিং প্রস্তুত',
    markedAt: `${today}T08:50:00`
  },
  {
    id: `att-3-${today}`,
    staffId: 'st-3',
    date: today,
    status: 'late',
    checkInTime: '09:15 AM',
    checkOutTime: '',
    note: 'যানজটের কারণে ১০ মিনিট বিলম্ব',
    markedAt: `${today}T09:15:00`
  },
  {
    id: `att-4-${today}`,
    staffId: 'st-4',
    date: today,
    status: 'present',
    checkInTime: '11:45 AM',
    checkOutTime: '',
    note: 'ডেলিভারি বাইক ফুয়েল চেক সম্পন্ন',
    markedAt: `${today}T11:45:00`
  },
  {
    id: `att-5-${today}`,
    staffId: 'st-5',
    date: today,
    status: 'present',
    checkInTime: '08:20 AM',
    checkOutTime: '',
    note: 'হেড শেফকে সহায়তায় প্রস্তুত',
    markedAt: `${today}T08:20:00`
  }
];

export const initialDirectives: Directive[] = [
  {
    id: 'dir-101',
    title: 'জরুরী: কাউন্টার ক্যাশ ক্লোজিং ও সিসিটিভি সেফটি প্রোটোকল',
    content: 'সকল কাউন্টার ক্যাশিয়ারদের নিশ্চিত করতে হবে যে সন্ধ্যা ৭টার মধ্যে ক্যাশ হিসাব রেজিস্টারে এন্টি করা হবে। কোন অবস্থাতেই ক্যাশ ড্রয়ার খোলা রেখে স্থান ত্যাগ করা যাবে না।',
    priority: 'urgent',
    category: 'Cash & Accounts',
    targetDepartment: 'all',
    createdBy: 'admin',
    createdAt: `${today}T08:00:00`,
    isPinned: true,
    status: 'progress',
    acknowledgedStaffIds: ['st-1', 'st-2', 'st-3'],
    checklist: [
      { id: 'chk-1', text: 'ক্যাশ ড্রয়ার লক চেক করা', isDone: true },
      { id: 'chk-2', text: 'প্রতিদিনের ক্যাশ ব্যালেন্স রেজিস্টারে স্বাক্ষর', isDone: false },
      { id: 'chk-3', text: 'সন্ধ্যা ৭টার রিপোর্ট প্রদান', isDone: false }
    ]
  },
  {
    id: 'dir-102',
    title: 'ফুড সেফটি ও কিচেন হাইজিন নির্দেশিকা',
    content: 'রান্নাঘরে কর্মরত সকল শেফ ও হেলপারদের বাধ্যতামূলক হ্যান্ড গ্লাভস, মাস্ক এবং অ্যাপ্রন পরতে হবে। খাদ্যসামগ্রী ঢেকে রাখা নিশ্চিত করতে হবে।',
    priority: 'high',
    category: 'Safety & Hygiene',
    targetDepartment: 'Kitchen & Production',
    createdBy: 'admin',
    createdAt: `${today}T08:30:00`,
    isPinned: true,
    status: 'progress',
    acknowledgedStaffIds: ['st-1', 'st-5'],
    checklist: [
      { id: 'chk-4', text: 'মাস্ক ও অ্যাপ্রন পরিধান', isDone: true },
      { id: 'chk-5', text: 'সারফেস স্যানিটাইজেশন', isDone: true }
    ]
  },
  {
    id: 'dir-103',
    title: 'সাপ্তাহিক ইনভেন্টরি ও রিকুইজিশন আপডেট',
    content: 'প্রতি সপ্তাহের রবিবার বিকালের মধ্যে সকল ডিপার্টমেন্ট থেকে প্রয়োজন অনুযায়ী কাঁচামাল ও মালামালের চাহিদাপত্র স্টোর রুমে জমা দিতে হবে।',
    priority: 'normal',
    category: 'Production Rules',
    targetDepartment: 'Store & Supply',
    createdBy: 'admin',
    createdAt: `${today}T09:00:00`,
    isPinned: false,
    status: 'pending',
    acknowledgedStaffIds: ['st-3'],
    checklist: [
      { id: 'chk-6', text: 'স্টক খাতা আপডেট', isDone: false }
    ]
  }
];

export const initialTasks: TaskItem[] = [
  {
    id: 'tsk-201',
    title: 'দৈনিক ফুড সেফটি ও কোয়ালিটি ইনস্পেকশন',
    description: 'সকালের মেনুর জন্য সকল আইটেমের মান ও তাপমাত্রা পরীক্ষা করে হেড শেফ রিপোর্ট প্রদান করবেন।',
    assignedStaffId: 'st-1',
    assignedStaffId2: 'st-5',
    priority: 'high',
    status: 'progress',
    dueDate: today,
    dueTime: '11:00 AM',
    category: 'Kitchen & Production',
    createdAt: `${today}T08:15:00`,
    subtasks: [
      { id: 'sub-1', title: 'কাঁচামাল পরীক্ষা', completed: true },
      { id: 'sub-2', title: 'তেলের কোয়ালিটি চেক', completed: true },
      { id: 'sub-3', title: 'ডিসপ্লে টেস্ট সম্পন্ন', completed: false }
    ],
    remarks: 'ইনস্পেকশন চলমান রয়েছে'
  },
  {
    id: 'tsk-202',
    title: 'সাপ্তাহিক ড্রাগন ফ্রুট ও ড্রাই ফ্রুটস স্টোর ইনভেন্টরি',
    description: 'স্টোর রুমে থাকা সকল ড্রাই ইনগ্রিডিয়েন্টস এর মেয়াদের তারিখ ও পরিমাণ চেক করতে হবে।',
    assignedStaffId: 'st-3',
    priority: 'medium',
    status: 'pending',
    dueDate: today,
    dueTime: '03:30 PM',
    category: 'Store & Supply',
    createdAt: `${today}T08:30:00`,
    subtasks: [
      { id: 'sub-4', title: 'প্যাকেট গণনা', completed: false },
      { id: 'sub-5', title: 'এক্সপায়ারি ডেট লগ', completed: false }
    ]
  },
  {
    id: 'tsk-203',
    title: 'কাউন্টার পিওএস (POS) ও রসিদ প্রিন্টার চেকআপ',
    description: 'বিলিং সফটওয়্যার ও থার্মাল প্রিন্টারের পেপার রোল চেক সম্পন্ন করতে হবে।',
    assignedStaffId: 'st-2',
    priority: 'urgent',
    status: 'complete',
    dueDate: today,
    dueTime: '09:30 AM',
    category: 'Sales & Counter',
    createdAt: `${today}T08:00:00`,
    completedAt: `${today}T09:15:00`,
    subtasks: [
      { id: 'sub-6', title: 'থার্মাল পেপার পরিবর্তন', completed: true },
      { id: 'sub-7', title: 'নেটওয়ার্ক কানেকশন টেস্ট', completed: true }
    ],
    remarks: 'সব কাজ ঠিকঠাক কাজ করছে'
  },
  {
    id: 'tsk-204',
    title: 'দুপুরের হোম ডেলিভারি পার্সেল রাইডার এসাইনমেন্ট',
    description: 'দুপুরের প্যাকেজগুলো নির্ধারিত ডেলিভারি রাইডারের কাছে বুঝিয়ে দেওয়া ও রসিদ চেক করা।',
    assignedStaffId: 'st-4',
    priority: 'high',
    status: 'progress',
    dueDate: today,
    dueTime: '01:30 PM',
    category: 'Delivery & Logistics',
    createdAt: `${today}T10:00:00`,
    subtasks: [
      { id: 'sub-8', title: 'পার্সেল প্যাকিং চেক', completed: true },
      { id: 'sub-9', title: 'রাইডার কল কনফার্মেশন', completed: false }
    ]
  }
];

export const departmentsList = [
  'All Departments',
  'Management',
  'Kitchen & Production',
  'Sales & Counter',
  'Cash & Accounts',
  'Delivery & Logistics',
  'Store & Supply'
];

