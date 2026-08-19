import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Clock, CheckSquare } from 'lucide-react';
import { StaffMember, PriorityLevel, TaskItem, SubTask } from '../types';
import { getTodayDateString } from '../utils/dateUtils';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  staffList,
  onAddTask
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState(staffList[0]?.id || '');
  const [assignedStaffId2, setAssignedStaffId2] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [category, setCategory] = useState('Normal');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('02:00 PM');
  const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const categories = ['Production', 'Sales', 'Cash & Accounts', 'Logistics', 'Cleaning & Hygiene', 'Normal'];

  const handleAddSubtask = () => {
    if (!newSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskInput.trim(),
        completed: false
      }
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      assignedStaffId,
      assignedStaffId2: assignedStaffId2 || undefined,
      priority,
      status: 'pending',
      dueDate,
      dueTime,
      category,
      subtasks
    });

    onClose();
  };

  // Keyboard shortcut listener for Ctrl+S / Cmd+S in NewTaskModal
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (title.trim()) {
          onAddTask({
            title: title.trim(),
            description: description.trim(),
            assignedStaffId,
            assignedStaffId2: assignedStaffId2 || undefined,
            priority,
            status: 'pending',
            dueDate,
            dueTime,
            category,
            subtasks
          });
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, description, assignedStaffId, assignedStaffId2, priority, dueDate, dueTime, category, subtasks, onAddTask, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-700/30 text-emerald-400 border border-emerald-500/40">
              <CheckSquare className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Create New Daily Task</span>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Check morning stock and prepare display"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Detailed Task Description
            </label>
            <textarea
              rows={2}
              placeholder="Details on how to complete the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-950 text-white text-sm rounded-xl px-3.5 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
            />
          </div>

          {/* Staff Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Assigned Staff 1 *
              </label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
              >
                {staffList.map(st => (
                  <option key={st.id} value={st.id} className="bg-gray-950 text-white">
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Assigned Staff 2 (Optional)
              </label>
              <select
                value={assignedStaffId2}
                onChange={(e) => setAssignedStaffId2(e.target.value)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
              >
                <option value="" className="text-gray-400">None (একক কাজ)</option>
                {staffList.filter(st => st.id !== assignedStaffId).map(st => (
                  <option key={st.id} value={st.id} className="bg-gray-950 text-white">
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Due Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Priority (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-medium"
              >
                <option value="urgent" className="bg-gray-950 text-white">Urgent</option>
                <option value="high" className="bg-gray-950 text-white">High</option>
                <option value="medium" className="bg-gray-950 text-white">Medium</option>
                <option value="normal" className="bg-gray-950 text-white">Normal</option>
                <option value="low" className="bg-gray-950 text-white">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Completion Time (Due Time)
              </label>
              <input
                type="text"
                placeholder="e.g. 11:30 AM / 04:00 PM"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-emerald-900/40 focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>
          </div>

          {/* Subtasks checklist */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Sub-tasks Checklist (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a step and add..."
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-gray-950 text-white text-xs sm:text-sm rounded-xl px-3 py-2 border border-emerald-900/40 focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-sky-400 rounded-xl text-xs font-bold border border-gray-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of subtasks */}
            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1 bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                {subtasks.map((st, idx) => (
                  <div key={st.id} className="flex items-center justify-between text-xs text-gray-300 py-1 border-b border-gray-850 last:border-0">
                    <span>{idx + 1}. {st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-gray-500 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
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
              <span>Create Task</span>
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
