import React, { useState } from 'react';
import { X, UserPlus, Users, Phone, Building2, Clock } from 'lucide-react';
import { StaffMember } from '../types';
import { departmentsList} from '../data/initialData';
import { getTodayDateString } from '../utils/dateUtils';

interface NewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStaff: (staff: Omit<StaffMember, 'id' | 'isActive'> & { customId?: string }) => void;
  existingStaffList?: StaffMember[];
}

const colorOptions = [
  'bg-emerald-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-amber-600',
  'bg-teal-600',
  'bg-rose-600',
  'bg-indigo-600',
  'bg-cyan-600'
];

export const NewStaffModal: React.FC<NewStaffModalProps> = ({
  isOpen,
  onClose,
  onAddStaff,
  existingStaffList = []
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [customId, setCustomId] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [shift, setShift] = useState('9:00 AM - 6:00 PM');
  const [avatarColor, setAvatarColor] = useState(colorOptions[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    // Validate if entered customId is already taken
    const cleanId = customId.trim().toLowerCase();
    if (cleanId) {
      const isTaken = existingStaffList.some(s => s.id.toLowerCase() === cleanId);
      if (isTaken) {
        alert(
          existingStaffList[0]?.name
            ? `This Staff ID "${customId}" is already taken! Please choose another one. ❌`
            : `এই স্টাফ আইডি "${customId}" ইতিমধ্যে ব্যবহৃত হয়েছে! অনুগ্রহ করে অন্য একটি ব্যবহার করুন। ❌`
        );
        return;
      }
    }

    onAddStaff({
      name: name.trim(),
      role: role.trim(),
      department: '',
      phone: phone.trim() || '01700-000000',
      email: email.trim(),
      shift,
      avatarColor,
      joiningDate: getTodayDateString(),
      customId: cleanId || undefined
    });

    // Reset fields
    setName('');
    setCustomId('');
    setRole('');
    setPhone('');
    setEmail('');
    onClose();
  };

  // Keyboard shortcut listener for Ctrl+S / Cmd+S in NewStaffModal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (name.trim() && role.trim()) {
          const cleanId = customId.trim().toLowerCase();
          if (cleanId) {
            const isTaken = existingStaffList.some(s => s.id.toLowerCase() === cleanId);
            if (isTaken) {
              alert(
                existingStaffList[0]?.name
                  ? `This Staff ID "${customId}" is already taken! Please choose another one. ❌`
                  : `এই স্টাফ আইডি "${customId}" ইতিমধ্যে ব্যবহৃত হয়েছে! অনুগ্রহ করে অন্য একটি ব্যবহার করুন। ❌`
              );
              return;
            }
          }

          onAddStaff({
            name: name.trim(),
            role: role.trim(),
            department: '',
            phone: phone.trim() || '01700-000000',
            email: email.trim(),
            shift,
            avatarColor,
            joiningDate: getTodayDateString(),
            customId: cleanId || undefined
          });

          setName('');
          setCustomId('');
          setRole('');
          setPhone('');
          setEmail('');
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, name, role, phone, email, shift, avatarColor, customId, existingStaffList, onAddStaff, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-700/30 text-emerald-400 border border-emerald-500/40">
              <UserPlus className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Register New Staff</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-gray-800 text-[10px] text-gray-400 border border-gray-700 font-mono">
                  Ctrl+S to save
                </span>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Staff Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Staff Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tanvir Hasan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-bold"
            />
          </div>

          {/* ID, Role & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                <span>Staff ID *</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">Custom ID</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. staff_12"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Designation (Role) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sales Executive"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
              />
            </div>


          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              placeholder="01712-345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-mono"
            />
          </div>

          {/* Shift Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Working Hours / Shift
            </label>
            <input
              type="text"
              placeholder="e.g. 8:00 AM - 4:00 PM"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Profile Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full ${c} transition-all ${
                    avatarColor === c ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-gray-900 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-xs sm:text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all active:scale-95 border border-emerald-500/40 flex items-center gap-1.5"
            >
              <span>Complete Registration</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-200 border border-emerald-500/30">
                Ctrl+S
              </kbd>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
