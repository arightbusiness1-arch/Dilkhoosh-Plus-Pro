import { StaffMember, AttendanceRecord, Directive, TaskItem } from '../types';

export const initialStaffList: StaffMember[] = [
  {
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
  }
];

export const initialAttendanceRecords: AttendanceRecord[] = [];

export const initialDirectives: Directive[] = [];

export const initialTasks: TaskItem[] = [];

export const departmentsList = [
  'All Departments',
  'Management',
  'Kitchen & Production',
  'Sales & Counter',
  'Cash & Accounts',
  'Delivery & Logistics',
  'Store & Supply'
];
