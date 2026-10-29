import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Building2,
  DollarSign,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Users
} from 'lucide-react';
import {
  serviceManagementStore,
  ServiceTemplate,
  Client,
  ClientServiceEngagement,
  ServiceTimesheetEntry,
  ServiceAuditEntry,
  LegalEntity,
  RecurrenceFrequency
} from '../../services/serviceManagementData';
import { employeesData } from '../../data/employeesData';

export type ManageViewType =
  | 'none'
  | 'assign_service'
  | 'catalogue'
  | 'engagements'
  | 'timesheets'
  | 'audit'
  | 'insights'
  | 'log_time';

interface ManageModalsProps {
  currentView: ManageViewType;
  onClose: () => void;
  currentActor: { id: string; name: string; entity: string };
  isPartnerOrDirector: boolean;
  selectedMonth: string;
  onRunRecurrenceJob: () => void;
}

export const ManageModals: React.FC<ManageModalsProps> = ({
  currentView,
  onClose,
  currentActor,
  isPartnerOrDirector,
  selectedMonth,
  onRunRecurrenceJob
}) => {
  const services = serviceManagementStore.getServices();
  const clients = serviceManagementStore.getClients();
  const internalCompanies = serviceManagementStore.getInternalCompanies();
  const allParties = [...clients, ...internalCompanies];
  const engagements = serviceManagementStore.getEngagements();
  const timesheets = serviceManagementStore.getTimesheets();
  const auditLogs = serviceManagementStore.getAuditLogs();
  const legalEntities = serviceManagementStore.getLegalEntities();

  // Assign Service Form State
  const [targetType, setTargetType] = useState<'client' | 'internal'>('client');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(clients[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [servicingEntityId, setServicingEntityId] = useState<string>(legalEntities[0]?.id || '');
  const [billingType, setBillingType] = useState<'fixed_fee' | 'time_and_materials' | 'monthly_retainer'>('monthly_retainer');
  const [contractValue, setContractValue] = useState<number>(120000);
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency>('monthly');
  const [cycleDueDay, setCycleDueDay] = useState<number>(15);
  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>([]);
  const [assignSuccessMsg, setAssignSuccessMsg] = useState('');

  // Timesheet rejection modal
  const [rejectingTsId, setRejectingTsId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Standalone Log Time Form
  const [logPartyId, setLogPartyId] = useState(allParties[0]?.id || '');
  const [logServiceId, setLogServiceId] = useState(services[0]?.id || '');
  const [logHours, setLogHours] = useState('4.0');
  const [logDescription, setLogDescription] = useState('');
  const [logSuccessMsg, setLogSuccessMsg] = useState('');

  // New Service Catalogue Form
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [newSrvTitle, setNewSrvTitle] = useState('');
  const [newSrvShort, setNewSrvShort] = useState('');
  const [newSrvCode, setNewSrvCode] = useState('SRV-NEW-01');
  const [newSrvCategory, setNewSrvCategory] = useState<'Audit & Assurance' | 'Tax & Regulatory' | 'Corporate Advisory' | 'Payroll & HR Outsourcing'>('Tax & Regulatory');
  const [newSrvRate, setNewSrvRate] = useState(3000);
  const [newSrvDesc, setNewSrvDesc] = useState('');

  if (currentView === 'none') return null;

  // Selected Service for deliverable options
  const activeServiceTemplate = services.find(s => s.id === selectedServiceId);

  // Initialize selected deliverables when service changes
  React.useEffect(() => {
    if (activeServiceTemplate) {
      setSelectedDeliverableIds(activeServiceTemplate.deliverables.map(d => d.id));
    }
  }, [selectedServiceId]);

  // Handle Assign Service Submission
  const handleAssignServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartyId || !selectedServiceId) return;

    serviceManagementStore.createEngagement(
      {
        tenantId: 'tenant-ecovis-global',
        clientId: selectedPartyId,
        serviceId: selectedServiceId,
        servicingLegalEntityId: servicingEntityId,
        billingType,
        contractValue,
        currency: 'INR',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        selectedTemplateTaskIds: selectedDeliverableIds,
        customTasks: [],
        collaborators: [
          {
            userId: currentActor.id,
            userName: currentActor.name,
            userEmail: `${currentActor.name.toLowerCase().replace(' ', '.')}@ecovis.com`,
            homeLegalEntityId: servicingEntityId,
            homeLegalEntityName: legalEntities.find(l => l.id === servicingEntityId)?.name || 'ECOVIS HQ',
            engagementRole: 'manager',
            allocatedHours: 40
          }
        ],
        recurrence: {
          frequency: recurrenceFreq,
          startDate: new Date().toISOString().split('T')[0],
          dayOfMonth: cycleDueDay,
          leadDays: 7,
          isActive: true
        }
      },
      currentActor
    );

    setAssignSuccessMsg('Service successfully assigned! Initial tasks generated.');
    setTimeout(() => {
      setAssignSuccessMsg('');
      onClose();
    }, 1500);
  };

  // Handle Standalone Log Time
  const handleLogTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(logHours) || 0;
    if (hrs <= 0) return;

    const party = allParties.find(p => p.id === logPartyId);
    const srv = services.find(s => s.id === logServiceId);

    serviceManagementStore.logTimesheet(
      {
        engagementId: `eng-${logPartyId}-${logServiceId}`,
        clientId: logPartyId,
        clientName: party?.name || 'Party',
        serviceId: logServiceId,
        serviceTitle: srv?.title || 'Service',
        taskTitle: `Advisory & Compliance: ${srv?.shortTitle || 'Service'}`,
        userId: currentActor.id,
        userName: currentActor.name,
        userLegalEntityId: party?.primaryLegalEntityId || 'le-mum',
        userLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        isCrossEntityCollaboration: false,
        date: new Date().toISOString().split('T')[0],
        hours: hrs,
        isBillable: true,
        hourlyRate: srv?.standardHourlyRate || 3000,
        description: logDescription.trim() || 'General service consultation & filing review.'
      },
      currentActor
    );

    setLogSuccessMsg('Timesheet entry logged successfully!');
    setTimeout(() => {
      setLogSuccessMsg('');
      onClose();
    }, 1200);
  };

  // Handle Create Service
  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvTitle.trim()) return;

    serviceManagementStore.addServiceTemplate(
      {
        code: newSrvCode.trim() || `SRV-${Date.now().toString().slice(-4)}`,
        title: newSrvTitle.trim(),
        shortTitle: newSrvShort.trim() || newSrvTitle.trim().split(' ')[0],
        category: newSrvCategory,
        description: newSrvDesc.trim() || 'Comprehensive service engagement.',
        department: 'Advisory & Tax',
        standardHourlyRate: newSrvRate,
        currency: 'INR',
        estimatedDurationDays: 14,
        tags: [newSrvShort || 'Service'],
        isActive: true,
        deliverables: [
          {
            id: `del-${Date.now()}-1`,
            title: 'Initial Scoping & Documentation Review',
            description: 'Gather requirements and initiate operational schedule.',
            estimatedHours: 16,
            priority: 'high',
            requiredRole: 'associate',
            subtasks: [
              { id: `st-${Date.now()}-1`, title: 'Client information verification', estimatedHours: 8 },
              { id: `st-${Date.now()}-2`, title: 'Draft working memo', estimatedHours: 8 }
            ],
            executionSteps: [
              { id: `es-${Date.now()}-1`, text: 'Execute opening workflow' }
            ]
          }
        ]
      },
      currentActor
    );

    setIsCreatingService(false);
    setNewSrvTitle('');
    setNewSrvShort('');
    setNewSrvDesc('');
  };

  // Export Audit JSON
  const handleExportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ecovis_service_audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container (Large width for tables, compact for forms) */}
      <div
        className={`relative z-50 w-full ${
          currentView === 'timesheets' || currentView === 'audit' || currentView === 'catalogue' || currentView === 'engagements'
            ? 'max-w-4xl'
            : 'max-w-xl'
        } bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {currentView === 'assign_service' && <>Assign Service to Entity</>}
              {currentView === 'catalogue' && <>Service Catalogue Master</>}
              {currentView === 'engagements' && <>Client & Internal Engagements</>}
              {currentView === 'timesheets' && <>Timesheets & Approvals</>}
              {currentView === 'audit' && <>Entities & Audit Trail</>}
              {currentView === 'insights' && <>Executive Insights (Partner/Director)</>}
              {currentView === 'log_time' && <>Log Service Time</>}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Service Management Module • ECOVIS Global
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal / Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. VIEW: ASSIGN SERVICE */}
          {currentView === 'assign_service' && (
            <form onSubmit={handleAssignServiceSubmit} className="space-y-4">
              {assignSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <Check size={16} /> {assignSuccessMsg}
                </div>
              )}

              {/* Target Type: External Client or Internal Company */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Target Entity Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('client');
                      setSelectedPartyId(clients[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                      targetType === 'client'
                        ? 'bg-cyan-500 text-white font-semibold border-cyan-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    External Client ({clients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('internal');
                      setSelectedPartyId(internalCompanies[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium text-center transition-all ${
                      targetType === 'internal'
                        ? 'bg-cyan-500 text-white font-semibold border-cyan-400 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Internal Group Entity ({internalCompanies.length})
                  </button>
                </div>
              </div>

              {/* Entity Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select {targetType === 'client' ? 'Client' : 'Internal Company'}
                </label>
                <select
                  value={selectedPartyId}
                  onChange={e => setSelectedPartyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {(targetType === 'client' ? clients : internalCompanies).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Catalogue Service */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Catalogue Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shortTitle} — {s.title} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicing Legal Entity */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Servicing Legal Entity (Work Provider)
                </label>
                <select
                  value={servicingEntityId}
                  onChange={e => setServicingEntityId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {legalEntities.map(le => (
                    <option key={le.id} value={le.id}>
                      {le.name} ({le.city}, {le.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Billing and Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Billing Type</label>
                  <select
                    value={billingType}
                    onChange={e => setBillingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="monthly_retainer">Monthly Retainer</option>
                    <option value="fixed_fee">Fixed Fee Milestone</option>
                    <option value="time_and_materials">Time & Materials</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Contract Value (INR)</label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={e => setContractValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Recurrence & Due Day */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Recurrence Frequency</label>
                  <select
                    value={recurrenceFreq}
                    onChange={e => setRecurrenceFreq(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half-yearly">Half-Yearly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-off">One-Time Bespoke</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cycle Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={cycleDueDay}
                    onChange={e => setCycleDueDay(parseInt(e.target.value, 10) || 15)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Deliverable Checkbox Selection */}
              {activeServiceTemplate && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Include Deliverables ({selectedDeliverableIds.length}/{activeServiceTemplate.deliverables.length})
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg">
                    {activeServiceTemplate.deliverables.map(del => {
                      const isChecked = selectedDeliverableIds.includes(del.id);
                      return (
                        <label key={del.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedDeliverableIds(prev =>
                                isChecked ? prev.filter(id => id !== del.id) : [...prev, del.id]
                              );
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                          />
                          <span className="flex-1 truncate">{del.title}</span>
                          <span className="text-[10px] text-slate-500">{del.estimatedHours}h</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Confirm Subscription
                </button>
              </div>
            </form>
          )}

          {/* 2. VIEW: SERVICE CATALOGUE */}
          {currentView === 'catalogue' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Active Services ({services.length})</h3>
                  <p className="text-xs text-slate-400">Master template catalogue with deliverables and standard hourly rates</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingService(!isCreatingService)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Add Service
                </button>
              </div>

              {isCreatingService && (
                <form onSubmit={handleCreateServiceSubmit} className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">New Service Template</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newSrvTitle}
                      onChange={e => setNewSrvTitle(e.target.value)}
                      placeholder="Service Full Title..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <input
                      type="text"
                      value={newSrvShort}
                      onChange={e => setNewSrvShort(e.target.value)}
                      placeholder="Short Card Name (e.g. Audit)..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                    <input
                      type="text"
                      value={newSrvCode}
                      onChange={e => setNewSrvCode(e.target.value)}
                      placeholder="Service Code (e.g. SRV-TAX-08)..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type="number"
                      value={newSrvRate}
                      onChange={e => setNewSrvRate(parseInt(e.target.value, 10) || 3000)}
                      placeholder="Standard Hourly Rate (INR)..."
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={newSrvDesc}
                    onChange={e => setNewSrvDesc(e.target.value)}
                    placeholder="Description of service deliverables and scope..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingService(false)}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              )}

              {/* Catalogue List */}
              <div className="space-y-2">
                {services.map(srv => (
                  <div key={srv.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-xs">{srv.title}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {srv.code}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                          {srv.category}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        ₹{srv.standardHourlyRate}/hr
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{srv.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-850">
                      <span>{srv.deliverables.length} Deliverable templates</span>
                      <span>•</span>
                      <span>Department: {srv.department}</span>
                      <span>•</span>
                      <span>Est. Duration: {srv.estimatedDurationDays} days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. VIEW: ENGAGEMENTS */}
          {currentView === 'engagements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Active Engagements ({engagements.length})</h3>
                  <p className="text-xs text-slate-400">All current client and internal company service subscriptions</p>
                </div>
              </div>
              <div className="space-y-2">
                {engagements.map(eng => {
                  const party = allParties.find(p => p.id === eng.clientId);
                  const service = services.find(s => s.id === eng.serviceId);
                  const servicingEntity = legalEntities.find(l => l.id === eng.servicingLegalEntityId);
                  return (
                    <div key={eng.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-xs">{party?.name || eng.clientId}</span>
                        <span className="text-xs font-bold text-cyan-400">
                          ₹{eng.contractValue.toLocaleString()} ({eng.billingType.replace('_', ' ')})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span className="text-cyan-400 font-medium">{service?.shortTitle || 'Service'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="capitalize text-slate-400">Recurrence: {eng.recurrence.frequency} (Due day: {eng.recurrence.dayOfMonth || 15})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Servicing Entity: {servicingEntity?.name || 'ECOVIS HQ'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. VIEW: TIMESHEETS & APPROVALS */}
          {currentView === 'timesheets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Timesheet Submissions ({timesheets.length})</h3>
                  <p className="text-xs text-slate-400">Review hours logged across clients and internal companies</p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">User</th>
                      <th className="py-2.5 px-3 font-semibold">Client / Entity</th>
                      <th className="py-2.5 px-3 font-semibold">Task</th>
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Hours</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {timesheets.map(ts => (
                      <tr key={ts.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-3 font-medium text-white">{ts.userName}</td>
                        <td className="py-2.5 px-3 text-slate-300 truncate max-w-[140px]">{ts.clientName}</td>
                        <td className="py-2.5 px-3 text-slate-400 truncate max-w-[160px]">{ts.taskTitle}</td>
                        <td className="py-2.5 px-3 text-slate-400">{ts.date}</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-400">{ts.hours}h</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            ts.status === 'approved'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : ts.status === 'rejected'
                              ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          }`}>
                            {ts.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {ts.status === 'submitted' && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => serviceManagementStore.approveTimesheet(ts.id, currentActor)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectingTsId(ts.id);
                                  setRejectionReason('');
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-red-900/60 text-red-400 rounded text-[11px] font-medium cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rejection Modal */}
              {rejectingTsId && (
                <div className="p-4 bg-slate-950 border border-red-800/60 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-semibold text-red-400">Provide Rejection Reason</h4>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejecting timesheet entry..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectingTsId(null)}
                      className="px-3 py-1 text-xs text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        serviceManagementStore.rejectTimesheet(rejectingTsId, rejectionReason || 'Information insufficient', currentActor);
                        setRejectingTsId(null);
                      }}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-medium cursor-pointer"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. VIEW: ENTITIES & AUDIT TRAIL */}
          {currentView === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Legal Entities & Audit Trail</h3>
                  <p className="text-xs text-slate-400">Real-time immutable audit trail of operational changes</p>
                </div>
                <button
                  type="button"
                  onClick={handleExportAuditJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={13} /> Export Audit JSON
                </button>
              </div>

              {/* Legal Entities Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {legalEntities.map(le => (
                  <div key={le.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                    <div className="font-semibold text-white">{le.code}</div>
                    <div className="text-slate-400 text-[11px] truncate">{le.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{le.city}, {le.country} • {le.currency}</div>
                  </div>
                ))}
              </div>

              {/* Audit Log Table */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Event Stream</h4>
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-cyan-400">{log.action}</span>
                        <span className="text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-300">{log.details}</p>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Actor: {log.actorName} ({log.actorLegalEntity})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. VIEW: INSIGHTS (Partner/Director only) */}
          {currentView === 'insights' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-white">Executive Insights & Revenue</h3>
                <p className="text-xs text-slate-400">Financial performance and delivery efficiency for partners</p>
              </div>

              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">Total Contract Value</span>
                  <div className="text-xl font-bold text-white">
                    ₹{engagements.reduce((sum, e) => sum + (e.contractValue || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">+12% vs prior cycle</span>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">Approved Billed Hours</span>
                  <div className="text-xl font-bold text-cyan-400">
                    {timesheets.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.hours, 0)}h
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Across {timesheets.length} entries</span>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">Active Subscriptions</span>
                  <div className="text-xl font-bold text-white">
                    {engagements.length}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">12 clients • 16 internals</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. VIEW: STANDALONE LOG TIME */}
          {currentView === 'log_time' && (
            <form onSubmit={handleLogTimeSubmit} className="space-y-4">
              {logSuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <Check size={16} /> {logSuccessMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Client / Internal Entity</label>
                <select
                  value={logPartyId}
                  onChange={e => setLogPartyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {allParties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.type === 'internal' ? 'Internal' : 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Service</label>
                <select
                  value={logServiceId}
                  onChange={e => setLogServiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shortTitle} — {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Hours to Log</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={logHours}
                    onChange={e => setLogHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Date</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Description of Work</label>
                <textarea
                  rows={3}
                  value={logDescription}
                  onChange={e => setLogDescription(e.target.value)}
                  placeholder="Details of audit, reconciliation, or filing performed..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg text-xs shadow-sm cursor-pointer"
                >
                  Submit Timesheet
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
