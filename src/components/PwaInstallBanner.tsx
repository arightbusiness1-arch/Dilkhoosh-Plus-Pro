import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check, X, Share, Sparkles } from 'lucide-react';

interface PwaInstallBannerProps {
  onDismiss?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone/installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallSuccess(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(!showIosGuide);
    } else {
      // Direct instruction fallback for Android/Chrome when prompt was already triggered or browser manages it
      alert("অ্যাপটি ইনস্টল করতে আপনার ব্রাউজারের তিনটি ডট (⋮) বা শেয়ার অপশন থেকে 'Add to Home Screen' বা 'Install App' বেছে নিন।");
    }
  };

  if (isInstalled && !installSuccess) {
    return null; // App is already running in PWA standalone mode
  }

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-[#021f38] to-emerald-950 border border-emerald-500/50 rounded-2xl p-3 sm:p-4 shadow-xl shadow-emerald-950/40 space-y-3 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* Background Accent glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Main Banner Content */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-950 shrink-0 border border-emerald-400/50 ring-2 ring-sky-400/30">
            <Smartphone className="w-5 h-5 text-white animate-bounce" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
              <span>দিলখুশ প্লাস অ্যাপ ইনস্টল করুন</span>
              <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                PWA App
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-sky-200 truncate font-medium">
              ফোনের হোম স্ক্রিনে অ্যাড করে সরাসরি অ্যাপ হিসেবে ব্যবহার করুন
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {installSuccess ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-800/80 text-emerald-200 border border-emerald-500 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>ইনস্টল সফল ✅</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-300/60 shadow-lg shadow-emerald-950 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>ইনস্টল করুন</span>
            </button>
          )}

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/80 transition-all cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* iOS Instructions Dropdown */}
      {showIosGuide && (
        <div className="bg-gray-950/90 border border-sky-500/40 rounded-xl p-3 text-xs text-sky-200 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <p className="font-bold text-white flex items-center gap-1">
            <Share className="w-3.5 h-3.5 text-sky-400" />
            <span>iPhone / Safari তে ইনস্টল করার নিয়ম:</span>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
            <li>সাফারি ব্রাউজারের নিচে থাকা <span className="font-bold text-sky-300">Share 📤</span> আইকনে ট্যাপ করুন।</li>
            <li>মেনু স্ক্রোল করে <span className="font-bold text-emerald-400">'Add to Home Screen' ➕</span> অপশনটি বেছে দিন।</li>
          </ol>
        </div>
      )}
    </div>
  );
};
