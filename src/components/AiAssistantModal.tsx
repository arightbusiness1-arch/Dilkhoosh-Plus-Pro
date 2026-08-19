import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  HelpCircle, 
  ArrowDown, 
  FileText,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { AppState } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const isBn = state.settings.language === 'bn';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: isBn 
        ? `আসসালামু আলাইকুম! আমি **দিলখুশ প্লাস এআই সহকারী (Dilkhoosh AI Assistant)** 🤖✨\n\nআমি এই সম্পূর্ণ অ্যাপের সমস্ত ফিচার, আজকের লাইভ হাজিরা, টাস্ক, অফিসিয়াল নির্দেশনা ও সেটিংস সম্পর্কে বিস্তারিত অবগত। আপনি যেকোনো প্রশ্ন জিজ্ঞেস করতে পারেন!`
        : `Hello! I am the **Dilkhoosh Plus AI Assistant** 🤖✨\n\nI have complete knowledge about this entire platform, including today's live attendance, tasks, directives, workflows, and settings. Feel free to ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = isBn ? [
    '📊 আজকের উপস্থিতির বিস্তারিত সামারি দিন',
    '📋 পেন্ডিং ও জরুরি কাজের তালিকা দেখান',
    '👑 এডমিন ও ম্যানেজারের ক্ষমতার পার্থক্য কি?',
    '✍️ দিলখুশ প্লাসে নতুন টাস্ক বা হাজিরা কিভাবে দেয়?',
    '🚨 জরুরী যোগাযোগ ও বিশেষ নির্দেশিকা কি কি আছে?',
    '🌟 এই পুরো অ্যাপটির একটি সংক্ষিপ্ত গাইডলাইন দিন'
  ] : [
    '📊 Give me a summary of today\'s attendance',
    '📋 List all urgent and pending tasks',
    '👑 What is the difference between Admin and Manager?',
    '✍️ How to assign tasks and submit attendance?',
    '🚨 What are the emergency contacts and hub directives?',
    '🌟 Give me a complete overview of Dilkhoosh Plus'
  ];

  // Auto scroll to bottom on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build conversation history for multi-turn context
      const conversationHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory,
          appStateContext: state
        })
      });

      const data = await res.json();
      const reply = data.reply || (isBn ? 'দুঃখিত, উত্তর পাওয়া যায়নি।' : 'Sorry, no response received.');

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: isBn 
          ? '⚠️ এআই সহকারীর সাথে যোগাযোগ করা সম্ভব হয়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা পরে চেষ্টা করুন।' 
          : '⚠️ Failed to communicate with AI Assistant. Please check your internet connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-fresh',
        role: 'assistant',
        text: isBn 
          ? 'কথোপকথন রিসেট করা হয়েছে! আপনি দিলখুশ প্লাস অ্যাপ সম্পর্কে যেকোনো প্রশ্ন করতে পারেন। 😊' 
          : 'Conversation cleared! Feel free to ask any question about Dilkhoosh Plus. 😊',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Helper to format basic markdown-like text (bold, lists, linebreaks)
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 leading-relaxed break-words text-[13px] sm:text-sm">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          // Bold formatting
          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-black text-white">{part.slice(2, -2)}</strong>;
            }
            return part;
          });

          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-sky-400 font-bold">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          if (/^\d+\./.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-400 font-bold">{line.match(/^\d+\./)?.[0]}</span>
                <span>{formattedLine.slice(1)}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-purple-500/40 rounded-2xl w-full max-w-2xl h-[90vh] max-h-[750px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#031528] via-purple-950/60 to-[#031528] border-b border-purple-500/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 border border-purple-400/40 flex items-center justify-center text-white shadow-md shadow-purple-950/50 shrink-0">
              <Bot className="w-5 h-5 text-purple-200 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight truncate flex items-center gap-1">
                  <span>দিলখুশ এআই সহকারী</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40">
                    Gemini 3.7
                  </span>
                </h3>
              </div>
              <p className="text-[11px] text-gray-300 truncate flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{isBn ? 'সম্পূর্ণ অ্যাপের লাইভ তথ্য ও গাইডলাইন যুক্ত' : 'Full App Knowledge & Live Context Active'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-1.5 text-gray-400 hover:text-purple-300 hover:bg-purple-950/50 rounded-lg transition-colors"
              title={isBn ? 'কথোপকথন পরিষ্কার করুন' : 'Clear Chat History'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={isBn ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Status Bar */}
        <div className="px-4 py-1.5 bg-gray-950/90 border-b border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400 shrink-0 overflow-x-auto no-scrollbar gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>রোল: {state.role.toUpperCase()}</span>
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-sky-300">
              তারিখ: {state.selectedDate}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-gray-300">স্টাফ: {state.staffList.length} জন</span>
            <span className="text-gray-600">•</span>
            <span className="text-amber-300">টাস্ক: {state.tasks.length} টি</span>
            <span className="text-gray-600">•</span>
            <span className="text-purple-300">নির্দেশনা: {state.directives.length} টি</span>
          </div>
        </div>

        {/* Messages Stream Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-gradient-to-b from-gray-950/50 via-gray-900 to-gray-950">
          
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 space-y-1.5 shadow-md ${
                  isUser 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-tr-none' 
                    : 'bg-gray-850/90 border border-gray-750 text-gray-200 rounded-tl-none'
                }`}>
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                    <span className="font-bold">{isUser ? (isBn ? 'আপনি' : 'You') : (isBn ? 'দিলখুশ এআই' : 'Dilkhoosh AI')}</span>
                    <div className="flex items-center gap-1.5">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="hover:text-white transition-colors p-0.5"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-gray-100">
                    {renderFormattedText(msg.text)}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 justify-start animate-in fade-in">
              <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="bg-gray-850 border border-purple-500/30 rounded-2xl rounded-tl-none p-3 text-xs text-purple-300 flex items-center gap-2 shadow-md">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>{isBn ? 'দিলখুশ এআই ডেটা বিশ্লেষণ করছে...' : 'Analyzing app state & answering...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-3 py-2 bg-gray-950/80 border-t border-gray-800/80 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 shrink-0 pl-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>পরামর্শ:</span>
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-gray-900 hover:bg-purple-950/70 border border-purple-500/30 text-purple-200 hover:text-white whitespace-nowrap transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#031528] border-t border-gray-800 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={isBn ? 'দিলখুশ প্লাস সম্পর্কে যেকোনো প্রশ্ন লিখুন (Enter চাপুন)...' : 'Ask anything about Dilkhoosh Plus (Press Enter)...'}
                className="w-full bg-gray-950 border border-purple-500/40 focus:border-purple-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-400 resize-none max-h-24 no-scrollbar"
              />
            </div>

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className={`p-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center ${
                !inputQuery.trim() || isLoading 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950 hover:scale-105 active:scale-95'
              }`}
              title={isBn ? 'পাঠান' : 'Send'}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
