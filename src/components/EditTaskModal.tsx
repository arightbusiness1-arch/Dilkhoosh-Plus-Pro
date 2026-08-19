import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Calendar, Clock, CheckSquare } from 'lucide-react';
import { StaffMember, PriorityLevel, TaskItem, TaskStatus, SubTask } from '../types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  task: TaskItem | null;
  onEditTask: (task: TaskItem) => void;
  isBn?: boolean;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  staffList,
  task,
  onEditTask,
  isBn = false
}) => {
  if (!isOpen || !task) return null;

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignedStaffId, setAssignedStaffId] = useState(task.assignedStaffId);
  const [assignedStaffId2, setAssignedStaffId2] = useState(task.assignedStaffId2 || '');
  const [priority, setPriority] = useState<PriorityLevel>(task.priority);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [category, setCategory] = useState(task.category);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [dueTime, setDueTime] = useState(task.dueTime || '02:00 PM');
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || []);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  const categories = ['Production', 'Sales', 'Cash & Accounts', 'Logistics', 'Cleaning & Hygiene', 'Normal'];

  // Keep state updated if the active task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedStaffId(task.assignedStaffId);
      setAssignedStaffId2(task.assignedStaffId2 || '');
      setPriority(task.priority);
      setStatus(task.status);
      setCategory(task.category);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime || '02:00 PM');
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

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

  const handleToggleSubtaskLocal = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !task) return;

    onEditTask({
      ...task,
      title: title.trim(),
      description: description.trim(),
      assignedStaffId,
      assignedStaffId2: assignedStaffId2 || undefined,
      priority,
      status,
      dueDate,
      dueTime,
      category,
      subtasks,
      completedAt: status === 'complete' ? (task.completedAt || new Date().toISOString()) : undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#021528] border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                {isBn ? 'টাস্ক এডিট করুন' : 'Edit Assigned Task'}
              </h2>
              <p className="text-[10px] text-gray-400">
                {isBn ? 'কাজের বিবরণী ও দায়িত্বশীল পরিবর্তন করুন' : 'Update work details, status and assignees'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
              {isBn ? 'টাস্কের শিরোনাম (বাধ্যতামূলক) *' : 'Task Title (Required) *'}
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isBn ? 'কাজের নাম লিখুন...' : 'Enter task title...'}
              className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
              {isBn ? 'বিস্তারিত বর্ণনা (ঐচ্ছিক)' : 'Detailed Description (Optional)'}
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isBn ? 'কাজের বিস্তারিত বিবরণ এখানে লিখুন...' : 'Write detailed instructions here...'}
              rows={2}
              className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Dual Assignees Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-950/40 p-3 rounded-xl border border-gray-850">
            {/* Primary Assignee */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block">
                {isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ ১ *' : 'Assigned Staff 1 *'}
              </label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-bold"
              >
                {staffList.map(st => (
                  <option key={st.id} value={st.id} className="bg-gray-900 text-white">
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Assignee */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-sky-400 uppercase tracking-wider block">
                {isBn ? 'দায়িত্বপ্রাপ্ত স্টাফ ২ (ঐচ্ছিক)' : 'Assigned Staff 2 (Optional)'}
              </label>
              <select
                value={assignedStaffId2}
                onChange={(e) => setAssignedStaffId2(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 focus:border-sky-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer font-medium"
              >
                <option value="" className="bg-gray-900 text-gray-400">
                  {isBn ? '-- একক কাজ (কোনোটি না) --' : '-- Single Task (None) --'}
                </option>
                {staffList
                  .filter(st => st.id !== assignedStaffId)
                  .map(st => (
                    <option key={st.id} value={st.id} className="bg-gray-900 text-white">
                      {st.name} ({st.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Priority, Category, Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
                {isBn ? 'ক্যাটেগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
                {isBn ? 'অগ্রাধিকার' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="urgent" className="bg-gray-900 text-rose-300">Urgent</option>
                <option value="high" className="bg-gray-900 text-orange-300">High</option>
                <option value="normal" className="bg-gray-900 text-sky-300">Normal</option>
              </select>
            </div>

            {/* Status (Admin override) */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
                {isBn ? 'বর্তমান স্ট্যাটাস' : 'Task Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-gray-950 border border-gray-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer font-bold"
              >
                <option value="pending" className="bg-gray-900 text-gray-300">Pending</option>
                <option value="progress" className="bg-gray-900 text-sky-300">In Progress</option>
                <option value="attempting" className="bg-gray-900 text-purple-300">Attempting</option>
                <option value="partial" className="bg-gray-900 text-amber-300">Partial</option>
                <option value="complete" className="bg-gray-900 text-emerald-300">Complete</option>
                <option value="failed" className="bg-gray-900 text-rose-300">Failed</option>
              </select>
            </div>
          </div>

          {/* Due Date & Time Grid */}
          <div className="grid grid-cols-2 gap-3 bg-[#021528]/30 p-3 rounded-xl border border-gray-850">
            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{isBn ? 'শেষ তারিখ' : 'Due Date'}</span>
              </label>
              <input 
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Due Time */}
            <div className="space-y-1">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>{isBn ? 'শেষ সময়' : 'Due Time'}</span>
              </label>
              <input 
                type="text"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                placeholder="e.g. 02:00 PM"
                className="w-full bg-gray-950 border border-gray-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div className="space-y-2 p-3 bg-gray-950/20 rounded-xl border border-gray-850">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'সাব-টাস্ক চেকলিস্ট' : 'Sub-tasks Checklist'}</span>
            </label>

            <div className="flex gap-2">
              <input 
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                placeholder={isBn ? 'সাব-টাস্ক লিখুন...' : 'Add a checklist subtask...'}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 bg-gray-800 hover:bg-gray-750 text-white rounded-xl text-xs font-black transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 pt-1">
                {subtasks.map((st) => (
                  <div 
                    key={st.id}
                    className="p-2 rounded-lg bg-gray-950 border border-gray-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input 
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtaskLocal(st.id)}
                        className="rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <span className={`text-white truncate ${st.completed ? 'line-through text-gray-500 font-medium' : ''}`}>
                        {st.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-gray-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-750 text-gray-300 rounded-xl text-xs font-black transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1 border border-emerald-500/40"
            >
              <Save className="w-4 h-4 text-sky-300" />
              <span>{isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
