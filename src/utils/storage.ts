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
  staffCanSubmitAttendance: true,
  staffCanChangeTaskStatus: true,
  staffCanAddDirectives: false,
  staffCanAddTasks: false,
  staffCanViewReports: false,
  staffCanManageHub: false
};

export const DEFAULT_HUB_DATA: HubData = {
  instructions: [],
  reminders: [],
  emergencies: [],
  ideas: [],
  actions: []
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
        const loaded = JSON.parse(rawHub);
        parsedHub = { ...DEFAULT_HUB_DATA, ...loaded };
      } catch (e) {
        parsedHub = DEFAULT_HUB_DATA;
      }
    }

    let loadedStaff: StaffMember[] = rawStaff ? JSON.parse(rawStaff) : initialStaffList;
    if (!loadedStaff || loadedStaff.length === 0) {
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
        phone: '',
        email: 'admin@dilkhoosh.com',
        avatarColor: 'bg-indigo-600',
        shift: 'General Shift',
        joiningDate: new Date().toISOString().split('T')[0],
        isActive: true
      };
      loadedStaff = [adminProfile, ...loadedStaff];
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(loadedStaff));
      } catch (e) {
        console.error('Storage error', e);
      }
    }

    return {
      staffList: loadedStaff,
      attendanceRecords: rawAtt ? JSON.parse(rawAtt) : initialAttendanceRecords,
      directives: rawDir ? JSON.parse(rawDir) : initialDirectives,
      tasks: rawTasks ? JSON.parse(rawTasks) : initialTasks,
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
