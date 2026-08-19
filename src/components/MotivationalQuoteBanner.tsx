import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Copy, 
  Check, 
  Target, 
  ShieldCheck, 
  Flame, 
  Compass,
  Quote,
  CheckCircle2,
  BookOpenCheck
} from 'lucide-react';
import { 
  getAllMotivationalQuotes, 
  getDailyDeckOrder, 
  getStoredDailyQuoteState, 
  saveStoredDailyQuoteState,
  MotivationalQuote 
} from '../data/motivationalQuotes';
import { getTodayDateString } from '../utils/dateUtils';

interface MotivationalQuoteBannerProps {
  className?: string;
  onShowToast?: (msg: string) => void;
}

export const MotivationalQuoteBanner: React.FC<MotivationalQuoteBannerProps> = ({
  className = '',
  onShowToast
}) => {
  const todayStr = getTodayDateString();
  const allQuotes = useMemo(() => getAllMotivationalQuotes(), []);
  const dailyDeck = useMemo(() => getDailyDeckOrder(todayStr, allQuotes.length), [todayStr, allQuotes.length]);

  const [deckPointer, setDeckPointer] = useState<number>(() => {
    const saved = getStoredDailyQuoteState(todayStr);
    return saved.currentIndex % dailyDeck.length;
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [justMarkedRead, setJustMarkedRead] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(15);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Current Quote derived strictly from today's non-repeating deck
  const currentQuoteIndex = dailyDeck[deckPointer % dailyDeck.length];
  const currentQuote: MotivationalQuote = allQuotes[currentQuoteIndex] || allQuotes[0];

  // Function to advance to next unique quote
  const advanceToNextQuote = useCallback(() => {
    setDeckPointer(prev => {
      const next = (prev + 1) % dailyDeck.length;
      saveStoredDailyQuoteState({
        date: todayStr,
        currentIndex: next,
        shownCount: next + 1
      });
      return next;
    });
    setSecondsLeft(15);
  }, [dailyDeck.length, todayStr]);

  // Handle "Mark as read" click
  const handleMarkAsRead = () => {
    setJustMarkedRead(true);
    setTimeout(() => setJustMarkedRead(false), 600);
    advanceToNextQuote();
    if (onShowToast) {
      onShowToast('পড়া হয়েছে — পরবর্তী নতুন উক্তি লোড করা হয়েছে ✨');
    }
  };

  // 15-second automatic rotation timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          advanceToNextQuote();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [advanceToNextQuote]);

  // Copy to clipboard handler
  const handleCopyQuote = () => {
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.quote}" — দিলখুশ প্লাস (${currentQuote.categoryLabel})`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    if (onShowToast) {
      onShowToast('মোটিভেশনাল উক্তি কপি করা হয়েছে ✅');
    }
    setTimeout(() => setCopied(false), 2500);
  };

  // Category Icon & Accent Color Helper
  const getCategoryConfig = (category: MotivationalQuote['category']) => {
    switch (category) {
      case 'focus':
        return {
          icon: Target,
          bgBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          dotColor: 'bg-emerald-400',
          glow: 'from-emerald-950/40 via-gray-900 to-gray-950'
        };
      case 'no-neglect':
        return {
          icon: ShieldCheck,
          bgBadge: 'bg-teal-950/80 text-teal-300 border-teal-500/50',
          dotColor: 'bg-teal-400',
          glow: 'from-teal-950/40 via-gray-900 to-gray-950'
        };
      case 'seriousness':
        return {
          icon: Flame,
          bgBadge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          dotColor: 'bg-amber-400',
          glow: 'from-amber-950/40 via-gray-900 to-gray-950'
        };
      case 'responsibility':
        return {
          icon: Compass,
          bgBadge: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
          dotColor: 'bg-sky-400',
          glow: 'from-sky-950/40 via-gray-900 to-gray-950'
        };
      default:
        return {
          icon: Sparkles,
          bgBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
          dotColor: 'bg-emerald-400',
          glow: 'from-emerald-950/40 via-gray-900 to-gray-950'
        };
    }
  };

  const config = getCategoryConfig(currentQuote.category);
  const CategoryIcon = config.icon;

  // Progress percentage for 15s timer
  const progressPercent = ((15 - secondsLeft) / 15) * 100;

  return (
    <div 
      id="motivational-quote-wrapper"
      className={`relative group bg-gradient-to-r ${config.glow} border border-emerald-700/40 rounded-xl p-2.5 sm:p-3 shadow-md transition-all duration-300 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 15-Second Animated Progress Bar at Top Border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gray-800/80 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-emerald-400 transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        
        {/* Top Header Row: Category Badge, Pillar & Right Controls */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          
          {/* Left: Category Badge + Pillar */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border shadow-sm ${config.bgBadge}`}>
              <CategoryIcon className="w-2.5 h-2.5" />
              <span>{currentQuote.categoryLabel}</span>
            </span>

            <span className="text-[10px] text-gray-300 flex items-center gap-1 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} animate-pulse`} />
              <span>{currentQuote.pillar}</span>
            </span>
          </div>

          {/* Right: Timer & Copy/Next Controls */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Seconds Countdown Chip */}
            <div 
              title="১৫ সেকেন্ড পর স্বয়ংক্রিয়ভাবে পরবর্তী উক্তি আসবে"
              className="flex items-center gap-1 px-1.5 py-0.2 rounded bg-gray-950/80 border border-gray-800 text-[10px] font-mono text-gray-400"
            >
              <span className="w-1 h-1 rounded-full bg-sky-400 animate-ping" />
              <span>{secondsLeft}s</span>
            </div>

            {/* Copy Quote Button */}
            <button
              type="button"
              id="btn-copy-motivational-quote"
              onClick={handleCopyQuote}
              className="p-1 rounded-lg bg-gray-950/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 transition-all text-xs flex items-center gap-1 active:scale-95"
              title="উক্তিটি কপি করুন"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400 hover:text-sky-300" />
              )}
            </button>

            {/* Next Button */}
            <button
              type="button"
              id="btn-next-motivational-quote"
              onClick={advanceToNextQuote}
              className="p-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 hover:text-white border border-emerald-600/40 transition-all text-xs flex items-center gap-1 active:scale-95 shadow-sm"
              title="পরবর্তী উক্তি দেখুন"
            >
              <RotateCw className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Motivational Quote Main Text */}
        <div className="flex items-start gap-2">
          <div className="p-1 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
            <Quote className="w-3 h-3 text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p 
              key={currentQuote.id}
              className="text-xs sm:text-sm font-medium text-gray-100 leading-snug animate-in fade-in duration-200"
            >
              "{currentQuote.quote}"
            </p>

            {/* Compact "Mark as read" right below quote */}
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                id="btn-mark-as-read"
                onClick={handleMarkAsRead}
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold transition-all active:scale-95 border ${
                  justMarkedRead 
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border-emerald-600/40 shadow-sm'
                }`}
                title="পড়া হলে ক্লিক করুন, নতুন উক্তি আসবে"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Mark as read</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
