import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import { LensType } from './ServiceControlBar';
import { ServiceTemplate, Client } from '../../services/serviceManagementData';

export interface CardItemStats {
  id: string;
  name: string;
  shortName: string;
  subLabel: string; // e.g. "4 clients" or "3 services"
  pendingCount: number;
  overdueCount: number;
  initials?: string;
  avatarColor?: string;
}

interface ServiceCardGridProps {
  lens: LensType;
  items: CardItemStats[];
  onSelectCard: (id: string) => void;
}

export const ServiceCardGrid: React.FC<ServiceCardGridProps> = ({
  lens,
  items,
  onSelectCard
}) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
        <p className="text-sm font-medium text-slate-400">No {lens === 'service' ? 'services' : lens === 'client' ? 'clients' : 'internal entities'} found</p>
        <p className="text-xs text-slate-600 mt-1">Try clearing your search query or overdue filter.</p>
      </div>
    );
  }

  // Pre-determined initials color palette for nice subtle visuals
  const getColorForId = (id: string) => {
    const colors = [
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pb-8">
      {items.map(item => {
        const hasOverdue = item.overdueCount > 0;
        const isAllClear = item.pendingCount === 0;
        const colorClasses = getColorForId(item.id);

        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectCard(item.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCard(item.id);
              }
            }}
            className="group relative flex flex-col justify-between bg-slate-900/90 dark:bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/60 rounded-xl p-3.5 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 select-none min-h-[142px]"
          >
            {/* Top row: Name & Sublabel (or Initials Avatar for party) */}
            <div>
              {lens !== 'service' ? (
                <div className="flex items-start gap-2.5 mb-2">
                  <div
                    className={`w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center text-[11px] font-bold tracking-tight uppercase ${colorClasses}`}
                  >
                    {item.initials || item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight"
                      title={item.name}
                    >
                      {item.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.subLabel}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <h3
                    className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-tight"
                    title={item.name}
                  >
                    {item.shortName || item.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.subLabel}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row: Large Pending Count or "All Clear" + Overdue Marker */}
            <div className="flex items-end justify-between pt-2 border-t border-slate-800/60 mt-auto">
              {isAllClear ? (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 py-1">
                  <CheckCircle2 size={15} className="text-emerald-400/80" />
                  <span className="font-medium text-slate-300">All clear</span>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    {item.pendingCount}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    pending
                  </span>
                </div>
              )}

              {/* Red Overdue Badge (only if overdue > 0) */}
              {hasOverdue && (
                <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800/40">
                  {item.overdueCount} overdue
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
