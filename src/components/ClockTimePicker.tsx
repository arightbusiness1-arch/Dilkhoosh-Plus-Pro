import React, { useState, useEffect } from 'react';
import { Clock, Zap, Check } from 'lucide-react';

interface ClockTimePickerProps {
  value: string;
  onChange: (formattedValue: string) => void;
  isBn?: boolean;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  value,
  onChange,
  isBn = true
}) => {
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
  const [isDaily, setIsDaily] = useState<boolean>(true);

  // Parse initial string value
  useEffect(() => {
    if (!value) return;
    const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      const h = String(parseInt(match[1], 10)).padStart(2, '0');
      const m = match[2];
      const p = (match[3] ? match[3].toUpperCase() : 'AM') as 'AM' | 'PM';
      setHour(h);
      setMinute(m);
      setPeriod(p);
    }
    if (value.includes('প্রতিদিন') || value.toLowerCase().includes('daily')) {
      setIsDaily(true);
    } else {
      setIsDaily(false);
    }
  }, [value]);

  const update = (h: string, m: string, p: 'AM' | 'PM', daily: boolean) => {
    setHour(h);
    setMinute(m);
    setPeriod(p);
    setIsDaily(daily);
    const timeStr = `${h}:${m} ${p}`;
    const result = daily ? (isBn ? `প্রতিদিন ${timeStr}` : `Daily at ${timeStr}`) : timeStr;
    onChange(result);
  };

  const handleSetNow = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const p: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hStr = String(hours).padStart(2, '0');
    update(hStr, minutes, p, isDaily);
  };

  const handlePreset = (presetH: string, presetM: string, presetP: 'AM' | 'PM') => {
    update(presetH, presetM, presetP, isDaily);
  };

  const quickPresets = [
    { label: '09:00 AM', h: '09', m: '00', p: 'AM' as const },
    { label: '10:30 AM', h: '10', m: '30', p: 'AM' as const },
    { label: '01:00 PM', h: '01', m: '00', p: 'PM' as const },
    { label: '04:00 PM', h: '04', m: '00', p: 'PM' as const },
    { label: '08:00 PM', h: '08', m: '00', p: 'PM' as const },
    { label: '10:00 PM', h: '10', m: '00', p: 'PM' as const }
  ];

  return (
    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
      
      {/* Time Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Hour & Minute Pickers */}
        <div className="flex items-center gap-1 font-mono">
          {/* Hour Select */}
          <div className="relative">
            <select
              value={hour}
              onChange={(e) => update(e.target.value, minute, period, isDaily)}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-black text-xs sm:text-sm px-2 py-1 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-amber-400 text-center w-12"
            >
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                <option key={h} value={h} className="bg-slate-900 text-white">{h}</option>
              ))}
            </select>
          </div>

          <span className="text-xs font-black text-amber-400">:</span>

          {/* Minute Select */}
          <div className="relative">
            <select
              value={minute}
              onChange={(e) => update(hour, e.target.value, period, isDaily)}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-black text-xs sm:text-sm px-2 py-1 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-amber-400 text-center w-12"
            >
              {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => (
                <option key={m} value={m} className="bg-slate-900 text-white">{m}</option>
              ))}
            </select>
          </div>

          {/* AM/PM Switch */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 ml-0.5">
            <button
              type="button"
              onClick={() => update(hour, minute, 'AM', isDaily)}
              className={`px-2 py-0.5 rounded text-[11px] font-black transition-all ${
                period === 'AM'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => update(hour, minute, 'PM', isDaily)}
              className={`px-2 py-0.5 rounded text-[11px] font-black transition-all ${
                period === 'PM'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Current Time (Now) */}
          <button
            type="button"
            onClick={handleSetNow}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-700 text-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95"
            title={isBn ? 'বর্তমান সময় সেট করুন' : 'Set to current time'}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{isBn ? 'এখন' : 'Now'}</span>
          </button>

          {/* Repeat Toggle */}
          <button
            type="button"
            onClick={() => update(hour, minute, period, !isDaily)}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
              isDaily
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{isDaily ? (isBn ? 'প্রতিদিন' : 'Daily') : (isBn ? 'একবার' : 'Once')}</span>
          </button>
        </div>

      </div>

      {/* Quick Time Presets Bar */}
      <div className="pt-1.5 border-t border-slate-850">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider shrink-0 mr-0.5">
            {isBn ? 'প্রিসেট:' : 'Quick:'}
          </span>
          {quickPresets.map(preset => {
            const isSelected = hour === preset.h && minute === preset.m && period === preset.p;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset.h, preset.m, preset.p)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
