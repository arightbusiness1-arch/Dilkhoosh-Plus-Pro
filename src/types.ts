export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'half_day';

export type TaskStatus = 'pending' | 'progress' | 'attempting' | 'partial' | 'complete' | 'failed';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'normal' | 'low';
export type AppTab = 'home' | 'tasks' | 'hub' | 'report' | 'menu' | 'attendance' | 'directives' | 'staff' | 'admin_dashboard' | 'hub_management';

export interface StaffMember {
  id: string;
  name: string;
  nameEn?: string;
  role: string;
  department: string;
  phone: string;
  email?: string;
  avatarColor: string;
  shift: string;
  joiningDate: string;
  isActive: boolean;
  googleEmail?: string;
  googleDisplayName?: string;
  googlePhotoUrl?: string;
  googleUid?: string;
  googleConnectedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  note?: string;
  markedAt: string;
}

export interface DirectiveChecklistItem {
  id: string;
  text: string;
  isDone: boolean;
}

export interface Directive {
  id: string;
  title: string;
  content: string;
  priority: PriorityLevel;
  category: string;
  targetDepartment: string; // 'all' or department name
  targetStaffId?: string;
  createdBy: string;
  createdAt: string;
  dueDate?: string;
  isPinned: boolean;
  acknowledgedStaffIds: string[];
  checklist?: DirectiveChecklistItem[];
  status?: TaskStatus;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  assignedStaffId: string;
  assignedStaffId2?: string; // Optional second assigned staff member
  priority: PriorityLevel;
  status: TaskStatus;
  dueDate: string;
  dueTime?: string;
  category: string;
  subtasks: SubTask[];
  createdAt: string;
  completedAt?: string;
  remarks?: string;
  feedback?: string;
}

export type ThemeMode = 'dark' | 'light';
export type AppLanguage = 'bn' | 'en';
export type NotificationMode = 'dnd' | 'silent' | 'vibration' | 'sound';

export interface AppSettings {
  theme: ThemeMode;
  language: AppLanguage;
  notificationMode: NotificationMode;
  version: string;
  developerCredit: string;
  adminPin?: string;
  loginPinType?: 'dynamic' | 'custom';
  customAdminPin?: string;
  securityQuestion?: string;
  securityAnswer?: string;
  masterRecoveryKey?: string;
  staffCanSubmitAttendance?: boolean;
  staffCanChangeTaskStatus?: boolean;
  staffCanAddDirectives?: boolean;
  staffCanAddTasks?: boolean;
  staffCanViewReports?: boolean;
  staffCanManageHub?: boolean;
}

export interface HubReminder {
  id: string;
  title: string;
  time: string;
  status: 'active' | 'coming';
}

export interface HubEmergency {
  id: string;
  title: string;
  phone?: string;
  status: string;
  type?: 'task' | 'contact';
  description?: string;
  assignedStaffId?: string;
}

export interface HubInstruction {
  id: string;
  text: string;
  status: TaskStatus;
  assignedStaffId?: string;
}

export interface HubIdea {
  id: string;
  text: string;
  isRemembered?: boolean;
  createdAt?: string;
}

export interface HubActionItem {
  id: string;
  text: string;
  isDone?: boolean;
  status?: 'active' | 'completed' | 'in_progress';
  createdAt?: string;
}

export interface HubData {
  instructions: HubInstruction[];
  reminders: HubReminder[];
  emergencies: HubEmergency[];
  ideas?: HubIdea[];
  actions?: HubActionItem[];
}

export interface DeletedItem {
  id: string;
  originalId: string;
  type: 'task' | 'staff' | 'directive';
  name: string;
  details: string;
  deletedAt: string;
  itemData: any;
}

export interface AppState {
  staffList: StaffMember[];
  attendanceRecords: AttendanceRecord[];
  directives: Directive[];
  tasks: TaskItem[];
  selectedDate: string;
  currentUserId: string; // Active staff view
  role: 'admin' | 'staff';
  settings: AppSettings;
  hubData: HubData;
  recycleBin: DeletedItem[];
}
