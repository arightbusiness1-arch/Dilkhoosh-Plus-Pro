import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpenCheck, Pin } from 'lucide-react';
import { Directive, PriorityLevel } from '../types';
import { departmentsList } from '../data/initialData';
import { getTodayDateString } from '../utils/dateUtils';

interface NewDirectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDirective: (directive: Omit<Directive, 'id' | 'createdAt' | 'acknowledgedStaffIds'>) => void;
}

export const NewDirectiveModal: React.FC<NewDirectiveModalProps> = ({
  isOpen,
  onClose,
  onAddDirective
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('urgent');
  const [category, setCategory] = useState('Safety & Hygiene');
  const [targetDepartment, setTargetDepartment] = useState('all');
  const [isPinned, setIsPinned] = useState(true);
  const [checklistItems, setChecklistItems] = useState<{ id: string; text: string; isDone: boolean }[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  const categories = [
    'Safety & Hygiene',
    'Customer Service',
    'Production Rules',
    'Cash & Accounts',
    'Normal Notice'
  ];

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklistItems([
      ...checklistItems,
      {
        id: `c-${Date.now()}`,
        text: newChecklistText.trim(),
        isDone: false
      }
    ]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklistItems(checklistItems.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddDirective({
      title: title.trim(),
      content: content.trim(),
      priority,
      category,
      targetDepartment,
      createdBy: 'Management',
      isPinned,
      checklist: checklistItems
    });

    onClose();
  };

  // Keyboard shortcut listener for Ctrl+S / Cmd+S in NewDirectiveModal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (title.trim() && content.trim()) {
          onAddDirective({
            title: title.trim(),
            content: content.trim(),
            priority,
            category,
            targetDepartment,
            createdBy: 'Management',
            isPinned,
            checklist: checklistItems
          });
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, content, priority, category, targetDepartment, isPinned, checklistItems, onAddDirective, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-700/30 text-emerald-400 border border-emerald-500/40">
              <BookOpenCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Post New Directives & SOP Guidelines</span>
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
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Directive Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Urgent: Morning store opening rules and hygiene checklist"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Details / Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Detailed Directive / Guideline *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Write detailed work rules for staff..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
              >
                <option value="urgent" className="bg-gray-950 text-white">Urgent Protocol (Urgent)</option>
                <option value="high" className="bg-gray-950 text-white">High Priority (High)</option>
                <option value="normal" className="bg-gray-950 text-white">Normal Rules (Normal)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-950 text-white">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Department */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Target Department
            </label>
            <select
              value={targetDepartment}
              onChange={(e) => setTargetDepartment(e.target.value)}
              className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
            >
              <option value="all" className="bg-gray-950 text-white">All Departments (All Staff)</option>
              {departmentsList.filter(d => d !== 'All Departments').map(d => (
                <option key={d} value={d} className="bg-gray-950 text-white">{d}</option>
              ))}
            </select>
          </div>

          {/* Pin Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pin-directive-checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-gray-700 text-emerald-600 focus:ring-0 w-4 h-4"
            />
            <label htmlFor="pin-directive-checkbox" className="text-xs text-gray-300 font-semibold cursor-pointer flex items-center gap-1">
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              <span>Pin to top (for high visibility)</span>
            </label>
          </div>

          {/* SOP Checklist Items */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Actionable Checklist Steps (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Wash hands and wear apron"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
                className="flex-1 bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sky-400 rounded-xl text-xs font-bold border border-gray-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {checklistItems.length > 0 && (
              <div className="mt-2 space-y-1 bg-gray-950 p-2.5 rounded-xl border border-gray-850">
                {checklistItems.map((c, idx) => (
                  <div key={c.id} className="flex items-center justify-between text-xs text-gray-300 py-1 border-b border-gray-850 last:border-0">
                    <span>{idx + 1}. {c.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(c.id)}
                      className="text-gray-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              <span>Post Directive</span>
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
