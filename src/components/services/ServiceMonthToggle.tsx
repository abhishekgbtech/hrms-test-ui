import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ServiceMonthToggleProps {
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  className?: string;
}

export const ServiceMonthToggle: React.FC<ServiceMonthToggleProps> = ({
  selectedMonth,
  onMonthChange,
  className = ''
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const realNow = new Date();
  const currentMonthKey = `${realNow.getFullYear()}-${String(realNow.getMonth() + 1).padStart(2, '0')}`;

  // Helper to format YYYY-MM to display
  const formatMonthLabel = (monthKey: string, isCurrentIndicator: boolean = false) => {
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const date = new Date(year, month, 1);
    const shortMonth = date.toLocaleString('default', { month: 'short' });

    if (isCurrentIndicator && monthKey === currentMonthKey) {
      return `${shortMonth} (current)`;
    }
    return shortMonth;
  };

  // Compute Prev, Current, Next month relative to real current date
  const computeRelativeMonths = () => {
    const months = [];
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date(realNow.getFullYear(), realNow.getMonth() + offset, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: formatMonthLabel(key, true),
        isCurrent: key === currentMonthKey
      });
    }
    return months;
  };

  const relativeMonths = computeRelativeMonths();
  const isSelectedInPill = relativeMonths.some(m => m.key === selectedMonth);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate selectable months for calendar popover (6 months past to 6 months future)
  const selectableMonths = React.useMemo(() => {
    const list = [];
    for (let i = -6; i <= 6; i++) {
      const d = new Date(realNow.getFullYear(), realNow.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const fullLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      list.push({ key, label: fullLabel, isCurrent: key === currentMonthKey });
    }
    return list;
  }, []);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={pickerRef}>
      {/* 3-Month Segmented Pill: [ Sep | Oct (current) | Nov ] */}
      <div className="flex items-center bg-slate-800/90 dark:bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-xs font-medium text-slate-300">
        {relativeMonths.map(m => {
          const isSelected = selectedMonth === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onMonthChange(m.key)}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 ${
                isSelected
                  ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-700/50 text-slate-300'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Calendar Jump Popover Trigger */}
      <button
        type="button"
        title="Jump to another month"
        aria-label="Pick any month"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 ${
          !isSelectedInPill
            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
            : 'bg-slate-800/90 dark:bg-slate-900/90 border-slate-700/80 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200'
        }`}
      >
        <CalendarIcon size={14} />
        {!isSelectedInPill && (
          <span className="font-semibold pr-1">
            {formatMonthLabel(selectedMonth)}
          </span>
        )}
      </button>

      {/* Month Picker Dropdown */}
      {isPickerOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 mb-1 border-b border-slate-800">
            Select Month
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5 py-1">
            {selectableMonths.map(item => {
              const active = selectedMonth === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onMonthChange(item.key);
                    setIsPickerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    active
                      ? 'bg-cyan-500 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.isCurrent && (
                      <span className={`text-[10px] px-1 rounded ${active ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-cyan-400'}`}>
                        current
                      </span>
                    )}
                  </span>
                  {active && <Check size={13} className="text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
