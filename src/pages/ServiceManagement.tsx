import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Clock,
  MoreVertical,
  Layers,
  Briefcase,
  FileText,
  Shield,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  serviceManagementStore,
  ServiceTemplate,
  Client,
  ServiceTaskInstance,
  ServiceTimesheetEntry
} from '../services/serviceManagementData';
import { ServiceControlBar, LensType, SortOption } from '../components/services/ServiceControlBar';
import { ServiceCardGrid, CardItemStats } from '../components/services/ServiceCardGrid';
import { ServiceWorkspace } from '../components/services/ServiceWorkspace';
import { TaskDetailDrawer } from '../components/services/TaskDetailDrawer';
import { ManageModals, ManageViewType } from '../components/services/ManageModals';

export default function ServiceManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile } = useAuth();

  const currentActor = useMemo(() => ({
    id: profile?.employee_id || user?.id || 'EMP001',
    name: profile?.full_name || 'Deepa Rathi',
    entity: 'ECOVIS RKCA - Mumbai HQ',
  }), [profile, user]);

  const isPartnerOrDirector = useMemo(() => {
    return (profile?.access_level ?? 0) >= 3 || profile?.primary_role === 'business_head' || profile?.primary_role === 'admin';
  }, [profile]);

  const isEmployeeRole = useMemo(() => {
    return profile?.primary_role === 'employee' || (profile?.access_level ?? 1) <= 1;
  }, [profile]);

  // Compute real today's month string (YYYY-MM)
  const realNow = useMemo(() => new Date(), []);
  const defaultCurrentMonthKey = useMemo(() => {
    return `${realNow.getFullYear()}-${String(realNow.getMonth() + 1).padStart(2, '0')}`;
  }, [realNow]);

  // Next month key
  const nextMonthKey = useMemo(() => {
    const nextDate = new Date(realNow.getFullYear(), realNow.getMonth() + 1, 1);
    return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
  }, [realNow]);

  // --- LENS STATE ---
  const [lens, setLens] = useState<LensType>(() => {
    const paramLens = searchParams.get('lens');
    if (paramLens === 'service' || paramLens === 'client' || paramLens === 'internal') {
      return paramLens;
    }
    try {
      const stored = localStorage.getItem('ecovis_srv_active_lens');
      if (stored === 'service' || stored === 'client' || stored === 'internal') {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return 'service';
  });

  // --- MONTH STATE ---
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const paramMonth = searchParams.get('month');
    if (paramMonth && /^\d{4}-\d{2}$/.test(paramMonth)) {
      return paramMonth;
    }
    try {
      const stored = localStorage.getItem('ecovis_srv_active_month');
      if (stored && /^\d{4}-\d{2}$/.test(stored)) {
        return stored;
      }
    } catch (e) {
      // ignore
    }
    return defaultCurrentMonthKey;
  });

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('pending_desc');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState(false);

  // Manage Dropdown & Modals State
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [manageView, setManageView] = useState<ManageViewType>('none');
  const [recurrenceFeedback, setRecurrenceFeedback] = useState<string | null>(null);

  // Data Store State (Subscribed to store changes)
  const [services, setServices] = useState<ServiceTemplate[]>(() => serviceManagementStore.getServices());
  const [clients, setClients] = useState<Client[]>(() => serviceManagementStore.getClients());
  const [internalCompanies, setInternalCompanies] = useState<Client[]>(() => serviceManagementStore.getInternalCompanies());
  const [engagements, setEngagements] = useState(() => serviceManagementStore.getEngagements());
  const [tasks, setTasks] = useState<ServiceTaskInstance[]>(() => serviceManagementStore.getTaskInstances());
  const [timesheets, setTimesheets] = useState<ServiceTimesheetEntry[]>(() => serviceManagementStore.getTimesheets());

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = serviceManagementStore.subscribe(() => {
      setServices([...serviceManagementStore.getServices()]);
      setClients([...serviceManagementStore.getClients()]);
      setInternalCompanies([...serviceManagementStore.getInternalCompanies()]);
      setEngagements([...serviceManagementStore.getEngagements()]);
      setTasks([...serviceManagementStore.getTaskInstances()]);
      setTimesheets([...serviceManagementStore.getTimesheets()]);
    });
    return unsubscribe;
  }, []);

  // Persist Lens in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecovis_srv_active_lens', lens);
    } catch (e) {
      // ignore
    }
  }, [lens]);

  // Persist Month in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecovis_srv_active_month', selectedMonth);
    } catch (e) {
      // ignore
    }
  }, [selectedMonth]);

  // Parse current route to check if in Workspace mode
  // Routes: /services, /services/service/:id, /services/client/:id, /services/internal/:id
  const pathParts = location.pathname.split('/').filter(Boolean);
  // e.g. ['services'] or ['services', 'service', 'srv-stat-audit']
  const isWorkspace = pathParts.length >= 3 && pathParts[0] === 'services';
  const workspaceLens = isWorkspace ? (pathParts[1] as LensType) : null;
  const workspaceEntityId = isWorkspace ? pathParts[2] : null;

  // Active workspace tab from query param (?tab=...)
  const activeWorkspaceTab = searchParams.get('tab') || 'all';

  // Open task drawer ID from query param (?task=...)
  const openTaskId = searchParams.get('task');
  const selectedTask = useMemo(() => {
    if (!openTaskId) return null;
    return tasks.find(t => t.id === openTaskId) || null;
  }, [openTaskId, tasks]);

  // Handle Month Change
  const handleMonthChange = useCallback((newMonth: string) => {
    setSelectedMonth(newMonth);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('month', newMonth);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Handle Lens Change
  const handleLensChange = useCallback((newLens: LensType) => {
    setLens(newLens);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('lens', newLens);
      return next;
    }, { replace: true });

    // If currently in workspace and lens changes, navigate back to main board
    if (isWorkspace) {
      navigate(`/services?lens=${newLens}&month=${selectedMonth}`);
    }
  }, [isWorkspace, navigate, selectedMonth, setSearchParams]);

  // Navigate to Workspace
  const handleSelectCard = useCallback((id: string) => {
    navigate(`/services/${lens}/${id}?month=${selectedMonth}&tab=all`);
  }, [navigate, lens, selectedMonth]);

  // Navigate back to main board
  const handleBackToBoard = useCallback(() => {
    navigate(`/services?lens=${lens}&month=${selectedMonth}`);
  }, [navigate, lens, selectedMonth]);

  // Workspace tab change
  const handleWorkspaceTabChange = useCallback((tabId: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tabId);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Task click -> open task drawer
  const handleTaskClick = useCallback((task: ServiceTaskInstance) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('task', task.id);
      return next;
    });
  }, [setSearchParams]);

  // Close task drawer
  const handleCloseDrawer = useCallback(() => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('task');
      return next;
    });
  }, [setSearchParams]);

  // Prev / Next navigation inside task drawer
  const currentWorkspaceTasks = useMemo(() => {
    if (!isWorkspace || !workspaceEntityId) return [];
    return tasks.filter(t => {
      const matchesEntity = workspaceLens === 'service' ? t.serviceId === workspaceEntityId : t.clientId === workspaceEntityId;
      if (!matchesEntity) return false;
      const tMonth = t.dueDate ? t.dueDate.slice(0, 7) : '';
      if (tMonth === selectedMonth) return true;
      if (selectedMonth === defaultCurrentMonthKey && tMonth < selectedMonth && t.status !== 'completed') {
        return true;
      }
      return false;
    });
  }, [isWorkspace, workspaceLens, workspaceEntityId, tasks, selectedMonth, defaultCurrentMonthKey]);

  const currentTaskIndex = useMemo(() => {
    if (!openTaskId) return -1;
    return currentWorkspaceTasks.findIndex(t => t.id === openTaskId);
  }, [openTaskId, currentWorkspaceTasks]);

  const handleNavigatePrevTask = useCallback(() => {
    if (currentTaskIndex > 0) {
      const prevTask = currentWorkspaceTasks[currentTaskIndex - 1];
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('task', prevTask.id);
        return next;
      });
    }
  }, [currentTaskIndex, currentWorkspaceTasks, setSearchParams]);

  const handleNavigateNextTask = useCallback(() => {
    if (currentTaskIndex >= 0 && currentTaskIndex < currentWorkspaceTasks.length - 1) {
      const nextTask = currentWorkspaceTasks[currentTaskIndex + 1];
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('task', nextTask.id);
        return next;
      });
    }
  }, [currentTaskIndex, currentWorkspaceTasks, setSearchParams]);

  // Recurrence generator trigger for next month or manual
  const handleRunRecurrenceJob = useCallback(() => {
    const res = serviceManagementStore.runAllRecurrences(currentActor, selectedMonth);
    setRecurrenceFeedback(
      `Dispatched: ${res.totalSpawned} tasks spawned, ${res.totalSkipped} duplicates skipped for ${selectedMonth}.`
    );
    setTimeout(() => setRecurrenceFeedback(null), 4000);
  }, [currentActor, selectedMonth]);

  // -------------------------------------------------------------
  // CARD GRID STATS COMPUTATION FOR MAIN BOARD (Month-Aware!)
  // -------------------------------------------------------------
  const cardGridItems = useMemo(() => {
    const isCurrentMonth = selectedMonth === defaultCurrentMonthKey;

    if (lens === 'service') {
      return services.map(service => {
        // Find all tasks for this service in this month (or carried over in current month)
        const serviceTasks = tasks.filter(t => {
          if (t.serviceId !== service.id) return false;
          const tMonth = t.dueDate ? t.dueDate.slice(0, 7) : '';
          if (tMonth === selectedMonth) return true;
          if (isCurrentMonth && tMonth < selectedMonth && t.status !== 'completed') return true;
          return false;
        });

        // Compute client count for this service
        const clientIds = new Set(engagements.filter(e => e.serviceId === service.id).map(e => e.clientId));
        const pendingCount = serviceTasks.filter(t => t.status !== 'completed').length;
        const overdueCount = serviceTasks.filter(t => {
          if (t.status === 'completed') return false;
          const due = t.dueDate ? new Date(t.dueDate) : null;
          return due ? due < realNow : false;
        }).length;

        return {
          id: service.id,
          name: service.title,
          shortName: service.shortTitle || service.title,
          subLabel: `${clientIds.size} clients`,
          pendingCount,
          overdueCount
        };
      });
    } else {
      // Party lens: 'client' or 'internal'
      const partyList = lens === 'client' ? clients : internalCompanies;

      return partyList.map(party => {
        const partyTasks = tasks.filter(t => {
          if (t.clientId !== party.id) return false;
          const tMonth = t.dueDate ? t.dueDate.slice(0, 7) : '';
          if (tMonth === selectedMonth) return true;
          if (isCurrentMonth && tMonth < selectedMonth && t.status !== 'completed') return true;
          return false;
        });

        const serviceIds = new Set(engagements.filter(e => e.clientId === party.id).map(e => e.serviceId));
        const pendingCount = partyTasks.filter(t => t.status !== 'completed').length;
        const overdueCount = partyTasks.filter(t => {
          if (t.status === 'completed') return false;
          const due = t.dueDate ? new Date(t.dueDate) : null;
          return due ? due < realNow : false;
        }).length;

        const initials = party.name
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map(w => w[0])
          .join('')
          .toUpperCase();

        return {
          id: party.id,
          name: party.name,
          shortName: party.name,
          subLabel: `${serviceIds.size} services`,
          pendingCount,
          overdueCount,
          initials
        };
      });
    }
  }, [lens, services, clients, internalCompanies, tasks, engagements, selectedMonth, defaultCurrentMonthKey, realNow]);

  // Overall Board Metrics (for slim summary line)
  const { totalPending, totalOverdue } = useMemo(() => {
    let pending = 0;
    let overdue = 0;
    cardGridItems.forEach(item => {
      pending += item.pendingCount;
      overdue += item.overdueCount;
    });
    return { totalPending: pending, totalOverdue: overdue };
  }, [cardGridItems]);

  const awaitingTimesheetsCount = useMemo(() => {
    return timesheets.filter(t => t.status === 'submitted').length;
  }, [timesheets]);

  // Filter & Sort Card Grid Items
  const displayedCardItems = useMemo(() => {
    let items = [...cardGridItems];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        i => i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q)
      );
    }

    // Filter by overdue only
    if (filterOverdueOnly) {
      items = items.filter(i => i.overdueCount > 0);
    }

    // Sort items
    items.sort((a, b) => {
      if (sortBy === 'pending_desc') return b.pendingCount - a.pendingCount;
      if (sortBy === 'pending_asc') return a.pendingCount - b.pendingCount;
      if (sortBy === 'overdue_desc') return b.overdueCount - a.overdueCount;
      if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

    return items;
  }, [cardGridItems, searchQuery, filterOverdueOnly, sortBy]);

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 py-5">
      {/* Recurrence Notification Banner */}
      {recurrenceFeedback && (
        <div className="mb-4 p-3 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            <span>{recurrenceFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecurrenceFeedback(null)}
            className="text-cyan-400 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Board Header Row (Screen 1) */}
      {!isWorkspace && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Service Management
            </h1>
          </div>

          {/* Action Buttons on Right */}
          <div className="flex items-center gap-2 relative">
            {/* Primary Action: + Assign service */}
            <button
              type="button"
              onClick={() => setManageView('assign_service')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Assign service</span>
            </button>

            {/* Secondary Action: Log time */}
            <button
              type="button"
              onClick={() => setManageView('log_time')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Clock size={13} className="text-slate-400" />
              <span>Log time</span>
            </button>

            {/* Manage Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsManageMenuOpen(!isManageMenuOpen)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Manage</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {isManageMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsManageMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-40 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setManageView('catalogue');
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Layers size={14} className="text-cyan-400" />
                      <span>Service Catalogue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setManageView('engagements');
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Briefcase size={14} className="text-blue-400" />
                      <span>Engagements</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setManageView('timesheets');
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <FileText size={14} className="text-emerald-400" />
                      <span>Timesheets & Approvals</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setManageView('audit');
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                    >
                      <Shield size={14} className="text-purple-400" />
                      <span>Entities & Audit Trail</span>
                    </button>

                    {isPartnerOrDirector && (
                      <button
                        type="button"
                        onClick={() => {
                          setManageView('insights');
                          setIsManageMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-200 hover:bg-slate-800 hover:text-white text-left"
                      >
                        <TrendingUp size={14} className="text-amber-400" />
                        <span>Executive Insights</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        handleRunRecurrenceJob();
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-cyan-400 hover:bg-slate-800 hover:text-cyan-300 text-left font-medium"
                    >
                      <Sparkles size={14} />
                      <span>Generate recurring tasks</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        serviceManagementStore.resetToSampleData();
                        setIsManageMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 text-left text-[11px]"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Sample Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 1: Main Board View */}
      {!isWorkspace ? (
        <>
          {/* Sticky Control Bar: Lens (Left), Month (Middle), Search+Sort (Right) + Slim Summary Line */}
          <ServiceControlBar
            currentLens={lens}
            onLensChange={handleLensChange}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalPending={totalPending}
            totalOverdue={totalOverdue}
            awaitingTimesheetsCount={awaitingTimesheetsCount}
            filterOverdueOnly={filterOverdueOnly}
            onToggleFilterOverdue={() => setFilterOverdueOnly(!filterOverdueOnly)}
            onOpenTimesheetApprovals={() => setManageView('timesheets')}
            isNextMonth={selectedMonth === nextMonthKey}
            onGenerateNextMonthTasks={handleRunRecurrenceJob}
          />

          {/* 5-Column Responsive Card Grid */}
          <ServiceCardGrid
            lens={lens}
            items={displayedCardItems}
            onSelectCard={handleSelectCard}
          />
        </>
      ) : (
        /* Screen 2: Workspace View */
        <ServiceWorkspace
          lens={workspaceLens!}
          entityId={workspaceEntityId!}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onBackToBoard={handleBackToBoard}
          activeTab={activeWorkspaceTab}
          onTabChange={handleWorkspaceTabChange}
          onTaskClick={handleTaskClick}
          currentActor={currentActor}
          isEmployeeRole={isEmployeeRole}
        />
      )}

      {/* Screen 3: Right-Side Task Detail Drawer (~480px width) */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={Boolean(openTaskId)}
        onClose={handleCloseDrawer}
        onNavigatePrev={handleNavigatePrevTask}
        onNavigateNext={handleNavigateNextTask}
        hasPrev={currentTaskIndex > 0}
        hasNext={currentTaskIndex >= 0 && currentTaskIndex < currentWorkspaceTasks.length - 1}
        currentActor={currentActor}
        onTaskUpdated={() => {
          // Triggered when task is updated inside drawer
        }}
      />

      {/* Secondary Features & Manage Modals (Catalogue, Engagements, Timesheets, Audit, Insights) */}
      <ManageModals
        currentView={manageView}
        onClose={() => setManageView('none')}
        currentActor={currentActor}
        isPartnerOrDirector={isPartnerOrDirector}
        selectedMonth={selectedMonth}
        onRunRecurrenceJob={handleRunRecurrenceJob}
      />
    </div>
  );
}
