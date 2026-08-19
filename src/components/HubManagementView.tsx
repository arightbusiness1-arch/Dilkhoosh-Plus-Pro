import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Layers, 
  AlertCircle, 
  CheckCircle2, 
  Phone, 
  Clock, 
  BookOpen,
  User,
  Lightbulb,
  Brain,
  Wrench,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { AppState, AppTab, HubData, HubReminder, HubEmergency, HubIdea, HubActionItem } from '../types';
import { EmergencyIcon } from './EmergencyIcon';
import { ClockTimePicker } from './ClockTimePicker';

interface HubManagementViewProps {
  state: AppState;
  onUpdateHubData: (newHubData: HubData) => void;
  onNavigateTab: (tab: AppTab) => void;
}

type ManagementTab = 'instructions' | 'reminders' | 'emergencies' | 'ideas' | 'actions';

export const HubManagementView: React.FC<HubManagementViewProps> = ({
  state,
  onUpdateHubData,
  onNavigateTab
}) => {
  const isBn = state.settings.language === 'bn';
  const [activeTab, setActiveTab] = useState<ManagementTab>('instructions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Special Instructions Local States
  const [newInstruction, setNewInstruction] = useState('');
  const [newInstructionStaffId, setNewInstructionStaffId] = useState('');
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null);
  const [editingInstructionText, setEditingInstructionText] = useState('');
  const [editingInstructionStaffId, setEditingInstructionStaffId] = useState('');

  // Reminders Local States
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderStatus, setReminderStatus] = useState<'active' | 'coming'>('active');
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // Reminders Clock Picker States
  const [clockHour, setClockHour] = useState('09');
  const [clockMinute, setClockMinute] = useState('00');
  const [clockPeriod, setClockPeriod] = useState<'AM' | 'PM'>('AM');
  const [clockFrequency, setClockFrequency] = useState<'none' | 'daily' | 'weekly'>('daily');
  const [showClockDial, setShowClockDial] = useState(true);

  const applyClockTime = (h: string, m: string, p: 'AM' | 'PM', freq: 'none' | 'daily' | 'weekly') => {
    setClockHour(h);
    setClockMinute(m);
    setClockPeriod(p);
    setClockFrequency(freq);

    const formattedTime = `${h}:${m} ${p}`;
    let fullSchedule = formattedTime;
    if (freq === 'daily') {
      fullSchedule = isBn ? `প্রতিদিন ${formattedTime}` : `Daily at ${formattedTime}`;
    } else if (freq === 'weekly') {
      fullSchedule = isBn ? `সাপ্তাহিক ${formattedTime}` : `Weekly at ${formattedTime}`;
    }
    setReminderTime(fullSchedule);
  };

  const handleSyncCurrentTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = String(hours).padStart(2, '0');
    applyClockTime(hourStr, minutes, ampm, clockFrequency);
    showToast(isBn ? 'বর্তমান সময় সেট করা হয়েছে ⏰' : 'Current time set ⏰');
  };

  const handleNativeTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // e.g. "16:45"
    if (!val) return;
    const [hStr, mStr] = val.split(':');
    let hNum = parseInt(hStr, 10);
    const p: 'AM' | 'PM' = hNum >= 12 ? 'PM' : 'AM';
    hNum = hNum % 12;
    hNum = hNum ? hNum : 12;
    const hourFormatted = String(hNum).padStart(2, '0');
    applyClockTime(hourFormatted, mStr, p, clockFrequency);
  };

  // Emergencies Local States
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyStatus, setEmergencyStatus] = useState('Active');
  const [emergencyType, setEmergencyType] = useState<'task' | 'contact'>('contact');
  const [emergencyDescription, setEmergencyDescription] = useState('');
  const [emergencyStaffId, setEmergencyStaffId] = useState('');
  const [editingEmergencyId, setEditingEmergencyId] = useState<string | null>(null);

  // Ideas Local States
  const [ideaInputText, setIdeaInputText] = useState('');
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [isIdeaListCollapsed, setIsIdeaListCollapsed] = useState(false);
  const [isIdeaExpandedView, setIsIdeaExpandedView] = useState(false);

  // Own Actions Local States
  const defaultActions: HubActionItem[] = [
    { id: 'act-1', text: 'সকালের হাজিরা ও রিপোর্ট চেক করা 📋', isDone: false, status: 'in_progress', createdAt: '2026-08-18' },
    { id: 'act-2', text: 'জরুরী নোটিশ ও অফিশিয়াল ডিরেক্টিভ ফলোআপ 🔔', isDone: false, status: 'active', createdAt: '2026-08-18' },
    { id: 'act-3', text: 'কাউন্টার ক্যাশ ভেরিফিকেশন ও ডেইলি ক্লোজিং 💰', isDone: true, status: 'completed', createdAt: '2026-08-18' }
  ];
  const currentActions: HubActionItem[] = state.hubData?.actions || defaultActions;
  const [actionInputText, setActionInputText] = useState('');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [isActionListCollapsed, setIsActionListCollapsed] = useState(false);
  const [isActionExpandedView, setIsActionExpandedView] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // ================= OWN ACTIONS HANDLERS =================
  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionInputText.trim()) return;

    if (editingActionId) {
      const updated = currentActions.map(item => 
        item.id === editingActionId ? { ...item, text: actionInputText.trim() } : item
      );
      onUpdateHubData({ ...state.hubData, actions: updated });
      setEditingActionId(null);
      setActionInputText('');
      showToast(isBn ? 'অ্যাকশন পরিমার্জন করা হয়েছে! 🛠️' : 'Action updated! 🛠️');
    } else {
      const newAct: HubActionItem = {
        id: `act-${Date.now()}`,
        text: actionInputText.trim(),
        isDone: false,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      onUpdateHubData({ ...state.hubData, actions: [newAct, ...currentActions] });
      setActionInputText('');
      showToast(isBn ? 'নতুন অ্যাকশন যুক্ত করা হয়েছে! 🛠️' : 'New action added! 🛠️');
    }
  };

  const handleToggleDoneAction = (actionId: string) => {
    const updated = currentActions.map(item => {
      if (item.id === actionId) {
        const nextDone = !item.isDone;
        return { 
          ...item, 
          isDone: nextDone, 
          status: (nextDone ? 'completed' : 'active') as 'completed' | 'active'
        };
      }
      return item;
    });
    onUpdateHubData({ ...state.hubData, actions: updated });
    showToast(isBn ? 'অ্যাকশনের স্ট্যাটাস পরিবর্তন করা হয়েছে! 🔄' : 'Action status updated! 🔄');
  };

  const handleStartEditAction = (act: HubActionItem) => {
    setEditingActionId(act.id);
    setActionInputText(act.text);
  };

  const handleCancelEditAction = () => {
    setEditingActionId(null);
    setActionInputText('');
  };

  const handleDeleteAction = (actionId: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই অ্যাকশনটি ডিলিট করতে চান?' : 'Are you sure you want to delete this action?')) return;
    const updated = currentActions.filter(item => item.id !== actionId);
    onUpdateHubData({ ...state.hubData, actions: updated });
    if (editingActionId === actionId) {
      setEditingActionId(null);
      setActionInputText('');
    }
    showToast(isBn ? 'অ্যাকশনটি ডিলিট করা হয়েছে। 🗑️' : 'Action deleted successfully. 🗑️');
  };

  // ================= IDEAS HANDLERS =================
  const currentIdeas: HubIdea[] = state.hubData?.ideas || [
    { id: 'idea-1', text: 'স্টাফদের জন্য প্রতিদিন সকালে ১৫ মিনিটের ব্রিফিং সেশন রাখা যেতে পারে। 💡', isRemembered: true, createdAt: '2026-08-18' },
    { id: 'idea-2', text: 'কাজের গতি বাড়ানোর জন্য নতুন শর্টকাট কিবোর্ড কমান্ড যুক্ত করা দরকার। 🚀', isRemembered: false, createdAt: '2026-08-18' }
  ];

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInputText.trim()) return;

    if (editingIdeaId) {
      const updated = currentIdeas.map(item => 
        item.id === editingIdeaId ? { ...item, text: ideaInputText.trim() } : item
      );
      onUpdateHubData({ ...state.hubData, ideas: updated });
      setEditingIdeaId(null);
      setIdeaInputText('');
      showToast(isBn ? 'আইডিয়া পরিমার্জন করা হয়েছে! 💡' : 'Idea updated! 💡');
    } else {
      const newIdea: HubIdea = {
        id: `idea-${Date.now()}`,
        text: ideaInputText.trim(),
        isRemembered: false,
        createdAt: new Date().toISOString()
      };
      onUpdateHubData({ ...state.hubData, ideas: [newIdea, ...currentIdeas] });
      setIdeaInputText('');
      showToast(isBn ? 'নতুন আইডিয়া যুক্ত করা হয়েছে! 💡' : 'New idea added! 💡');
    }
  };

  const handleToggleRememberedIdea = (ideaId: string) => {
    const updated = currentIdeas.map(item => {
      if (item.id === ideaId) {
        const nextState = !item.isRemembered;
        showToast(nextState 
          ? (isBn ? 'আইডিয়াটি "মনে রেখেছি" হিসেবে চিহ্নি করা হলো! 🧠' : 'Idea marked as remembered! 🧠')
          : (isBn ? 'আইডিয়াটি আনমার্ক করা হয়েছে! 💡' : 'Idea un-marked! 💡')
        );
        return { ...item, isRemembered: nextState };
      }
      return item;
    });
    onUpdateHubData({ ...state.hubData, ideas: updated });
  };

  const handleStartEditIdea = (idea: HubIdea) => {
    setEditingIdeaId(idea.id);
    setIdeaInputText(idea.text);
  };

  const handleCancelEditIdea = () => {
    setEditingIdeaId(null);
    setIdeaInputText('');
  };

  const handleDeleteIdea = (ideaId: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই আইডিয়াটি ডিলিট করতে চান?' : 'Are you sure you want to delete this idea?')) return;
    const updated = currentIdeas.filter(item => item.id !== ideaId);
    onUpdateHubData({ ...state.hubData, ideas: updated });
    showToast(isBn ? 'আইডিয়াটি ডিলিট করা হয়েছে। 🗑️' : 'Idea deleted successfully. 🗑️');
  };

  // ================= INSTRUCTIONS HANDLERS =================
  const handleAddInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim()) return;

    const newInst = {
      id: `inst-${Date.now()}`,
      text: newInstruction.trim(),
      status: 'pending' as const,
      assignedStaffId: newInstructionStaffId || undefined
    };

    const updatedInstructions = [...(state.hubData.instructions || []), newInst];
    onUpdateHubData({
      ...state.hubData,
      instructions: updatedInstructions
    });
    setNewInstruction('');
    setNewInstructionStaffId('');
    showToast(isBn ? 'নতুন বিশেষ নির্দেশিকা যুক্ত করা হয়েছে! 🎯' : 'New instruction added successfully! 🎯');
  };

  const handleStartEditInstruction = (index: number) => {
    setEditingInstructionIndex(index);
    setEditingInstructionText(state.hubData.instructions[index].text);
    setEditingInstructionStaffId(state.hubData.instructions[index].assignedStaffId || '');
  };

  const handleSaveEditInstruction = (index: number) => {
    if (!editingInstructionText.trim()) return;

    const updatedInstructions = [...state.hubData.instructions];
    updatedInstructions[index] = {
      ...updatedInstructions[index],
      text: editingInstructionText.trim(),
      assignedStaffId: editingInstructionStaffId || undefined
    };
    
    onUpdateHubData({
      ...state.hubData,
      instructions: updatedInstructions
    });
    
    setEditingInstructionIndex(null);
    setEditingInstructionText('');
    setEditingInstructionStaffId('');
    showToast(isBn ? 'নির্দেশিকাটি সফলভাবে আপডেট করা হয়েছে! 📝' : 'Instruction updated successfully! 📝');
  };

  const handleDeleteInstruction = (index: number) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই নির্দেশিকাটি ডিলিট করতে চান?' : 'Are you sure you want to delete this instruction?')) return;

    const updatedInstructions = state.hubData.instructions.filter((_, idx) => idx !== index);
    onUpdateHubData({
      ...state.hubData,
      instructions: updatedInstructions
    });
    showToast(isBn ? 'নির্দেশিকাটি ডিলিট করা হয়েছে। 🗑️' : 'Instruction deleted successfully. 🗑️');
  };

  // ================= REMINDERS HANDLERS =================
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderTime.trim()) return;

    let updatedReminders: HubReminder[] = [];

    if (editingReminderId) {
      // Edit mode
      updatedReminders = state.hubData.reminders.map(rem => 
        rem.id === editingReminderId 
          ? { ...rem, title: reminderTitle.trim(), time: reminderTime.trim(), status: reminderStatus }
          : rem
      );
      setEditingReminderId(null);
      showToast(isBn ? 'রিমাইন্ডার সফলভাবে আপডেট করা হয়েছে! ⏰' : 'Reminder updated successfully! ⏰');
    } else {
      // Add mode
      const newRem: HubReminder = {
        id: `rem-${Date.now()}`,
        title: reminderTitle.trim(),
        time: reminderTime.trim(),
        status: reminderStatus
      };
      updatedReminders = [...(state.hubData.reminders || []), newRem];
      showToast(isBn ? 'নতুন রিমাইন্ডার সফলভাবে যুক্ত করা হয়েছে! ⏰' : 'New reminder added successfully! ⏰');
    }

    onUpdateHubData({
      ...state.hubData,
      reminders: updatedReminders
    });

    setReminderTitle('');
    setReminderTime('');
    setReminderStatus('active');
  };

  const handleStartEditReminder = (rem: HubReminder) => {
    setEditingReminderId(rem.id);
    setReminderTitle(rem.title);
    setReminderTime(rem.time);
    setReminderStatus(rem.status);

    // Try parsing hour, minute, AM/PM
    const timeMatch = rem.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (timeMatch) {
      const h = String(parseInt(timeMatch[1], 10)).padStart(2, '0');
      const m = timeMatch[2];
      const p = (timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM') as 'AM' | 'PM';
      setClockHour(h);
      setClockMinute(m);
      setClockPeriod(p);
    }
    if (rem.time.includes('প্রতিদিন') || rem.time.toLowerCase().includes('daily')) {
      setClockFrequency('daily');
    } else if (rem.time.includes('সাপ্তাহিক') || rem.time.toLowerCase().includes('weekly')) {
      setClockFrequency('weekly');
    } else {
      setClockFrequency('none');
    }
    setShowClockDial(true);
  };

  const handleCancelEditReminder = () => {
    setEditingReminderId(null);
    setReminderTitle('');
    setReminderTime('');
    setReminderStatus('active');
  };

  const handleDeleteReminder = (id: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই রিমাইন্ডারটি ডিলিট করতে চান?' : 'Are you sure you want to delete this reminder?')) return;

    const updatedReminders = state.hubData.reminders.filter(rem => rem.id !== id);
    onUpdateHubData({
      ...state.hubData,
      reminders: updatedReminders
    });
    showToast(isBn ? 'রিমাইন্ডার ডিলিট করা হয়েছে। 🗑️' : 'Reminder deleted successfully. 🗑️');
  };

  // ================= EMERGENCIES HANDLERS =================
  const handleSaveEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyTitle.trim()) return;
    if (emergencyType === 'contact' && !emergencyPhone.trim()) return;

    let updatedEmergencies: HubEmergency[] = [];

    const itemType = emergencyType;
    const itemPhone = itemType === 'contact' ? emergencyPhone.trim() : undefined;
    const itemDesc = itemType === 'task' ? emergencyDescription.trim() : undefined;
    const itemStaff = itemType === 'task' ? (emergencyStaffId || undefined) : undefined;

    if (editingEmergencyId) {
      // Edit mode
      updatedEmergencies = state.hubData.emergencies.map(eme => 
        eme.id === editingEmergencyId 
          ? { 
              ...eme, 
              title: emergencyTitle.trim(), 
              phone: itemPhone, 
              status: emergencyStatus.trim(),
              type: itemType,
              description: itemDesc,
              assignedStaffId: itemStaff
            }
          : eme
      );
      setEditingEmergencyId(null);
      showToast(isBn ? 'জরুরী বিষয় আপডেট করা হয়েছে! 🚨' : 'Emergency item updated successfully! 🚨');
    } else {
      // Add mode
      const newEme: HubEmergency = {
        id: `eme-${Date.now()}`,
        title: emergencyTitle.trim(),
        phone: itemPhone,
        status: emergencyStatus.trim() || 'Active',
        type: itemType,
        description: itemDesc,
        assignedStaffId: itemStaff
      };
      updatedEmergencies = [...(state.hubData.emergencies || []), newEme];
      showToast(isBn ? 'নতুন জরুরী বিষয় যুক্ত করা হয়েছে! 🚨' : 'New emergency item added successfully! 🚨');
    }

    onUpdateHubData({
      ...state.hubData,
      emergencies: updatedEmergencies
    });

    setEmergencyTitle('');
    setEmergencyPhone('');
    setEmergencyStatus('Active');
    setEmergencyType('contact');
    setEmergencyDescription('');
    setEmergencyStaffId('');
  };

  const handleStartEditEmergency = (eme: HubEmergency) => {
    setEditingEmergencyId(eme.id);
    setEmergencyTitle(eme.title);
    setEmergencyPhone(eme.phone || '');
    setEmergencyStatus(eme.status);
    setEmergencyType(eme.type || 'contact');
    setEmergencyDescription(eme.description || '');
    setEmergencyStaffId(eme.assignedStaffId || '');
  };

  const handleCancelEditEmergency = () => {
    setEditingEmergencyId(null);
    setEmergencyTitle('');
    setEmergencyPhone('');
    setEmergencyStatus('Active');
    setEmergencyType('contact');
    setEmergencyDescription('');
    setEmergencyStaffId('');
  };

  const handleDeleteEmergency = (id: string) => {
    if (!window.confirm(isBn ? 'আপনি কি নিশ্চিতভাবে এই জরুরী আইটেমটি ডিলিট করতে চান?' : 'Are you sure you want to delete this emergency item?')) return;

    const updatedEmergencies = state.hubData.emergencies.filter(eme => eme.id !== id);
    onUpdateHubData({
      ...state.hubData,
      emergencies: updatedEmergencies
    });
    showToast(isBn ? 'জরুরী আইটেম ডিলিট করা হয়েছে। 🗑️' : 'Emergency item deleted successfully. 🗑️');
  };

  return (
    <div className="space-y-6 pb-24 w-full overflow-x-hidden animate-in fade-in duration-200">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border-2 border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-900 border border-indigo-900/40 p-2.5 sm:p-3.5 rounded-xl shadow-lg">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('menu')}
            className="px-2 py-1 bg-gray-950 border border-gray-800 hover:border-indigo-500/40 text-sky-300 hover:text-white rounded-lg transition-all flex items-center gap-1 text-xs font-bold shrink-0"
            title={isBn ? 'মেনুতে ফিরুন' : 'Back to Menu'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'মেনু' : 'Menu'}</span>
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>{isBn ? 'হাব কার্যক্রম ব্যবস্থাপনা' : 'Hub Activity Management'}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                Admin
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isBn ? 'স্পেশাল নির্দেশাবলী, রিমাইন্ডার এবং জরুরী কন্টাক্ট কন্ট্রোল প্যানেল' : 'Control special instructions, active alerts, and emergency contact registries'}
            </p>
          </div>
        </div>
      </div>

      {/* Inner Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 bg-gray-950 p-1.5 rounded-xl border border-gray-800/80">
        <button
          type="button"
          onClick={() => {
            setActiveTab('instructions');
            setEditingInstructionIndex(null);
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'instructions'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isBn ? 'নির্দেশিকা' : 'Instructions'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('reminders');
            handleCancelEditReminder();
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'reminders'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/60'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isBn ? 'রিমাইন্ডার' : 'Reminders'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('emergencies');
            handleCancelEditEmergency();
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'emergencies'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <EmergencyIcon className="w-4 h-4 object-contain shrink-0" />
          <span>{isBn ? 'জরুরী কন্টাক্ট' : 'Emergencies'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('ideas');
            handleCancelEditIdea();
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
            activeTab === 'ideas'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>{isBn ? 'আইডিয়া হাব' : 'Own Ideas'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('actions');
            handleCancelEditAction();
          }}
          className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
            activeTab === 'actions'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-950/60'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{isBn ? 'ওন অ্যাকশন' : 'Own Actions'}</span>
        </button>
      </div>

      {/* ================= SECTION 1: SPECIAL INSTRUCTIONS ================= */}
      {activeTab === 'instructions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* New Instruction Form */}
          <div className="lg:col-span-5 bg-gray-900 border border-indigo-900/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span>
              <span>{isBn ? 'নতুন নির্দেশিকা যোগ করুন' : 'Add Special Instruction'}</span>
            </h3>

            <form onSubmit={handleAddInstruction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  {isBn ? 'নির্দেশিকার টেক্সট লিখুন' : 'Instruction Content'}
                </label>
                <textarea
                  rows={4}
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder={isBn ? 'যেমন: অফিসে প্রবেশের সময় আইডি কার্ড ভিজিবল রাখুন...' : 'Enter the instruction message here...'}
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-550 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ (ঐচ্ছিক)' : 'Assigned Staff (Optional)'}</span>
                </label>
                <select
                  value={newInstructionStaffId}
                  onChange={(e) => setNewInstructionStaffId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-350 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="">{isBn ? '-- কোনো স্টাফ এসাইন করুন --' : '-- Select a Staff (Optional) --'}</option>
                  {state.staffList?.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {isBn ? staff.name : (staff.nameEn || staff.name)} ({isBn ? staff.role : staff.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নির্দেশিকা সাবমিট করুন' : 'Submit Instruction'}</span>
              </button>
            </form>
          </div>

          {/* Current Instructions List */}
          <div className="lg:col-span-7 bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span>📋 {isBn ? 'বিদ্যমান নির্দেশিকাসমূহ' : 'Current Instructions'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-bold">
                {state.hubData?.instructions?.length || 0} Total
              </span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {state.hubData?.instructions?.map((inst, index) => {
                const assignedStaff = state.staffList?.find(s => s.id === inst.assignedStaffId);
                return (
                  <div 
                    key={inst.id || index} 
                    className="p-4 rounded-xl bg-gray-950 border border-gray-850 hover:border-gray-800 transition-all flex flex-col gap-3 animate-in fade-in duration-150"
                  >
                    {editingInstructionIndex === index ? (
                      <div className="space-y-3 w-full">
                        <textarea
                          rows={3}
                          value={editingInstructionText}
                          onChange={(e) => setEditingInstructionText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-indigo-500/50 text-white text-sm focus:outline-none"
                        />
                        
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{isBn ? 'স্টাফ:' : 'Staff:'}</span>
                          </label>
                          <select
                            value={editingInstructionStaffId}
                            onChange={(e) => setEditingInstructionStaffId(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="">{isBn ? '-- কেউ এসাইন করা নেই --' : '-- No staff assigned --'}</option>
                            {state.staffList?.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {isBn ? staff.name : (staff.nameEn || staff.name)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-900 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingInstructionIndex(null)}
                            className="px-3 py-1.5 rounded-lg bg-gray-850 hover:bg-gray-800 text-gray-400 text-xs font-bold border border-gray-800"
                          >
                            {isBn ? 'বাতিল' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditInstruction(index)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{isBn ? 'সংরক্ষণ' : 'Save'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-indigo-400 font-extrabold text-sm min-w-[18px] text-right">{index + 1}.</span>
                            <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">{inst.text}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditInstruction(index)}
                              className="p-2 bg-gray-900 hover:bg-indigo-950/40 text-gray-400 hover:text-indigo-400 rounded-lg border border-gray-800/80 transition-colors"
                              title={isBn ? 'সম্পাদনা করুন' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInstruction(index)}
                              className="p-2 bg-gray-900 hover:bg-rose-950/45 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800/80 transition-colors"
                              title={isBn ? 'ডিলিট করুন' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Staff Assignment Display */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-[11px]">{isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ:' : 'Assigned Staff:'}</span>
                          {assignedStaff ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                              {isBn ? assignedStaff.name : (assignedStaff.nameEn || assignedStaff.name)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-600 italic">{isBn ? 'কেউ নেই' : 'None'}</span>
                          )}
                        </div>

                        {/* Color Graded Status Indicator & Tracker for Admin */}
                      <div className="pt-2 border-t border-gray-900 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">{isBn ? 'স্ট্যাটাস:' : 'Status:'}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            inst.status === 'pending' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                            inst.status === 'progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                            inst.status === 'attempting' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' :
                            inst.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            inst.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {inst.status === 'pending' ? (isBn ? 'পেন্ডিং' : 'Pending') :
                             inst.status === 'progress' ? (isBn ? 'চলমান' : 'Progress') :
                             inst.status === 'attempting' ? (isBn ? 'চেষ্টা' : 'Attempting') :
                             inst.status === 'partial' ? (isBn ? 'আংশিক' : 'Partial') :
                             inst.status === 'complete' ? (isBn ? 'সম্পন্ন' : 'Complete') :
                             (isBn ? 'ব্যর্থ' : 'Failed')}
                          </span>
                        </div>

                        {/* Direct status change buttons for admin convenience */}
                        <div className="flex flex-wrap gap-1">
                          {[
                            { value: 'pending', label: 'P', title: 'Pending' },
                            { value: 'progress', label: 'PR', title: 'Progress' },
                            { value: 'attempting', label: 'AT', title: 'Attempting' },
                            { value: 'partial', label: 'PT', title: 'Partial' },
                            { value: 'complete', label: 'C', title: 'Complete' },
                            { value: 'failed', label: 'F', title: 'Failed' }
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              title={opt.title}
                              onClick={() => {
                                const updatedInstructions = [...state.hubData.instructions];
                                updatedInstructions[index] = {
                                  ...updatedInstructions[index],
                                  status: opt.value as any
                                };
                                onUpdateHubData({
                                  ...state.hubData,
                                  instructions: updatedInstructions
                                });
                                showToast(isBn ? 'স্ট্যাটাস আপডেট করা হয়েছে! 👍' : 'Status updated successfully! 👍');
                              }}
                              className={`w-5 h-5 rounded text-[8px] font-black border flex items-center justify-center transition-all ${
                                inst.status === opt.value
                                  ? 'bg-indigo-600 border-indigo-400 text-white font-bold'
                                  : 'bg-gray-900 border-gray-800 text-gray-550 hover:text-white'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

              {(!state.hubData?.instructions || state.hubData.instructions.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed border-gray-850 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">{isBn ? 'কোনো নির্দেশিকা খুঁজে পাওয়া যায়নি।' : 'No special instructions registered yet.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: REMINDERS & ALERTS ================= */}
      {activeTab === 'reminders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Reminder Input Form */}
          <div className="lg:col-span-5 bg-gray-900 border border-amber-900/40 p-3.5 sm:p-4 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-800">
              <span>⏰</span>
              <span>{editingReminderId ? (isBn ? 'রিমাইন্ডার এডিট করুন' : 'Edit Reminder') : (isBn ? 'নতুন রিমাইন্ডার সেট করুন (Set New Reminder)' : 'Set New Reminder')}</span>
            </h3>

            <form onSubmit={handleSaveReminder} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  {isBn ? 'রিমাইন্ডার শিরোনাম' : 'Reminder Title'}
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder={isBn ? 'যেমন: সকালের স্টাফ ব্রিফিং' : 'e.g. Weekly Stock Audit'}
                  className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-550 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/45"
                  required
                />

                {/* Suggested Quick Titles */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5">
                  {[
                    isBn ? 'সকালের ব্রিফিং' : 'Staff Briefing',
                    isBn ? 'ক্যাশ রিভিউ' : 'Cash Review',
                    isBn ? 'ইনভেন্টরি অডিট' : 'Stock Audit',
                    isBn ? 'ক্লোজিং চেক' : 'Closing Checklist'
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setReminderTitle(suggestion)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800 shrink-0 transition-all active:scale-95"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time & Schedule Picker */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isBn ? 'সময় ও শিডিউল' : 'Time & Schedule'}</span>
                  </span>
                  {reminderTime && (
                    <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {reminderTime}
                    </span>
                  )}
                </label>

                <ClockTimePicker
                  value={reminderTime}
                  onChange={(formatted) => setReminderTime(formatted)}
                  isBn={isBn}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1">
                  {isBn ? 'স্ট্যাটাস' : 'Status'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderStatus('active')}
                    className={`py-1.5 rounded-lg text-xs font-black border transition-all ${
                      reminderStatus === 'active'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isBn ? 'সক্রিয় (Active)' : 'Active'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderStatus('coming')}
                    className={`py-1.5 rounded-lg text-xs font-black border transition-all ${
                      reminderStatus === 'coming'
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isBn ? 'আসছে (Coming)' : 'Coming Soon'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingReminderId && (
                  <button
                    type="button"
                    onClick={handleCancelEditReminder}
                    className="flex-1 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:bg-gray-900 text-gray-400 font-bold text-xs transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-950 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  {editingReminderId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{editingReminderId ? (isBn ? 'সংরক্ষণ করুন' : 'Save Changes') : (isBn ? 'যুক্ত করুন' : 'Add Reminder')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Reminders List */}
          <div className="lg:col-span-7 bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span>📋 {isBn ? 'বিদ্যমান রিমাইন্ডার ও অ্যালার্ট' : 'Current Reminders'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 font-bold">
                {state.hubData?.reminders?.length || 0} Active
              </span>
            </h3>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {state.hubData?.reminders?.map((rem) => (
                <div 
                  key={rem.id} 
                  className="p-4 rounded-xl bg-gray-950 border border-gray-850 hover:border-gray-800 transition-all flex items-center justify-between gap-4 animate-in fade-in duration-150"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{rem.title}</h4>
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded tracking-wide ${
                        rem.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/25' 
                          : 'bg-amber-500/20 text-amber-350 border border-amber-500/25'
                      }`}>
                        {rem.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : (isBn ? 'আসছে' : 'Coming')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span>{rem.time}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEditReminder(rem)}
                      className="p-2 bg-gray-900 hover:bg-amber-950/40 text-gray-400 hover:text-amber-400 rounded-lg border border-gray-800/80 transition-colors"
                      title={isBn ? 'সম্পাদনা' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-2 bg-gray-900 hover:bg-rose-950/45 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800/80 transition-colors"
                      title={isBn ? 'ডিলিট' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {(!state.hubData?.reminders || state.hubData.reminders.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed border-gray-850 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-550">{isBn ? 'কোনো রিমাইন্ডার খুঁজে পাওয়া যায়নি।' : 'No reminders set up yet.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: EMERGENCY & URGENT TASKS ================= */}
      {activeTab === 'emergencies' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Emergency Input Form */}
          <div className="lg:col-span-5 bg-gray-900 border border-rose-900/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <EmergencyIcon className="w-5 h-5 object-contain shrink-0" />
              <span>
                {editingEmergencyId 
                  ? (isBn ? 'জরুরী বিষয় এডিট করুন' : 'Edit Emergency Item') 
                  : (isBn ? 'নতুন জরুরী কাজ বা কন্টাক্ট' : 'Add Emergency / Urgent Item')}
              </span>
            </h3>

            <form onSubmit={handleSaveEmergency} className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  {isBn ? 'জরুরী বিষয়ের ধরন' : 'Emergency Item Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmergencyType('contact')}
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-all ${
                      emergencyType === 'contact'
                        ? 'bg-rose-600 border-rose-500 text-white font-bold shadow-md shadow-rose-950/50'
                        : 'bg-gray-950 border-gray-850 text-gray-400 hover:text-white'
                    }`}
                  >
                    📞 {isBn ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmergencyType('task')}
                    className={`py-2 px-3 rounded-lg text-xs font-black border transition-all ${
                      emergencyType === 'task'
                        ? 'bg-rose-600 border-rose-500 text-white font-bold shadow-md shadow-rose-950/50'
                        : 'bg-gray-950 border-gray-850 text-gray-400 hover:text-white'
                    }`}
                  >
                    ⚠️ {isBn ? 'জরুরী নোটিশ/কাজ' : 'Urgent Task Notice'}
                  </button>
                </div>
              </div>

              {/* Title / Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  {emergencyType === 'task' 
                    ? (isBn ? 'জরুরী কাজ বা নোটিশের শিরোনাম' : 'Urgent Task Title') 
                    : (isBn ? 'প্রতিষ্ঠান বা পদের নাম' : 'Title / Department')}
                </label>
                <input
                  type="text"
                  value={emergencyTitle}
                  onChange={(e) => setEmergencyTitle(e.target.value)}
                  placeholder={
                    emergencyType === 'task'
                      ? (isBn ? 'যেমন: বিদ্যুৎ বিভ্রাটে আইপিএস চেক করতে হবে' : 'e.g. Check UPS during blackout')
                      : (isBn ? 'যেমন: দিলখুশ সিকিউরিটি কন্ট্রোল রুম' : 'e.g. Dilkhoosh Control Room')
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-555 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  required
                />
              </div>

              {/* Contact Number (Only for Contact type) */}
              {emergencyType === 'contact' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    {isBn ? 'মোবাইল / হটলাইন নম্বর' : 'Phone / Hotline Number'}
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder={isBn ? 'যেমন: 01700-000000' : 'e.g. 01700-000000'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-555 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    required
                  />
                </div>
              )}

              {/* Description (Only for Task type) */}
              {emergencyType === 'task' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5">
                    {isBn ? 'কাজের বিবরণ / বিশেষ নির্দেশনা' : 'Task Description / Urgent Guidelines'}
                  </label>
                  <textarea
                    rows={3}
                    value={emergencyDescription}
                    onChange={(e) => setEmergencyDescription(e.target.value)}
                    placeholder={isBn ? 'জরুরী কাজের বিবরণ এবং করণীয় পদক্ষেপগুলো বিস্তারিত লিখুন...' : 'Describe the urgent task and exact steps required...'}
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-555 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 resize-none"
                  />
                </div>
              )}

              {/* Assigned Staff (Only for Task type) */}
              {emergencyType === 'task' && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-rose-450" />
                    <span>{isBn ? 'স্টাফ অ্যাসাইন করুন (ঐচ্ছিক)' : 'Assign Staff (Optional)'}</span>
                  </label>
                  <select
                    value={emergencyStaffId}
                    onChange={(e) => setEmergencyStaffId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
                  >
                    <option value="">{isBn ? '-- কোনো স্টাফ সিলেক্ট করুন --' : '-- Select a Staff Member --'}</option>
                    {state.staffList?.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {isBn ? staff.name : (staff.nameEn || staff.name)} ({isBn ? staff.role : staff.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status Badge */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5">
                  {isBn ? 'স্ট্যাটাস বা লেবেল টেক্সট' : 'Status / Label Text'}
                </label>
                <input
                  type="text"
                  value={emergencyStatus}
                  onChange={(e) => setEmergencyStatus(e.target.value)}
                  placeholder={
                    emergencyType === 'task'
                      ? (isBn ? 'যেমন: Pending, Urgent, Active' : 'e.g. Pending, Urgent, Active')
                      : (isBn ? 'যেমন: 24/7 Active বা কল করুন' : 'e.g. 24/7 Active or Call Now')
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white placeholder-gray-555 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                {editingEmergencyId && (
                  <button
                    type="button"
                    onClick={handleCancelEditEmergency}
                    className="flex-1 py-3 rounded-xl bg-gray-950 border border-gray-800 hover:bg-gray-900 text-gray-400 font-bold text-sm transition-colors"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-[2] py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950 transition-all flex items-center justify-center gap-1.5"
                >
                  {editingEmergencyId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>
                    {editingEmergencyId 
                      ? (isBn ? 'সংরক্ষণ করুন' : 'Save Changes') 
                      : (isBn ? 'যুক্ত করুন' : 'Add to Emergency')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Current Emergencies List */}
          <div className="lg:col-span-7 bg-gray-900 border border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
              <span>📋 {isBn ? 'বিদ্যমান জরুরী বিষয় ও কাজসমূহ' : 'Current Emergencies & Urgent Tasks'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 font-bold">
                {state.hubData?.emergencies?.length || 0} {isBn ? 'টি মোট' : 'Items'}
              </span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {state.hubData?.emergencies?.map((eme, idx) => {
                const isTask = eme.type === 'task' || !eme.phone;
                const assignedStaff = state.staffList?.find(s => s.id === eme.assignedStaffId);
                return (
                  <div 
                    key={eme.id || idx} 
                    className="p-4 rounded-xl bg-gray-950 border border-gray-850 hover:border-gray-800 transition-all flex flex-col gap-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <EmergencyIcon className="w-4 h-4 object-contain shrink-0" />
                          <h4 className="text-sm font-bold text-white truncate">{eme.title}</h4>
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded border tracking-wide shrink-0 ${
                            isTask 
                              ? 'bg-rose-500/10 text-rose-450 border-rose-500/25' 
                              : 'bg-emerald-500/10 text-emerald-350 border-emerald-500/25'
                          }`}>
                            {isTask ? (isBn ? 'জরুরী কাজ' : 'Urgent Task') : (isBn ? 'যোগাযোগ' : 'Contact')}
                          </span>
                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-gray-900 border border-gray-800 text-gray-400 shrink-0">
                            {eme.status}
                          </span>
                        </div>

                        {!isTask ? (
                          <p className="text-xs text-rose-450 mt-1.5 font-mono font-bold flex items-center gap-1 truncate">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{eme.phone}</span>
                          </p>
                        ) : (
                          <div className="mt-2 space-y-2">
                            {eme.description && (
                              <p className="text-xs text-gray-300 bg-rose-950/10 p-2.5 rounded-lg border border-rose-950/20 whitespace-pre-line leading-relaxed">
                                {eme.description}
                              </p>
                            )}
                            {assignedStaff && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-450 pl-1">
                                <User className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                <span className="font-semibold text-[10px]">{isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ:' : 'Staff:'}</span>
                                <span className="text-[10px] bg-rose-500/10 text-rose-300 font-bold px-1.5 py-0.5 rounded-full border border-rose-500/20">
                                  {isBn ? assignedStaff.name : (assignedStaff.nameEn || assignedStaff.name)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEditEmergency(eme)}
                          className="p-2 bg-gray-900 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800/80 transition-colors"
                          title={isBn ? 'সম্পাদনা' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmergency(eme.id)}
                          className="p-2 bg-gray-900 hover:bg-rose-950/45 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800/80 transition-colors"
                          title={isBn ? 'ডিলিট' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {(!state.hubData?.emergencies || state.hubData.emergencies.length === 0) && (
                <div className="text-center py-10 border-2 border-dashed border-gray-850 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-550">
                    {isBn ? 'কোনো জরুরী কাজ বা কন্টাক্ট খুঁজে পাওয়া যায়নি।' : 'No emergency contacts or urgent tasks registered yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: OWN IDEAS ================= */}
      {activeTab === 'ideas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          
          {/* Add / Edit Form */}
          <div className="lg:col-span-5 bg-gray-900 border border-emerald-900/40 rounded-2xl p-5 shadow-xl space-y-4 h-fit">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingIdeaId 
                    ? (isBn ? 'আইডিয়া সম্পাদনা করুন' : 'Edit Idea')
                    : (isBn ? 'নতুন আইডিয়া বা প্রস্তাবনা' : 'New Idea / Suggestion')}
                </h3>
                <p className="text-xs text-gray-400">
                  {isBn ? 'ব্যবসার সার্বিক উন্নতির জন্য আইডিয়া সংরক্ষণ করুন' : 'Record innovative ideas for business operations'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  {isBn ? 'আইডিয়া/প্রস্তাবনা বিবরণ:' : 'Idea Details:'}
                </label>
                <textarea
                  value={ideaInputText}
                  onChange={(e) => setIdeaInputText(e.target.value)}
                  placeholder={isBn ? 'উদাহরণ: রান্নাঘরে ডিপ ক্লিন শেডিউল প্রতি রবিবার রাখা যেতে পারে...' : 'e.g. Schedule weekly deep cleaning every Sunday...'}
                  rows={3}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-emerald-500 text-white text-xs focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                {editingIdeaId && (
                  <button
                    type="button"
                    onClick={handleCancelEditIdea}
                    className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingIdeaId 
                      ? (isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')
                      : (isBn ? 'আইডিয়া সেভ করুন' : 'Save Idea')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Ideas List with Collapse support */}
          <div className="lg:col-span-7 bg-gray-900 border border-emerald-900/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            {/* Header with Collapsible trigger */}
            <div 
              onClick={() => setIsIdeaListCollapsed(!isIdeaListCollapsed)}
              className="flex items-center justify-between pb-3 border-b border-gray-800 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {isBn ? 'সংরক্ষিত আইডিয়া ও "মনে রেখেছি" তালিকা' : 'Saved Ideas & Remembered Items'}
                </h3>
                <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  {currentIdeas.length} {isBn ? 'টি আইডিয়া' : 'Items'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-emerald-300 transition-colors">
                <span>{isIdeaListCollapsed ? (isBn ? 'তালিকা খুলুন' : 'Expand') : (isBn ? 'কোলাপ্স করুন' : 'Collapse')}</span>
                <div className="p-1 rounded bg-gray-950 border border-gray-800 text-emerald-400">
                  {isIdeaListCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {/* List Body */}
            {!isIdeaListCollapsed && (
              <div className="space-y-3">
                <div className={`space-y-3 overflow-y-auto pr-1 transition-all ${
                  isIdeaExpandedView ? 'max-h-[550px]' : 'max-h-96'
                }`}>
                  {(isIdeaExpandedView ? currentIdeas : currentIdeas.slice(0, 4)).map((idea) => (
                    <div
                      key={idea.id}
                      className={`p-4 rounded-xl border transition-all ${
                        idea.isRemembered
                          ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                          : 'bg-gray-950/60 border-gray-800 hover:border-gray-750'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium flex-1">
                            {idea.text}
                          </p>
                          {idea.isRemembered && (
                            <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 shadow-sm">
                              <Brain className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{isBn ? 'মনে রেখেছি' : 'Remembered'}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-900/80 gap-2">
                          {/* Remembered toggle button */}
                          <button
                            type="button"
                            onClick={() => handleToggleRememberedIdea(idea.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all flex items-center gap-1.5 active:scale-95 ${
                              idea.isRemembered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                                : 'bg-gray-900 text-gray-400 hover:text-emerald-300 border-gray-800 hover:border-emerald-500/30'
                            }`}
                          >
                            <Brain className={`w-4 h-4 ${idea.isRemembered ? 'text-emerald-400' : 'text-gray-500'}`} />
                            <span>{idea.isRemembered ? (isBn ? '🧠 মনে রেখেছি' : '🧠 Remembered') : (isBn ? 'মনে রাখুন' : 'Mark Remembered')}</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditIdea(idea)}
                              className="p-2 bg-gray-900 hover:bg-emerald-950/40 text-gray-400 hover:text-emerald-400 rounded-lg border border-gray-800 transition-colors"
                              title={isBn ? 'সম্পাদনা' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteIdea(idea.id)}
                              className="p-2 bg-gray-900 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800 transition-colors"
                              title={isBn ? 'ডিলিট' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentIdeas.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-850 rounded-xl">
                      <Lightbulb className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-550">
                        {isBn ? 'কোনো সক্রিয় আইডিয়া খুঁজে পাওয়া যায়নি।' : 'No active ideas registered yet.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Large List Pagination Toggle */}
                {currentIdeas.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setIsIdeaExpandedView(!isIdeaExpandedView)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    {isIdeaExpandedView ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        <span>{isBn ? 'সংক্ষিপ্ত করুন (কম দেখুন)' : 'Collapse (Show Less)'}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>{isBn ? `আরও ${currentIdeas.length - 4}টি আইডিয়া দেখুন` : `Show ${currentIdeas.length - 4} More Ideas`}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 5: OWN ACTIONS ================= */}
      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-200">
          
          {/* Add / Edit Action Form */}
          <div className="lg:col-span-5 bg-gray-900 border border-sky-900/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>{editingActionId ? (isBn ? 'অ্যাকশন সম্পাদনা' : 'Edit Action') : (isBn ? 'নতুন ওন অ্যাকশন যোগ করুন' : 'Add New Own Action')}</span>
              </h3>
              {editingActionId && (
                <button
                  type="button"
                  onClick={handleCancelEditAction}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  {isBn ? 'অ্যাকশন বা কাজের বিবরণ' : 'Action or Task Description'} <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={actionInputText}
                  onChange={(e) => setActionInputText(e.target.value)}
                  placeholder={isBn ? "যেমন: সকালের কাউন্টার ক্যাশ হিসাব মেলানো... 📋" : "e.g. Morning counter cash reconciliation... 📋"}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-950 border border-gray-800 focus:border-sky-500 text-white text-xs sm:text-sm placeholder-gray-600 focus:outline-none transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!actionInputText.trim()}
                  className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-950 transition-all flex items-center justify-center gap-2"
                >
                  {editingActionId ? (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'নতুন অ্যাকশন যুক্ত করুন' : 'Add Action Item'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Action Items List with Collapse support */}
          <div className="lg:col-span-7 bg-gray-900 border border-sky-900/40 p-4 sm:p-5 rounded-2xl shadow-xl space-y-4">
            {/* Header with Collapsible trigger */}
            <div 
              onClick={() => setIsActionListCollapsed(!isActionListCollapsed)}
              className="flex items-center justify-between pb-3 border-b border-gray-800 cursor-pointer select-none group"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span>{isBn ? 'আমার অ্যাকশন তালিকা' : 'My Action List'}</span>
                </h3>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentActions.filter(a => a.isDone).length}/{currentActions.length} {isBn ? 'সম্পন্ন' : 'Done'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-sky-300 transition-colors">
                <span>{isActionListCollapsed ? (isBn ? 'তালিকা খুলুন' : 'Expand') : (isBn ? 'কোলাপ্স করুন' : 'Collapse')}</span>
                <div className="p-1 rounded bg-gray-950 border border-gray-800 text-sky-400">
                  {isActionListCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>

            {/* List Body */}
            {!isActionListCollapsed && (
              <div className="space-y-3">
                <div className={`space-y-2.5 overflow-y-auto pr-1 transition-all ${
                  isActionExpandedView ? 'max-h-[500px]' : 'max-h-96'
                }`}>
                  {(isActionExpandedView ? currentActions : currentActions.slice(0, 4)).map((act) => (
                    <div 
                      key={act.id} 
                      className={`p-3.5 rounded-xl border transition-all duration-200 ${
                        act.isDone 
                          ? 'bg-gray-950/40 border-emerald-900/30 opacity-75' 
                          : 'bg-gray-950/70 border-sky-900/40 hover:border-sky-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div 
                          onClick={() => handleToggleDoneAction(act.id)}
                          className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                        >
                          <button
                            type="button"
                            aria-label={act.isDone ? "Mark Incomplete" : "Mark Complete"}
                            className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center transition-all shrink-0 border ${
                              act.isDone
                                ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                                : 'border-sky-500/40 bg-gray-900 hover:border-sky-400'
                            }`}
                          >
                            {act.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                              act.isDone ? 'line-through text-gray-400' : 'text-gray-100'
                            }`}>
                              {act.text}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {act.isDone ? (isBn ? '✅ সম্পন্ন করা হয়েছে' : '✅ Completed') : (isBn ? '⏳ চলমান' : '⏳ In Progress')}
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEditAction(act)}
                            className="p-1.5 bg-gray-900 hover:bg-sky-950/40 text-gray-400 hover:text-sky-300 rounded-lg border border-gray-800 transition-colors"
                            title={isBn ? 'সম্পাদনা' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAction(act.id)}
                            className="p-1.5 bg-gray-900 hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 rounded-lg border border-gray-800 transition-colors"
                            title={isBn ? 'ডিলিট' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {currentActions.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-850 rounded-xl">
                      <Wrench className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-550">
                        {isBn ? 'কোনো ওন অ্যাকশন নেই।' : 'No own actions registered yet.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Show More / Show Less for long lists */}
                {currentActions.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setIsActionExpandedView(!isActionExpandedView)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-950 hover:bg-gray-850 border border-gray-800 hover:border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isActionExpandedView ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সংক্ষিপ্ত তালিকা (কম দেখুন)' : 'Show Less'}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5" />
                        <span>{isBn ? `আরও ${currentActions.length - 4}টি অ্যাকশন দেখুন` : `Show ${currentActions.length - 4} More Actions`}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
