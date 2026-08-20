import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  Bell, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  ShieldCheck,
  Plus,
  Send,
  X,
  User,
  Trash2,
  Edit2,
  Save,
  Brain,
  Clock,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { AppState, HubData, HubIdea, HubReminder, HubActionItem } from '../types';
import { EmergencyIcon } from './EmergencyIcon';
import { NewDirectiveModal } from './NewDirectiveModal';
import { ClockTimePicker } from './ClockTimePicker';
import { AiAssistantModal } from './AiAssistantModal';

interface HubViewProps {
  state: AppState;
  showToast: (msg: string) => void;
  onNavigateTab: (tab: any) => void;
  onUpdateHubData?: (newHubData: HubData) => void;
  onOpenAiAssistant?: () => void;
}

export const HubView: React.FC<HubViewProps> = ({ state, showToast, onNavigateTab, onUpdateHubData, onOpenAiAssistant }) => {
  const isBn = state.settings.language === 'bn';
  
  const handleUpdateInstructionStatus = (instId: string, status: any) => {
    if (!onUpdateHubData) return;
    const updatedInstructions = state.hubData.instructions.map(inst => 
      inst.id === instId ? { ...inst, status } : inst
    );
    onUpdateHubData({
      ...state.hubData,
      instructions: updatedInstructions
    });
    showToast(isBn ? 'নির্দেশিকার স্ট্যাটাস পরিবর্তন করা হয়েছে! 📊' : 'Instruction status updated! 📊');
  };

  const handleUpdateInstructionStaff = (instId: string, assignedStaffId: string) => {
    if (!onUpdateHubData) return;
    const updatedInstructions = state.hubData.instructions.map(inst => 
      inst.id === instId ? { ...inst, assignedStaffId: assignedStaffId || undefined } : inst
    );
    onUpdateHubData({
      ...state.hubData,
      instructions: updatedInstructions
    });
    showToast(isBn ? 'স্টাফ অ্যাসাইনমেন্ট পরিবর্তন করা হয়েছে! 👤' : 'Staff assignment updated! 👤');
  };

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [ideaText, setIdeaText] = useState('');
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [editingIdeaText, setEditingIdeaText] = useState('');
  const [isIdeasCollapsed, setIsIdeasCollapsed] = useState(false);
  const [isIdeasExpandedView, setIsIdeasExpandedView] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddInstruction, setShowAddInstruction] = useState(false);
  const [quickReminderTitle, setQuickReminderTitle] = useState('');
  const [quickReminderTime, setQuickReminderTime] = useState('প্রতিদিন 09:00 AM');

  const handleAddQuickReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReminderTitle.trim()) return;
    const newRem: HubReminder = {
      id: `rem-${Date.now()}`,
      title: quickReminderTitle.trim(),
      time: quickReminderTime || '09:00 AM',
      status: 'active'
    };
    const currentList = state.hubData?.reminders || [];
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        reminders: [newRem, ...currentList]
      });
    }
    setQuickReminderTitle('');
    setShowAddReminder(false);
    showToast(isBn ? 'নতুন রিমাইন্ডার সফলভাবে সেট করা হয়েছে! ⏰' : 'New reminder created successfully! ⏰');
  };

  const handleAddInstruction = (directive: any) => {
    if (!onUpdateHubData) return;
    const newDir = {
      ...directive,
      id: `dir-${Date.now()}`,
      createdAt: new Date().toISOString(),
      acknowledgedStaffIds: []
    };
    onUpdateHubData({
      ...state.hubData,
      instructions: [newDir, ...state.hubData.instructions]
    });
    showToast(isBn ? 'নতুন বিশেষ নির্দেশিকা যুক্ত করা হয়েছে! 🎯' : 'New special instruction added! 🎯');
  };

  const currentIdeas: HubIdea[] = state.hubData?.ideas || [
    { id: 'idea-1', text: 'স্টাফদের জন্য প্রতিদিন সকালে ১৫ মিনিটের ব্রিফিং সেশন রাখা যেতে পারে। 💡', isRemembered: true, createdAt: '2026-08-18' },
    { id: 'idea-2', text: 'কাজের গতি বাড়ানোর জন্য নতুন শর্টকাট কিবোর্ড কমান্ড যুক্ত করা দরকার। 🚀', isRemembered: false, createdAt: '2026-08-18' }
  ];

  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaText.trim()) return;
    const newIdea: HubIdea = {
      id: `idea-${Date.now()}`,
      text: ideaText.trim(),
      isRemembered: false,
      createdAt: new Date().toISOString()
    };
    const updated = [newIdea, ...currentIdeas];
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        ideas: updated
      });
    }
    setIdeaText('');
    showToast(isBn ? 'নতুন আইডিয়া সফলভাবে যুক্ত করা হয়েছে! 💡' : 'New idea added successfully! 💡');
  };

  const handleToggleRemembered = (ideaId: string) => {
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
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        ideas: updated
      });
    }
  };

  const handleStartEditIdea = (idea: HubIdea) => {
    setEditingIdeaId(idea.id);
    setEditingIdeaText(idea.text);
  };

  const handleSaveEditIdea = (ideaId: string) => {
    if (!editingIdeaText.trim()) return;
    const updated = currentIdeas.map(item => 
      item.id === ideaId ? { ...item, text: editingIdeaText.trim() } : item
    );
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        ideas: updated
      });
    }
    setEditingIdeaId(null);
    setEditingIdeaText('');
    showToast(isBn ? 'আইডিয়াটি সফলভাবে পরিমার্জন করা হয়েছে! 📝' : 'Idea updated successfully! 📝');
  };

  const handleDeleteIdea = (ideaId: string) => {
    const updated = currentIdeas.filter(item => item.id !== ideaId);
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        ideas: updated
      });
    }
    showToast(isBn ? 'আইডিয়াটি সফলভাবে ডিলিট করা হয়েছে! 🗑️' : 'Idea deleted successfully! 🗑️');
  };

  const defaultActions: HubActionItem[] = [
    { id: 'act-1', text: 'সকালের হাজিরা ও রিপোর্ট চেক করা 📋', isDone: false, status: 'in_progress', createdAt: '2026-08-18' },
    { id: 'act-2', text: 'জরুরী নোটিশ ও অফিশিয়াল ডিরেক্টিভ ফলোআপ 🔔', isDone: false, status: 'active', createdAt: '2026-08-18' },
    { id: 'act-3', text: 'কাউন্টার ক্যাশ ভেরিফিকেশন ও ডেইলি ক্লোজিং 💰', isDone: true, status: 'completed', createdAt: '2026-08-18' }
  ];

  const currentActions: HubActionItem[] = state.hubData?.actions || defaultActions;
  const [newActionText, setNewActionText] = useState('');
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionText, setEditingActionText] = useState('');
  const [isActionsCollapsed, setIsActionsCollapsed] = useState(false);
  const [isActionsExpandedView, setIsActionsExpandedView] = useState(false);

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    const newAct: HubActionItem = {
      id: `act-${Date.now()}`,
      text: newActionText.trim(),
      isDone: false,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const updated = [newAct, ...currentActions];
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        actions: updated
      });
    }
    setNewActionText('');
    showToast(isBn ? 'নতুন অ্যাকশন সফলভাবে যোগ করা হয়েছে! 🛠️' : 'Own Action added successfully! 🛠️');
  };

  const handleStartEditAction = (act: HubActionItem) => {
    setEditingActionId(act.id);
    setEditingActionText(act.text);
  };

  const handleSaveEditAction = (actionId: string) => {
    if (!editingActionText.trim()) return;
    const updated = currentActions.map(act => 
      act.id === actionId ? { ...act, text: editingActionText.trim() } : act
    );
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        actions: updated
      });
    }
    setEditingActionId(null);
    setEditingActionText('');
    showToast(isBn ? 'অ্যাকশন সফলভাবে পরিমার্জন করা হয়েছে! 📝' : 'Action updated successfully! 📝');
  };

  const handleDeleteAction = (actionId: string) => {
    const updated = currentActions.filter(act => act.id !== actionId);
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        actions: updated
      });
    }
    if (editingActionId === actionId) {
      setEditingActionId(null);
      setEditingActionText('');
    }
    showToast(isBn ? 'অ্যাকশনটি সফলভাবে ডিলিট করা হয়েছে! 🗑️' : 'Action deleted successfully! 🗑️');
  };

  const handleToggleActionDone = (actionId: string) => {
    const updated = currentActions.map(act => {
      if (act.id === actionId) {
        const nextDone = !act.isDone;
        return { 
          ...act, 
          isDone: nextDone, 
          status: (nextDone ? 'completed' : 'active') as 'completed' | 'active'
        };
      }
      return act;
    });
    if (onUpdateHubData) {
      onUpdateHubData({
        ...state.hubData,
        actions: updated
      });
    }
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setAiResponse(`এআই অ্যাসিস্ট্যান্ট উত্তর: "${aiPrompt}" - আপনার প্রশ্নটি সফলভাবে বিশ্লেষণ করা হয়েছে। দিলখুশ এন্টারপ্রাইজ ম্যানেজমেন্ট সিস্টেমের কার্যকারিতা বজায় রাখতে এটি অত্যন্ত চমৎকার একটি বিষয়! 🤖✨`);
      setIsAiLoading(false);
      showToast('AI Assistant responded successfully! 🤖');
    }, 800);
  };

  return (
    <div className="space-y-6 pb-28 w-full max-w-5xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Hub Header Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/90 via-sky-950/90 to-gray-900 border border-sky-500/30 p-3 shadow-lg">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h1 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-400" />
              🌟 দিলখুশ হাব (Hub)
            </h1>
            <p className="text-[10px] text-gray-400 leading-tight">
              নির্দেশিকা, রিমাইন্ডার, আইডিয়া, সতর্কতা, নিজস্ব অ্যাকশন ও এআই অ্যাসিস্ট্যান্ট।
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-950/80 px-2 py-1 rounded-lg border border-sky-500/20 shadow-inner shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[9px] font-bold text-emerald-400 font-sans">v{state.settings.version}</span>
          </div>
        </div>
      </div>

      {/* 6 Grid Hub Options (2 per row, compact design) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        
        {/* 1. Special Instructions */}
        <div 
          onClick={() => setActiveModal('instructions')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/90 via-gray-900 to-slate-950 border border-indigo-500/50 hover:border-indigo-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center text-lg shadow-md shadow-indigo-950">
                🎯
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowAddInstruction(true); }}
                className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-950/50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 font-black" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-indigo-300 transition-colors mb-1">
              Special Instructions
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              বিশেষ নির্দেশিকা ও অফিসিয়াল গাইডলাইন।
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-indigo-950/80 flex items-center justify-between text-indigo-400 text-[11px] font-bold">
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }}>{isBn ? 'ম্যানেজ করুন' : 'Manage'}</span>
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }} className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* 2. Reminder */}
        <div 
          onClick={() => setActiveModal('reminder')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/90 via-gray-900 to-slate-950 border border-amber-500/50 hover:border-amber-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/25 border border-amber-400/50 flex items-center justify-center text-lg shadow-md shadow-amber-950">
                ⏰
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowAddReminder(true); setActiveModal('reminder'); }}
                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center shadow-md shadow-amber-950/50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 font-black" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors mb-1">
              Reminder
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              দৈনিক কাজের রিমাইন্ডার ও নোটিফিকেশন।
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-amber-950/80 flex items-center justify-between text-amber-400 text-[11px] font-bold">
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }}>{isBn ? 'ম্যানেজ করুন' : 'Manage'}</span>
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }} className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* 3. Own Ideas 💡 */}
        <div 
          onClick={() => setActiveModal('ideas')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/90 via-gray-900 to-slate-950 border border-emerald-500/50 hover:border-emerald-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center text-lg shadow-md shadow-emerald-950">
                💡
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
                Creative
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-emerald-300 transition-colors mb-1">
              Own Ideas 💡
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              উদ্ভাবনী আইডিয়া ও প্রস্তাবনা যুক্ত করুন।
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-emerald-950/80 flex items-center justify-between text-emerald-400 text-[11px] font-bold">
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }}>{isBn ? 'ম্যানেজ করুন' : 'Manage'}</span>
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }} className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* 4. Emergency & Urgent Tasks */}
        <div 
          onClick={() => setActiveModal('emergency')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/90 via-gray-900 to-slate-950 border border-rose-500/50 hover:border-rose-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center p-1.5 shadow-md shadow-rose-950">
                <EmergencyIcon className="w-6 h-6 object-contain drop-shadow" />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveModal('emergency'); /* Assume emergency modal has add logic */ }}
                className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-950/50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 font-black" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-rose-300 transition-colors mb-1">
              {isBn ? 'জরুরী কাজ ও অ্যালার্ট' : 'Emergency & Urgent Tasks'}
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              {isBn ? 'জরুরী কাজ, বিশেষ নোটিশ ও হটলাইন সহায়তা।' : 'Urgent tasks, special notices, and hotline support.'}
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-rose-950/80 flex items-center justify-between text-rose-400 text-[11px] font-bold">
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }}>{isBn ? 'ম্যানেজ করুন' : 'Manage'}</span>
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }} className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* 5. Own action */}
        <div 
          onClick={() => setActiveModal('action')}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-950/90 via-gray-900 to-slate-950 border border-sky-500/50 hover:border-sky-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500/25 border border-sky-400/50 flex items-center justify-center text-lg shadow-md shadow-sky-950">
                🛠️
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveModal('action'); }}
                className="w-7 h-7 rounded-lg bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-950/50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 font-black" />
              </button>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-sky-300 transition-colors mb-1">
              Own action
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              নিজস্ব কর্মপরিকল্পনা ও টাস্ক লিস্ট।
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-sky-950/80 flex items-center justify-between text-sky-400 text-[11px] font-bold">
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }}>{isBn ? 'ম্যানেজ করুন' : 'Manage'}</span>
            <span onClick={(e) => { e.stopPropagation(); onNavigateTab('hub-manage'); }} className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* 6. Ai assistant */}
        <div 
          onClick={() => {
            if (onOpenAiAssistant) {
              onOpenAiAssistant();
            } else {
              setActiveModal('ai');
            }
          }}
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/90 via-gray-900 to-slate-950 border border-purple-500/50 hover:border-purple-400 p-4 shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-lg shadow-md shadow-purple-950">
                🤖
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase tracking-wider">
                AI Smart
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white group-hover:text-purple-300 transition-colors mb-1">
              Ai assistant
            </h3>
            <p className="text-[11px] text-gray-300 leading-snug line-clamp-2">
              স্মার্ট এআই অ্যাসিস্ট্যান্টের সাথে কথা বলুন।
            </p>
          </div>
          <div className="mt-4 pt-2.5 border-t border-purple-950/80 flex items-center justify-between text-purple-400 text-[11px] font-bold">
            <span>প্রশ্ন করুন</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

      </div>

      {/* Interactive Modals for each Hub item */}
      <NewDirectiveModal
        isOpen={showAddInstruction}
        onClose={() => setShowAddInstruction(false)}
        onAddDirective={handleAddInstruction}
      />
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-sky-500/50 rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-5 shadow-2xl relative my-auto max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header for Reminders (Fixed at top inside modal) */}
            {activeModal === 'reminder' ? (
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-800 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xl shrink-0">
                    ⏰
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-white truncate">Reminder & Alerts</h3>
                    <p className="text-[11px] text-gray-400 truncate">{isBn ? 'গুরুত্বপূর্ণ রিমাইন্ডার ও নোটিফিকেশন' : 'Important reminders and notifications'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAddReminder(!showAddReminder)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs flex items-center gap-1 transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddReminder ? (isBn ? 'ফর্ম বন্ধ' : 'Close') : (isBn ? 'নতুন রিমাইন্ডার' : '+ Set New Reminder')}</span>
                  </button>

                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-800/80 hover:bg-rose-950/50 text-gray-400 hover:text-rose-300 transition-all z-10 cursor-pointer"
                title={isBn ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto pr-1 pt-3 space-y-3.5">

            {/* 1. Instructions Modal */}
            {activeModal === 'instructions' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-2xl">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Special Instructions</h3>
                    <p className="text-xs text-gray-400">অফিসিয়াল বিশেষ নির্দেশিকা ও নীতিমালা</p>
                  </div>
                </div>
                <div className="space-y-3.5 pt-2 text-sm text-gray-200 max-h-96 overflow-y-auto pr-1">
                  {(() => {
                    const activeInstructions = state.hubData?.instructions?.filter(inst => (inst.status || 'pending') !== 'complete') || [];
                    if (activeInstructions.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <p className="text-xs text-gray-500">
                            {isBn ? 'সব কাজ সম্পন্ন হয়েছে! কোনো চলমান বিশেষ নির্দেশিকা নেই।' : 'All tasks completed! No active special instructions.'}
                          </p>
                        </div>
                      );
                    }
                    return activeInstructions.map((inst, index) => {
                      const statusVal = inst.status || 'pending';
                      const assignedStaff = state.staffList?.find(s => s.id === inst.assignedStaffId);
                      return (
                        <div key={inst.id || index} className="p-4 rounded-2xl bg-gray-950 border border-gray-850 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-200 shadow-md">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-2.5 items-start">
                              <span className="text-indigo-400 font-extrabold text-sm min-w-[16px] text-right">{index + 1}.</span>
                              <p className="whitespace-pre-line leading-relaxed text-sm text-gray-200">{inst.text}</p>
                            </div>
                            
                            {/* Top Right Status Badge */}
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0 ${
                              statusVal === 'pending' ? 'bg-slate-500/10 text-slate-400 border-slate-500/30' :
                              statusVal === 'progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' :
                              statusVal === 'attempting' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' :
                              statusVal === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                              statusVal === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {statusVal === 'pending' ? (isBn ? 'পেন্ডিং' : 'Pending') :
                               statusVal === 'progress' ? (isBn ? 'চলমান' : 'Progress') :
                               statusVal === 'attempting' ? (isBn ? 'চেষ্টা' : 'Attempting') :
                               statusVal === 'partial' ? (isBn ? 'আংশিক' : 'Partial') :
                               statusVal === 'complete' ? (isBn ? 'সম্পন্ন' : 'Complete') :
                               (isBn ? 'ব্যর্থ' : 'Failed')}
                            </span>
                          </div>

                          {/* Staff Assignment Display */}
                          <div className="flex items-center gap-2 mt-1 pb-2 border-b border-gray-900">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[11px] font-bold text-gray-400">
                              {isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ:' : 'Assigned Staff:'}
                            </span>
                            {assignedStaff ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                {isBn ? (assignedStaff.name) : (assignedStaff.nameEn || assignedStaff.name)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-550 italic">
                                {isBn ? 'কেউ এসাইন করা নেই' : 'No staff assigned'}
                              </span>
                            )}
                          </div>

                          {/* Status Quick-Select Buttons Tracker Row */}
                          <div className="mt-2 pt-2 border-t border-gray-900 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                {isBn ? 'অগ্রগতি ট্র্যাকার:' : 'Progress Tracker:'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                              {[
                                { value: 'pending', labelBn: 'পেন্ডিং', labelEn: 'Pending', sel: 'bg-slate-500/20 text-slate-300 border-slate-500/50', unsel: 'bg-slate-950/20 text-gray-500 border-transparent hover:bg-slate-500/10 hover:text-slate-400' },
                                { value: 'progress', labelBn: 'চলমান', labelEn: 'Progress', sel: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50', unsel: 'bg-indigo-950/20 text-gray-500 border-transparent hover:bg-indigo-500/10 hover:text-indigo-400' },
                                { value: 'attempting', labelBn: 'চেষ্টা', labelEn: 'Attempting', sel: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50', unsel: 'bg-fuchsia-950/20 text-gray-500 border-transparent hover:bg-fuchsia-500/10 hover:text-fuchsia-400' },
                                { value: 'partial', labelBn: 'আংশিক', labelEn: 'Partial', sel: 'bg-amber-500/20 text-amber-300 border-amber-500/50', unsel: 'bg-amber-950/20 text-gray-500 border-transparent hover:bg-amber-500/10 hover:text-amber-400' },
                                { value: 'complete', labelBn: 'সম্পন্ন', labelEn: 'Complete', sel: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50', unsel: 'bg-emerald-950/20 text-gray-500 border-transparent hover:bg-emerald-500/10 hover:text-emerald-400' },
                                { value: 'failed', labelBn: 'ব্যর্থ', labelEn: 'Failed', sel: 'bg-rose-500/20 text-rose-300 border-rose-500/50', unsel: 'bg-rose-950/20 text-gray-500 border-transparent hover:bg-rose-500/10 hover:text-rose-400' }
                              ].map((opt) => {
                                const isSelected = statusVal === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleUpdateInstructionStatus(inst.id, opt.value)}
                                    className={`py-1 rounded text-[9px] font-black border transition-all text-center ${
                                      isSelected 
                                        ? `${opt.sel} font-extrabold shadow-sm` 
                                        : `${opt.unsel}`
                                    }`}
                                  >
                                    {isBn ? opt.labelBn : opt.labelEn}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* 2. Reminder Modal */}
            {activeModal === 'reminder' && (
              <div className="space-y-3">
                {/* Compact Inline Set New Reminder Form */}
                {showAddReminder && (
                  <form onSubmit={handleAddQuickReminder} className="p-3.5 sm:p-4 rounded-2xl bg-gray-950 border border-amber-500/40 space-y-2.5 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
                    <div className="flex items-center justify-between pb-1 border-b border-gray-850">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isBn ? 'নতুন রিমাইন্ডার ফর্ম (Set New Reminder)' : 'Set New Reminder'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowAddReminder(false)}
                        className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-gray-400">
                          {isBn ? 'রিমাইন্ডার বিষয়/শিরোনাম' : 'Reminder Title'}
                        </label>
                        {quickReminderTime && (
                          <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {quickReminderTime}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={quickReminderTitle}
                        onChange={(e) => setQuickReminderTitle(e.target.value)}
                        placeholder={isBn ? 'যেমন: সকালের ক্যাশ হিসাব বা মিটিং' : 'e.g. Daily morning sales review'}
                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-550 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        required
                      />

                      {/* Suggested Quick Titles */}
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5">
                        {[
                          isBn ? 'সকালের ক্যাশ চেক' : 'Morning Cash Review',
                          isBn ? 'স্টাফ ব্রিফিং' : 'Staff Briefing',
                          isBn ? 'স্টক ও ইনভেন্টরি অডিট' : 'Stock Audit',
                          isBn ? 'দোকান ক্লোজিং চেক' : 'Closing Checklist'
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setQuickReminderTitle(suggestion)}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-300 border border-slate-800 shrink-0 transition-all active:scale-95"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clock Picker Component */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{isBn ? 'সময় নির্বাচন' : 'Time Picker'}</span>
                      </label>
                      <ClockTimePicker
                        value={quickReminderTime}
                        onChange={(val) => setQuickReminderTime(val)}
                        isBn={isBn}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-gray-850">
                      <button
                        type="button"
                        onClick={() => setShowAddReminder(false)}
                        className="px-3 py-1.5 rounded-xl bg-gray-850 hover:bg-gray-800 text-gray-300 text-xs font-bold transition-all"
                      >
                        {isBn ? 'বাতিল' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সেভ করুন' : 'Save Reminder'}</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2 pt-1 max-h-72 overflow-y-auto pr-1">
                  {state.hubData?.reminders?.map((rem) => (
                    <div key={rem.id} className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-amber-300 truncate">{rem.title}</h4>
                        <p className="text-[11px] text-gray-300 mt-0.5 flex items-center gap-1.5 truncate font-medium">
                          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{rem.time}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase shrink-0 ${
                        rem.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {rem.status === 'active' ? (isBn ? 'সক্রিয়' : 'ACTIVE') : (isBn ? 'আসছে' : 'COMING')}
                      </span>
                    </div>
                  ))}
                  {(!state.hubData?.reminders || state.hubData.reminders.length === 0) && (
                    <p className="text-xs text-gray-550 text-center py-6">{isBn ? 'কোনো রিমাইন্ডার সেট করা নেই।' : 'No reminders set yet.'}</p>
                  )}
                </div>

                {/* Direct link to Manage Tab */}
                <div className="pt-2 border-t border-gray-850 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onNavigateTab('hub-manage');
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{isBn ? 'সব রিমাইন্ডার ম্যানেজমেন্ট স্ক্রিনে দেখুন ও এডিট করুন →' : 'Manage & edit all reminders →'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. Own Ideas Modal */}
            {activeModal === 'ideas' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-2xl">
                    💡
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Own Ideas 💡</h3>
                    <p className="text-xs text-gray-400">
                      {isBn 
                        ? 'আপনার নিজস্ব উদ্ভাবনী আইডিয়া যুক্ত, সম্পাদনা ও মনে রাখুন' 
                        : 'Add, edit, delete, and mark remembered ideas'}
                    </p>
                  </div>
                </div>

                {/* Add new idea form */}
                <form onSubmit={handleAddIdea} className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ideaText}
                      onChange={(e) => setIdeaText(e.target.value)}
                      placeholder={isBn ? "নতুন কোনো আইডিয়া বা প্রস্তাবনা লিখুন... 💡" : "Type a new idea or suggestion... 💡"}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-gray-950 border border-emerald-500/50 text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950 transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'যোগ করুন' : 'Add Idea'}</span>
                    </button>
                  </div>
                </form>

                {/* Collapsible List of ideas section */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setIsIdeasCollapsed(!isIdeasCollapsed)}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/40 cursor-pointer transition-all select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold text-xs">💡</span>
                      <h4 className="text-xs font-black text-gray-200 tracking-wide">
                        {isBn ? 'সকল আইডিয়া তালিকা' : 'All Saved Ideas'}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                        {currentIdeas.length} {isBn ? 'টি' : 'items'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                      <span className="text-[10px] hidden sm:inline text-gray-400">
                        {isIdeasCollapsed ? (isBn ? 'তালিকা খুলুন' : 'Expand') : (isBn ? 'কোলাপ্স করুন' : 'Collapse')}
                      </span>
                      <div className="p-1 rounded bg-gray-900 border border-gray-800 text-emerald-400">
                        {isIdeasCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* List Container with Collapse Support */}
                  {!isIdeasCollapsed && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      {currentIdeas.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-500 bg-gray-950/60 rounded-xl border border-dashed border-gray-800">
                          {isBn ? 'কোনো জমা দেওয়া আইডিয়া নেই। উপরে নতুন আইডিয়া যোগ করুন।' : 'No saved ideas found. Add one above.'}
                        </div>
                      ) : (
                        <>
                          <div className={`space-y-2.5 overflow-y-auto pr-1 transition-all ${
                            isIdeasExpandedView ? 'max-h-80' : 'max-h-56'
                          }`}>
                            {(isIdeasExpandedView ? currentIdeas : currentIdeas.slice(0, 3)).map((item) => {
                              const isEditing = editingIdeaId === item.id;
                              return (
                                <div 
                                  key={item.id} 
                                  className={`p-3 rounded-xl border transition-all duration-200 ${
                                    item.isRemembered 
                                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950/40' 
                                      : 'bg-gray-950 border-gray-800 hover:border-gray-750'
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <textarea
                                        value={editingIdeaText}
                                        onChange={(e) => setEditingIdeaText(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-emerald-500/60 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                        rows={2}
                                      />
                                      <div className="flex items-center justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setEditingIdeaId(null)}
                                          className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold hover:text-white"
                                        >
                                          {isBn ? 'বাতিল' : 'Cancel'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleSaveEditIdea(item.id)}
                                          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 flex items-center gap-1"
                                        >
                                          <Save className="w-3.5 h-3.5" />
                                          <span>{isBn ? 'সংরক্ষণ' : 'Save'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs sm:text-sm text-gray-100 font-medium leading-relaxed min-w-0 flex-1">
                                          {item.text}
                                        </p>
                                        {item.isRemembered && (
                                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black flex items-center gap-1 shadow-sm">
                                            <Brain className="w-3 h-3 text-emerald-400" />
                                            <span>{isBn ? 'মনে রেখেছি' : 'Remembered'}</span>
                                          </span>
                                        )}
                                      </div>

                                      {/* Controls: Remembered button, Edit button, Delete button */}
                                      <div className="flex items-center justify-between pt-2 border-t border-gray-900/80 gap-2">
                                        {/* Remembered Toggle Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleToggleRemembered(item.id)}
                                          className={`px-2.5 py-1 rounded-xl text-[10px] font-black border transition-all flex items-center gap-1.5 active:scale-95 ${
                                            item.isRemembered
                                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                                              : 'bg-gray-900 text-gray-400 hover:text-emerald-300 border-gray-800 hover:border-emerald-500/30'
                                          }`}
                                        >
                                          <Brain className={`w-3.5 h-3.5 ${item.isRemembered ? 'text-emerald-400' : 'text-gray-500'}`} />
                                          <span>{item.isRemembered ? (isBn ? '🧠 মনে রেখেছি' : '🧠 Remembered') : (isBn ? 'মনে রাখুন' : 'Mark Remembered')}</span>
                                        </button>

                                        <div className="flex items-center gap-1.5">
                                          {/* Edit Button */}
                                          <button
                                            type="button"
                                            onClick={() => handleStartEditIdea(item)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-sky-300 bg-gray-900 border border-gray-800 hover:border-sky-500/30 transition-colors"
                                            title={isBn ? 'এডিট করুন' : 'Edit Idea'}
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Delete Button */}
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteIdea(item.id)}
                                            className="p-1.5 rounded-lg text-rose-450 hover:text-rose-300 bg-gray-900 border border-gray-800 hover:border-rose-500/30 transition-colors"
                                            title={isBn ? 'ডিলিট করুন' : 'Delete Idea'}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Large List Collapse/Expand Toggle (> 3 items) */}
                          {currentIdeas.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setIsIdeasExpandedView(!isIdeasExpandedView)}
                              className="w-full py-1.5 px-3 rounded-lg bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              {isIdeasExpandedView ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'সংক্ষিপ্ত করুন (কম দেখুন)' : 'Collapse (Show Less)'}</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>{isBn ? `আরও ${currentIdeas.length - 3}টি আইডিয়া দেখুন` : `Show ${currentIdeas.length - 3} More Ideas`}</span>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Emergency Modal */}
            {activeModal === 'emergency' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/40 flex items-center justify-center">
                    <EmergencyIcon className="w-8 h-8 object-contain drop-shadow" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>{isBn ? 'জরুরী কাজ ও অ্যালার্ট' : 'Emergency Tasks & Alerts'}</span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      {isBn ? 'জরুরী কর্মপরিকল্পনা, বিশেষ কাজ ও নিরাপত্তা সহায়তা' : 'Urgent actions, tasks, and emergency hotlines'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3 pt-2 max-h-96 overflow-y-auto pr-1">
                  {state.hubData?.emergencies?.map((eme, idx) => {
                    const isTask = eme.type === 'task' || !eme.phone;
                    const assignedStaff = state.staffList?.find(s => s.id === eme.assignedStaffId);
                    
                    if (isTask) {
                      return (
                        <div 
                          key={eme.id || idx}
                          className="p-4 rounded-xl bg-gray-950 border border-rose-950/80 flex flex-col gap-2.5 relative overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
                        >
                          <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/5 rounded-full blur-lg"></div>
                          
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex gap-2 items-start">
                              <EmergencyIcon className="w-4 h-4 object-contain mt-0.5 shrink-0" />
                              <h4 className="text-sm font-extrabold text-rose-300 leading-tight">
                                {eme.title}
                              </h4>
                            </div>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              {eme.status || (isBn ? 'জরুরী' : 'URGENT')}
                            </span>
                          </div>

                          {eme.description && (
                            <p className="text-xs text-gray-300 leading-relaxed pl-6 whitespace-pre-line bg-rose-950/20 p-2.5 rounded-lg border border-rose-950/30">
                              {eme.description}
                            </p>
                          )}

                          {assignedStaff && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 pl-6">
                              <User className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                              <span className="font-semibold text-[11px]">{isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ:' : 'Assigned Staff:'}</span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                                {isBn ? assignedStaff.name : (assignedStaff.nameEn || assignedStaff.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <a 
                        key={eme.id || idx}
                        href={`tel:${eme.phone}`} 
                        className="p-3.5 rounded-xl bg-gray-950 border border-gray-850 flex items-center justify-between gap-3 hover:bg-rose-950/30 hover:border-rose-950/50 transition-all animate-in fade-in duration-200 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <EmergencyIcon className="w-5 h-5 object-contain shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-gray-200 group-hover:text-rose-300 transition-colors">{eme.title}</h4>
                            <p className="text-xs text-gray-450 mt-0.5">{isBn ? 'হটলাইন' : 'Hotline'}: <span className="font-sans text-rose-400 font-bold">{eme.phone}</span></p>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-lg bg-rose-600 group-hover:bg-rose-500 text-white text-xs font-black shadow shrink-0 transition-all group-hover:scale-105">
                          {eme.status || (isBn ? 'কল' : 'CALL')}
                        </span>
                      </a>
                    );
                  })}
                  {(!state.hubData?.emergencies || state.hubData.emergencies.length === 0) && (
                    <p className="text-xs text-gray-550 text-center py-6">
                      {isBn ? 'কোনো জরুরী কাজ বা কন্টাক্ট সেট করা নেই।' : 'No emergency tasks or contacts registered yet.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 5. Own Action Modal */}
            {activeModal === 'action' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/40 text-2xl shadow-md shadow-sky-950">
                      🛠️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">Own action</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          {currentActions.length} {isBn ? 'টি অ্যাকশন' : 'Actions'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{isBn ? 'ব্যক্তিগত কার্যতালিকা ও কর্মপরিকল্পনা' : 'Personal action items & checklist'}</p>
                    </div>
                  </div>
                </div>

                {/* Add New Action Form */}
                <form onSubmit={handleAddAction} className="space-y-3 pt-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      placeholder={isBn ? "নতুন অ্যাকশন বা কাজ লিখুন... 🛠️" : "Type new custom action... 🛠️"}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gray-950 border border-sky-500/50 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="submit"
                      disabled={!newActionText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-950 transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isBn ? 'যোগ করুন' : 'Add'}</span>
                    </button>
                  </div>
                </form>

                {/* Collapsible Action List Section */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setIsActionsCollapsed(!isActionsCollapsed)}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-sky-500/40 cursor-pointer transition-all select-none"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sky-400 font-bold text-xs">📋</span>
                      <h4 className="text-xs font-black text-gray-200 tracking-wide">
                        {isBn ? 'আমার অ্যাকশন তালিকা' : 'My Action List'}
                      </h4>
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 border border-sky-400/25">
                        {currentActions.filter(a => a.isDone).length}/{currentActions.length} {isBn ? 'সম্পন্ন' : 'Done'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                      <span className="text-[10px] hidden sm:inline text-gray-400">
                        {isActionsCollapsed ? (isBn ? 'তালিকা খুলুন' : 'Expand') : (isBn ? 'কোলাপ্স করুন' : 'Collapse')}
                      </span>
                      <div className="p-1 rounded bg-gray-900 border border-gray-800 text-sky-400">
                        {isActionsCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* List Container with Collapse Support */}
                  {!isActionsCollapsed && (
                    <div className="space-y-2 animate-in fade-in duration-200">
                      {currentActions.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-xs bg-gray-950/60 rounded-xl border border-dashed border-gray-800">
                          {isBn ? 'কোনো অ্যাকশন নেই। উপরে নতুন অ্যাকশন যোগ করুন।' : 'No action items yet. Add one above.'}
                        </div>
                      ) : (
                        <>
                          <div className={`space-y-2 overflow-y-auto pr-1 transition-all ${
                            isActionsExpandedView ? 'max-h-80' : 'max-h-56'
                          }`}>
                            {(isActionsExpandedView ? currentActions : currentActions.slice(0, 3)).map((act) => {
                              const isEditing = editingActionId === act.id;

                              if (isEditing) {
                                return (
                                  <div 
                                    key={act.id} 
                                    className="p-2.5 rounded-xl bg-sky-950/90 border border-sky-400 shadow-md animate-in fade-in duration-150 space-y-2"
                                  >
                                    <input
                                      type="text"
                                      value={editingActionText}
                                      onChange={(e) => setEditingActionText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEditAction(act.id);
                                        if (e.key === 'Escape') setEditingActionId(null);
                                      }}
                                      autoFocus
                                      className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-sky-400 text-white text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
                                    />
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingActionId(null)}
                                        className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-all"
                                      >
                                        {isBn ? 'বাতিল' : 'Cancel'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditAction(act.id)}
                                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                                      >
                                        <Save className="w-3 h-3" />
                                        <span>{isBn ? 'সংরক্ষণ' : 'Save'}</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div 
                                  key={act.id} 
                                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 transition-all duration-200 group ${
                                    act.isDone
                                      ? 'bg-gray-950/70 border-emerald-500/25 opacity-80'
                                      : 'bg-sky-950/30 hover:bg-sky-950/60 border-sky-900/60 hover:border-sky-500/40'
                                  }`}
                                >
                                  {/* Left: Checkbox + Text */}
                                  <div 
                                    onClick={() => handleToggleActionDone(act.id)}
                                    className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none"
                                  >
                                    <button
                                      type="button"
                                      aria-label={act.isDone ? "Mark Incomplete" : "Mark Complete"}
                                      className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 border ${
                                        act.isDone
                                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-sm'
                                          : 'border-sky-500/40 bg-gray-900 hover:border-sky-400'
                                      }`}
                                    >
                                      {act.isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </button>
                                    <span className={`text-xs sm:text-sm transition-all break-words ${
                                      act.isDone ? 'line-through text-gray-400' : 'text-gray-100 font-medium'
                                    }`}>
                                      {act.text}
                                    </span>
                                  </div>

                                  {/* Right: Status badge & Action Controls (Edit & Delete) */}
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border hidden sm:inline-block ${
                                      act.isDone
                                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                        : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                    }`}>
                                      {act.isDone ? (isBn ? 'সম্পন্ন' : 'Done') : (isBn ? 'চলমান' : 'Active')}
                                    </span>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEditAction(act);
                                      }}
                                      className="p-1.5 rounded-lg bg-gray-900 hover:bg-sky-950 text-gray-400 hover:text-sky-300 border border-gray-800 hover:border-sky-500/40 transition-all"
                                      title={isBn ? 'অ্যাকশন এডিট করুন' : 'Edit action'}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAction(act.id);
                                      }}
                                      className="p-1.5 rounded-lg bg-gray-900 hover:bg-rose-950 text-gray-400 hover:text-rose-400 border border-gray-800 hover:border-rose-500/40 transition-all"
                                      title={isBn ? 'অ্যাকশন ডিলিট করুন' : 'Delete action'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Large List Collapse/Expand Toggle (> 3 items) */}
                          {currentActions.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setIsActionsExpandedView(!isActionsExpandedView)}
                              className="w-full py-1.5 px-3 rounded-lg bg-gray-950 hover:bg-gray-900 border border-gray-800 hover:border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            >
                              {isActionsExpandedView ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>{isBn ? 'সংক্ষিপ্ত করুন (কম দেখুন)' : 'Collapse (Show Less)'}</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>{isBn ? `আরও ${currentActions.length - 3}টি অ্যাকশন দেখুন` : `Show ${currentActions.length - 3} More Actions`}</span>
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. AI Assistant Modal */}
            {activeModal === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/40 text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Ai assistant</h3>
                    <p className="text-xs text-gray-400">স্মার্ট এআই অ্যাসিস্ট্যান্টের সাথে কথা বলুন</p>
                  </div>
                </div>

                <form onSubmit={handleAskAi} className="space-y-3 pt-2">
                  <div>
                    <textarea
                      rows={3}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt.call ? setAiPrompt(e.target.value) : null}
                      placeholder="আপনার যেকোনো প্রশ্ন বা এআই সাহায্য চান এখানে লিখুন... 🤖✨"
                      className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-purple-500/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAiLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-950 transition-all flex items-center justify-center gap-2"
                  >
                    {isAiLoading ? (
                      <span>বিশ্লেষণ করা হচ্ছে... ⏳</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>এআই কে জিজ্ঞেস করুন</span>
                      </>
                    )}
                  </button>
                </form>

                {aiResponse && (
                  <div className="p-4 rounded-xl bg-purple-950/60 border border-purple-700/60 text-sm text-purple-200 space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                      <Sparkles className="w-4 h-4" />
                      <span>এআই রেসপন্স:</span>
                    </div>
                    <p>{aiResponse}</p>
                  </div>
                )}
              </div>
            )}

            </div>

            <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold transition-all"
              >
                বন্ধ করুন
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
