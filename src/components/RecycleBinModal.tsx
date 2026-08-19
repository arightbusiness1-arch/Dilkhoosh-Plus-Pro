import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  Calendar, 
  Info, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  UserX,
  PlusCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { AppState, DeletedItem } from '../types';
import { toBengaliNumber } from '../utils/dateUtils';

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onRestoreItem: (item: DeletedItem) => void;
  onPermanentlyDeleteItem: (itemId: string) => void;
  onClearRecycleBin: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({
  isOpen,
  onClose,
  state,
  onRestoreItem,
  onPermanentlyDeleteItem,
  onClearRecycleBin
}) => {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState<'all' | 'task' | 'staff'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const isBn = state.settings.language === 'bn';
  const recycleItems = state.recycleBin || [];

  // Filter and search logic
  const filteredItems = recycleItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIconForType = (type: 'task' | 'staff' | 'directive') => {
    switch (type) {
      case 'staff':
        return <UserX className="w-4 h-4 text-rose-400" />;
      case 'task':
        return <Briefcase className="w-4 h-4 text-sky-400" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getBadgeForType = (type: 'task' | 'staff' | 'directive') => {
    if (type === 'staff') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {isBn ? 'স্টাফ প্রোফাইল' : 'Staff Profile'}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
          {isBn ? 'হিসাব / কাজ' : 'Ledger / Task'}
        </span>
      );
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto w-full">
      <div className="bg-gray-900 border border-emerald-900/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-650/20 text-rose-450 border border-rose-500/30 relative">
              <Trash2 className="w-5 h-5 text-rose-450" />
              {recycleItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center">
                  {recycleItems.length}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                {isBn ? 'রিসাইকেল বিন (মুছে ফেলা হিস্ট্রি)' : 'Recycle Bin (Deleted History)'}
              </h3>
              <p className="text-xs text-gray-400">
                {isBn 
                  ? 'ভুলবশত ডিলিট হওয়া হিসেব, লেনদেন বা স্টাফ উদ্ধার করুন' 
                  : "Restore accidentally deleted accounts, ledger items or staff details"}
              </p>
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

        {/* Filters and Search Bar */}
        <div className="p-4 bg-gray-950/80 border-b border-gray-850 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-rose-700 text-white shadow-sm'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {isBn ? 'সব ডিলিট হিস্ট্রি' : 'All Trashed'} ({recycleItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('task')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeFilter === 'task'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{isBn ? 'হিসাব ও কাজ' : 'Ledger / Tasks'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('staff')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                  activeFilter === 'staff'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                <UserX className="w-3.5 h-3.5" />
                <span>{isBn ? 'স্টাফ' : 'Staff'}</span>
              </button>
            </div>

            {/* Clear All Button */}
            {recycleItems.length > 0 && !confirmClearOpen && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 border border-rose-500/20 rounded-xl hover:bg-rose-950/20 transition-all flex items-center justify-center gap-1 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isBn ? 'বিন খালি করুন' : 'Empty Trash'}</span>
              </button>
            )}
          </div>

          {/* Search input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isBn ? 'নাম বা বিবরণ দিয়ে ডিলিট হিস্ট্রি খুঁজুন...' : 'Search deleted entries by name or info...'}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-sky-400 font-medium placeholder-gray-500 focus:outline-none focus:border-emerald-700"
          />
        </div>

        {/* Confirmation panel for clearing bin */}
        {confirmClearOpen && (
          <div className="p-4 bg-rose-950/20 border-b border-rose-500/20 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-rose-200 font-bold">
                    {isBn ? 'আপনি কি নিশ্চিতভাবে পুরো রিসাইকেল বিন খালি করতে চান?' : 'Are you sure you want to empty the Recycle Bin?'}
                  </p>
                  <p className="text-gray-400 mt-0.5">
                    {isBn 
                      ? 'এটি সম্পূর্ণ করলে মুছে ফেলা হিসাব বা লেনদেনগুলো চিরতরে ডিলিট হয়ে যাবে এবং আর কখনও পুনরুদ্ধার করা সম্ভব হবে না।' 
                      : 'This action is irreversible and all trash records will be permanently erased.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold bg-gray-900 border border-gray-800 rounded-lg text-gray-300 hover:bg-gray-850"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearRecycleBin();
                    setConfirmClearOpen(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold bg-rose-700 text-white rounded-lg hover:bg-rose-600"
                >
                  {isBn ? 'হ্যাঁ, খালি করুন' : 'Yes, Empty'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trashed Item List */}
        <div className="p-4 sm:p-5 space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar">
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-gray-950 border border-gray-850 hover:border-gray-800 transition-all shadow-sm flex flex-col justify-between gap-3"
                >
                  {/* Top line with type icon, name, and type badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-gray-900 border border-gray-800 shrink-0 mt-0.5">
                        {getIconForType(item.type)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                          {item.details}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getBadgeForType(item.type)}
                    </div>
                  </div>

                  {/* Bottom line with timestamp & action buttons */}
                  <div className="pt-2.5 border-t border-gray-900 flex items-center justify-between gap-3 flex-wrap">
                    <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span>
                        {isBn ? 'মুছে ফেলা হয়েছে:' : 'Deleted:'} {formatDate(item.deletedAt)}
                      </span>
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Delete Permanently */}
                      <button
                        type="button"
                        onClick={() => onPermanentlyDeleteItem(item.id)}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-450 hover:text-rose-400 bg-rose-950/20 border border-rose-500/20 rounded-lg hover:bg-rose-950/40 transition-colors flex items-center gap-1 active:scale-95"
                        title={isBn ? 'চিরতরে ডিলিট করুন' : 'Delete Permanently'}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                      </button>

                      {/* Restore Button */}
                      <button
                        type="button"
                        onClick={() => onRestoreItem(item)}
                        className="px-3 py-1 text-[10px] font-black text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg border border-emerald-500/30 transition-colors flex items-center gap-1 shadow active:scale-95"
                        title={isBn ? 'পুনরুদ্ধার করুন' : 'Restore Item'}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{isBn ? 'উদ্ধার করুন' : 'Restore'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3 bg-gray-950/30 border border-gray-850 rounded-2xl">
              <div className="p-3 w-12 h-12 rounded-full bg-gray-900 border border-gray-800 text-gray-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="max-w-xs mx-auto">
                <h5 className="text-sm font-bold text-gray-400">
                  {isBn ? 'রিসাইকেল বিন সম্পূর্ণ খালি!' : 'Recycle Bin is Empty'}
                </h5>
                <p className="text-xs text-gray-500 mt-1">
                  {isBn 
                    ? 'কোনো মুছে ফেলা হিসাব, লেনদেন বা ফাইল রেকর্ড পাওয়া যায়নি।' 
                    : 'No deleted tasks, accounts, or staff records currently in trash.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between gap-3">
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Dilkhoosh Plus Safety Safe-Guards</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-850 text-white text-xs font-bold border border-gray-800 hover:border-gray-700 transition-all active:scale-95"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
