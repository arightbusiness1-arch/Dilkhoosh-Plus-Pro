import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MessageCircle, 
  Building2, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Briefcase, 
  ShieldCheck, 
  Mail, 
  Globe, 
  LogOut, 
  Sparkles,
  UserCheck,
  Award,
  AlertCircle,
  Edit3,
  Save,
  RotateCcw,
  User,
  Tag,
  Check
} from 'lucide-react';
import { StaffMember, AppState } from '../types';
import { formatEnglishDate, toBengaliNumber } from '../utils/dateUtils';
import { loginWithGoogle, logoutGoogleAuth } from '../lib/firebase';

interface ProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  state: AppState;
  onSelectStaffUser: (staffId: string) => void;
  onUpdateStaff?: (oldId: string, updatedStaff: StaffMember) => void;
  onUpdateStaffGoogleAuth: (
    staffId: string, 
    googleData: {
      googleEmail?: string;
      googleDisplayName?: string;
      googlePhotoUrl?: string;
      googleUid?: string;
    } | null
  ) => void;
  showToast: (msg: string) => void;
}

const colorOptions = [
  { name: 'Emerald', value: 'bg-emerald-600' },
  { name: 'Sky Blue', value: 'bg-sky-600' },
  { name: 'Indigo', value: 'bg-indigo-600' },
  { name: 'Rose', value: 'bg-rose-600' },
  { name: 'Amber', value: 'bg-amber-600' },
  { name: 'Teal', value: 'bg-teal-600' },
  { name: 'Violet', value: 'bg-violet-600' },
];

const departmentSuggestions = ['Management', 'Kitchen', 'Service', 'Accounts', 'Front Desk', 'IT & Support', 'Operations'];
const roleSuggestions = ['Manager', 'Senior Staff', 'Executive', 'Chef', 'Cashier', 'Receptionist', 'Delivery Officer'];

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  isOpen,
  onClose,
  staff,
  state,
  onSelectStaffUser,
  onUpdateStaff,
  onUpdateStaffGoogleAuth,
  showToast
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editShift, setEditShift] = useState('');
  const [editJoiningDate, setEditJoiningDate] = useState('');
  const [editAvatarColor, setEditAvatarColor] = useState('bg-emerald-600');
  const [editIsActive, setEditIsActive] = useState(true);

  const isBn = state.settings.language === 'bn';

  useEffect(() => {
    if (staff) {
      setEditId(staff.id || '');
      setEditName(staff.name || '');
      setEditNameEn(staff.nameEn || '');
      setEditRole(staff.role || '');
      setEditDept(staff.department || '');
      setEditPhone(staff.phone || '');
      setEditEmail(staff.email || '');
      setEditShift(staff.shift || '');
      setEditJoiningDate(staff.joiningDate || '');
      setEditAvatarColor(staff.avatarColor || 'bg-emerald-600');
      setEditIsActive(staff.isActive ?? true);
    }
  }, [staff, isOpen]);

  if (!isOpen || !staff) return null;

  const isCurrentUser = state.currentUserId === staff.id;

  // Attendance stats for this staff
  const staffAttendanceRecords = state.attendanceRecords.filter(r => r.staffId === staff.id);
  const presentCount = staffAttendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = staffAttendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = staffAttendanceRecords.filter(r => r.status === 'absent').length;
  const leaveCount = staffAttendanceRecords.filter(r => r.status === 'leave').length;
  const totalRecordsCount = staffAttendanceRecords.length || 1;
  const attendancePercentage = Math.round(((presentCount + lateCount) / totalRecordsCount) * 100);

  // Task stats
  const assignedTasks = state.tasks.filter(t => t.assignedStaffId === staff.id || t.assignedStaffId2 === staff.id);
  const pendingTasks = assignedTasks.filter(t => t.status !== 'complete');
  const completedTasks = assignedTasks.filter(t => t.status === 'complete');

  // Handle Google Sign-In Connection
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onUpdateStaffGoogleAuth(staff.id, {
          googleEmail: user.email || undefined,
          googleDisplayName: user.displayName || undefined,
          googlePhotoUrl: user.photoURL || undefined,
          googleUid: user.uid
        });
        showToast(isBn ? `গুগল একাউন্ট (${user.email}) সফলভাবে সংযুক্ত হয়েছে! 🎉` : `Google account (${user.email}) connected successfully! 🎉`);
      }
    } catch (err: any) {
      console.error('Google Sign In Failed:', err);
      showToast(isBn ? 'গুগল সাইন ইন সম্পন্ন হয়নি! ❌' : 'Google sign-in failed! ❌');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle Google Disconnection
  const handleDisconnectGoogle = async () => {
    try {
      await logoutGoogleAuth();
      onUpdateStaffGoogleAuth(staff.id, null);
      showToast(isBn ? 'গুগল একাউন্ট ডিসকানেক্ট করা হয়েছে!' : 'Google account disconnected!');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Save Edit Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staff) return;

    const cleanName = editName.trim();
    const cleanId = editId.trim().toLowerCase();

    if (!cleanName) {
      showToast(isBn ? 'স্টাফের নাম খালি রাখা যাবে না! ❌' : 'Staff name cannot be empty! ❌');
      return;
    }

    if (!cleanId) {
      showToast(isBn ? 'স্টাফ আইডি খালি রাখা যাবে না! ❌' : 'Staff ID cannot be empty! ❌');
      return;
    }

    // Check if new ID collides with another staff
    if (cleanId !== staff.id.toLowerCase()) {
      const isTaken = state.staffList.some(
        s => s.id.toLowerCase() === cleanId && s.id.toLowerCase() !== staff.id.toLowerCase()
      );
      if (isTaken) {
        showToast(
          isBn
            ? `আইডি "${editId}" অন্য স্টাফের জন্য ব্যবহৃত হয়েছে! ❌`
            : `ID "${editId}" is taken by another staff! ❌`
        );
        return;
      }
    }

    if (onUpdateStaff) {
      const updatedStaffObject: StaffMember = {
        ...staff,
        id: cleanId,
        name: cleanName,
        nameEn: editNameEn.trim() || undefined,
        role: editRole.trim() || 'Staff',
        department: '',
        phone: editPhone.trim(),
        email: editEmail.trim() || undefined,
        shift: editShift.trim() || '09:00 AM - 06:00 PM',
        joiningDate: editJoiningDate || staff.joiningDate,
        avatarColor: editAvatarColor,
        isActive: editIsActive
      };

      onUpdateStaff(staff.id, updatedStaffObject);
      showToast(isBn ? 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে! ✅' : 'Profile updated successfully! ✅');
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto border-sky-500/20">
        
        {/* Top Compact Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs">
              🧑‍💼
            </span>
            <h3 className="text-xs sm:text-sm font-black text-white">
              {isEditing 
                ? (isBn ? 'প্রোফাইল তথ্য সম্পাদনা করুন' : 'Edit Staff Profile')
                : (isBn ? 'প্রোফাইল বিবরণ ও গুগল অ্যাকাউন্ট' : 'Staff Profile & Google Account')
              }
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBn ? 'বাতিল' : 'Cancel'}</span>
              </button>
            )}

            {/* Compact X Close Button */}
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                onClose();
              }}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 space-y-4 max-h-[82vh] overflow-y-auto">

          {/* ================= EDITING MODE FORM ================= */}
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Header Box in Edit Mode */}
              <div className="p-3 bg-slate-950 rounded-xl border border-sky-500/30 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg border border-white/20 shadow ${editAvatarColor}`}>
                  {editName ? editName.slice(0, 1) : 'S'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {isBn ? 'তথ্য আপডেট করুন' : 'Update Profile Information'}
                  </h4>
                  <p className="text-[10px] text-gray-400">
                    {isBn ? 'সবগুলো ফিল্ড সঠিকভাবে পূরণ করে সংরক্ষণ করুন' : 'Fill in the required fields and click Save'}
                  </p>
                </div>
              </div>

              {/* Name & English Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'নাম (বাংলা) *' : 'Name (Bangla) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="যেমন: জুবায়ের আহমেদ"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'নাম (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    placeholder="e.g. Zubayer Ahmed"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Staff ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'স্টাফ আইডি / কোড *' : 'Staff ID / Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editId}
                    onChange={(e) => setEditId(e.target.value)}
                    placeholder="e.g. za01"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-sky-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[9px] text-gray-500 mt-0.5 block">
                    {isBn ? 'আইডি পরিবর্তন করলে ডাটাবেজের সব জায়গায় আপডেট হবে' : 'Changing ID updates all system references'}
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>



                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'পদবি / Role' : 'Role'}
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    placeholder="e.g. Manager, Senior Staff"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 mb-1.5"
                  />
                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {roleSuggestions.map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEditRole(role)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          editRole === role
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                            : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-white'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

              {/* Email & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'যোগাযোগের ইমেইল' : 'Contact Email'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="e.g. staff@example.com"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'ডিউটি শিফট / সময়' : 'Duty Shift / Hours'}
                  </label>
                  <input
                    type="text"
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value)}
                    placeholder="09:00 AM - 06:00 PM"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Joining Date & Avatar Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'যোগদানের তারিখ' : 'Joining Date'}
                  </label>
                  <input
                    type="date"
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-300 uppercase tracking-wider mb-1">
                    {isBn ? 'অবতার থিম রং' : 'Avatar Color Theme'}
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {colorOptions.map(col => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setEditAvatarColor(col.value)}
                        className={`w-6 h-6 rounded-full ${col.value} border-2 transition-transform flex items-center justify-center ${
                          editAvatarColor === col.value ? 'border-white scale-110 shadow-md ring-2 ring-sky-400' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        title={col.name}
                      >
                        {editAvatarColor === col.value && <Check className="w-3 h-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active / Inactive Status Toggle */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    {isBn ? 'স্টাফ সক্রিয় স্ট্যাটাস (Active Status)' : 'Staff Active Status'}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {isBn ? 'নিষ্ক্রিয় করলে ডিরেক্টরিতে নিষ্ক্রিয় দেখাবে' : 'Mark staff as active or inactive in company directory'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                    editIsActive 
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                      : 'bg-rose-950 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {editIsActive ? (isBn ? 'সক্রিয় (Active)' : 'Active') : (isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive')}
                </button>
              </div>

              {/* Save & Cancel Form Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-colors"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Profile Changes'}</span>
                </button>
              </div>

            </form>
          ) : (
            
            /* ================= VIEW PROFILE MODE ================= */
            <>
              {/* Main Staff Header Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-[#031d36] to-slate-950 p-3.5 rounded-xl border border-sky-500/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Profile Photo / Avatar */}
                  <div className="relative">
                    {staff.googlePhotoUrl ? (
                      <img 
                        src={staff.googlePhotoUrl} 
                        alt={staff.name} 
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shadow-emerald-950/60"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md border-2 border-white/20 ${staff.avatarColor}`}>
                        {staff.name.slice(0, 1)}
                      </div>
                    )}
                    
                    {staff.googleEmail && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-slate-950 border border-gray-900 shadow" title="Google Account Connected">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {staff.name}
                      </h2>
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400/40">
                        ID: {staff.id.toUpperCase()}
                      </span>
                    </div>

                    {staff.nameEn && (
                      <p className="text-xs text-gray-400 font-sans font-medium">
                        {staff.nameEn}
                      </p>
                    )}

                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {staff.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Viewer Switcher & Edit Button */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectStaffUser(staff.id);
                      showToast(isBn ? `সক্রিয় ইউজার হিসেবে "${staff.name}" নির্বাচন করা হয়েছে` : `Set "${staff.name}" as active viewer`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                      isCurrentUser
                        ? 'bg-emerald-600 text-white border border-emerald-400/40 ring-1 ring-sky-400'
                        : 'bg-gray-950 hover:bg-gray-850 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isCurrentUser ? (isBn ? 'সক্রিয় ভিউয়ার' : 'Active Viewer') : (isBn ? 'ভিউয়ার হিসেবে সেট করুন' : 'Set Active Viewer')}</span>
                  </button>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                    staff.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {staff.isActive ? (isBn ? 'স্টাফ সক্রিয় (Active)' : 'Active Status') : (isBn ? 'নিষ্ক্রিয় (Inactive)' : 'Inactive Status')}
                  </span>
                </div>
              </div>

              {/* ================= GOOGLE ACCOUNT CONNECTION CARD ================= */}
              <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-slate-950 border border-sky-500/30 p-3.5 rounded-xl space-y-3 shadow-md">
                <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                    </svg>
                    <div>
                      <h4 className="text-xs font-black text-white">
                        {isBn ? 'গুগল অ্যাকাউন্ট সংযোগ (Google Account)' : 'Google Account Connection'}
                      </h4>
                      <p className="text-[10px] text-gray-400">
                        {isBn ? 'ক্লাউড সিঙ্ক ও প্রোফাইল ভেরিফিকেশনের জন্য' : 'Cloud synchronization & account verification'}
                      </p>
                    </div>
                  </div>

                  {staff.googleEmail ? (
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Not Connected
                    </span>
                  )}
                </div>

                {staff.googleEmail ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {staff.googlePhotoUrl ? (
                        <img 
                          src={staff.googlePhotoUrl} 
                          alt="Google Profile" 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full border border-emerald-400 shrink-0" 
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          G
                        </div>
                      )}
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-bold text-white truncate">
                          {staff.googleDisplayName || staff.name}
                        </p>
                        <p className="text-[10px] text-emerald-400 font-mono font-medium truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{staff.googleEmail}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDisconnectGoogle}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 self-end sm:self-auto"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-gray-950 p-2.5 rounded-lg border border-gray-800">
                    <p className="text-[11px] text-gray-300">
                      {isBn 
                        ? 'আপনার গুগল জিমেইল একাউন্টটি এই প্রোফাইলের সাথে কানেক্ট করুন:' 
                        : 'Link your official Google Workspace / Gmail account:'
                      }
                    </p>

                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={handleConnectGoogle}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-md shadow-sky-950 transition-all flex items-center gap-2 shrink-0 active:scale-95 border border-sky-400/40"
                    >
                      {isConnecting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.1 9 5 12 5z"/>
                            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.1-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                          </svg>
                          <span>{isBn ? 'গুগল দিয়ে কানেক্ট করুন' : 'Connect Google Account'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Communication Bar */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${staff.phone.replace(/[^0-9]/g, '')}`}
                  className="py-2 px-3 rounded-xl bg-gray-950 hover:bg-gray-850 text-white hover:text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-gray-800 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Call ({staff.phone})</span>
                </a>

                <a
                  href={`https://wa.me/${staff.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/40 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Message</span>
                </a>
              </div>

              {/* Key Job Details Grid */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isBn ? 'কাজের বিবরণ ও ডিউটি তথ্য' : 'Employment Details'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-gray-200">
                  <div className="bg-gray-900 p-2 rounded-lg border border-gray-800">
                    <span className="text-gray-400 block text-[9px]">Shift / Hours</span>
                    <strong className="text-white font-mono">{staff.shift}</strong>
                  </div>

                  <div className="bg-gray-900 p-2 rounded-lg border border-gray-800">
                    <span className="text-gray-400 block text-[9px]">Joined Date</span>
                    <strong className="text-emerald-300">{formatEnglishDate(staff.joiningDate)}</strong>
                  </div>

                  <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 col-span-2 sm:col-span-1">
                    <span className="text-gray-400 block text-[9px]">Contact Email</span>
                    <strong className="text-sky-300 font-mono truncate block">{staff.email || staff.googleEmail || 'Not specified'}</strong>
                  </div>
                </div>
              </div>

              {/* Attendance Stats Summary */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isBn ? 'উপস্থিতি ও হাজিরা সামারি' : 'Attendance Record Summary'}</span>
                  </h4>
                  <span className="text-xs font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {attendancePercentage}% Present
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-black text-sm block">{toBengaliNumber(presentCount)}</span>
                    <span className="text-[9px] text-gray-400">Present</span>
                  </div>
                  <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                    <span className="text-amber-400 font-black text-sm block">{toBengaliNumber(lateCount)}</span>
                    <span className="text-[9px] text-gray-400">Late</span>
                  </div>
                  <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                    <span className="text-rose-400 font-black text-sm block">{toBengaliNumber(absentCount)}</span>
                    <span className="text-[9px] text-gray-400">Absent</span>
                  </div>
                  <div className="bg-purple-950/40 p-2 rounded-lg border border-purple-500/20">
                    <span className="text-purple-400 font-black text-sm block">{toBengaliNumber(leaveCount)}</span>
                    <span className="text-[9px] text-gray-400">Leave</span>
                  </div>
                </div>
              </div>

              {/* Assigned Active Tasks */}
              <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                    <span>{isBn ? 'অর্পিত কাজসমূহ' : 'Assigned Tasks'}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-gray-400">
                    Pending: <strong className="text-amber-400">{pendingTasks.length}</strong> • Done: <strong className="text-emerald-400">{completedTasks.length}</strong>
                  </span>
                </div>

                {assignedTasks.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic py-1 text-center">
                    {isBn ? 'এই কর্মীর নামে কোনো কাজ নির্ধারণ করা নেই।' : 'No tasks currently assigned to this staff.'}
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {assignedTasks.map(task => (
                      <div key={task.id} className="p-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between text-[11px] gap-2">
                        <div className="min-w-0">
                          <p className={`font-bold truncate ${task.status === 'complete' ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                          </p>
                          <p className="text-[9px] text-gray-400">Due: {task.dueDate}</p>
                        </div>

                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold shrink-0 ${
                          task.status === 'complete' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রোফাইল তথ্য সম্পাদনা করুন' : 'Edit Profile Information'}</span>
            </button>
          ) : (
            <span className="text-[10px] text-gray-400 font-medium">
              {isBn ? 'সম্পাদনা মোড সক্রিয় রয়েছে' : 'Editing Mode Active'}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
