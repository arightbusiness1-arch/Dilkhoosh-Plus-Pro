import { AppState, StaffMember, AttendanceRecord, Directive, TaskItem, AppSettings, HubData, DeletedItem } from '../types';
import { initialStaffList, initialAttendanceRecords, initialDirectives, initialTasks } from '../data/initialData';
import { getTodayDateString } from './dateUtils';

const STORAGE_KEYS = {
  STAFF: 'dilkhoosh_staff_v2',
  ATTENDANCE: 'dilkhoosh_attendance_v2',
  DIRECTIVES: 'dilkhoosh_directives_v2',
  TASKS: 'dilkhoosh_tasks_v2',
  CURRENT_USER: 'dilkhoosh_current_user_v2',
  ROLE: 'dilkhoosh_role_v2',
  SETTINGS: 'dilkhoosh_settings_v2',
  HUB: 'dilkhoosh_hub_v2',
  RECYCLE_BIN: 'dilkhoosh_recycle_bin_v2'
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  notificationMode: 'vibration',
  version: '1.4',
  developerCredit: 'Developed By Zubayer Ahmedr',
  adminPin: '300723',
  loginPinType: 'dynamic',
  customAdminPin: '300723',
  securityQuestion: 'আপনার প্রিয় সিকিউরিটি শব্দ কী?',
  securityAnswer: 'dilkhoosh',
  masterRecoveryKey: '778899',
  staffCanSubmitAttendance: true,
  staffCanChangeTaskStatus: true,
  staffCanAddDirectives: false,
  staffCanAddTasks: false,
  staffCanViewReports: false,
  staffCanManageHub: false
};

export const DEFAULT_HUB_DATA: HubData = {
  instructions: [
    {
      id: 'inst-101',
      text: 'কাস্টমার অর্ডারের ক্ষেত্রে প্রসেসিং সময় সর্বোচ্চ ১০ মিনিটের মধ্যে সীমাবদ্ধ রাখুন।',
      status: 'progress',
      assignedStaffId: 'st-2'
    },
    {
      id: 'inst-102',
      text: 'প্রতিদিন রাতে দোকান বন্ধের আগে সকল পাওয়ার সুইচ ও এয়ার কন্ডিশনার বন্ধ রাখা নিশ্চিত করুন।',
      status: 'pending',
      assignedStaffId: 'st-3'
    }
  ],
  reminders: [
    {
      id: 'rem-101',
      title: 'বিকালে নতুন কাঁচামাল স্টক রিসিভ ও ওজন পরীক্ষা',
      time: '04:00 PM',
      status: 'active'
    },
    {
      id: 'rem-102',
      title: 'সাপ্তাহিক অল-স্টাফ ব্রিফিং ও পারফর্ম্যান্স রিভিউ মিটিং',
      time: '09:00 AM',
      status: 'coming'
    }
  ],
  emergencies: [
    {
      id: 'emg-101',
      title: 'ফ্রন্ট গেটের সিসিটিভি ক্যামেরা ২ মেইনটেন্যান্স প্রসেসে আছে',
      phone: '01700000000',
      status: 'সার্ভিসিং টিমকে কল দেওয়া হয়েছে',
      type: 'contact',
      description: 'জরুরী সিকিউরিটি আপডেট'
    }
  ],
  ideas: [
    {
      id: 'ida-101',
      text: 'কাস্টমার ফিডব্যাক কার্ড কিউআর কোডের মাধ্যমে ডিজিটাল সংগ্রহ করার নতুন আইডিয়া।',
      isRemembered: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'ida-102',
      text: 'মাসিক সেরা পারফর্মিং স্টাফ মেম্বারকে বিশেষ রিওয়ার্ড ব্যাজ দেওয়ার প্রস্তাব।',
      isRemembered: false,
      createdAt: new Date().toISOString()
    }
  ],
  actions: [
    {
      id: 'act-101',
      text: 'আজকের স্পেশাল মেনু ডিসপ্লে বোর্ডে টাঙানো',
      isDone: true,
      status: 'completed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'act-102',
      text: 'নতুন ডেলিভারি রাইডারদের আইডি কার্ড দেওয়া',
      isDone: false,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    }
  ]
};

export const loadInitialState = (): AppState => {
  try {
    const rawStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
    const rawAtt = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const rawDir = localStorage.getItem(STORAGE_KEYS.DIRECTIVES);
    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const rawRole = localStorage.getItem(STORAGE_KEYS.ROLE);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawHub = localStorage.getItem(STORAGE_KEYS.HUB);
    const rawRecycle = localStorage.getItem(STORAGE_KEYS.RECYCLE_BIN);

    let parsedSettings = DEFAULT_SETTINGS;
    if (rawSettings) {
      try {
        const loaded = JSON.parse(rawSettings);
        parsedSettings = { ...DEFAULT_SETTINGS, ...loaded };
        parsedSettings.version = '1.4';
        parsedSettings.developerCredit = 'Developed By Zubayer Ahmedr';
        saveSettings(parsedSettings);
      } catch (e) {
        parsedSettings = DEFAULT_SETTINGS;
      }
    }

    let parsedHub = DEFAULT_HUB_DATA;
    if (rawHub) {
      try {
        parsedHub = JSON.parse(rawHub);
      } catch (e) {
        parsedHub = DEFAULT_HUB_DATA;
      }
    }

    let loadedStaff: StaffMember[] = rawStaff ? JSON.parse(rawStaff) : initialStaffList;
    if (!loadedStaff || !Array.isArray(loadedStaff) || loadedStaff.length === 0) {
      loadedStaff = initialStaffList;
    }
    const hasAdmin = loadedStaff.some(s => s.id === 'admin');
    if (!hasAdmin) {
      const adminProfile: StaffMember = {
        id: 'admin',
        name: 'Administrator',
        nameEn: 'System Administrator',
        role: 'System Administrator',
        department: 'Management',
        phone: '01700000000',
        email: 'admin@dilkhoosh.com',
        avatarColor: 'bg-indigo-600',
        shift: 'General Shift',
        joiningDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      loadedStaff = [adminProfile, ...loadedStaff];
    }

    let loadedAtt: AttendanceRecord[] = rawAtt ? JSON.parse(rawAtt) : initialAttendanceRecords;
    if (!loadedAtt || !Array.isArray(loadedAtt)) {
      loadedAtt = initialAttendanceRecords;
    }

    let loadedDir: Directive[] = rawDir ? JSON.parse(rawDir) : initialDirectives;
    if (!loadedDir || !Array.isArray(loadedDir)) {
      loadedDir = initialDirectives;
    }

    let loadedTasks: TaskItem[] = rawTasks ? JSON.parse(rawTasks) : initialTasks;
    if (!loadedTasks || !Array.isArray(loadedTasks)) {
      loadedTasks = initialTasks;
    }

    return {
      staffList: loadedStaff,
      attendanceRecords: loadedAtt,
      directives: loadedDir,
      tasks: loadedTasks,
      selectedDate: getTodayDateString(),
      currentUserId: rawUser || 'admin',
      role: (rawRole as any) || 'admin',
      settings: parsedSettings,
      hubData: parsedHub,
      recycleBin: rawRecycle ? JSON.parse(rawRecycle) : []
    };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return {
      staffList: initialStaffList,
      attendanceRecords: initialAttendanceRecords,
      directives: initialDirectives,
      tasks: initialTasks,
      selectedDate: getTodayDateString(),
      currentUserId: 'admin',
      role: 'admin',
      settings: DEFAULT_SETTINGS,
      hubData: DEFAULT_HUB_DATA,
      recycleBin: []
    };
  }
};

export const saveSettings = (data: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveHubData = (data: HubData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HUB, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveStaffList = (data: StaffMember[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveAttendanceRecords = (data: AttendanceRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveDirectives = (data: Directive[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIRECTIVES, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveTasks = (data: TaskItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveRecycleBin = (data: DeletedItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECYCLE_BIN, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};


export const saveRole = (role: 'admin' | 'staff') => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const saveCurrentUser = (userId: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  } catch (e) {
    console.error('Storage error', e);
  }
};

export const exportAllDataJSON = (state: AppState): string => {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    app: 'Dilkhoosh Plus',
    staffList: state.staffList,
    attendanceRecords: state.attendanceRecords,
    directives: state.directives,
    tasks: state.tasks
  };
  return JSON.stringify(exportPayload, null, 2);
};

export const resetToDefaultData = () => {
  localStorage.removeItem(STORAGE_KEYS.STAFF);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.DIRECTIVES);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.HUB);
  localStorage.removeItem(STORAGE_KEYS.RECYCLE_BIN);
  window.location.reload();
};
