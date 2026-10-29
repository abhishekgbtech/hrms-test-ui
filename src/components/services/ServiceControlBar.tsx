import React from 'react';
import { Search, ArrowUpDown, Filter, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { ServiceMonthToggle } from './ServiceMonthToggle';

export type LensType = 'service' | 'client' | 'internal';
export type SortOption = 'pending_desc' | 'alphabetical' | 'overdue_desc' | 'pending_asc';

interface ServiceControlBarProps {
  currentLens: LensType;
  onLensChange: (lens: LensType) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  // Metrics for slim summary line
  totalPending: number;
  totalOverdue: number;
  awaitingTimesheetsCount: number;
  filterOverdueOnly: boolean;
  onToggleFilterOverdue: () => void;
  onOpenTimesheetApprovals: () => void;
  isNextMonth?: boolean;
  onGenerateNextMonthTasks?: () => void;
}

export const ServiceControlBar: React.FC<ServiceControlBarProps> = ({
  currentLens,
  onLensChange,
  selectedMonth,
  onMonthChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalPending,
  totalOverdue,
  awaitingTimesheetsCount,
  filterOverdueOnly,
  onToggleFilterOverdue,
  onOpenTimesheetApprovals,
  isNextMonth,
  onGenerateNextMonthTasks
}) => {
  return (
    <div className="sticky top-0 z-30 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-md pb-3 pt-1 border-b border-slate-800/80 mb-5">
      {/* Line 1: Lens Toggle (Left), Month Toggle (Middle), Search + Sort (Right) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Lens Toggle */}
        <div className="flex items-center">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => onLensChange('service')}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 focus:outline-none ${
                currentLens === 'service'
                  ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800 text-slate-400'
              }`}
            >
              Service
            </button>
            <button
              type="button"
              onClick={() => onLensChange('client')}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 focus:outline-none ${
                currentLens === 'client'
                  ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800 text-slate-400'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => onLensChange('internal')}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 focus:outline-none ${
                currentLens === 'internal'
                  ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                  : 'hover:text-white hover:bg-slate-800 text-slate-400'
              }`}
            >
              Internal
            </button>
          </div>
        </div>

        {/* Middle: Month Toggle */}
        <div className="flex justify-center">
          <ServiceMonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
        </div>

        {/* Right: Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={
                currentLens === 'service'
                  ? 'Search services...'
                  : currentLens === 'client'
                  ? 'Search clients...'
                  : 'Search internal...'
              }
              className="w-44 lg:w-56 pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              aria-label="Sort by"
              onChange={e => onSortChange(e.target.value as SortOption)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-7 py-1.5 text-xs text-slate-300 hover:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="pending_desc">Most pending</option>
              <option value="alphabetical">A-Z</option>
              <option value="overdue_desc">Most overdue</option>
              <option value="pending_asc">Fewest pending</option>
            </select>
            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
          </div>
        </div>
      </div>

      {/* Line 2: Slim Summary Line */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2.5 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-medium">
            <strong className="text-white font-semibold">{totalPending}</strong> pending
          </span>

          <span className="text-slate-600">•</span>

          <button
            type="button"
            onClick={onToggleFilterOverdue}
            className={`inline-flex items-center gap-1 transition-colors ${
              filterOverdueOnly
                ? 'text-red-400 font-semibold underline decoration-red-500 underline-offset-4'
                : totalOverdue > 0
                ? 'text-red-400/90 hover:text-red-300 font-medium cursor-pointer'
                : 'text-slate-400'
            }`}
            title={filterOverdueOnly ? 'Click to show all' : 'Click to filter overdue only'}
          >
            {totalOverdue > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
            <strong className={totalOverdue > 0 ? 'text-red-400' : 'text-slate-300'}>{totalOverdue}</strong> overdue
            {filterOverdueOnly && <span className="text-[10px] bg-red-900/40 text-red-300 px-1 rounded ml-1">Filtered</span>}
          </button>

          <span className="text-slate-600">•</span>

          <button
            type="button"
            onClick={onOpenTimesheetApprovals}
            className="hover:text-cyan-400 transition-colors cursor-pointer text-slate-400 hover:underline"
          >
            <strong className="text-slate-300 font-semibold">{awaitingTimesheetsCount}</strong> timesheets awaiting approval
          </button>
        </div>

        {/* Quiet inline "Generate" action for next month if scheduled instances needed */}
        {isNextMonth && onGenerateNextMonthTasks && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Scheduled next month instances</span>
            <button
              type="button"
              onClick={onGenerateNextMonthTasks}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium text-[11px] ml-1 cursor-pointer"
            >
              Generate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
