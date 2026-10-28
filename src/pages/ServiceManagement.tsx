import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Layers,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Building2,
  FileText,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Shield,
  ArrowRight,
  Download,
  AlertTriangle,
  Send,
  Sliders,
  CheckSquare,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  serviceManagementStore,
  ServiceTemplate,
  Client,
  ClientServiceEngagement,
  ServiceTaskInstance,
  ServiceTimesheetEntry,
  LegalEntity,
  RecurrenceFrequency,
  ServiceAuditEntry
} from '../services/serviceManagementData';
import { employeesData } from '../data/employeesData';

export default function ServiceManagement() {
  const { user, profile } = useAuth();
  const currentActor = useMemo(() => ({
    id: profile?.employee_id || user?.id || 'EMP001',
    name: profile?.full_name || 'Deepa Rathi',
    entity: 'ECOVIS RKCA - Mumbai HQ',
  }), [profile, user]);

  // State from store
  const [services, setServices] = useState<ServiceTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [engagements, setEngagements] = useState<ClientServiceEngagement[]>([]);
  const [taskInstances, setTaskInstances] = useState<ServiceTaskInstance[]>([]);
  const [timesheets, setTimesheets] = useState<ServiceTimesheetEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<ServiceAuditEntry[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'catalogue' | 'engagements' | 'recurrence' | 'timesheets' | 'analytics'>('catalogue');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddEngagementOpen, setIsAddEngagementOpen] = useState(false);
  const [isAddCustomTaskOpen, setIsAddCustomTaskOpen] = useState(false);
  const [selectedEngagementForCustomTask, setSelectedEngagementForCustomTask] = useState<string | null>(null);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [selectedTaskForTime, setSelectedTaskForTime] = useState<ServiceTaskInstance | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>('srv-stat-audit');
  const [expandedEngagementId, setExpandedEngagementId] = useState<string | null>('eng-tata-audit');

  // Job Run Notification banner
  const [jobRunResult, setJobRunResult] = useState<{ totalSpawned: number; totalSkipped: number; details: string[] } | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingTimesheetId, setRejectingTimesheetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Subscribe to store updates
  useEffect(() => {
    const updateAll = () => {
      setServices(serviceManagementStore.getServices());
      setClients(serviceManagementStore.getClients());
      setEngagements(serviceManagementStore.getEngagements());
      setTaskInstances(serviceManagementStore.getTaskInstances());
      setTimesheets(serviceManagementStore.getTimesheets());
      setAuditLogs(serviceManagementStore.getAuditLogs());
      setLegalEntities(serviceManagementStore.getLegalEntities());
    };

    updateAll();
    const unsub = serviceManagementStore.subscribe(updateAll);
    return () => {
      unsub();
    };
  }, []);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const totalServices = services.length;
    const activeEngagements = engagements.filter(e => e.status === 'active').length;
    const pendingTasks = taskInstances.filter(t => t.status !== 'completed').length;
    const totalTimesheetHours = timesheets.reduce((acc, t) => acc + (t.status === 'approved' ? t.hours : 0), 0);
    const pendingApprovals = timesheets.filter(t => t.status === 'submitted').length;
    const totalBilledValue = timesheets
      .filter(t => t.status === 'approved' && t.isBillable)
      .reduce((acc, t) => acc + t.totalBilledAmount, 0);

    return {
      totalServices,
      activeEngagements,
      pendingTasks,
      totalTimesheetHours,
      pendingApprovals,
      totalBilledValue
    };
  }, [services, engagements, taskInstances, timesheets]);

  // --- RECURRENCE RUN TRIGGER ---
  const handleTriggerRecurrence = () => {
    const res = serviceManagementStore.runAllRecurrences(currentActor);
    setJobRunResult(res);
    setTimeout(() => {
      // Auto-hide alert banner after 8s
    }, 8000);
  };

  // --- NEW SERVICE FORM STATE ---
  const [newServiceCode, setNewServiceCode] = useState('');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<ServiceTemplate['category']>('Audit & Assurance');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceRate, setNewServiceRate] = useState(3000);
  const [newServiceDuration, setNewServiceDuration] = useState(30);

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceTitle || !newServiceCode) return;

    serviceManagementStore.addService({
      code: newServiceCode,
      title: newServiceTitle,
      category: newServiceCategory,
      description: newServiceDesc || 'Standard comprehensive service template.',
      department: newServiceCategory,
      standardHourlyRate: Number(newServiceRate),
      currency: 'INR',
      estimatedDurationDays: Number(newServiceDuration),
      tags: [newServiceCategory.split(' ')[0], 'Master'],
      isActive: true,
      deliverables: [
        {
          id: `del-${Date.now()}-1`,
          title: `${newServiceTitle} - Initial Scoping & Workpapers`,
          description: 'Kick-off assessment and documentation intake.',
          estimatedHours: 20,
          priority: 'high',
          requiredRole: 'senior_associate',
          subtasks: [
            { id: `st-${Date.now()}-1`, title: 'Intake and data verification', estimatedHours: 10 },
            { id: `st-${Date.now()}-2`, title: 'Risk assessment matrix', estimatedHours: 10 }
          ],
          executionSteps: [
            { id: `es-${Date.now()}-1`, text: 'Obtain client files' },
            { id: `es-${Date.now()}-2`, text: 'Establish timeline schedule' }
          ]
        },
        {
          id: `del-${Date.now()}-2`,
          title: `${newServiceTitle} - Execution & Final Delivery`,
          description: 'Substantive testing, review, and client report sign-off.',
          estimatedHours: 25,
          priority: 'high',
          requiredRole: 'manager',
          subtasks: [
            { id: `st-${Date.now()}-3`, title: 'Draft deliverable report', estimatedHours: 15 },
            { id: `st-${Date.now()}-4`, title: 'Partner review and clearance', estimatedHours: 10 }
          ],
          executionSteps: [
            { id: `es-${Date.now()}-3`, text: 'Conduct review meeting' },
            { id: `es-${Date.now()}-4`, text: 'Issue final certified documents' }
          ]
        }
      ]
    }, currentActor);

    setNewServiceCode('');
    setNewServiceTitle('');
    setNewServiceDesc('');
    setIsAddServiceOpen(false);
  };

  // --- NEW ENGAGEMENT FORM STATE ---
  const [newEngClientId, setNewEngClientId] = useState(clients[0]?.id || 'cli-tata');
  const [newEngServiceId, setNewEngServiceId] = useState(services[0]?.id || 'srv-stat-audit');
  const [newEngLegalEntityId, setNewEngLegalEntityId] = useState('le-mum');
  const [newEngBillingType, setNewEngBillingType] = useState<ClientServiceEngagement['billingType']>('monthly_retainer');
  const [newEngContractValue, setNewEngContractValue] = useState(150000);
  const [newEngFrequency, setNewEngFrequency] = useState<RecurrenceFrequency>('monthly');
  const [newEngDayOfMonth, setNewEngDayOfMonth] = useState(15);
  const [newEngSelectedDeliverables, setNewEngSelectedDeliverables] = useState<string[]>([]);
  const [selectedCollaboratorIds, setSelectedCollaboratorIds] = useState<string[]>(['EMP001', 'EMP002']);

  // Reset selected deliverables when chosen service changes
  useEffect(() => {
    const srv = services.find(s => s.id === newEngServiceId);
    if (srv) {
      setNewEngSelectedDeliverables(srv.deliverables.map(d => d.id));
    }
  }, [newEngServiceId, services]);

  const handleCreateEngagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEngClientId || !newEngServiceId) return;

    const chosenCollaborators = selectedCollaboratorIds.map(empId => {
      const emp = employeesData.find(ed => ed.employee_id === empId);
      // Map emp to home legal entity (simulate cross-entity: odd IDs to Delhi/Pune, even to Mumbai/Bengaluru)
      const homeEntity = empId === 'EMP002' ? legalEntities[1] : (empId === 'EMP004' ? legalEntities[3] : legalEntities[0]);
      return {
        userId: empId,
        userName: emp?.full_name || 'Team Member',
        userEmail: emp?.email || `${empId}@ecovis.com`,
        homeLegalEntityId: homeEntity.id,
        homeLegalEntityName: homeEntity.name,
        engagementRole: emp?.primary_role === 'business_head' ? 'engagement_partner' as const : (emp?.primary_role === 'manager' ? 'manager' as const : 'senior_associate' as const),
        allocatedHours: 40
      };
    });

    serviceManagementStore.addEngagement({
      clientId: newEngClientId,
      serviceId: newEngServiceId,
      servicingLegalEntityId: newEngLegalEntityId,
      billingType: newEngBillingType,
      contractValue: Number(newEngContractValue),
      currency: 'INR',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      selectedTemplateTaskIds: newEngSelectedDeliverables,
      customTasks: [],
      collaborators: chosenCollaborators,
      recurrence: {
        frequency: newEngFrequency,
        startDate: new Date().toISOString().split('T')[0],
        dayOfMonth: Number(newEngDayOfMonth),
        leadDays: 7,
        isActive: true,
        lastRunAt: new Date().toISOString()
      },
      notes: 'Configured with custom task selection and cross-entity team.'
    }, currentActor);

    setIsAddEngagementOpen(false);
  };

  // --- CUSTOM CLIENT TASK FORM STATE ---
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDesc, setCustomTaskDesc] = useState('');
  const [customTaskHours, setCustomTaskHours] = useState(15);
  const [customTaskPriority, setCustomTaskPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [customSubtask1, setCustomSubtask1] = useState('');
  const [customSubtask2, setCustomSubtask2] = useState('');

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEngagementForCustomTask || !customTaskTitle) return;

    const subtasks = [];
    if (customSubtask1.trim()) subtasks.push({ id: `st-c1-${Date.now()}`, title: customSubtask1 });
    if (customSubtask2.trim()) subtasks.push({ id: `st-c2-${Date.now()}`, title: customSubtask2 });

    serviceManagementStore.addCustomTaskToEngagement(
      selectedEngagementForCustomTask,
      {
        title: customTaskTitle,
        description: customTaskDesc || 'Bespoke client task.',
        estimatedHours: Number(customTaskHours),
        priority: customTaskPriority,
        subtasks,
        executionSteps: [
          { id: `es-c-${Date.now()}`, text: 'Execute custom client deliverable scope' }
        ]
      },
      currentActor
    );

    setCustomTaskTitle('');
    setCustomTaskDesc('');
    setCustomSubtask1('');
    setCustomSubtask2('');
    setIsAddCustomTaskOpen(false);
  };

  // --- LOG TIMESHEET FORM STATE ---
  const [timeEngagementId, setTimeEngagementId] = useState(engagements[0]?.id || '');
  const [timeHours, setTimeHours] = useState(4);
  const [timeDate, setTimeDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeDesc, setTimeDesc] = useState('');
  const [timeIsBillable, setTimeIsBillable] = useState(true);

  const handleLogTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    const engagement = engagements.find(e => e.id === timeEngagementId);
    if (!engagement) return;

    const client = clients.find(c => c.id === engagement.clientId);
    const service = services.find(s => s.id === engagement.serviceId);

    // Check if actor's entity differs from client's servicing entity
    const actorHomeEntity = legalEntities[0];
    const isCross = actorHomeEntity.id !== engagement.servicingLegalEntityId;

    serviceManagementStore.logTimesheet({
      engagementId: engagement.id,
      clientId: engagement.clientId,
      clientName: client?.name || 'Client',
      serviceId: engagement.serviceId,
      serviceTitle: service?.title || 'Service',
      taskInstanceId: selectedTaskForTime?.id,
      taskTitle: selectedTaskForTime?.taskTitle || (service?.deliverables[0]?.title || 'General Engagement Work'),
      userId: currentActor.id,
      userName: currentActor.name,
      userLegalEntityId: actorHomeEntity.id,
      userLegalEntityName: actorHomeEntity.name,
      isCrossEntityCollaboration: isCross,
      date: timeDate,
      hours: Number(timeHours),
      isBillable: timeIsBillable,
      hourlyRate: service?.standardHourlyRate || 3000,
      description: timeDesc || 'Service engagement work completed.'
    }, currentActor);

    setTimeDesc('');
    setTimeHours(4);
    setSelectedTaskForTime(null);
    setIsLogTimeOpen(false);
  };

  // --- TIMESHEET APPROVALS ---
  const handleApproveTimesheet = (tsId: string) => {
    serviceManagementStore.approveTimesheet(tsId, currentActor);
  };

  const handleOpenRejectModal = (tsId: string) => {
    setRejectingTimesheetId(tsId);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectingTimesheetId && rejectReason.trim()) {
      serviceManagementStore.rejectTimesheet(rejectingTimesheetId, rejectReason, currentActor);
      setIsRejectModalOpen(false);
      setRejectingTimesheetId(null);
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [services, searchQuery, categoryFilter]);

  // Filtered Engagements
  const filteredEngagements = useMemo(() => {
    return engagements.filter(e => {
      const client = clients.find(c => c.id === e.clientId);
      const service = services.find(s => s.id === e.serviceId);
      const matchSearch = !searchQuery ||
        client?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service?.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClient = clientFilter === 'ALL' || e.clientId === clientFilter;
      const matchStatus = statusFilter === 'ALL' || e.status === statusFilter;
      return matchSearch && matchClient && matchStatus;
    });
  }, [engagements, clients, services, searchQuery, clientFilter, statusFilter]);

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return taskInstances.filter(t => {
      const matchSearch = !searchQuery ||
        t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [taskInstances, searchQuery, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Service Management &amp; Client Engagements
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Tenant-Isolated
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-client catalogue, custom task customization, cross-legal-entity teams, and idempotent recurring schedules.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerRecurrence}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition active:scale-95"
            title="Execute automated recurrence generation job across all active subscriptions"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Run Recurrence Job</span>
          </button>

          <button
            onClick={() => setIsAddEngagementOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Service to Client</span>
          </button>

          <button
            onClick={() => setIsLogTimeOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Log Time</span>
          </button>
        </div>
      </div>

      {/* Recurrence Run Notification Alert Banner */}
      {jobRunResult && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">
                Recurrence Dispatch Completed Successfully: {jobRunResult.totalSpawned} Task Instances Spawned, {jobRunResult.totalSkipped} Duplicate Cycles Safely Skipped (Idempotent).
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800 dark:text-emerald-300">
                {jobRunResult.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => setJobRunResult(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Master Services</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalServices}</div>
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-0.5">Tenant-wide catalogue</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Client Subscriptions</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.activeEngagements}</div>
          <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">Active contracts</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Tasks</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pendingTasks}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recurring cycles</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Approved Hours</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalTimesheetHours} hrs</div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Billed by cross-entity</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pending Approvals</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.pendingApprovals}</div>
          <div className="text-[10px] text-indigo-500 mt-0.5">Awaiting partner sign-off</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Billed Revenue</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            ₹{(stats.totalBilledValue / 1000).toFixed(0)}k
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Accrued billables</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filtering Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex space-x-1.5 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'catalogue'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Catalogue</span>
          </button>

          <button
            onClick={() => setActiveTab('engagements')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'engagements'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Client Engagements</span>
          </button>

          <button
            onClick={() => setActiveTab('recurrence')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'recurrence'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recurring Task Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('timesheets')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'timesheets'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timesheets &amp; Approvals</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Workload &amp; Audit</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalogue, clients, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* --- TAB 1: SERVICE CATALOGUE (TENANT LEVEL) --- */}
      {activeTab === 'catalogue' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tenant-Level Service Catalogue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Master service templates independent of legal entities. Any subsidiary entity can subscribe clients to these templates.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Categories</option>
                <option value="Audit & Assurance">Audit & Assurance</option>
                <option value="Tax & Regulatory">Tax & Regulatory</option>
                <option value="Payroll & HR Outsourcing">Payroll & HR</option>
                <option value="Digital & IT Audit">Digital & IT Audit</option>
              </select>

              <button
                onClick={() => setIsAddServiceOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Master Service</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredServices.map((service) => {
              const isExpanded = expandedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold">
                            {service.code}
                          </span>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {service.title}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-5 shrink-0 self-end md:self-center">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          ₹{service.standardHourlyRate.toLocaleString()}/hr
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {service.deliverables.length} Deliverables • {service.estimatedDurationDays} Days
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Deliverables breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
                      <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                        Standard Deliverables &amp; Subtasks Template
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {service.deliverables.map((deliv, idx) => (
                          <div
                            key={deliv.id}
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">
                                Deliverable {idx + 1}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                                {deliv.estimatedHours} hrs
                              </span>
                            </div>
                            <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                              {deliv.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {deliv.description}
                            </p>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 space-y-1">
                              <div className="text-[10px] font-semibold text-slate-400">Default Subtasks:</div>
                              {deliv.subtasks.map((st) => (
                                <div key={st.id} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
                                  <CheckSquare className="w-3 h-3 text-cyan-500 shrink-0" />
                                  <span className="truncate">{st.title}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                          <Info className="w-3.5 h-3.5 text-slate-400" />
                          <span>When subscribing a client, you can selectively toggle these deliverables or add bespoke custom tasks.</span>
                        </div>
                        <button
                          onClick={() => {
                            setNewEngServiceId(service.id);
                            setIsAddEngagementOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-xs"
                        >
                          Subscribe Client to this Service
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: CLIENT ENGAGEMENTS (SELECTION & CUSTOM TASKS) --- */}
      {activeTab === 'engagements' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Active Client Service Engagements
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-client service subscriptions with customized deliverable selection, custom client tasks, and cross-legal-entity teams.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Clients ({clients.length})</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={() => setIsAddEngagementOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Engagement</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredEngagements.map((eng) => {
              const client = clients.find(c => c.id === eng.clientId);
              const service = services.find(s => s.id === eng.serviceId);
              const servicingEntity = legalEntities.find(le => le.id === eng.servicingLegalEntityId);
              const isExpanded = expandedEngagementId === eng.id;

              return (
                <div
                  key={eng.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedEngagementId(isExpanded ? null : eng.id)}
                    className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                  >
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {client?.name}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-xs text-cyan-600 dark:text-cyan-400">
                          {service?.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {eng.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-4 flex-wrap">
                        <span>Serviced by: <strong className="text-slate-700 dark:text-slate-200">{servicingEntity?.name}</strong></span>
                        <span>•</span>
                        <span>Billing: <strong className="text-slate-700 dark:text-slate-200">{eng.billingType.replace('_', ' ')}</strong></span>
                        <span>•</span>
                        <span>Recurrence: <strong className="text-cyan-600 dark:text-cyan-400 capitalize">{eng.recurrence.frequency}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 self-end lg:self-center">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          ₹{eng.contractValue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {eng.collaborators.length} Collaborators ({eng.collaborators.filter(c => c.homeLegalEntityId !== eng.servicingLegalEntityId).length} Cross-Entity)
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Scope Details & Custom Tasks */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/40 space-y-5">
                      {/* Section A: Selected Standard Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            1. Selected Deliverables from Master Catalogue ({eng.selectedTemplateTaskIds.length} of {service?.deliverables.length})
                          </span>
                          <span className="text-[11px] text-slate-400">Client-specific tailored scope</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          {service?.deliverables.map((deliv) => {
                            const isSelected = eng.selectedTemplateTaskIds.includes(deliv.id);
                            return (
                              <div
                                key={deliv.id}
                                className={`p-3 rounded-xl border text-xs transition ${
                                  isSelected
                                    ? 'bg-white dark:bg-slate-800 border-cyan-400 dark:border-cyan-600 shadow-xs'
                                    : 'bg-slate-100/50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="truncate">{deliv.title}</span>
                                  {isSelected ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">Active</span>
                                  ) : (
                                    <span className="text-[9px] text-slate-400">Excluded</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {deliv.estimatedHours} hrs • {deliv.subtasks.length} subtasks
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section B: Custom Client Tasks (Without Touching Master Template) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              2. Custom Client Tasks ({eng.customTasks?.length || 0})
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800">
                              Preserves Master Template Integrity
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedEngagementForCustomTask(eng.id);
                              setIsAddCustomTaskOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Custom Client Task</span>
                          </button>
                        </div>

                        {eng.customTasks && eng.customTasks.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {eng.customTasks.map((ct) => (
                              <div
                                key={ct.id}
                                className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-purple-900 dark:text-purple-300">{ct.title}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-mono">
                                    {ct.estimatedHours} hrs
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400">{ct.description}</p>
                                {ct.subtasks.length > 0 && (
                                  <div className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                                    Includes: {ct.subtasks.map(s => s.title).join(', ')}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                            No bespoke client tasks added yet. Standard template deliverables are currently applied.
                          </div>
                        )}
                      </div>

                      {/* Section C: Cross-Legal-Entity Collaboration Team */}
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                          3. Cross-Legal-Entity Collaboration Team
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {eng.collaborators.map((collab) => {
                            const isCross = collab.homeLegalEntityId !== eng.servicingLegalEntityId;
                            return (
                              <div
                                key={collab.userId}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center space-x-2.5"
                              >
                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                                  {collab.userName.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1 text-xs">
                                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                                    {collab.userName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {collab.engagementRole.replace('_', ' ')} • {collab.allocatedHours} hrs
                                  </div>
                                  {isCross && (
                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      {collab.homeLegalEntityName.split('-')[1]?.trim() || 'Cross-Entity'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: RECURRING TASK PIPELINE (WITH IDEMPOTENCY) --- */}
      {activeTab === 'recurrence' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recurring Task Pipeline &amp; Idempotent Task Instances
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Independent task instances generated automatically on daily, weekly, monthly, quarterly, or yearly schedules.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Task Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button
                onClick={handleTriggerRecurrence}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Simulate Recurrence Run</span>
              </button>
            </div>
          </div>

          {/* Tasks Instances List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const statusColors: Record<string, string> = {
                completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                'in-progress': "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
                pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                review: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800",
              };

              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3.5 hover:border-cyan-400 dark:hover:border-cyan-600 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                          {task.periodKey}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {task.clientName}
                        </span>
                        {task.isCustomTask && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                            Custom Client Scope
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">
                        {task.taskTitle}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusColors[task.status] || 'bg-slate-100'}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Idempotency Key Tag */}
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[10px] font-mono text-slate-500 break-all">
                    Idempotency Key: {task.idempotencyKey}
                  </div>

                  {/* Progress & Due Date */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>Progress ({task.progress}%)</span>
                      <span>Due: <strong>{task.dueDate.split('T')[0]}</strong></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Assignee & Cross-Entity Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center">
                        {task.assignedTo.charAt(0)}
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{task.assignedTo}</span>
                      {task.isCrossEntity && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                          Cross-Entity
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTaskForTime(task);
                          setTimeEngagementId(task.engagementId);
                          setIsLogTimeOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-medium"
                      >
                        Log Hours ({task.actualHours}/{task.estimatedHours}h)
                      </button>

                      {task.status !== 'completed' ? (
                        <button
                          onClick={() => {
                            serviceManagementStore.updateTaskInstance(task.id, { status: 'completed', progress: 100 }, currentActor);
                          }}
                          className="p-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 transition"
                          title="Mark task completed"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            serviceManagementStore.updateTaskInstance(task.id, { status: 'in-progress', progress: 50 }, currentActor);
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600"
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 4: CLIENT TIMESHEETS & APPROVAL WORKFLOW --- */}
      {activeTab === 'timesheets' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Client-Specific Timesheets &amp; Approvals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log billable and non-billable client hours with inter-company cross-entity rate reconciliation.
              </p>
            </div>
            <button
              onClick={() => setIsLogTimeOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Time Entry</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Client &amp; Service</th>
                    <th className="p-3.5">Deliverable Task</th>
                    <th className="p-3.5">Consultant</th>
                    <th className="p-3.5 text-center">Hours</th>
                    <th className="p-3.5 text-right">Billable Amount</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Approver Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                  {timesheets.map((ts) => {
                    let statusBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
                    if (ts.status === 'approved') statusBadge = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
                    if (ts.status === 'rejected') statusBadge = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";

                    return (
                      <tr key={ts.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                          {ts.date}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          <div>{ts.clientName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{ts.serviceTitle}</div>
                        </td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                          <div className="truncate font-medium">{ts.taskTitle}</div>
                          <div className="text-[10px] text-slate-400 truncate">{ts.description}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-900 dark:text-white">{ts.userName}</div>
                          <div className="text-[10px] text-slate-400">
                            {ts.userLegalEntityName.split('-')[1]?.trim() || 'HQ'}
                            {ts.isCrossEntityCollaboration && (
                              <span className="ml-1 text-amber-600 dark:text-amber-400 font-bold">[Cross-Entity]</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white">
                          {ts.hours}h
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                          ₹{ts.totalBilledAmount.toLocaleString()}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadge}`}>
                            {ts.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {ts.status === 'submitted' ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => handleApproveTimesheet(ts.id)}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(ts.id)}
                                className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              {ts.status === 'approved' ? `Approved by ${ts.approvedBy || 'Partner'}` : (ts.rejectionReason || 'Rejected')}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: WORKLOAD, COLLABORATION & AUDIT LEDGER --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Cross-Entity Matrix & Workload */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Cross-Legal-Entity Collaboration Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracking consultants delivering services across multiple subsidiary entities under the tenant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {legalEntities.map(entity => {
                const entityCollaborators = employeesData.filter(e => {
                  return e.employee_id === 'EMP001' ? entity.id === 'le-mum' :
                    (e.employee_id === 'EMP002' ? entity.id === 'le-del' :
                    (e.employee_id === 'EMP004' ? entity.id === 'le-pun' : entity.id === 'le-blr'));
                });

                return (
                  <div key={entity.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{entity.code}</span>
                      <span className="text-[10px] text-slate-400">{entity.city}, {entity.country}</span>
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{entity.name}</div>
                    <div className="text-xs text-slate-500">
                      Tax Reg: <code className="font-mono">{entity.taxRegistrationNumber}</code>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                      Active on <strong>{engagements.filter(e => e.collaborators.some(c => c.homeLegalEntityId === entity.id)).length}</strong> client subscriptions
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-500" />
                  <span>Immutable Service Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recorded ledger of catalogue alterations, client assignments, recurrence dispatches, and timesheet approvals.
                </p>
              </div>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                  const a = document.createElement('a');
                  a.href = dataStr;
                  a.download = "service-management-audit-log.json";
                  a.click();
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-96 overflow-y-auto pr-2 space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="pt-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                  <div className="text-[10px] text-slate-400">
                    Actor: <strong className="text-slate-600 dark:text-slate-300">{log.actorName}</strong> ({log.actorLegalEntity})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD MASTER SERVICE CATALOGUE --- */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>Author Master Service Template</span>
              </h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Service Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SRV-TAX-05"
                    value={newServiceCode}
                    onChange={(e) => setNewServiceCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Category *</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="Audit & Assurance">Audit & Assurance</option>
                    <option value="Tax & Regulatory">Tax & Regulatory</option>
                    <option value="Corporate Advisory">Corporate Advisory</option>
                    <option value="Payroll & HR Outsourcing">Payroll & HR</option>
                    <option value="Digital & IT Audit">Digital & IT Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Transfer Pricing Study & Form 3CEB Certification"
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Scope Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed deliverables and standard statutory coverage..."
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Standard Rate (INR/hr)</label>
                  <input
                    type="number"
                    value={newServiceRate}
                    onChange={(e) => setNewServiceRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Estimated Duration (Days)</label>
                  <input
                    type="number"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-start space-x-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Initial master deliverables, subtask checklists, and execution steps will be bootstrapped automatically and can be tailored per client engagement.</span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-xs"
                >
                  Publish to Catalogue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ASSIGN SERVICE TO CLIENT (WITH DELIVERABLES SELECTION) --- */}
      {isAddEngagementOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-cyan-600" />
                <span>Subscribe Client to Service (Engagement Scope)</span>
              </h3>
              <button onClick={() => setIsAddEngagementOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEngagement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Target Client *</label>
                  <select
                    value={newEngClientId}
                    onChange={(e) => setNewEngClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Catalogue Service *</label>
                  <select
                    value={newEngServiceId}
                    onChange={(e) => setNewEngServiceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Servicing Legal Entity *</label>
                  <select
                    value={newEngLegalEntityId}
                    onChange={(e) => setNewEngLegalEntityId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    {legalEntities.map(le => (
                      <option key={le.id} value={le.id}>{le.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Billing Type &amp; Value</label>
                  <div className="flex space-x-2">
                    <select
                      value={newEngBillingType}
                      onChange={(e) => setNewEngBillingType(e.target.value as any)}
                      className="w-1/2 px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    >
                      <option value="monthly_retainer">Monthly Retainer</option>
                      <option value="fixed_fee">Fixed Fee</option>
                      <option value="time_and_materials">Time &amp; Materials</option>
                    </select>
                    <input
                      type="number"
                      value={newEngContractValue}
                      onChange={(e) => setNewEngContractValue(Number(e.target.value))}
                      placeholder="Contract Value"
                      className="w-1/2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Deliverable Scope Selection Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex justify-between items-center">
                  <span>Client-Specific Deliverable Selection:</span>
                  <span className="text-[10px] text-cyan-600 font-normal">Check which template deliverables apply</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {services.find(s => s.id === newEngServiceId)?.deliverables.map(deliv => {
                    const isChecked = newEngSelectedDeliverables.includes(deliv.id);
                    return (
                      <label
                        key={deliv.id}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEngSelectedDeliverables([...newEngSelectedDeliverables, deliv.id]);
                            } else {
                              setNewEngSelectedDeliverables(newEngSelectedDeliverables.filter(id => id !== deliv.id));
                            }
                          }}
                          className="rounded text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{deliv.title}</span>
                        <span className="text-[10px] text-slate-400">({deliv.estimatedHours} hrs)</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence Schedule Config */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Recurrence Frequency</label>
                  <select
                    value={newEngFrequency}
                    onChange={(e) => setNewEngFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="one-off">One-Off Deliverable</option>
                    <option value="daily">Daily Checklist</option>
                    <option value="weekly">Weekly Cycle</option>
                    <option value="monthly">Monthly Cycle (e.g. GST/PF)</option>
                    <option value="quarterly">Quarterly Review</option>
                    <option value="yearly">Yearly Statutory Audit</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Cycle Due Day (of month)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newEngDayOfMonth}
                    onChange={(e) => setNewEngDayOfMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEngagementOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-xs"
                >
                  Confirm Subscription &amp; Spawn Initial Tasks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: ADD BESPOKE CLIENT CUSTOM TASK --- */}
      {isAddCustomTaskOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Add Custom Client Task (Isolated Scope)</span>
              </h3>
              <button onClick={() => setIsAddCustomTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Custom Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Supplier Environmental Compliance Audit"
                  value={customTaskTitle}
                  onChange={(e) => setCustomTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  placeholder="Client-specific notes and justification..."
                  value={customTaskDesc}
                  onChange={(e) => setCustomTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Estimated Hours</label>
                  <input
                    type="number"
                    value={customTaskHours}
                    onChange={(e) => setCustomTaskHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={customTaskPriority}
                    onChange={(e) => setCustomTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold block text-slate-700 dark:text-slate-300">Custom Subtasks</label>
                <input
                  type="text"
                  placeholder="Subtask 1 (e.g. Review vendor ISO certifications)"
                  value={customSubtask1}
                  onChange={(e) => setCustomSubtask1(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="Subtask 2 (optional)"
                  value={customSubtask2}
                  onChange={(e) => setCustomSubtask2(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-[10px] text-purple-800 dark:text-purple-300">
                Notice: This task is stored exclusively inside this client subscription and will NOT contaminate or mutate the master service template.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomTaskOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                >
                  Save Custom Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: LOG CLIENT TIMESHEET --- */}
      {isLogTimeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Log Service Timesheet Hours</span>
              </h3>
              <button onClick={() => setIsLogTimeOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogTimesheet} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Client Engagement *</label>
                <select
                  value={timeEngagementId}
                  onChange={(e) => setTimeEngagementId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                >
                  {engagements.map(e => {
                    const client = clients.find(c => c.id === e.clientId);
                    const service = services.find(s => s.id === e.serviceId);
                    return (
                      <option key={e.id} value={e.id}>{client?.name} - {service?.title}</option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={timeDate}
                    onChange={(e) => setTimeDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={timeHours}
                    onChange={(e) => setTimeHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Work Description / Deliverable Milestones</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail work performed for client audit trail..."
                  value={timeDesc}
                  onChange={(e) => setTimeDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="billableCheck"
                  checked={timeIsBillable}
                  onChange={(e) => setTimeIsBillable(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="billableCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Mark as Billable Hours to Client
                </label>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400">
                Logging as: <strong>{currentActor.name}</strong> ({currentActor.entity}). Time entry will route to Engagement Partner approval queue.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogTimeOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-xs"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: REJECT TIMESHEET REASON --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3.5 animate-in zoom-in-95">
            <h4 className="font-bold text-sm text-red-600 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Reject Timesheet Entry</span>
            </h4>
            <p className="text-xs text-slate-500">
              Provide feedback for why this time entry cannot be approved:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Scope was out of agreed engagement retainer..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            />
            <div className="flex justify-end space-x-2 pt-1 text-xs">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
