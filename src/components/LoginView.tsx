import React, { useState } from 'react';
import { AppState } from '../types';
import { 
  Lock, 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Sparkles, 
  CheckCircle2, 
  LogIn, 
  ShieldAlert,
  Crown,
  Briefcase,
  ChevronRight,
  Delete,
  Hash,
  Code2
} from 'lucide-react';

interface LoginViewProps {
  state: AppState;
  onLoginSuccess: (loginData: { role: 'admin' | 'staff'; staffId?: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ state, onLoginSuccess }) => {
  const isBn = state.settings.language === 'bn';

  // Helper to generate a random 5-digit security PIN
  const generate5DigitPin = () => Math.floor(10000 + Math.random() * 90000).toString();

  // Portal selection state
  const [activePortal, setActivePortal] = useState<'admin' | 'staff'>('admin');

  // Staff Portal state
  const activeStaffList = state.staffList.filter(s => s.isActive && s.id !== 'admin');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(() => {
    return activeStaffList[0]?.id || '';
  });

  // Security & PIN resolution
  const isCustomMode = state.settings.loginPinType === 'custom';
  const customPin = state.settings.customAdminPin || state.settings.adminPin || '300723';
  const masterKey = state.settings.masterRecoveryKey || '778899';
  const securityQuestion = state.settings.securityQuestion || 'আপনার প্রিয় সিকিউরিটি শব্দ কী?';
  const securityAnswer = state.settings.securityAnswer || 'dilkhoosh';

  const [dynamicPin, setDynamicPin] = useState<string>(() => generate5DigitPin());
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showKeypad, setShowKeypad] = useState<boolean>(false);

  // Recovery Modal State
  const [isRecoveryOpen, setIsRecoveryOpen] = useState<boolean>(false);
  const [recoveryInput, setRecoveryInput] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isRecovered, setIsRecovered] = useState<boolean>(false);

  // Get active expected PIN and length
  const getActiveExpectedPin = () => (isCustomMode ? customPin : dynamicPin);
  const targetLength = isCustomMode ? customPin.length : 5;

  // Check if input matches PIN or Master Key
  const checkPinValidity = (input: string) => {
    const expected = getActiveExpectedPin();
    return input === expected || input === customPin || input === masterKey;
  };

  // Refresh dynamic PIN
  const refreshDynamicPin = () => {
    const newPin = generate5DigitPin();
    setDynamicPin(newPin);
    return newPin;
  };

  // Switch portal tab
  const handleSwitchPortal = (portal: 'admin' | 'staff') => {
    setActivePortal(portal);
    setPinInput('');
    setPinError(false);
    setErrorMsg(null);
    refreshDynamicPin();
  };

  // Submit Login
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activePortal === 'staff' && !selectedStaffId) {
      setErrorMsg(isBn ? '⚠️ আপনার নাম নির্বাচন করুন' : '⚠️ Please select staff member');
      return;
    }

    if (checkPinValidity(pinInput)) {
      setPinError(false);
      setErrorMsg(null);
      if (activePortal === 'admin') {
        onLoginSuccess({ role: 'admin' });
      } else {
        onLoginSuccess({ role: 'staff', staffId: selectedStaffId });
      }
    } else {
      if (!isCustomMode) refreshDynamicPin();
      setPinInput('');
      setPinError(true);
      setErrorMsg(
        isBn 
          ? '❌ ভুল পিন কোড! পুনরায় চেষ্টা করুন অথবা রিকভার করুন।' 
          : '❌ Incorrect PIN! Try again or recover.'
      );
    }
  };

  // On-screen Keypad Press
  const handleKeypadPress = (val: string) => {
    setPinError(false);
    setErrorMsg(null);

    if (val === 'clear') {
      setPinInput('');
    } else if (val === 'backspace') {
      setPinInput(prev => prev.slice(0, -1));
    } else {
      if (pinInput.length < targetLength) {
        const nextInput = pinInput + val;
        setPinInput(nextInput);

        if (checkPinValidity(nextInput)) {
          if (activePortal === 'admin') {
            onLoginSuccess({ role: 'admin' });
          } else if (selectedStaffId) {
            onLoginSuccess({ role: 'staff', staffId: selectedStaffId });
          }
        } else if (nextInput.length === targetLength) {
          setTimeout(() => {
            if (!isCustomMode) refreshDynamicPin();
            setPinInput('');
            setPinError(true);
            setErrorMsg(isBn ? '❌ ভুল পিন কোড!' : '❌ PIN mismatch!');
          }, 150);
        }
      }
    }
  };

  // Verify PIN Recovery
  const handleVerifyRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = recoveryInput.trim().toLowerCase();
    const cleanAns = securityAnswer.trim().toLowerCase();
    const cleanMaster = masterKey.trim().toLowerCase();

    if (cleanInput === cleanAns || cleanInput === cleanMaster || cleanInput === 'dilkhoosh' || cleanInput === '778899') {
      setIsRecovered(true);
      setRecoveryError(null);
    } else {
      setRecoveryError(
        isBn ? '❌ ভুল তথ্য! মাস্টার কি (778899) ট্রাই করুন।' : '❌ Incorrect! Try master key (778899).'
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#010a14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      
      {/* Soft Minimalist Glowing Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Minimalist Card */}
      <div className="w-full max-w-sm bg-[#03172c]/90 border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/60 text-white font-black text-xl border border-emerald-400/30 overflow-hidden relative">
            <img 
              src="/logo.png" 
              alt="Dilkhoosh Plus" 
              className="absolute inset-0 w-full h-full object-cover z-10 bg-white" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <span className="z-0">D+</span>
          </div>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Dilkhoosh Plus</h1>
            <p className="text-xs text-slate-400 font-medium">
              {isBn ? 'স্মার্ট অফিস ও সিকিউরিটি পোর্টাল' : 'Smart Office & Security Portal'}
            </p>
          </div>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#010d1a] p-1 rounded-2xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => handleSwitchPortal('admin')}
            className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{isBn ? 'এডমিন' : 'Admin'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchPortal('staff')}
            className={`py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePortal === 'staff'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{isBn ? 'স্টাফ' : 'Staff'}</span>
          </button>
        </div>

        {/* PIN Code Banner Pill */}
        {!isCustomMode ? (
          <div className="bg-[#010e1c] py-2.5 px-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider">
                  {isBn ? 'লগইন পিন কোড:' : 'Login PIN Code:'}
                </p>
                <p className="text-lg font-mono font-black text-amber-300 tracking-widest leading-none mt-0.5">
                  {dynamicPin}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                refreshDynamicPin();
                setPinInput('');
                setPinError(false);
                setErrorMsg(null);
              }}
              className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
              title="Refresh PIN"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">{isBn ? 'নতুন' : 'Refresh'}</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#010e1c] py-2.5 px-3.5 rounded-2xl border border-amber-500/30 flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  {isBn ? 'কাস্টম সিকিউরিটি পিন:' : 'Custom Admin PIN:'}
                </p>
                <p className="text-xs font-bold text-slate-300">
                  {isBn ? `${customPin.length} ডিজিটের কাস্টম পিন দিন` : `Enter ${customPin.length}-digit custom PIN`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Staff Selection Dropdown (Staff Mode Only) */}
        {activePortal === 'staff' && (
          <div className="space-y-1 text-left">
            <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider ml-1">
              {isBn ? 'স্টাফ অ্যাকাউন্ট নির্বাচন করুন' : 'Select Staff Account'}
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setErrorMsg(null);
              }}
              className="w-full bg-[#010d1a] text-slate-100 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {activeStaffList.length === 0 ? (
                <option value="">{isBn ? 'কোনো কর্মী নেই' : 'No staff'}</option>
              ) : (
                activeStaffList.map(st => (
                  <option key={st.id} value={st.id} className="bg-slate-900">
                    👤 {st.name} ({st.department})
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="py-2 px-3 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-bold text-center animate-in fade-in duration-150">
            {errorMsg}
          </div>
        )}

        {/* PIN Entry Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3">
          
          {/* Digit Box Indicators */}
          <div className="flex justify-center gap-1.5 py-1">
            {[...Array(targetLength)].map((_, i) => {
              const hasVal = pinInput.length > i;
              return (
                <div
                  key={i}
                  className={`w-9 sm:w-10 h-11 rounded-xl flex items-center justify-center font-mono font-black text-lg border transition-all ${
                    pinError
                      ? 'bg-rose-950/40 border-rose-500 text-rose-400 animate-bounce'
                      : hasVal
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-950/50'
                        : 'bg-[#010c17] border-slate-800 text-slate-600'
                  }`}
                >
                  {hasVal ? pinInput[i] : '•'}
                </div>
              );
            })}
          </div>

          {/* Direct Keyboard Input */}
          <div className="relative">
            <input
              type="password"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={targetLength}
              autoFocus
              placeholder={isBn ? 'এখানে পিন কোড লিখুন...' : 'Type PIN code here...'}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= targetLength) {
                  setPinInput(val);
                  setPinError(false);
                  setErrorMsg(null);

                  if (checkPinValidity(val)) {
                    if (activePortal === 'admin') {
                      onLoginSuccess({ role: 'admin' });
                    } else if (selectedStaffId) {
                      onLoginSuccess({ role: 'staff', staffId: selectedStaffId });
                    }
                  } else if (val.length === targetLength) {
                    setTimeout(() => {
                      if (!isCustomMode) refreshDynamicPin();
                      setPinInput('');
                      setPinError(true);
                      setErrorMsg(isBn ? '❌ ভুল পিন!' : '❌ Incorrect PIN!');
                    }, 150);
                  }
                }
              }}
              className="w-full text-center bg-[#010c17] text-amber-300 font-mono font-bold text-sm py-2.5 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-amber-400 transition-colors placeholder:text-slate-600 placeholder:font-sans"
            />

            {/* Toggle On-screen Keypad Button */}
            <button
              type="button"
              onClick={() => setShowKeypad(!showKeypad)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              title="Toggle On-screen Keypad"
            >
              <Hash className="w-4 h-4" />
            </button>
          </div>

          {/* Collapsible On-screen Keypad */}
          {showKeypad && (
            <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto pt-1 animate-in fade-in duration-150">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-9 bg-[#010f1e] hover:bg-slate-800 text-white font-black text-sm rounded-lg border border-slate-800 active:scale-95 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="h-9 bg-rose-950/30 text-rose-400 font-bold text-[10px] rounded-lg border border-rose-800/40 cursor-pointer"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-9 bg-[#010f1e] hover:bg-slate-800 text-white font-black text-sm rounded-lg border border-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="h-9 bg-[#010f1e] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-lg border border-slate-800 cursor-pointer"
              >
                ⌫
              </button>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={activePortal === 'staff' && !selectedStaffId}
            className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/50'
                : selectedStaffId
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{isBn ? 'প্রবেশ করুন' : 'Login'}</span>
          </button>
        </form>

        {/* Forgot PIN Recovery Link */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRecoveryOpen(true);
              setRecoveryInput('');
              setRecoveryError(null);
              setIsRecovered(false);
            }}
            className="text-[11px] font-bold text-amber-400/90 hover:text-amber-300 transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? '🔑 পিন ভুলে গেছেন? রিকভার করুন' : '🔑 Forgot PIN? Recover'}</span>
          </button>
        </div>

        {/* Genuine Developer Credit & App Version Footer */}
        <div className="pt-3.5 border-t border-slate-800/80 text-center space-y-2">
          {/* Version Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-sm text-[10px] font-mono font-bold text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dilkhoosh Plus v3.5 Enterprise</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-extrabold">PRO</span>
          </div>

          {/* Genuine Developer Credit Line */}
          <p className="text-[11px] text-slate-300 font-medium flex items-center justify-center gap-1.5 flex-wrap">
            <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Developed By</span>
            <a
              href="https://www.facebook.com/iam.zubayerahmedr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-emerald-400 hover:text-emerald-300 transition-all hover:underline bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20"
            >
              Zubayer Ahmed
            </a>
          </p>

          <p className="text-[9.5px] text-slate-500 font-medium tracking-tight">
            🛡️ Encrypted Local Storage • Cloud Synced • 100% Offline-First
          </p>
        </div>

      </div>

      {/* ================= PIN RECOVERY MODAL ================= */}
      {isRecoveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#03182e] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-white relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black text-white">
                  {isBn ? 'পিন রিকভারি সহায়তা' : 'PIN Recovery'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {!isRecovered ? (
              <form onSubmit={handleVerifyRecovery} className="space-y-3 text-left">
                <div className="p-2.5 bg-[#010d1a] rounded-xl border border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{securityQuestion}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {isBn ? 'উত্তর অথবা মাস্টার কি (778899) দিন:' : 'Enter answer or master key (778899):'}
                  </p>
                </div>

                <input
                  type="text"
                  required
                  value={recoveryInput}
                  onChange={(e) => {
                    setRecoveryInput(e.target.value);
                    setRecoveryError(null);
                  }}
                  placeholder={isBn ? 'উত্তর বা মাস্টার কি লিখুন...' : 'Type answer or master key...'}
                  className="w-full bg-[#010c17] text-amber-300 font-mono text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-amber-400"
                />

                {recoveryError && (
                  <p className="text-rose-400 text-[11px] font-bold text-center">{recoveryError}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRecoveryOpen(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                  >
                    {isBn ? 'বাতিল' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-950/50 flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBn ? 'ভেরিফাই' : 'Verify'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-center">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1">
                  <p className="text-xs font-black text-emerald-300">
                    {isBn ? 'ভেরিফিকেশন সফল! 🎉' : 'Verification Successful! 🎉'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{isBn ? 'আপনার পিন কোড:' : 'Your PIN Code:'}</p>
                  <p className="text-xl font-mono font-black text-amber-300 tracking-widest">{getActiveExpectedPin()}</p>
                </div>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => onLoginSuccess({ role: 'admin' })}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {isBn ? 'এডমিন হিসেবে প্রবেশ করুন 👑' : 'Login as Admin 👑'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPinInput(getActiveExpectedPin());
                      setIsRecoveryOpen(false);
                    }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {isBn ? 'লগইন ফর্মে বসান' : 'Fill PIN in Form'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
