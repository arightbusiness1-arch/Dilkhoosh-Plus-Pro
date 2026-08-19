import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppTab, AttendanceStatus, TaskStatus, StaffMember, Directive, TaskItem, AppSettings, HubData, DeletedItem } from './types';
import { 
  loadInitialState, 
  saveStaffList, 
  saveAttendanceRecords, 
  saveDirectives, 
  saveTasks, 
  saveRole, 
  saveCurrentUser,
  saveSettings,
  saveHubData,
  saveRecycleBin
} from './utils/storage';
import { 
  testFirebaseConnection, 
  syncStateToCloud, 
  fetchStateFromCloud, 
  subscribeToCloudUpdates 
} from './lib/firebase';
import { getTodayDateString, getCurrentTimeString } from './utils/dateUtils';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { AttendanceView } from './components/AttendanceView';
import { TasksView } from './components/TasksView';
import { DirectivesView } from './components/DirectivesView';
import { StaffDirectoryView } from './components/StaffDirectoryView';
import { ReportsView } from './components/ReportsView';
import { MenuView } from './components/MenuView';
import { HubView } from './components/HubView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { NewTaskModal } from './components/NewTaskModal';
import { NewDirectiveModal } from './components/NewDirectiveModal';
import { NewStaffModal } from './components/NewStaffModal';
import { ReportsModal } from './components/ReportsModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { RecycleBinModal } from './components/RecycleBinModal';
import { ProfileDetailModal } from './components/ProfileDetailModal';
import { HubManagementView } from './components/HubManagementView';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { DataCenterModal } from './components/DataCenterModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { LoginView } from './components/LoginView';
import { CheckCircle2, Info, Lock, X, ShieldAlert, Eye, EyeOff, Bot, Sparkles, UserCheck, RefreshCw, ShieldCheck, Key } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<AppState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<AppTab>('home');

  // Login session state (Defaults to Login Page)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Online/Offline status & Firebase Cloud Storage Sync state
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [firebaseStatus, setFirebaseStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
  const isCloudSyncingRef = useRef<boolean>(false);

  // Monitor network connectivity changes (Online/Offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setFirebaseStatus('connecting');
      testFirebaseConnection().then(connected => {
        if (connected) {
          setFirebaseStatus('connected');
          syncStateToCloud(state);
        } else {
          setFirebaseStatus('offline');
        }
      }).catch(() => {
        setFirebaseStatus('offline');
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setFirebaseStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [state]);

  // Initialize Firebase connection and subscribe to live cloud updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initFirebase() {
      try {
        const isConnected = await testFirebaseConnection();
        if (isConnected) {
          setFirebaseStatus('connected');
          
          // Check for existing cloud data
          const cloudData = await fetchStateFromCloud();
          if (cloudData && Object.keys(cloudData).length > 0) {
            isCloudSyncingRef.current = true;
            setState(prev => {
              const merged: AppState = {
                ...prev,
                staffList: cloudData.staffList && cloudData.staffList.length > 0 ? cloudData.staffList : prev.staffList,
                attendanceRecords: cloudData.attendanceRecords || prev.attendanceRecords,
                directives: cloudData.directives || prev.directives,
                tasks: cloudData.tasks || prev.tasks,
                settings: cloudData.settings ? { ...prev.settings, ...cloudData.settings } : prev.settings,
                hubData: cloudData.hubData ? { ...prev.hubData, ...cloudData.hubData } : prev.hubData,
                recycleBin: cloudData.recycleBin || prev.recycleBin
              };
              // Sync to local storage as cache
              saveStaffList(merged.staffList);
              saveAttendanceRecords(merged.attendanceRecords);
              saveDirectives(merged.directives);
              saveTasks(merged.tasks);
              saveSettings(merged.settings);
              saveHubData(merged.hubData);
              saveRecycleBin(merged.recycleBin);
              return merged;
            });
            setTimeout(() => {
              isCloudSyncingRef.current = false;
            }, 600);
          } else {
            // Seed initial state to Firestore
            syncStateToCloud(state);
          }

          // Real-time synchronization subscription
          unsubscribe = subscribeToCloudUpdates((cloudData) => {
            if (isCloudSyncingRef.current) return;
            isCloudSyncingRef.current = true;
            setState(prev => {
              const updated: AppState = {
                ...prev,
                staffList: cloudData.staffList && cloudData.staffList.length > 0 ? cloudData.staffList : prev.staffList,
                attendanceRecords: cloudData.attendanceRecords || prev.attendanceRecords,
                directives: cloudData.directives || prev.directives,
                tasks: cloudData.tasks || prev.tasks,
                settings: cloudData.settings ? { ...prev.settings, ...cloudData.settings } : prev.settings,
                hubData: cloudData.hubData ? { ...prev.hubData, ...cloudData.hubData } : prev.hubData,
                recycleBin: cloudData.recycleBin || prev.recycleBin
              };
              saveStaffList(updated.staffList);
              saveAttendanceRecords(updated.attendanceRecords);
              saveDirectives(updated.directives);
              saveTasks(updated.tasks);
              saveSettings(updated.settings);
              saveHubData(updated.hubData);
              saveRecycleBin(updated.recycleBin);
              return updated;
            });
            setTimeout(() => {
              isCloudSyncingRef.current = false;
            }, 600);
          });
        } else {
          setFirebaseStatus('offline');
        }
      } catch (err) {
        console.warn('Firebase initialization note:', err);
        setFirebaseStatus('offline');
      }
    }

    initFirebase();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Debounced sync to Firebase Firestore when state changes
  useEffect(() => {
    if (isCloudSyncingRef.current || firebaseStatus !== 'connected') return;
    const timer = setTimeout(() => {
      syncStateToCloud(state);
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    state.staffList,
    state.attendanceRecords,
    state.directives,
    state.tasks,
    state.settings,
    state.hubData,
    state.recycleBin,
    firebaseStatus
  ]);

  // Modals state
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewDirectiveOpen, setIsNewDirectiveOpen] = useState(false);
  const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDataCenterOpen, setIsDataCenterOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileStaffId, setSelectedProfileStaffId] = useState<string | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'info'>('settings');
  const [showPinCode, setShowPinCode] = useState(false);

  const handleOpenSettings = (tab: 'settings' | 'info' = 'settings') => {
    setSettingsInitialTab(tab);
    setIsSettingsOpen(true);
  };

  const handleOpenStaffProfile = (staffId?: string) => {
    const targetId = staffId || state.currentUserId;
    setSelectedProfileStaffId(targetId);
    setIsProfileModalOpen(true);
  };

  const handleUpdateStaffGoogleAuth = (
    staffId: string,
    googleData: {
      googleEmail?: string;
      googleDisplayName?: string;
      googlePhotoUrl?: string;
      googleUid?: string;
    } | null
  ) => {
    setState(prev => {
      const updatedStaffList = prev.staffList.map(s => {
        if (s.id === staffId) {
          if (!googleData) {
            return {
              ...s,
              googleEmail: undefined,
              googleDisplayName: undefined,
              googlePhotoUrl: undefined,
              googleUid: undefined,
              googleConnectedAt: undefined
            };
          }
          return {
            ...s,
            googleEmail: googleData.googleEmail,
            googleDisplayName: googleData.googleDisplayName,
            googlePhotoUrl: googleData.googlePhotoUrl,
            googleUid: googleData.googleUid,
            googleConnectedAt: new Date().toISOString()
          };
        }
        return s;
      });
      saveStaffList(updatedStaffList);
      const updatedState = { ...prev, staffList: updatedStaffList };
      syncStateToCloud(updatedState);
      return updatedState;
    });
  };

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Escape key to close all open modals
      if (e.key === 'Escape') {
        setIsNewTaskOpen(false);
        setIsNewDirectiveOpen(false);
        setIsNewStaffOpen(false);
        setIsReportsOpen(false);
        setIsNotificationsOpen(false);
        setIsSettingsOpen(false);
        setIsRecycleBinOpen(false);
        setIsShortcutsOpen(false);
        setIsProfileModalOpen(false);
        setIsPinModalOpen(false);
        return;
      }

      if (!isCtrlOrCmd) return;

      // Ctrl + N: Open New Task Modal
      if (key === 'n' && !e.shiftKey) {
        e.preventDefault();
        setIsNewTaskOpen(true);
        showToast('Opened New Task Modal (Ctrl+N) 📝');
        return;
      }

      // Ctrl + Shift + D: Open New Directive Modal
      if (key === 'd' && e.shiftKey) {
        e.preventDefault();
        setIsNewDirectiveOpen(true);
        showToast('Opened New Directive Modal (Ctrl+Shift+D) 📢');
        return;
      }

      // Ctrl + Shift + S: Open New Staff Modal
      if (key === 's' && e.shiftKey) {
        e.preventDefault();
        setIsNewStaffOpen(true);
        showToast('Opened Register Staff Modal (Ctrl+Shift+S) 👤');
        return;
      }

      // Ctrl + Shift + R: Open Reports Modal
      if (key === 'r' && e.shiftKey) {
        e.preventDefault();
        setIsReportsOpen(true);
        showToast('Opened Reports Modal (Ctrl+Shift+R) 📊');
        return;
      }

      // Ctrl + Shift + K: Open Settings
      if (key === 'k' && e.shiftKey) {
        e.preventDefault();
        handleOpenSettings('settings');
        showToast('Opened Settings Modal (Ctrl+Shift+K) ⚙️');
        return;
      }

      // Ctrl + K: Toggle Keyboard Shortcuts Guide
      if (key === 'k' && !e.shiftKey) {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
        return;
      }

      // Ctrl + S: Save active form / cloud auto-save confirmation
      if (key === 's' && !e.shiftKey) {
        e.preventDefault();
        // If no modal is open, trigger cloud sync notification
        if (!isNewTaskOpen && !isNewDirectiveOpen && !isNewStaffOpen && !isSettingsOpen) {
          syncStateToCloud(state);
          showToast('Form Inputs & State Saved to Cloud 💾');
        }
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state, isNewTaskOpen, isNewDirectiveOpen, isNewStaffOpen, isSettingsOpen]);

  // Helper function to generate a random 5-digit security PIN
  const generate5DigitPin = () => Math.floor(10000 + Math.random() * 90000).toString();

  // Admin PIN verification state with changing 5-digit PIN
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [dynamicPin, setDynamicPin] = useState<string>(() => generate5DigitPin());

  // Function to refresh the dynamic 5-digit PIN code
  const refreshDynamicPin = () => {
    const newPin = generate5DigitPin();
    setDynamicPin(newPin);
    return newPin;
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Settings update handler
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setState(prev => {
      const updated = { ...prev.settings, ...newSettings };
      saveSettings(updated);
      return { ...prev, settings: updated };
    });
    showToast('Settings successfully updated ✅');
  };

  const handleUpdateHubData = (newHubData: HubData) => {
    setState(prev => {
      const next = { ...prev, hubData: newHubData };
      saveHubData(newHubData);
      return next;
    });
  };

  // Login & Logout session handlers
  const handleLoginSuccess = (loginData: { role: 'admin' | 'staff'; staffId?: string }) => {
    const nextRole = loginData.role;
    const nextUser = loginData.staffId || (nextRole === 'admin' ? 'admin' : state.currentUserId);
    
    setState(prev => {
      saveRole(nextRole);
      saveCurrentUser(nextUser);
      return {
        ...prev,
        role: nextRole,
        currentUserId: nextUser
      };
    });

    setIsLoggedIn(true);
    sessionStorage.setItem('dilkhoosh_is_logged_in', 'true');
    showToast(
      state.settings.language === 'bn' 
        ? `সফলভাবে ${nextRole === 'admin' ? 'এডমিন' : 'স্টাফ'} হিসেবে লগইন করেছেন 🎉` 
        : `Successfully logged in as ${nextRole === 'admin' ? 'Admin' : 'Staff'} 🎉`
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('dilkhoosh_is_logged_in');
    showToast(state.settings.language === 'bn' ? 'সফলভাবে লগআউট করা হয়েছে 👋' : 'Successfully logged out 👋');
  };

  // Branch & Role change handlers

  const handleRoleChange = (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      if (state.role === 'admin') {
        showToast('You are already an Admin 👑');
        return;
      }
      refreshDynamicPin();
      setPinInput('');
      setPinError(false);
      setIsPinModalOpen(true);
    } else {
      setState(prev => {
        const next = { ...prev, role };
        saveRole(role);
        return next;
      });
      showToast('Switched to: Staff Portal 🧑‍💼');
    }
  };

  const handleVerifyPinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput === dynamicPin) {
      setState(prev => {
        const next = { ...prev, role: 'admin' as const };
        saveRole('admin');
        return next;
      });
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError(false);
      refreshDynamicPin();
      showToast(state.settings.language === 'bn' ? 'এডমিন হিসেবে সফলভাবে লগইন করেছেন 👑' : 'Welcome Administrator 👑');
    } else {
      // Auto-change PIN on incorrect attempt!
      refreshDynamicPin();
      setPinInput('');
      setPinError(true);
      showToast(state.settings.language === 'bn' ? '❌ ভুল পিন! নতুন পিন জেনারেট হয়েছে।' : '❌ Incorrect PIN! Generated new 5-digit PIN.');
    }
  };

  const handleKeypadPress = (val: string) => {
    setPinError(false);
    if (val === 'clear') {
      setPinInput('');
    } else if (val === 'backspace') {
      setPinInput(prev => prev.slice(0, -1));
    } else {
      if (pinInput.length < 5) {
        const nextInput = pinInput + val;
        setPinInput(nextInput);
        if (nextInput === dynamicPin) {
          setState(prev => {
            const next = { ...prev, role: 'admin' as const };
            saveRole('admin');
            return next;
          });
          setIsPinModalOpen(false);
          setPinInput('');
          setPinError(false);
          refreshDynamicPin();
          showToast(state.settings.language === 'bn' ? 'এডমিন হিসেবে সফলভাবে লগইন করেছেন 👑' : 'Welcome Administrator 👑');
        } else if (nextInput.length === 5) {
          // Auto-change PIN after 5 digits entered incorrectly
          setTimeout(() => {
            refreshDynamicPin();
            setPinInput('');
            setPinError(true);
            showToast(state.settings.language === 'bn' ? '❌ পিন মিলেনি! নতুন ৫ ডিজিটের পিন দেওয়া হলো।' : '❌ PIN mismatch! Generated new 5-digit PIN.');
          }, 150);
        }
      }
    }
  };

  const handleSelectStaffUser = (staffId: string) => {
    setState(prev => {
      const next = { ...prev, currentUserId: staffId };
      saveCurrentUser(staffId);
      return next;
    });
    const staff = state.staffList.find(s => s.id === staffId);
    showToast(`Current Viewer: ${staff?.name || 'Staff'}`);
  };

  // Attendance Handlers
  const handleMarkAttendance = (
    staffId: string, 
    status: AttendanceStatus, 
    checkIn?: string, 
    checkOut?: string, 
    note?: string
  ) => {
    const today = state.selectedDate;
    setState(prev => {
      const existingIndex = prev.attendanceRecords.findIndex(
        r => r.staffId === staffId && r.date === today
      );

      const staff = prev.staffList.find(s => s.id === staffId);
      const newRecord = {
        id: existingIndex >= 0 ? prev.attendanceRecords[existingIndex].id : `att-${Date.now()}-${staffId}`,
        staffId,
        date: today,
        status,
        checkInTime: checkIn !== undefined ? checkIn : (existingIndex >= 0 ? prev.attendanceRecords[existingIndex].checkInTime : getCurrentTimeString()),
        checkOutTime: checkOut !== undefined ? checkOut : (existingIndex >= 0 ? prev.attendanceRecords[existingIndex].checkOutTime : ''),
        note: note !== undefined ? note : (existingIndex >= 0 ? prev.attendanceRecords[existingIndex].note : ''),
        markedAt: new Date().toISOString()
      };

      let updatedRecords = [...prev.attendanceRecords];
      if (existingIndex >= 0) {
        updatedRecords[existingIndex] = newRecord;
      } else {
        updatedRecords.unshift(newRecord);
      }

      saveAttendanceRecords(updatedRecords);
      return { ...prev, attendanceRecords: updatedRecords };
    });

    const staff = state.staffList.find(s => s.id === staffId);
    const statusText = status === 'present' ? 'Present' : status === 'late' ? 'Late' : status === 'leave' ? 'Leave' : 'Absent';
    showToast(`${staff?.name || 'Staff'} attendance (${statusText}) saved`);
  };

  // Bulk mark present
  const handleBulkMarkPresent = () => {
    const today = state.selectedDate;
    const currentTime = getCurrentTimeString();

    setState(prev => {
      const activeStaff = prev.staffList.filter(
        s => s.isActive
      );

      let updatedRecords = [...prev.attendanceRecords];

      activeStaff.forEach(st => {
        const idx = updatedRecords.findIndex(r => r.staffId === st.id && r.date === today);
        if (idx < 0) {
          updatedRecords.push({
            id: `att-${Date.now()}-${st.id}`,
            staffId: st.id,
            date: today,
            status: 'present',
            checkInTime: currentTime,
            checkOutTime: '',
            note: 'Attendance completed with one click',
            markedAt: new Date().toISOString()
          });
        }
      });

      saveAttendanceRecords(updatedRecords);
      return { ...prev, attendanceRecords: updatedRecords };
    });

    showToast('Everyone marked present ✅');
  };

  // Helper: check if staff member is checked in today
  const isStaffCheckedInToday = (staffId?: string) => {
    if (state.role !== 'staff') return true;
    const targetId = staffId || state.currentUserId;
    const todayRec = state.attendanceRecords.find(
      r => r.staffId === targetId && r.date === state.selectedDate
    );
    return Boolean(todayRec && (todayRec.status === 'present' || todayRec.status === 'late'));
  };

  // Tasks Handlers
  const handleAddTask = (newTaskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    if (state.role === 'staff' && !isStaffCheckedInToday()) {
      showToast(state.settings.language === 'bn' 
        ? 'টাস্ক নিয়ে কাজ করার পূর্বে অবশ্যই চেক-ইন (Check-in) করতে হবে! 🔒' 
        : 'You must check-in (Check-in) first before working on tasks! 🔒');
      return;
    }

    const newTask: TaskItem = {
      ...newTaskData,
      status: 'pending', // প্রত্যেক টা new task প্রথমে পেন্ডিং অবস্থায় থাকবে
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      const nextTasks = [newTask, ...prev.tasks];
      saveTasks(nextTasks);
      return { ...prev, tasks: nextTasks };
    });

    showToast('New tasks successfully assigned ✅');
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (state.role === 'staff' && !isStaffCheckedInToday()) {
      showToast(state.settings.language === 'bn' 
        ? 'টাস্ক নিয়ে কাজ করার পূর্বে অবশ্যই চেক-ইন (Check-in) করতে হবে! 🔒' 
        : 'You must check-in (Check-in) first before working on tasks! 🔒');
      return;
    }

    setState(prev => {
      const nextTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completedAt: status === 'complete' ? new Date().toISOString() : undefined
          };
        }
        return t;
      });

      saveTasks(nextTasks);
      return { ...prev, tasks: nextTasks };
    });

    showToast(`Task status updated`);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    if (state.role === 'staff' && !isStaffCheckedInToday()) {
      showToast(state.settings.language === 'bn' 
        ? 'সাব-টাস্কে কাজ করার পূর্বে অবশ্যই চেক-ইন (Check-in) করতে হবে! 🔒' 
        : 'You must check-in (Check-in) first before working on subtasks! 🔒');
      return;
    }

    setState(prev => {
      const nextTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map(st => {
            if (st.id === subtaskId) {
              return { ...st, completed: !st.completed };
            }
            return st;
          });
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      });

      saveTasks(nextTasks);
      return { ...prev, tasks: nextTasks };
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (state.role === 'staff') {
      showToast('Staff members are not permitted to delete tasks! ❌');
      return;
    }

    const taskToDelete = state.tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const deletedItem: DeletedItem = {
      id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      originalId: taskToDelete.id,
      type: 'task',
      name: taskToDelete.title,
      details: `${taskToDelete.category || 'General'} • ${taskToDelete.description || ''}`,
      deletedAt: new Date().toISOString(),
      itemData: taskToDelete
    };

    setState(prev => {
      const nextTasks = prev.tasks.filter(t => t.id !== taskId);
      const nextRecycle = [deletedItem, ...(prev.recycleBin || [])];
      saveTasks(nextTasks);
      saveRecycleBin(nextRecycle);
      return { ...prev, tasks: nextTasks, recycleBin: nextRecycle };
    });
    showToast('Task moved to Recycle Bin 🗑️');
  };

  const handleEditTask = (updatedTask: TaskItem) => {
    if (state.role !== 'admin') {
      showToast('Only Admin is permitted to edit tasks! ❌');
      return;
    }

    setState(prev => {
      const nextTasks = prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      saveTasks(nextTasks);
      return { ...prev, tasks: nextTasks };
    });

    showToast('Task successfully updated ✅');
  };

  const handleUpdateTaskFeedback = (taskId: string, feedback: string) => {
    if (state.role === 'staff' && !isStaffCheckedInToday()) {
      showToast(state.settings.language === 'bn' 
        ? 'ফিডব্যাক দেওয়ার পূর্বে অবশ্যই চেক-ইন (Check-in) করতে হবে! 🔒' 
        : 'You must check-in (Check-in) first before submitting feedback! 🔒');
      return;
    }

    setState(prev => {
      const nextTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, feedback };
        }
        return t;
      });
      saveTasks(nextTasks);
      return { ...prev, tasks: nextTasks };
    });
    showToast('Task feedback saved ✅');
  };

  // Directives Handlers
  const handleAddDirective = (newDirectiveData: Omit<Directive, 'id' | 'createdAt' | 'acknowledgedStaffIds'>) => {
    const newDirective: Directive = {
      ...newDirectiveData,
      id: `dir-${Date.now()}`,
      createdAt: getTodayDateString(),
      acknowledgedStaffIds: [state.currentUserId]
    };

    setState(prev => {
      const nextDirectives = [newDirective, ...prev.directives];
      saveDirectives(nextDirectives);
      return { ...prev, directives: nextDirectives };
    });

    showToast('New directive posted ✅');
  };

  const handleAcknowledgeDirective = (directiveId: string, staffId: string) => {
    setState(prev => {
      const nextDirectives = prev.directives.map(d => {
        if (d.id === directiveId) {
          const hasAck = d.acknowledgedStaffIds.includes(staffId);
          const nextAck = hasAck 
            ? d.acknowledgedStaffIds.filter(id => id !== staffId)
            : [...d.acknowledgedStaffIds, staffId];
          return { ...d, acknowledgedStaffIds: nextAck };
        }
        return d;
      });

      saveDirectives(nextDirectives);
      return { ...prev, directives: nextDirectives };
    });

    showToast('Directive acknowledgement updated');
  };

  const handleToggleChecklistItem = (directiveId: string, itemId: string) => {
    setState(prev => {
      const nextDirectives = prev.directives.map(d => {
        if (d.id === directiveId && d.checklist) {
          const nextChecklist = d.checklist.map(c => {
            if (c.id === itemId) {
              return { ...c, isDone: !c.isDone };
            }
            return c;
          });
          return { ...d, checklist: nextChecklist };
        }
        return d;
      });

      saveDirectives(nextDirectives);
      return { ...prev, directives: nextDirectives };
    });
  };

  const handleTogglePinDirective = (directiveId: string) => {
    setState(prev => {
      const nextDirectives = prev.directives.map(d => {
        if (d.id === directiveId) {
          return { ...d, isPinned: !d.isPinned };
        }
        return d;
      });

      saveDirectives(nextDirectives);
      return { ...prev, directives: nextDirectives };
    });
  };

  const handleUpdateDirectiveStatus = (directiveId: string, status: TaskStatus) => {
    setState(prev => {
      const nextDirectives = prev.directives.map(d => {
        if (d.id === directiveId) {
          return { ...d, status };
        }
        return d;
      });

      saveDirectives(nextDirectives);
      return { ...prev, directives: nextDirectives };
    });
    showToast(`Directive status: ${status.toUpperCase()}`);
  };

  // Staff Handlers
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id' | 'isActive'> & { customId?: string }) => {
    const { customId, ...rest } = newStaffData;
    const newStaff: StaffMember = {
      ...rest,
      id: customId?.trim() ? customId.trim() : `staff-${Date.now()}`,
      isActive: true
    };

    setState(prev => {
      const nextStaff = [...prev.staffList, newStaff];
      saveStaffList(nextStaff);
      return { ...prev, staffList: nextStaff };
    });

    showToast(`${newStaff.name} successfully registered ✅`);
  };

  const handleUpdateStaff = (oldId: string, updatedStaff: StaffMember) => {
    setState(prev => {
      // 1. Update staff list
      const nextStaff = prev.staffList.map(s => s.id === oldId ? updatedStaff : s);
      saveStaffList(nextStaff);

      // 2. Setup next state starting with next staff list
      const nextState = { ...prev, staffList: nextStaff };

      // 3. If ID changed, cascade updates to all references
      if (oldId !== updatedStaff.id) {
        // Update currentUserId
        if (prev.currentUserId === oldId) {
          nextState.currentUserId = updatedStaff.id;
          saveCurrentUser(updatedStaff.id);
        }

        // Update attendance records
        const nextAttendance = prev.attendanceRecords.map(r => 
          r.staffId === oldId ? { ...r, staffId: updatedStaff.id } : r
        );
        saveAttendanceRecords(nextAttendance);
        nextState.attendanceRecords = nextAttendance;

        // Update tasks
        const nextTasks = prev.tasks.map(t => 
          t.assignedStaffId === oldId ? { ...t, assignedStaffId: updatedStaff.id } : t
        );
        saveTasks(nextTasks);
        nextState.tasks = nextTasks;

        // Update instructions in HubData
        const nextInstructions = (prev.hubData.instructions || []).map(inst => 
          inst.assignedStaffId === oldId ? { ...inst, assignedStaffId: updatedStaff.id } : inst
        );
        // Update emergencies in HubData
        const nextEmergencies = (prev.hubData.emergencies || []).map(eme => 
          eme.assignedStaffId === oldId ? { ...eme, assignedStaffId: updatedStaff.id } : eme
        );
        const nextHubData = {
          ...prev.hubData,
          instructions: nextInstructions,
          emergencies: nextEmergencies
        };
        saveHubData(nextHubData);
        nextState.hubData = nextHubData;
      }

      return nextState;
    });
    showToast(`${updatedStaff.name} details successfully updated ✅`);
  };

  const handleDeleteStaff = (staffId: string) => {
    const staffToDelete = state.staffList.find(s => s.id === staffId);
    if (!staffToDelete) return;

    const deletedItem: DeletedItem = {
      id: `del-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      originalId: staffToDelete.id,
      type: 'staff',
      name: staffToDelete.name,
      details: `${staffToDelete.role || ''} • ${staffToDelete.department || ''}`,
      deletedAt: new Date().toISOString(),
      itemData: staffToDelete
    };

    setState(prev => {
      const nextStaff = prev.staffList.filter(s => s.id !== staffId);
      saveStaffList(nextStaff);
      
      // If we deleted the currently active user, select the first remaining staff or empty
      let nextCurrentUser = prev.currentUserId;
      if (prev.currentUserId === staffId) {
        nextCurrentUser = nextStaff.length > 0 ? nextStaff[0].id : '';
        saveCurrentUser(nextCurrentUser);
      }

      const nextRecycle = [deletedItem, ...(prev.recycleBin || [])];
      saveRecycleBin(nextRecycle);
      
      return { 
        ...prev, 
        staffList: nextStaff,
        currentUserId: nextCurrentUser,
        recycleBin: nextRecycle
      };
    });
    showToast('Staff profile moved to Recycle Bin 🗑️');
  };

  // Recycle Bin Handlers
  const handleRestoreItem = (item: DeletedItem) => {
    setState(prev => {
      const nextRecycle = (prev.recycleBin || []).filter(i => i.id !== item.id);
      saveRecycleBin(nextRecycle);

      if (item.type === 'task') {
        const restoredTask: TaskItem = item.itemData;
        const exists = prev.tasks.some(t => t.id === restoredTask.id);
        const nextTasks = exists ? prev.tasks : [restoredTask, ...prev.tasks];
        saveTasks(nextTasks);
        return { ...prev, tasks: nextTasks, recycleBin: nextRecycle };
      } else if (item.type === 'staff') {
        const restoredStaff: StaffMember = item.itemData;
        const exists = prev.staffList.some(s => s.id === restoredStaff.id);
        const nextStaff = exists ? prev.staffList : [...prev.staffList, restoredStaff];
        saveStaffList(nextStaff);
        return { ...prev, staffList: nextStaff, recycleBin: nextRecycle };
      }

      return { ...prev, recycleBin: nextRecycle };
    });
    showToast('Item successfully restored ✅');
  };

  const handlePermanentlyDeleteItem = (itemId: string) => {
    setState(prev => {
      const nextRecycle = (prev.recycleBin || []).filter(i => i.id !== itemId);
      saveRecycleBin(nextRecycle);
      return { ...prev, recycleBin: nextRecycle };
    });
    showToast('Item permanently erased ❌');
  };

  const handleClearRecycleBin = () => {
    setState(prev => {
      saveRecycleBin([]);
      return { ...prev, recycleBin: [] };
    });
    showToast('Recycle Bin emptied 🗑️');
  };

  const handleToggleStaffActive = (staffId: string) => {
    setState(prev => {
      let isNowActive = false;
      const nextStaff = prev.staffList.map(s => {
        if (s.id === staffId) {
          isNowActive = !s.isActive;
          return { ...s, isActive: isNowActive };
        }
        return s;
      });
      saveStaffList(nextStaff);
      return { ...prev, staffList: nextStaff };
    });
    const staff = state.staffList.find(s => s.id === staffId);
    showToast(`${staff?.name || 'Staff'} status updated`);
  };

  // Data Restore Handler
  const handleRestoreData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.staffList && parsed.attendanceRecords && parsed.directives && parsed.tasks) {
        saveStaffList(parsed.staffList);
        saveAttendanceRecords(parsed.attendanceRecords);
        saveDirectives(parsed.directives);
        saveTasks(parsed.tasks);
        setState(prev => ({
          ...prev,
          staffList: parsed.staffList,
          attendanceRecords: parsed.attendanceRecords,
          directives: parsed.directives,
          tasks: parsed.tasks
        }));
        showToast('Data successfully restored! ✅');
      } else {
        alert('Invalid backup file format.');
      }
    } catch (e) {
      alert('Failed to parse JSON. Provide valid file or code.');
    }
  };

  // Apply light/dark theme class to HTML and body elements for complete CSS theme adaptation
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (state.settings.theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      body.classList.remove('dark');
      body.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      body.classList.remove('light');
      body.classList.add('dark');
    }
  }, [state.settings.theme]);

  // Counts for badge notifications
  const pendingTasksCount = state.tasks.filter(t => t.status !== 'complete').length;
  const urgentDirectivesCount = state.directives.filter(d => d.priority === 'urgent').length;
  const unmarkedAttendanceCount = Math.max(
    0,
    state.staffList.filter(s => s.isActive).length - state.attendanceRecords.filter(r => r.date === state.selectedDate).length
  );

  if (!isLoggedIn) {
    return (
      <LoginView
        state={state}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200 ${
      state.settings.theme === 'dark' 
        ? 'dark bg-[#031b33] bg-gradient-to-b from-[#021528] via-[#041f3b] to-[#021324] text-slate-100' 
        : 'light bg-sky-50 text-gray-900'
    }`}>
      
      {/* Top Header */}
      <Header
        state={state}
        cloudStatus={firebaseStatus}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => handleOpenSettings('settings')}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onGoHome={() => setActiveTab('home')}
        onOpenProfile={() => handleOpenStaffProfile(state.currentUserId)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onSelectStaffUser={handleSelectStaffUser}
        onLogout={handleLogout}
      />

      {/* Dynamic Role & Mode Switcher Bar (স্টাফ ও এডমিন প্যানেল সুইচার) - Only displayed when activeTab is 'menu' */}
      {activeTab === 'menu' && (
        <div className="bg-[#031d36] border-b border-sky-900/40 py-2.5 px-4 w-full">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            
            {/* Left Side: Mode badge and Acting user */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-300">Workspace Mode:</span>
              <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wide flex items-center gap-1 ${
                state.role === 'admin' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <span>{
                  state.role === 'admin' ? '👑 Admin Panel (ম্যানেজমেন্ট)' : 
                  '🧑‍💼 Staff Portal (স্টাফ)'
                }</span>
              </span>

              {state.role !== 'admin' && (
                <div className="flex items-center gap-1.5 bg-gray-950/80 px-2.5 py-1 rounded-xl border border-gray-800 shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold">Acting Staff:</span>
                  <select
                    value={state.currentUserId}
                    onChange={(e) => handleSelectStaffUser(e.target.value)}
                    className="bg-transparent text-xs font-black text-sky-300 focus:outline-none cursor-pointer border-none p-0 outline-none"
                  >
                    {state.staffList.map(st => (
                      <option key={st.id} value={st.id} className="bg-gray-900 text-white font-bold">
                        {st.name} ({st.department})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Side: Quick Role Switches */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-semibold hidden lg:inline">Quick Mode Switch:</span>
              <div className="flex bg-gray-950 p-0.5 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1 transition-all ${
                    state.role === 'admin'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>👑 Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('staff')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1 transition-all ${
                    state.role === 'staff'
                      ? 'bg-amber-500 text-gray-950 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <span>🧑‍💼 Staff</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Tab Navigation for Desktop & Mobile */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingTasksCount={pendingTasksCount}
        urgentDirectivesCount={urgentDirectivesCount}
        unmarkedAttendanceCount={unmarkedAttendanceCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 sm:pt-6">
        
        {(activeTab === 'home' || activeTab === 'dashboard') && (
          <DashboardView
            state={state}
            onNavigateTab={setActiveTab}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewDirective={() => setIsNewDirectiveOpen(true)}
            onMarkAttendance={handleMarkAttendance}
            onToggleTaskStatus={(taskId) => {
              const task = state.tasks.find(t => t.id === taskId);
              if (task) {
                handleUpdateTaskStatus(taskId, task.status === 'complete' ? 'pending' : 'complete');
              }
            }}
            onAcknowledgeDirective={handleAcknowledgeDirective}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            state={state}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onToggleSubtask={handleToggleSubtask}
            onDeleteTask={handleDeleteTask}
            onEditTask={handleEditTask}
            onUpdateTaskFeedback={handleUpdateTaskFeedback}
            onMarkAttendance={handleMarkAttendance}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'admin_dashboard' && (
          <AdminDashboardView
            state={state}
            onNavigateTab={setActiveTab}
            onRoleChange={handleRoleChange}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewStaff={() => setIsNewStaffOpen(true)}
            onOpenNewDirective={() => setIsNewDirectiveOpen(true)}
          />
        )}

        {activeTab === 'hub' && (
          <HubView
            state={state}
            showToast={showToast}
            onNavigateTab={setActiveTab}
            onUpdateHubData={handleUpdateHubData}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />
        )}

        {activeTab === 'hub_management' && (
          <HubManagementView
            state={state}
            onUpdateHubData={handleUpdateHubData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'report' && (
          <ReportsView
            state={state}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onRestoreData={handleRestoreData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            state={state}
            onNavigateTab={setActiveTab}
            onOpenNewStaff={() => setIsNewStaffOpen(true)}
            onOpenNewTask={() => setIsNewTaskOpen(true)}
            onOpenNewDirective={() => setIsNewDirectiveOpen(true)}
            onOpenReports={() => setActiveTab('report')}
            onOpenSettings={handleOpenSettings}
            onUpdateSettings={handleUpdateSettings}
            onOpenRecycleBin={() => setIsRecycleBinOpen(true)}
            onOpenDataCenter={() => setIsDataCenterOpen(true)}
            onOpenStaffProfile={handleOpenStaffProfile}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            state={state}
            onMarkAttendance={handleMarkAttendance}
            onBulkMarkPresent={handleBulkMarkPresent}
            onOpenNewStaff={() => setIsNewStaffOpen(true)}
            onOpenReports={() => setActiveTab('report')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'directives' && (
          <DirectivesView
            state={state}
            onOpenNewDirective={() => setIsNewDirectiveOpen(true)}
            onAcknowledgeDirective={handleAcknowledgeDirective}
            onToggleChecklistItem={handleToggleChecklistItem}
            onTogglePinDirective={handleTogglePinDirective}
            onUpdateDirectiveStatus={handleUpdateDirectiveStatus}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'staff' && (
          <StaffDirectoryView
            state={state}
            onOpenNewStaff={() => setIsNewStaffOpen(true)}
            onSelectStaffUser={handleSelectStaffUser}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            onToggleStaffActive={handleToggleStaffActive}
            onNavigateTab={setActiveTab}
            onOpenStaffProfile={handleOpenStaffProfile}
          />
        )}

      </main>

      {/* Interactive Modals */}
      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        staffList={state.staffList}
        onAddTask={handleAddTask}
      />

      <NewDirectiveModal
        isOpen={isNewDirectiveOpen}
        onClose={() => setIsNewDirectiveOpen(false)}
        onAddDirective={handleAddDirective}
      />

      <NewStaffModal
        isOpen={isNewStaffOpen}
        onClose={() => setIsNewStaffOpen(false)}
        onAddStaff={handleAddStaff}
        existingStaffList={state.staffList}
        isBn={state.settings.language === 'bn'}
      />

      <ReportsModal
        isOpen={isReportsOpen}
        onClose={() => setIsReportsOpen(false)}
        state={state}
        onRestoreData={handleRestoreData}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        state={state}
        onNavigateTab={setActiveTab}
        onAcknowledgeDirective={handleAcknowledgeDirective}
        onMarkAttendance={handleMarkAttendance}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onUpdateSettings={handleUpdateSettings}
        state={state}
        initialTab={settingsInitialTab}
      />

      <RecycleBinModal
        isOpen={isRecycleBinOpen}
        onClose={() => setIsRecycleBinOpen(false)}
        state={state}
        onRestoreItem={handleRestoreItem}
        onPermanentlyDeleteItem={handlePermanentlyDeleteItem}
        onClearRecycleBin={handleClearRecycleBin}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <DataCenterModal
        isOpen={isDataCenterOpen}
        onClose={() => setIsDataCenterOpen(false)}
        state={state}
        onRestoreData={handleRestoreData}
      />

      <ProfileDetailModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        staff={state.staffList.find(s => s.id === (selectedProfileStaffId || state.currentUserId)) || state.staffList[0]}
        state={state}
        onSelectStaffUser={handleSelectStaffUser}
        onUpdateStaff={(oldId, updatedStaff) => {
          handleUpdateStaff(oldId, updatedStaff);
          setSelectedProfileStaffId(updatedStaff.id);
        }}
        onUpdateStaffGoogleAuth={handleUpdateStaffGoogleAuth}
        showToast={showToast}
      />

      {/* Dilkhoosh AI Smart Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        state={state}
      />

      {/* Floating AI Assistant Quick Trigger (Bottom-Right floating pill) */}
      <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40">
        <button
          type="button"
          id="floating-ai-assistant-btn"
          onClick={() => setIsAiAssistantOpen(true)}
          className="p-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-2xl shadow-purple-950/80 border border-purple-300/40 hover:border-purple-200 transition-all hover:scale-105 active:scale-95 group flex items-center gap-2 cursor-pointer"
          title={state.settings.language === 'bn' ? 'দিলখুশ এআই সহকারী - প্রশ্ন করুন' : 'Dilkhoosh AI Assistant - Ask Question'}
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <span className="text-xs font-black hidden sm:inline-block pr-1 tracking-wide">
            {state.settings.language === 'bn' ? 'এআই সহকারী' : 'AI Assistant'}
          </span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 sm:top-24 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-950/40 flex items-center gap-2 border border-emerald-400/40 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ================= ADMIN PIN LOCK MODAL WITH DYNAMIC 5-DIGIT PIN ================= */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#031d36] border-2 border-amber-500/40 rounded-3xl w-full max-w-sm shadow-2xl shadow-black/90 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-[#021528]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>👑 {state.settings.language === 'bn' ? 'এডমিন অ্যাক্সেস সিকিউরিটি' : 'Admin Security Access'}</span>
                  </h3>
                  <p className="text-[9px] text-amber-400/90 uppercase tracking-widest font-bold">
                    {state.settings.language === 'bn' ? '৫ ডিজিটের ডাইনামিক পিন সিস্টেম' : '5-Digit Dynamic PIN System'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setPinInput('');
                  setPinError(false);
                }}
                className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-center">
              
              {/* Dynamic 5-Digit PIN Display Card */}
              <div className="bg-gradient-to-b from-gray-950 via-[#021528] to-gray-950 p-4 rounded-2xl border border-amber-500/40 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {state.settings.language === 'bn' ? 'নিরাপত্তা পিন কোড:' : 'Security PIN Code:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      refreshDynamicPin();
                      setPinInput('');
                      setPinError(false);
                      showToast(state.settings.language === 'bn' ? 'নতুন ৫ ডিজিটের পিন জেনারেট হয়েছে 🔄' : 'Generated new 5-digit PIN 🔄');
                    }}
                    className="p-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Generate New PIN"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{state.settings.language === 'bn' ? 'নতুন পিন' : 'Refresh'}</span>
                  </button>
                </div>

                {/* 5-Digit Display Boxes */}
                <div className="flex justify-center items-center gap-2 py-1">
                  {dynamicPin.split('').map((digit, idx) => (
                    <div 
                      key={idx}
                      className="w-10 h-12 bg-amber-500/20 border-2 border-amber-400 rounded-xl flex items-center justify-center text-amber-300 font-mono font-black text-2xl shadow-lg shadow-amber-950/60 transform hover:scale-105 transition-transform"
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-300 leading-tight font-medium">
                  {state.settings.language === 'bn' 
                    ? 'লগইন করতে উপরে প্রদর্শিত এই ৫ ডিজিটের পিন কোডটি টাইপ করুন। প্রতিটি চেষ্টার পর এটি নতুন একটি পিনে পরিবর্তিত হবে।' 
                    : 'Type this 5-digit PIN code to log in. It automatically changes after every attempt.'}
                </p>
              </div>

              {/* User 5-Digit PIN Input Display */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-sky-400 font-bold uppercase tracking-wider text-left ml-1">
                  {state.settings.language === 'bn' ? 'আপনার পিন কোড ইনপুট (৫ ডিজিট):' : 'Type 5-Digit PIN:'}
                </p>
                <div className="flex justify-center gap-2">
                  {[...Array(5)].map((_, i) => {
                    const hasValue = pinInput.length > i;
                    const char = hasValue ? pinInput[i] : '';
                    return (
                      <div
                        key={i}
                        className={`w-11 h-12 rounded-xl flex items-center justify-center font-mono font-black text-xl border-2 transition-all ${
                          pinError
                            ? 'bg-rose-950/40 border-rose-500 text-rose-400 animate-bounce'
                            : hasValue
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-950/50'
                              : 'bg-gray-950 border-gray-800 text-gray-600'
                        }`}
                      >
                        {char || '•'}
                      </div>
                    );
                  })}
                </div>
              </div>

              {pinError && (
                <div className="text-xs text-rose-300 font-bold bg-rose-950/60 py-2 px-3 rounded-xl border border-rose-500/50 animate-in fade-in duration-200">
                  {state.settings.language === 'bn'
                    ? '❌ পিন কোড মিলেনি! স্বয়ংক্রিয়ভাবে নতুন ৫ ডিজিটের পিন জেনারেট করা হয়েছে।'
                    : '❌ Incorrect PIN! A new 5-digit PIN has been generated automatically.'}
                </div>
              )}

              {/* Numeric Pad */}
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 bg-gray-950 hover:bg-gray-850 active:bg-gray-800 text-white font-bold text-base rounded-xl border border-gray-800 active:scale-95 transition-all shadow-sm"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('clear')}
                  className="h-11 bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 font-black text-xs rounded-xl border border-rose-800/50 active:scale-95 transition-all uppercase"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-11 bg-gray-950 hover:bg-gray-850 active:bg-gray-800 text-white font-bold text-base rounded-xl border border-gray-800 active:scale-95 transition-all shadow-sm"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-11 bg-gray-950 hover:bg-gray-850 active:bg-gray-800 text-gray-300 font-bold text-xs rounded-xl border border-gray-800 active:scale-95 transition-all"
                >
                  ⌫
                </button>
              </div>

              {/* Direct Keyboard Entry Form */}
              <form onSubmit={handleVerifyPinSubmit} className="pt-2 border-t border-gray-800/80 space-y-2">
                <input
                  type="password"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder={state.settings.language === 'bn' ? 'এখানে ৫ ডিজিট পিন টাইপ করুন...' : 'Type 5-digit PIN here...'}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 5) {
                      setPinInput(val);
                      setPinError(false);
                      if (val === dynamicPin) {
                        setState(prev => {
                          const next = { ...prev, role: 'admin' as const };
                          saveRole('admin');
                          return next;
                        });
                        setIsPinModalOpen(false);
                        setPinInput('');
                        setPinError(false);
                        refreshDynamicPin();
                        showToast(state.settings.language === 'bn' ? 'এডমিন হিসেবে সফলভাবে লগইন করেছেন 👑' : 'Welcome Administrator 👑');
                      } else if (val.length === 5) {
                        setTimeout(() => {
                          refreshDynamicPin();
                          setPinInput('');
                          setPinError(true);
                          showToast(
                            state.settings.language === 'bn'
                              ? '❌ পিন কোড মিলছে না! স্বয়ংক্রিয়ভাবে নতুন পিন জেনারেট করা হয়েছে।'
                              : '❌ PIN mismatch! Generated new 5-digit PIN.'
                          );
                        }, 150);
                      }
                    }
                  }}
                  className="w-full text-center bg-gray-950 text-emerald-400 font-mono font-bold text-sm py-2.5 rounded-xl border border-gray-800 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-gray-600 placeholder:font-sans"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-950/50 uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{state.settings.language === 'bn' ? 'লগইন নিশ্চিত করুন' : 'Confirm & Login'}</span>
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

      {/* Forced Staff Selection Overlay */}
      {state.role === 'staff' && (state.currentUserId === 'admin' || state.currentUserId === '' || !state.staffList.some(s => s.id === state.currentUserId && s.isActive && s.id !== 'admin')) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#010912]/98 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#041a30] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <UserCheck className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {state.settings.language === 'bn' ? 'আপনার নাম নির্বাচন করুন' : 'Identify Yourself'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                {state.settings.language === 'bn' 
                  ? 'স্টাফ পোর্টাল অ্যাক্সেস করতে ড্রপডাউন থেকে অবশ্যই আপনার নিজের নামটি সিলেক্ট করতে হবে।' 
                  : 'You must select your own name from the list below to proceed in Staff Portal mode.'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-950/80 p-3 rounded-2xl border border-gray-850">
                <label className="block text-[10px] text-sky-400 font-black uppercase tracking-wider text-left mb-1.5 ml-1">
                  {state.settings.language === 'bn' ? 'স্টাফ মেম্বার সিলেক্ট করুন *' : 'Select Staff Member *'}
                </label>
                <select
                  id="forced-staff-select"
                  value={state.currentUserId === 'admin' ? '' : state.currentUserId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      handleSelectStaffUser(val);
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer p-1.5 border-none outline-none"
                >
                  <option value="" className="bg-gray-900 text-gray-500 font-bold">
                    {state.settings.language === 'bn' ? '-- এখানে ক্লিক করে আপনার নাম খুঁজুন --' : '-- Click here to select your name --'}
                  </option>
                  {state.staffList.filter(s => s.isActive && s.id !== 'admin').map(st => (
                    <option key={st.id} value={st.id} className="bg-gray-900 text-white font-bold">
                      {st.name} ({st.department})
                    </option>
                  ))}
                </select>
              </div>

              {state.staffList.filter(s => s.isActive && s.id !== 'admin').length === 0 && (
                <p className="text-[11px] text-rose-400 font-bold bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                  {state.settings.language === 'bn' 
                    ? '⚠️ কোনো একটিভ স্টাফ মেম্বার পাওয়া যায়নি! অনুগ্রহ করে এডমিন প্যানেলে ফিরে স্টাফ মেম্বার যোগ করুন।' 
                    : '⚠️ No active staff members found! Please switch back to Admin to add staff members.'}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                id="forced-staff-confirm-btn"
                onClick={() => {
                  const selectEl = document.getElementById('forced-staff-select') as HTMLSelectElement | null;
                  if (selectEl && selectEl.value) {
                    handleSelectStaffUser(selectEl.value);
                  } else {
                    alert(state.settings.language === 'bn' ? 'অনুগ্রহ করে ড্রপডাউন থেকে আপনার নিজের নাম সিলেক্ট করুন!' : 'Please select your name from the dropdown first!');
                  }
                }}
                disabled={state.currentUserId === 'admin' || state.currentUserId === '' || !state.staffList.some(s => s.id === state.currentUserId)}
                className={`w-full py-3 px-5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-lg uppercase transition-all flex items-center justify-center gap-2 ${
                  state.currentUserId !== 'admin' && state.currentUserId !== '' && state.staffList.some(s => s.id === state.currentUserId)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60 active:scale-95 cursor-pointer'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                }`}
              >
                <CheckCircle2 className="w-4.5 h-4.5" />
                <span>{state.settings.language === 'bn' ? 'কার্যক্রম শুরু করুন' : 'Confirm & Proceed'}</span>
              </button>

              <button
                type="button"
                id="forced-staff-back-admin-btn"
                onClick={() => {
                  handleRoleChange('admin');
                }}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>👑 {state.settings.language === 'bn' ? 'এডমিন প্যানেলে ফিরুন' : 'Back to Admin Panel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
