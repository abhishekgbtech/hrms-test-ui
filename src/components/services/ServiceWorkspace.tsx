import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Eye,
  Sliders,
  Filter,
  CheckSquare,
  Square,
  ExternalLink
} from 'lucide-react';
import {
  ServiceTemplate,
  Client,
  ServiceTaskInstance,
  TaskStatus,
  serviceManagementStore
} from '../../services/serviceManagementData';
import { ServiceMonthToggle } from './ServiceMonthToggle';
import { employeesData } from '../../data/employeesData';

interface ServiceWorkspaceProps {
  lens: 'service' | 'client' | 'internal';
  entityId: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onBackToBoard: () => void;
  activeTab: string; // 'all' or partyId or serviceId
  onTabChange: (tabId: string) => void;
  onTaskClick: (task: ServiceTaskInstance) => void;
  currentActor: { id: string; name: string; entity: string };
  isEmployeeRole: boolean;
  audience?: 'internal' | 'client';
  readOnly?: boolean;
}

export const ServiceWorkspace: React.FC<ServiceWorkspaceProps> = ({
  lens,
  entityId,
  selectedMonth,
  onMonthChange,
  onBackToBoard,
  activeTab,
  onTabChange,
  onTaskClick,
  currentActor,
  isEmployeeRole,
  audience: initialAudience = 'internal',
  readOnly = false
}) => {
  // State
  const [audience, setAudience] = useState<'internal' | 'client'>(initialAudience);
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(isEmployeeRole);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [isCompletedGroupOpen, setIsCompletedGroupOpen] = useState(false);
  const [tabSearch, setTabSearch] = useState('');
  const [isMoreTabsOpen, setIsMoreTabsOpen] = useState(false);
  const [reassignPopoverTaskId, setReassignPopoverTaskId] = useState<string | null>(null);

  // Retrieve current entity details
  const services = serviceManagementStore.getServices();
  const clients = serviceManagementStore.getClients();
  const internalCompanies = serviceManagementStore.getInternalCompanies();
  const allParties = useMemo(() => [...clients, ...internalCompanies], [clients, internalCompanies]);
  const engagements = serviceManagementStore.getEngagements();
  const allTasks = serviceManagementStore.getTaskInstances();

  const realNow = new Date();
  const currentMonthKey = `${realNow.getFullYear()}-${String(realNow.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === currentMonthKey;

  // Determine Current Workspace Entity
  const currentService = lens === 'service' ? services.find(s => s.id === entityId) : null;
  const currentParty = (lens === 'client' || lens === 'internal') ? allParties.find(p => p.id === entityId) : null;

  const entityName = currentService ? currentService.title : (currentParty?.name || 'Entity Workspace');
  const shortName = currentService?.shortTitle || entityName;
  const entityCode = currentService ? currentService.code : (currentParty?.code || '');
  const category = currentService ? currentService.category : (currentParty?.industry || '');

  // Subscriptions / Engagements linked to this entity
  const relevantEngagements = useMemo(() => {
    if (lens === 'service') {
      return engagements.filter(e => e.serviceId === entityId);
    }
    return engagements.filter(e => e.clientId === entityId);
  }, [engagements, lens, entityId]);

  // Compute tabs:
  // In a service workspace, tabs are the parties (clients/internals) subscribed to this service.
  // In a client/internal workspace, tabs are the services subscribed by this party.
  const dynamicTabs = useMemo(() => {
    if (lens === 'service') {
      const partyIds = Array.from(new Set(relevantEngagements.map(e => e.clientId)));
      return partyIds.map(pId => {
        const p = allParties.find(party => party.id === pId);
        return {
          id: pId,
          name: p?.name || pId,
          shortName: p?.name ? (p.name.length > 20 ? p.name.slice(0, 18) + '...' : p.name) : pId
        };
      });
    } else {
      const serviceIds = Array.from(new Set(relevantEngagements.map(e => e.serviceId)));
      return serviceIds.map(sId => {
        const s = services.find(service => service.id === sId);
        return {
          id: sId,
          name: s?.title || sId,
          shortName: s?.shortTitle || s?.title || sId
        };
      });
    }
  }, [lens, relevantEngagements, allParties, services]);

  // Filter tasks belonging to this entity for the selected month
  // Note: Unfinished tasks from earlier months also show in the current month under "Carried over"
  const entityTasks = useMemo(() => {
    return allTasks.filter(task => {
      // 1. Matches this entity
      const matchesEntity = lens === 'service' ? task.serviceId === entityId : task.clientId === entityId;
      if (!matchesEntity) return false;

      // 2. Month check
      const taskMonth = task.dueDate ? task.dueDate.slice(0, 7) : '';
      if (taskMonth === selectedMonth) return true;

      // 3. Carried over rule: unfinished earlier tasks appear in current month ONLY
      if (isCurrentMonth && taskMonth < selectedMonth && task.status !== 'completed') {
        return true;
      }

      return false;
    });
  }, [allTasks, lens, entityId, selectedMonth, isCurrentMonth]);

  // Compute pending badge counts per tab for the selected month
  const tabPendingCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    dynamicTabs.forEach(t => { counts[t.id] = 0; });

    entityTasks.forEach(task => {
      if (task.status !== 'completed') {
        counts.all = (counts.all || 0) + 1;
        const key = lens === 'service' ? task.clientId : task.serviceId;
        if (counts[key] !== undefined) {
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });

    return counts;
  }, [entityTasks, dynamicTabs, lens]);

  // Filter tasks based on selected tab, status filter, and assignedToMe
  const filteredTasks = useMemo(() => {
    return entityTasks.filter(task => {
      // Tab filter
      if (activeTab !== 'all') {
        const matchesTab = lens === 'service' ? task.clientId === activeTab : task.serviceId === activeTab;
        if (!matchesTab) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        if (task.status !== statusFilter) return false;
      }

      // Assigned to me
      if (assignedToMeOnly) {
        if (task.assignedTo !== currentActor.name) return false;
      }

      return true;
    });
  }, [entityTasks, activeTab, statusFilter, assignedToMeOnly, lens, currentActor.name]);

  // Group tasks into:
  // 1. Carried over (older unfinished tasks, only in current month)
  // 2. Pending (current month pending, in-progress, review)
  // 3. Completed (done tasks)
  const { carriedOverTasks, pendingTasks, completedTasks } = useMemo(() => {
    const carried: ServiceTaskInstance[] = [];
    const pending: ServiceTaskInstance[] = [];
    const done: ServiceTaskInstance[] = [];

    filteredTasks.forEach(t => {
      const taskMonth = t.dueDate ? t.dueDate.slice(0, 7) : '';
      if (t.status === 'completed') {
        done.push(t);
      } else if (isCurrentMonth && taskMonth < selectedMonth) {
        carried.push(t);
      } else {
        pending.push(t);
      }
    });

    return { carriedOverTasks: carried, pendingTasks: pending, completedTasks: done };
  }, [filteredTasks, isCurrentMonth, selectedMonth]);

  // Quick action: status cycling
  const handleQuickStatusCycle = (e: React.MouseEvent, taskId: string, currentStatus: TaskStatus) => {
    e.stopPropagation();
    if (readOnly) return;
    const order: TaskStatus[] = ['pending', 'in-progress', 'review', 'completed'];
    const currentIndex = order.indexOf(currentStatus);
    const nextStatus = order[(currentIndex + 1) % order.length];
    serviceManagementStore.changeTaskStatus(taskId, nextStatus, currentActor);
  };

  // Quick action: subtask toggle
  const handleToggleSubtask = (e: React.MouseEvent, taskId: string, subtaskId: string, done: boolean) => {
    e.stopPropagation();
    if (readOnly) return;
    serviceManagementStore.updateSubtask(taskId, subtaskId, !done, currentActor);
  };

  // Quick action: reassign
  const handleQuickReassign = (taskId: string, newAssignee: string) => {
    serviceManagementStore.reassignTask(taskId, newAssignee, currentActor);
    setReassignPopoverTaskId(null);
  };

  const toggleExpandTask = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Relative time formatter
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const diffHours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  };

  // Render a task row
  const renderTaskRow = (task: ServiceTaskInstance, isCarriedOver: boolean = false) => {
    const isExpanded = expandedTaskIds.has(task.id);
    const subtasks = task.subtasks || [];
    const pendingSubtasksCount = subtasks.filter(st => !st.done && st.status !== 'completed').length;
    const hasSubtasks = subtasks.length > 0;
    const progressPercent = subtasks.length > 0 ? Math.round(((subtasks.length - pendingSubtasksCount) / subtasks.length) * 100) : task.progress;
    const isDone = task.status === 'completed';

    const statusBadgeColors: Record<TaskStatus, string> = {
      'pending': 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700',
      'in-progress': 'bg-cyan-950/60 text-cyan-400 border-cyan-800/60 hover:bg-cyan-900/60',
      'review': 'bg-purple-950/60 text-purple-400 border-purple-800/60 hover:bg-purple-900/60',
      'completed': 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60',
      'blocked': 'bg-red-950/60 text-red-400 border-red-800/60 hover:bg-red-900/60'
    };

    return (
      <React.Fragment key={task.id}>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTaskClick(task)}
          onKeyDown={e => {
            if (e.key === 'Enter') onTaskClick(task);
          }}
          className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer ${
            isCarriedOver
              ? 'bg-red-950/15 border-red-900/30 hover:border-red-500/50'
              : isDone
              ? 'bg-slate-900/40 border-slate-800/40 opacity-75 hover:opacity-100 hover:border-slate-700'
              : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850'
          }`}
        >
          {/* Col 1: Chevron + Title + Tags */}
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
            {hasSubtasks ? (
              <button
                type="button"
                onClick={e => toggleExpandTask(e, task.id)}
                className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                title={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-5" />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                  {task.taskTitle}
                </span>

                {/* Tag: Monthly / One-time */}
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                  task.kind === 'one-time'
                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}>
                  {task.kind === 'one-time' ? 'One-time' : 'Monthly'}
                </span>

                {/* Carried over overdue indicator */}
                {isCarriedOver && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">
                    Carried over
                  </span>
                )}
              </div>

              {/* On "All" tab also show party or service name */}
              {activeTab === 'all' && (
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {lens === 'service' ? task.clientName : task.serviceTitle}
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Subtasks "2 of 5 pending" with small progress ring */}
          <div className="hidden sm:flex items-center gap-1.5 w-32 shrink-0">
            {hasSubtasks ? (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyan-400"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
                <span>{pendingSubtasksCount} of {subtasks.length} pending</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-600">—</span>
            )}
          </div>

          {/* Col 3: Assigned to (avatar & name) with quick click reassign */}
          <div className="hidden md:flex items-center gap-2 w-36 shrink-0 relative">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                if (!readOnly) {
                  setReassignPopoverTaskId(reassignPopoverTaskId === task.id ? null : task.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white group/assignee"
              title="Click to reassign"
            >
              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-cyan-400 font-bold shrink-0">
                {task.assignedTo?.slice(0, 1) || 'U'}
              </div>
              <span className="truncate max-w-[100px] text-[11px]">
                {task.assignedTo || 'Unassigned'}
              </span>
            </button>

            {/* Quick Reassign Dropdown */}
            {reassignPopoverTaskId === task.id && (
              <div
                className="absolute top-full left-0 mt-1 z-40 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 text-xs"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Reassign to:
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {employeesData.slice(0, 13).map(emp => (
                    <button
                      key={emp.employee_id}
                      type="button"
                      onClick={() => handleQuickReassign(task.id, emp.full_name)}
                      className="w-full text-left px-2.5 py-1 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      {emp.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 4: Created Date */}
          <div className="hidden lg:block w-20 shrink-0 text-[11px] text-slate-500">
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
          </div>

          {/* Col 5: Last Updated (relative time & by whom) */}
          <div className="hidden xl:block w-32 shrink-0 text-[11px] text-slate-400 truncate">
            <span>{formatRelativeTime(task.updatedAt)}</span>
            {task.updatedBy && (
              <span className="text-slate-500 ml-1">by {task.updatedBy.split(' ')[0]}</span>
            )}
          </div>

          {/* Col 6: Due Date */}
          <div className="w-20 shrink-0 text-right pr-2">
            <span className={`text-[11px] font-medium ${isCarriedOver ? 'text-red-400 font-semibold' : 'text-slate-400'}`}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}
            </span>
          </div>

          {/* Col 7: Status Chip with quick action */}
          <div className="w-24 shrink-0 text-right">
            <button
              type="button"
              onClick={e => handleQuickStatusCycle(e, task.id, task.status)}
              title="Click to advance status"
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all cursor-pointer ${statusBadgeColors[task.status]}`}
            >
              {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Done' : task.status === 'review' ? 'In Review' : 'Pending'}
            </button>
          </div>
        </div>

        {/* Expanded Inline Subtasks Checklist */}
        {isExpanded && hasSubtasks && (
          <div className="ml-8 mr-2 py-2 px-3 bg-slate-950/70 border-x border-b border-slate-800 rounded-b-lg space-y-1.5 -mt-1 mb-2">
            {subtasks.map(st => {
              const done = st.done || st.status === 'completed';
              return (
                <div
                  key={st.id}
                  onClick={e => handleToggleSubtask(e, task.id, st.id, done)}
                  className="flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-slate-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => {}}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className={`flex-1 ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                    {st.title}
                  </span>
                  {st.assignee && (
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1 rounded">
                      {st.assignee.split(' ')[0]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </React.Fragment>
    );
  };

  const totalEntityPending = tabPendingCounts.all || 0;

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Breadcrumb + Back Arrow + Month Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={onBackToBoard}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Back to board</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="capitalize">{lens}</span>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium truncate max-w-[200px]">{shortName}</span>
        </div>

        {/* Global Month Toggle stays visible */}
        <ServiceMonthToggle
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* 2. Workspace Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {entityName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            {entityCode && <span className="font-mono text-cyan-400">{entityCode}</span>}
            {category && (
              <>
                <span className="text-slate-600">•</span>
                <span>{category}</span>
              </>
            )}
            <span className="text-slate-600">•</span>
            <span>
              {lens === 'service'
                ? `${dynamicTabs.length} clients/entities`
                : `${dynamicTabs.length} active services`}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-semibold">
              <strong className="text-white">{totalEntityPending}</strong> pending
            </span>
          </div>
        </div>

        {/* Right side of header: Client preview toggle & settings */}
        <div className="flex items-center gap-2">
          {lens === 'client' && (
            <button
              type="button"
              onClick={() => setAudience(audience === 'client' ? 'internal' : 'client')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                audience === 'client'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
              }`}
              title="Toggle Client Portal preview (hides internal-only rates, billing, comments)"
            >
              <Eye size={13} />
              <span>{audience === 'client' ? 'Client View Mode' : 'Internal View'}</span>
            </button>
          )}

          <button
            type="button"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Engagement settings"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* 3. Navigation Bar: Horizontally Scrollable Tab Strip */}
      <div className="relative border-b border-slate-800 pb-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* First tab: "All" */}
          <button
            type="button"
            onClick={() => onTabChange('all')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <span>All</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'all'
                ? 'bg-cyan-700 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {tabPendingCounts.all || 0}
            </span>
          </button>

          {/* Subscribed Entities/Services Tabs (up to 12) */}
          {dynamicTabs.slice(0, 12).map(tab => {
            const isTabActive = activeTab === tab.id;
            const pending = tabPendingCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isTabActive
                    ? 'bg-cyan-500 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
                title={tab.name}
              >
                <span>{tab.shortName}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isTabActive
                    ? 'bg-cyan-700 text-white'
                    : pending > 0
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-900 text-slate-500'
                }`}>
                  {pending}
                </span>
              </button>
            );
          })}

          {/* More Tabs Dropdown if > 12 */}
          {dynamicTabs.length > 12 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreTabsOpen(!isMoreTabsOpen)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 border border-slate-800"
              >
                <span>More ({dynamicTabs.length - 12})</span>
                <ChevronDown size={12} />
              </button>

              {isMoreTabsOpen && (
                <div className="absolute left-0 top-full mt-1 z-40 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2">
                  <input
                    type="text"
                    value={tabSearch}
                    onChange={e => setTabSearch(e.target.value)}
                    placeholder="Search tabs..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 mb-1.5"
                  />
                  <div className="max-h-48 overflow-y-auto space-y-0.5">
                    {dynamicTabs
                      .slice(12)
                      .filter(t => t.name.toLowerCase().includes(tabSearch.toLowerCase()))
                      .map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            onTabChange(t.id);
                            setIsMoreTabsOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <span className="truncate">{t.name}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded ml-1">
                            {tabPendingCounts[t.id] || 0}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Filter Controls (Status chips & Assigned to me) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'pending', 'in-progress', 'review', 'completed'].map(st => {
            const active = statusFilter === st;
            const labels: Record<string, string> = {
              'ALL': 'All Status',
              'pending': 'Pending',
              'in-progress': 'In Progress',
              'review': 'In Review',
              'completed': 'Done'
            };
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
            assignedToMeOnly
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <User size={12} />
          <span>Assigned to me</span>
        </button>
      </div>

      {/* 5. Grouped Task List */}
      <div className="space-y-4 pt-1">
        {/* Group 1: Carried Over Tasks (only in current month) */}
        {carriedOverTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
              <AlertTriangle size={14} />
              <span>Carried over from prior cycles ({carriedOverTasks.length})</span>
              <span className="text-[11px] text-slate-500 font-normal">
                Requires immediate resolution
              </span>
            </div>
            <div className="space-y-1.5">
              {carriedOverTasks.map(t => renderTaskRow(t, true))}
            </div>
          </div>
        )}

        {/* Group 2: Pending Tasks for Current Month */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Pending & Active Tasks ({pendingTasks.length})</span>
          </div>
          {pendingTasks.length > 0 ? (
            <div className="space-y-1.5">
              {pendingTasks.map(t => renderTaskRow(t, false))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30">
              <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-300">All pending tasks completed for this month</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Check completed items below or jump to next month.</p>
            </div>
          )}
        </div>

        {/* Group 3: Completed Tasks (Collapsed by default) */}
        {completedTasks.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsCompletedGroupOpen(!isCompletedGroupOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
            >
              {isCompletedGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span>Completed ({completedTasks.length})</span>
            </button>
            {isCompletedGroupOpen && (
              <div className="space-y-1.5 mt-2">
                {completedTasks.map(t => renderTaskRow(t, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
