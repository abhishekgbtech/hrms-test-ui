/**
 * Service Management Module - Core Domain Models & Multi-Lens Recurrence Engine
 * Supports 10 Services, 12 External Clients, 16 Internal Companies,
 * Dynamic Month-aware Tasks, Subtasks, Timesheets, and Audit Logs.
 */

import { SubTask, ExecutionStep, TaskHistory } from '../data/mockData';
import { employeesData } from '../data/employeesData';

// --- DOMAIN TYPES ---

export type RecurrenceFrequency = 'one-off' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'custom';
export type PartyType = 'client' | 'internal';
export type TaskKind = 'recurring' | 'one-time';
export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked';

export interface ServiceDeliverableTemplate {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  requiredRole: 'partner' | 'manager' | 'senior_associate' | 'associate';
  subtasks: {
    id: string;
    title: string;
    description?: string;
    estimatedHours: number;
  }[];
  executionSteps: {
    id: string;
    text: string;
  }[];
}

export interface ServiceTemplate {
  id: string;
  code: string;
  title: string;
  shortTitle: string; // Compact card title (e.g. "Accounting", "GST")
  category: 'Audit & Assurance' | 'Tax & Regulatory' | 'Corporate Advisory' | 'Payroll & HR Outsourcing' | 'Risk & Compliance' | 'Digital & IT Audit';
  description: string;
  department: string;
  standardHourlyRate: number;
  currency: string;
  estimatedDurationDays: number;
  tags: string[];
  deliverables: ServiceDeliverableTemplate[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface LegalEntity {
  id: string;
  code: string;
  name: string;
  country: string;
  city: string;
  taxRegistrationNumber: string;
  currency: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  industry: string;
  taxId: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  primaryLegalEntityId: string;
  assignedPartnerId: string;
  status: 'active' | 'onboarding' | 'suspended' | 'archived';
  onboardingDate: string;
  type: PartyType; // 'client' for external clients, 'internal' for group companies
}

export interface CustomClientTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  subtasks: {
    id: string;
    title: string;
    description?: string;
  }[];
  executionSteps: {
    id: string;
    text: string;
  }[];
  isCustom: true;
  createdAt: string;
}

export interface EngagementCollaborator {
  userId: string;
  userName: string;
  userEmail: string;
  homeLegalEntityId: string;
  homeLegalEntityName: string;
  engagementRole: 'engagement_partner' | 'manager' | 'senior_associate' | 'associate' | 'reviewer';
  allocatedHours: number;
}

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  monthOfQuarter?: number;
  monthOfYear?: number;
  leadDays: number;
  isActive: boolean;
  lastRunAt?: string;
  nextScheduledDate?: string;
}

export interface ClientServiceEngagement {
  id: string;
  tenantId: string;
  clientId: string; // ID of either external client or internal company
  serviceId: string;
  servicingLegalEntityId: string;
  billingType: 'fixed_fee' | 'time_and_materials' | 'monthly_retainer' | 'contingent';
  contractValue: number;
  currency: string;
  status: 'active' | 'draft' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  selectedTemplateTaskIds: string[];
  customTasks: CustomClientTask[];
  collaborators: EngagementCollaborator[];
  recurrence: RecurrenceConfig;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceTaskInstance {
  id: string;
  tenantId: string;
  engagementId: string;
  clientId: string;
  serviceId: string;
  serviceCode: string;
  serviceTitle: string;
  clientName: string;
  taskId: string;
  taskTitle: string;
  description: string;
  periodKey: string; // e.g. "2026-M10", "2026-Q4", "ONE-OFF"
  idempotencyKey: string;
  dueDate: string; // ISO date string: YYYY-MM-DD...
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  progress: number;
  assignedTo: string;
  assignedToId?: string;
  assignedLegalEntityId: string;
  isCrossEntity: boolean;
  contributors: string[];
  subtasks: (SubTask & { done?: boolean })[];
  executionSteps: ExecutionStep[];
  history: TaskHistory[];
  isCustomTask: boolean;
  estimatedHours: number;
  actualHours: number;
  kind?: TaskKind;
  recurrenceFrequency?: RecurrenceFrequency;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServiceTimesheetEntry {
  id: string;
  tenantId: string;
  engagementId: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceTitle: string;
  taskInstanceId?: string;
  taskTitle: string;
  userId: string;
  userName: string;
  userLegalEntityId: string;
  userLegalEntityName: string;
  isCrossEntityCollaboration: boolean;
  date: string;
  hours: number;
  isBillable: boolean;
  hourlyRate: number;
  totalBilledAmount: number;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  history: {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface ServiceAuditEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorLegalEntity: string;
  action: string;
  category: 'catalogue' | 'engagement' | 'task_generation' | 'timesheet' | 'access';
  targetType: string;
  targetId: string;
  details: string;
}

// --- INITIAL LEGAL ENTITIES ---
export const INITIAL_LEGAL_ENTITIES: LegalEntity[] = [
  { id: 'le-mum', code: 'ECV-MUM', name: 'ECOVIS RKCA - Mumbai HQ', country: 'India', city: 'Mumbai', taxRegistrationNumber: '27AAACE1234F1Z1', currency: 'INR' },
  { id: 'le-del', code: 'ECV-DEL', name: 'ECOVIS RKCA - New Delhi Branch', country: 'India', city: 'New Delhi', taxRegistrationNumber: '07AAACE1234F1Z8', currency: 'INR' },
  { id: 'le-blr', code: 'ECV-BLR', name: 'ECOVIS Digital Solutions - Bengaluru', country: 'India', city: 'Bengaluru', taxRegistrationNumber: '29AAACE1234F1Z3', currency: 'INR' },
  { id: 'le-pun', code: 'ECV-PUN', name: 'ECOVIS Advisory - Pune Regional', country: 'India', city: 'Pune', taxRegistrationNumber: '27AAACE5678G2Z2', currency: 'INR' },
  { id: 'le-sin', code: 'ECV-SIN', name: 'ECOVIS Global Advisory Pte Ltd', country: 'Singapore', city: 'Singapore', taxRegistrationNumber: 'UEN20239999X', currency: 'SGD' },
];

// --- 10 SERVICES (4 existing + 6 new) ---
export const INITIAL_SERVICE_CATALOGUE: ServiceTemplate[] = [
  {
    id: 'srv-stat-audit',
    code: 'SRV-AUD-01',
    title: 'Statutory Financial Audit & Tax Filing',
    shortTitle: 'Statutory Audit',
    category: 'Audit & Assurance',
    description: 'Comprehensive statutory audit of financial statements in accordance with applicable accounting standards and statutory regulations.',
    department: 'Audit & Assurance',
    standardHourlyRate: 3500,
    currency: 'INR',
    estimatedDurationDays: 30,
    tags: ['Statutory Audit', 'Ind AS', 'Tax Audit', 'ROC'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
    deliverables: [
      {
        id: 'del-stat-1',
        title: 'Trial Balance Ingestion & Risk Assessment',
        description: 'Collect initial general ledger data, perform materiality assessment, and identify high-risk accounts.',
        estimatedHours: 24,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-stat-1', title: 'Collect & reconcile trial balance', estimatedHours: 8 },
          { id: 'st-stat-2', title: 'Define planning materiality threshold', estimatedHours: 6 },
          { id: 'st-stat-3', title: 'Prepare analytical review memo', estimatedHours: 10 }
        ],
        executionSteps: [
          { id: 'es-stat-1', text: 'Obtain trial balance dump in Excel/ERP' },
          { id: 'es-stat-2', text: 'Apply analytical check formulas' }
        ]
      },
      {
        id: 'del-stat-2',
        title: 'Substantive Audit Testing & Sample Verification',
        description: 'Vouch sample transactions, test revenue recognition, and verify bank balances.',
        estimatedHours: 40,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-stat-4', title: 'Revenue cut-off testing', estimatedHours: 16 },
          { id: 'st-stat-5', title: 'Fixed asset register physical verification memo', estimatedHours: 12 },
          { id: 'st-stat-6', title: 'Bank balance confirmation reconciliations', estimatedHours: 12 }
        ],
        executionSteps: [
          { id: 'es-stat-3', text: 'Send external confirmation letters' },
          { id: 'es-stat-4', text: 'Document substantive working papers' }
        ]
      },
      {
        id: 'del-stat-3',
        title: 'Independent Auditor Report & CARO Disclosures',
        description: 'Draft the final audit report, CARO clauses, and management representation letter.',
        estimatedHours: 16,
        priority: 'high',
        requiredRole: 'partner',
        subtasks: [
          { id: 'st-stat-7', title: 'CARO 2020 clause-by-clause checklist', estimatedHours: 8 },
          { id: 'st-stat-8', title: 'Partner concurrence & UDIN generation', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-stat-5', text: 'Final partner review meeting' },
          { id: 'es-stat-6', text: 'Issue signed PDF with ICAI UDIN' }
        ]
      }
    ]
  },
  {
    id: 'srv-gst-compliance',
    code: 'SRV-TAX-02',
    title: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    shortTitle: 'GST',
    category: 'Tax & Regulatory',
    description: 'Monthly input tax credit reconciliation, sales outward supply filing (GSTR-1), and summary return (GSTR-3B) preparation.',
    department: 'Tax & Compliance',
    standardHourlyRate: 2800,
    currency: 'INR',
    estimatedDurationDays: 10,
    tags: ['GST', 'Indirect Tax', 'Monthly Retainer', 'GSTR-3B'],
    isActive: true,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    deliverables: [
      {
        id: 'del-gst-1',
        title: 'Sales & Outward Supply Data Ingestion (GSTR-1)',
        description: 'Ingest monthly invoices, validate HSN codes, and generate e-invoicing discrepancy report.',
        estimatedHours: 16,
        priority: 'high',
        requiredRole: 'associate',
        subtasks: [
          { id: 'st-gst-1', title: 'B2B Invoice Validation', estimatedHours: 8 },
          { id: 'st-gst-2', title: 'B2C and Export Invoices Reconciliation', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-gst-1', text: 'Download ERP Sales register' },
          { id: 'es-gst-2', text: 'Cross-verify with E-way Bill portal' }
        ]
      },
      {
        id: 'del-gst-2',
        title: 'GSTR-2B Input Tax Credit (ITC) Reconciliation',
        description: 'Match vendor uploaded invoices against GSTR-2B to maximize eligible credit and identify defaulting suppliers.',
        estimatedHours: 20,
        priority: 'medium',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-gst-3', title: 'Auto-drafted ITC 2B Ingestion', estimatedHours: 10 },
          { id: 'st-gst-4', title: 'Vendor Discrepancy Notice Drafts', estimatedHours: 10 }
        ],
        executionSteps: [
          { id: 'es-gst-3', text: 'Run 2B automated matching script' },
          { id: 'es-gst-4', text: 'Segregate blocked credits under Sec 17(5)' }
        ]
      },
      {
        id: 'del-gst-3',
        title: 'GSTR-3B Tax Computation & Challan Creation',
        description: 'Calculate net tax liability, apply electronic cash and credit ledger offsets, and upload return.',
        estimatedHours: 8,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-gst-5', title: 'Tax Challan Generation', estimatedHours: 4 },
          { id: 'st-gst-6', title: 'Final Portal Submission with EVC/DSC', estimatedHours: 4 }
        ],
        executionSteps: [
          { id: 'es-gst-5', text: 'Client payment confirmation' },
          { id: 'es-gst-6', text: 'Submit with Digital Signature Certificate' }
        ]
      }
    ]
  },
  {
    id: 'srv-payroll-outsourcing',
    code: 'SRV-HR-03',
    title: 'End-to-End Payroll & Statutory Processing',
    shortTitle: 'Payroll',
    category: 'Payroll & HR Outsourcing',
    description: 'Monthly payroll run computation, attendance & leave reconciliation, PF/ESIC challans, and payslip release.',
    department: 'Human Resources',
    standardHourlyRate: 2400,
    currency: 'INR',
    estimatedDurationDays: 7,
    tags: ['Payroll', 'PF', 'ESIC', 'Salary Run'],
    isActive: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    deliverables: [
      {
        id: 'del-pay-1',
        title: 'Monthly Attendance & LOP Computation',
        description: 'Process biometric logs, approved leaves, and compute Loss of Pay days for salary calculation.',
        estimatedHours: 12,
        priority: 'high',
        requiredRole: 'associate',
        subtasks: [
          { id: 'st-pay-1', title: 'Absence & Overtime Adjustment', estimatedHours: 6 },
          { id: 'st-pay-2', title: 'Reimbursement Claims Audit', estimatedHours: 6 }
        ],
        executionSteps: [
          { id: 'es-pay-1', text: 'Import raw attendance feed' },
          { id: 'es-pay-2', text: 'Apply manager regularization approvals' }
        ]
      },
      {
        id: 'del-pay-2',
        title: 'Salary Computation & Statutory Challans (PF/ESIC/PT)',
        description: 'Calculate gross-to-net breakdown, tax deduction at source, and generate monthly ECR and challan files.',
        estimatedHours: 16,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-pay-3', title: 'PF ECR File Generation', estimatedHours: 8 },
          { id: 'st-pay-4', title: 'ESIC Contribution Return Upload', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-pay-3', text: 'Export bank salary transfer batch file' },
          { id: 'es-pay-4', text: 'Upload PF ECR on EPFO employer portal' }
        ]
      }
    ]
  },
  {
    id: 'srv-it-audit',
    code: 'SRV-SEC-04',
    title: 'SOC2 / ISO 27001 Security Audit & Pen Testing',
    shortTitle: 'IT Audit',
    category: 'Digital & IT Audit',
    description: 'Information security management system evaluation, cloud infrastructure audit, vulnerability assessment, and SOC2 report readiness.',
    department: 'Risk & Cybersecurity',
    standardHourlyRate: 4500,
    currency: 'INR',
    estimatedDurationDays: 45,
    tags: ['SOC2', 'ISO27001', 'Cloud Audit', 'InfoSec'],
    isActive: true,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    deliverables: [
      {
        id: 'del-it-1',
        title: 'Cloud Infrastructure & IAM Security Posture Audit',
        description: 'Review AWS/GCP IAM roles, multi-factor authentication enforcement, and network security groups.',
        estimatedHours: 30,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-it-1', title: 'IAM Least Privilege Policy Review', estimatedHours: 15 },
          { id: 'st-it-2', title: 'VPC and Firewall Ingress/Egress Inspection', estimatedHours: 15 }
        ],
        executionSteps: [
          { id: 'es-it-1', text: 'Run read-only cloud configuration scanner' },
          { id: 'es-it-2', text: 'Document open ports and elevated privileges' }
        ]
      },
      {
        id: 'del-it-2',
        title: 'Penetration Testing & SOC2 Evidence Gathering',
        description: 'Perform blackbox web app penetration test and compile control evidence for Type II certification.',
        estimatedHours: 35,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-it-3', title: 'OWASP Top 10 Application Assessment', estimatedHours: 20 },
          { id: 'st-it-4', title: 'Compile Trust Service Criteria Evidence', estimatedHours: 15 }
        ],
        executionSteps: [
          { id: 'es-it-3', text: 'Perform authenticated penetration testing' },
          { id: 'es-it-4', text: 'Generate remediation priority report' }
        ]
      }
    ]
  },
  {
    id: 'srv-accounting',
    code: 'SRV-ACC-05',
    title: 'Accounting & Bookkeeping Services',
    shortTitle: 'Accounting',
    category: 'Corporate Advisory',
    description: 'Comprehensive general ledger accounting, monthly bank and credit card reconciliations, vendor payables and accounts receivable ledger maintenance.',
    department: 'Financial Operations',
    standardHourlyRate: 2600,
    currency: 'INR',
    estimatedDurationDays: 15,
    tags: ['Bookkeeping', 'General Ledger', 'Reconciliations', 'Monthly Close'],
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
    deliverables: [
      {
        id: 'del-acc-1',
        title: 'Bank & Payment Gateway Reconciliations',
        description: 'Match bank statements and gateway clearing accounts with ERP book balances.',
        estimatedHours: 18,
        priority: 'high',
        requiredRole: 'associate',
        subtasks: [
          { id: 'st-acc-1', title: 'Statement line-item matching', estimatedHours: 10 },
          { id: 'st-acc-2', title: 'Investigate uncleared checks & deposits', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-acc-1', text: 'Download MT940 bank feeds' },
          { id: 'es-acc-2', text: 'Post reconciliation journal entries' }
        ]
      },
      {
        id: 'del-acc-2',
        title: 'Month-End Accruals & Balance Sheet Finalisation',
        description: 'Post depreciation, prepayments, deferred revenue, and close provisional trial balance.',
        estimatedHours: 22,
        priority: 'medium',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-acc-3', title: 'Calculate monthly depreciation schedule', estimatedHours: 8 },
          { id: 'st-acc-4', title: 'Audit prepayments amortization ledger', estimatedHours: 8 },
          { id: 'st-acc-5', title: 'Close month-end ledger batches', estimatedHours: 6 }
        ],
        executionSteps: [
          { id: 'es-acc-3', text: 'Execute month-end closing routine in ERP' },
          { id: 'es-acc-4', text: 'Publish balance sheet draft' }
        ]
      }
    ]
  },
  {
    id: 'srv-tds',
    code: 'SRV-TAX-06',
    title: 'TDS Compliance & Quarterly Return Filing',
    shortTitle: 'TDS Compliance',
    category: 'Tax & Regulatory',
    description: 'Monthly tax deducted at source computation, challan payment verification, and quarterly returns (24Q/26Q/27Q) preparation.',
    department: 'Tax & Compliance',
    standardHourlyRate: 2500,
    currency: 'INR',
    estimatedDurationDays: 8,
    tags: ['TDS', '26Q', '24Q', 'Form 16A'],
    isActive: true,
    createdAt: '2025-01-12T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    deliverables: [
      {
        id: 'del-tds-1',
        title: 'Monthly TDS Payment & Challan Generation',
        description: 'Verify 194C, 194J, 194H, 194I deduction registers and generate OLTAS challans.',
        estimatedHours: 14,
        priority: 'high',
        requiredRole: 'associate',
        subtasks: [
          { id: 'st-tds-1', title: 'Extract vendor TDS ledger from ERP', estimatedHours: 6 },
          { id: 'st-tds-2', title: 'Generate Challan 281 for monthly deposit', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-tds-1', text: 'Check PAN validity of deductees' },
          { id: 'es-tds-2', text: 'Pay Challan 281 before 7th of the month' }
        ]
      },
      {
        id: 'del-tds-2',
        title: 'Quarterly Return Filing (Form 26Q / 24Q)',
        description: 'Compile quarterly FVU return, run validation utility, and upload to TRACES/Income Tax portal.',
        estimatedHours: 18,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-tds-3', title: 'Generate FVU quarterly data file', estimatedHours: 10 },
          { id: 'st-tds-4', title: 'Issue Form 16A certificates to vendors', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-tds-3', text: 'Run NSDL File Validation Utility' },
          { id: 'es-tds-4', text: 'Download signed Form 16A from TRACES' }
        ]
      }
    ]
  },
  {
    id: 'srv-income-tax',
    code: 'SRV-TAX-07',
    title: 'Corporate Income Tax Filing & Assessment',
    shortTitle: 'Income Tax Filing',
    category: 'Tax & Regulatory',
    description: 'Corporate tax computation under old/new regimes, MAT calculations, ITR-6 preparation and assessment assistance.',
    department: 'Tax & Compliance',
    standardHourlyRate: 3800,
    currency: 'INR',
    estimatedDurationDays: 25,
    tags: ['ITR-6', 'Corporate Tax', 'MAT', 'Advance Tax'],
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
    deliverables: [
      {
        id: 'del-itax-1',
        title: 'Advance Tax Computation & Cashflow Planning',
        description: 'Quarterly estimated profits analysis and computation of Advance Tax installments.',
        estimatedHours: 16,
        priority: 'medium',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-itax-1', title: 'P&L run rate projections', estimatedHours: 8 },
          { id: 'st-itax-2', title: 'Compute Section 234B/234C interest exposure', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-itax-1', text: 'Review quarterly provisional accounts' },
          { id: 'es-itax-2', text: 'Issue tax payment advisory memorandum' }
        ]
      },
      {
        id: 'del-itax-2',
        title: 'Annual ITR-6 Return Filing & Tax Audit Form 3CD',
        description: 'Finalize computation of income, tax deductions under chapter VI-A, and submit ITR-6.',
        estimatedHours: 32,
        priority: 'high',
        requiredRole: 'partner',
        subtasks: [
          { id: 'st-itax-3', title: 'Form 3CD Annexure preparation', estimatedHours: 16 },
          { id: 'st-itax-4', title: 'ITR-6 schema validation and partner e-sign', estimatedHours: 16 }
        ],
        executionSteps: [
          { id: 'es-itax-3', text: 'Finalize disallowances under Section 40(a)' },
          { id: 'es-itax-4', text: 'Submit with Class 3 DSC' }
        ]
      }
    ]
  },
  {
    id: 'srv-roc',
    code: 'SRV-SEC-08',
    title: 'ROC & Company Secretarial Compliance',
    shortTitle: 'ROC & Secretarial',
    category: 'Corporate Advisory',
    description: 'Statutory filings under the Companies Act 2013, Annual AOC-4 / MGT-7 filings, board meeting minutes and register maintenance.',
    department: 'Legal & Corporate Services',
    standardHourlyRate: 3000,
    currency: 'INR',
    estimatedDurationDays: 14,
    tags: ['ROC', 'MCA21', 'MGT-7', 'AOC-4', 'Secretarial'],
    isActive: true,
    createdAt: '2025-02-10T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z',
    deliverables: [
      {
        id: 'del-roc-1',
        title: 'Statutory Registers & Board Resolutions',
        description: 'Draft board meeting notices, agendas, directors report, and maintain statutory registers.',
        estimatedHours: 14,
        priority: 'medium',
        requiredRole: 'associate',
        subtasks: [
          { id: 'st-roc-1', title: 'Draft quarterly board meeting minutes', estimatedHours: 6 },
          { id: 'st-roc-2', title: 'Update register of members & directors (Form MBP-1)', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-roc-1', text: 'Circulate draft resolutions to directors' },
          { id: 'es-roc-2', text: 'File signed minutes in minute book' }
        ]
      },
      {
        id: 'del-roc-2',
        title: 'Annual ROC Filings (AOC-4 & MGT-7)',
        description: 'Convert financial statements to XBRL where applicable, and file AOC-4 and MGT-7 on MCA V3 portal.',
        estimatedHours: 24,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-roc-3', title: 'XBRL tagging of balance sheet & P&L', estimatedHours: 14 },
          { id: 'st-roc-4', title: 'MCA V3 e-filing with CS certification', estimatedHours: 10 }
        ],
        executionSteps: [
          { id: 'es-roc-3', text: 'Validate XBRL document with MCA validation tool' },
          { id: 'es-roc-4', text: 'Upload on MCA V3 and generate SRN challan' }
        ]
      }
    ]
  },
  {
    id: 'srv-transfer-pricing',
    code: 'SRV-TP-09',
    title: 'Transfer Pricing Documentation & Study',
    shortTitle: 'Transfer Pricing',
    category: 'Tax & Regulatory',
    description: 'Arm length price analysis, benchmarking studies, Form 3CEB certification and Master/Local file preparation.',
    department: 'International Tax',
    standardHourlyRate: 4200,
    currency: 'INR',
    estimatedDurationDays: 35,
    tags: ['Transfer Pricing', 'Form 3CEB', 'Arm Length', 'Benchmarking'],
    isActive: true,
    createdAt: '2025-02-15T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
    deliverables: [
      {
        id: 'del-tp-1',
        title: 'FAR Analysis & Database Benchmarking Study',
        description: 'Conduct Functions, Assets & Risks analysis and perform comparable company search on Prowess/Capitaline.',
        estimatedHours: 28,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-tp-1', title: 'Functional interview & interview notes', estimatedHours: 12 },
          { id: 'st-tp-2', title: 'Run database filters & compute margin interquartile range', estimatedHours: 16 }
        ],
        executionSteps: [
          { id: 'es-tp-1', text: 'Identify tested party and select most appropriate method' },
          { id: 'es-tp-2', text: 'Extract multi-year financial data of comparables' }
        ]
      },
      {
        id: 'del-tp-2',
        title: 'Form 3CEB Certification & Local File Compilation',
        description: 'Prepare Form 3CEB report and certify cross-border international transactions.',
        estimatedHours: 26,
        priority: 'high',
        requiredRole: 'partner',
        subtasks: [
          { id: 'st-tp-3', title: 'Form 3CEB clause-wise data compilation', estimatedHours: 14 },
          { id: 'st-tp-4', title: 'Chartered Accountant e-certification and upload', estimatedHours: 12 }
        ],
        executionSteps: [
          { id: 'es-tp-3', text: 'Reconcile cross-border invoices with intercompany agreement' },
          { id: 'es-tp-4', text: 'Upload Form 3CEB on e-filing portal' }
        ]
      }
    ]
  },
  {
    id: 'srv-cfo',
    code: 'SRV-CFO-10',
    title: 'Virtual CFO & MIS Reporting',
    shortTitle: 'Virtual CFO & MIS',
    category: 'Corporate Advisory',
    description: 'Executive financial leadership, cash flow modeling, board deck preparation, budget vs actual variance and KPI analytics.',
    department: 'Advisory & Strategy',
    standardHourlyRate: 4800,
    currency: 'INR',
    estimatedDurationDays: 12,
    tags: ['vCFO', 'MIS', 'Cash Flow', 'Board Deck', 'Strategy'],
    isActive: true,
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
    deliverables: [
      {
        id: 'del-cfo-1',
        title: 'Monthly Management Information System (MIS) Deck',
        description: 'Consolidated EBITDA, unit economics, gross margins, cash burn and departmental variance reports.',
        estimatedHours: 20,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-cfo-1', title: 'Consolidate unit metrics & revenue drivers', estimatedHours: 10 },
          { id: 'st-cfo-2', title: 'Prepare budget vs actual variance commentary', estimatedHours: 10 }
        ],
        executionSteps: [
          { id: 'es-cfo-1', text: 'Extract ERP trial balance into financial model' },
          { id: 'es-cfo-2', text: 'Generate executive dashboard slides' }
        ]
      },
      {
        id: 'del-cfo-2',
        title: 'Rolling 13-Week Cash Flow & Runway Forecast',
        description: 'Weekly cash flow projections, working capital optimization and creditor disbursement schedule.',
        estimatedHours: 16,
        priority: 'medium',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-cfo-3', title: 'Update collection forecast from top debtors', estimatedHours: 8 },
          { id: 'st-cfo-4', title: 'Model payroll and statutory outflow schedule', estimatedHours: 8 }
        ],
        executionSteps: [
          { id: 'es-cfo-3', text: 'Reconcile AR aging ledger' },
          { id: 'es-cfo-4', text: 'Present runway recommendations to CEO' }
        ]
      }
    ]
  }
];

// --- 12 EXTERNAL CLIENTS (type: 'client') ---
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl-tata',
    code: 'CLI-TAT-01',
    name: 'Tata Sons & Group Enterprises',
    industry: 'Conglomerate & Heavy Industries',
    taxId: '27AAACT0001A1Z5',
    contactPerson: 'Rajesh Gopinathan',
    contactEmail: 'r.gopinathan@tata.com',
    contactPhone: '+91 22 6665 8282',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-04-01',
    type: 'client'
  },
  {
    id: 'cl-reliance',
    code: 'CLI-REL-02',
    name: 'Reliance Retail & Logistics Ltd',
    industry: 'Retail & FMCG',
    taxId: '27AAACR1234F1Z0',
    contactPerson: 'Venkatesh Raman',
    contactEmail: 'v.raman@ril.com',
    contactPhone: '+91 22 4477 0000',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-06-15',
    type: 'client'
  },
  {
    id: 'cl-infosys',
    code: 'CLI-INF-03',
    name: 'Infosys Cloud Innovations Ltd',
    industry: 'Technology & Enterprise IT',
    taxId: '29AAACI4321K1Z2',
    contactPerson: 'Anand Swaminathan',
    contactEmail: 'anand.s@infosys.com',
    contactPhone: '+91 80 2852 0261',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2024-08-01',
    type: 'client'
  },
  {
    id: 'cl-zomato',
    code: 'CLI-ZOM-04',
    name: 'Zomato Media & Hyperlocal Tech',
    industry: 'Food Delivery & Hyperlocal Commerce',
    taxId: '07AAACZ9876Q1Z9',
    contactPerson: 'Akshant Goyal',
    contactEmail: 'akshant@zomato.com',
    contactPhone: '+91 124 426 8565',
    primaryLegalEntityId: 'le-del',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2025-01-10',
    type: 'client'
  },
  {
    id: 'cl-mahindra',
    code: 'CLI-MAH-05',
    name: 'Mahindra & Mahindra Auto Ltd',
    industry: 'Automotive & Manufacturing',
    taxId: '27AAACM5432B1Z8',
    contactPerson: 'Manoj Bhat',
    contactEmail: 'bhat.manoj@mahindra.com',
    contactPhone: '+91 22 2490 1441',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-05-12',
    type: 'client'
  },
  {
    id: 'cl-hdfc',
    code: 'CLI-HDF-06',
    name: 'HDFC Bank Financial Services',
    industry: 'Banking & Financial Markets',
    taxId: '27AAACH1122C1Z4',
    contactPerson: 'Srinivasan Vaidyanathan',
    contactEmail: 's.vaidyanathan@hdfcbank.com',
    contactPhone: '+91 22 6652 1000',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2024-07-20',
    type: 'client'
  },
  {
    id: 'cl-airtel',
    code: 'CLI-AIR-07',
    name: 'Bharti Airtel Digital Telecom',
    industry: 'Telecommunications & Digital Services',
    taxId: '07AAACB9988D1Z3',
    contactPerson: 'Soumen Ray',
    contactEmail: 'soumen.ray@airtel.com',
    contactPhone: '+91 11 4666 6100',
    primaryLegalEntityId: 'le-del',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2024-09-01',
    type: 'client'
  },
  {
    id: 'cl-wipro',
    code: 'CLI-WIP-08',
    name: 'Wipro Technologies Global',
    industry: 'Technology & Consulting',
    taxId: '29AAACW3344E1Z7',
    contactPerson: 'Aparna Iyer',
    contactEmail: 'aparna.iyer@wipro.com',
    contactPhone: '+91 80 2844 0011',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2024-10-15',
    type: 'client'
  },
  {
    id: 'cl-swiggy',
    code: 'CLI-SWI-09',
    name: 'Swiggy Ltd Quick Commerce',
    industry: 'Logistics & Quick Commerce',
    taxId: '29AAACS6677F1Z1',
    contactPerson: 'Rahul Bothra',
    contactEmail: 'rahul.bothra@swiggy.in',
    contactPhone: '+91 80 6746 6777',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2025-02-01',
    type: 'client'
  },
  {
    id: 'cl-nykaa',
    code: 'CLI-NYK-10',
    name: 'Nykaa Lifestyle E-Commerce',
    industry: 'Beauty & Fashion E-Commerce',
    taxId: '27AAACN8899G1Z6',
    contactPerson: 'P. Ganesh',
    contactEmail: 'p.ganesh@nykaa.com',
    contactPhone: '+91 22 6614 9600',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2025-03-01',
    type: 'client'
  },
  {
    id: 'cl-zerodha',
    code: 'CLI-ZER-11',
    name: 'Zerodha Broking & Tech',
    industry: 'FinTech & Capital Markets',
    taxId: '29AAACZ2233H1Z9',
    contactPerson: 'Nithin Kamath',
    contactEmail: 'nithin@zerodha.com',
    contactPhone: '+91 80 4718 1888',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2025-01-20',
    type: 'client'
  },
  {
    id: 'cl-razorpay',
    code: 'CLI-RAZ-12',
    name: 'Razorpay Software Payments Ltd',
    industry: 'FinTech & Payment Gateway',
    taxId: '29AAACR4455J1Z2',
    contactPerson: 'Arpit Chug',
    contactEmail: 'arpit.chug@razorpay.com',
    contactPhone: '+91 80 6608 0000',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2025-02-15',
    type: 'client'
  }
];

// --- 16 INTERNAL COMPANIES (type: 'internal') ---
export const INITIAL_INTERNAL_COMPANIES: Client[] = [
  {
    id: 'int-holdings',
    code: 'GRP-HLD-01',
    name: 'ECOVIS RKCA Holdings Ltd',
    industry: 'Group Holding & Investments',
    taxId: '27AAACE0001K1Z1',
    contactPerson: 'Deepa Rathi',
    contactEmail: 'deepa.rathi@ecovis.com',
    contactPhone: '+91 22 2888 1001',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-01-01',
    type: 'internal'
  },
  {
    id: 'int-techlabs',
    code: 'GRP-TEC-02',
    name: 'ECOVIS TechLabs LLP',
    industry: 'Software & Technology R&D',
    taxId: '29AAACE0002L1Z2',
    contactPerson: 'Mukesh Singh',
    contactEmail: 'mukesh.singh@ecovis.com',
    contactPhone: '+91 80 2888 1002',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2023-03-01',
    type: 'internal'
  },
  {
    id: 'int-advisory',
    code: 'GRP-ADV-03',
    name: 'ECOVIS Advisory India Pvt Ltd',
    industry: 'Corporate Advisory Services',
    taxId: '27AAACE0003M1Z3',
    contactPerson: 'Sudhir Bhosale',
    contactEmail: 'sudhir.bhosale@ecovis.com',
    contactPhone: '+91 22 2888 1003',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-04-01',
    type: 'internal'
  },
  {
    id: 'int-capital',
    code: 'GRP-CAP-04',
    name: 'ECOVIS Capital Partners LLP',
    industry: 'Private Equity & Capital Syndication',
    taxId: '27AAACE0004N1Z4',
    contactPerson: 'Namita Chaudhary',
    contactEmail: 'namita.chaudhary@ecovis.com',
    contactPhone: '+91 22 2888 1004',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-05-15',
    type: 'internal'
  },
  {
    id: 'int-taxdesk',
    code: 'GRP-TAX-05',
    name: 'ECOVIS Tax Consultants Desk',
    industry: 'Taxation & Regulatory Advisory',
    taxId: '07AAACE0005P1Z5',
    contactPerson: 'Namdev Malusare',
    contactEmail: 'namdev.malusare@ecovis.com',
    contactPhone: '+91 11 2888 1005',
    primaryLegalEntityId: 'le-del',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2023-06-01',
    type: 'internal'
  },
  {
    id: 'int-pune',
    code: 'GRP-PUN-06',
    name: 'ECOVIS Digital Pune Branch',
    industry: 'Regional Accounting & IT Services',
    taxId: '27AAACE0006Q1Z6',
    contactPerson: 'Sanjana Konda',
    contactEmail: 'sanjana.konda@ecovis.com',
    contactPhone: '+91 20 2888 1006',
    primaryLegalEntityId: 'le-pun',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-07-01',
    type: 'internal'
  },
  {
    id: 'int-gss',
    code: 'GRP-GSS-07',
    name: 'ECOVIS Global Shared Services',
    industry: 'Shared Services & Backoffice Hub',
    taxId: '29AAACE0007R1Z7',
    contactPerson: 'Aryan Singh',
    contactEmail: 'aryan.singh@ecovis.com',
    contactPhone: '+91 80 2888 1007',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2023-08-15',
    type: 'internal'
  },
  {
    id: 'int-auditllp',
    code: 'GRP-AUD-08',
    name: 'ECOVIS Audit & Assurance LLP',
    industry: 'Chartered Accountancy & Statutory Practice',
    taxId: '27AAACE0008S1Z8',
    contactPerson: 'Deepa Rathi',
    contactEmail: 'deepa.rathi@ecovis.com',
    contactPhone: '+91 22 2888 1008',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-09-01',
    type: 'internal'
  },
  {
    id: 'int-fintech',
    code: 'GRP-FIN-09',
    name: 'ECOVIS FinTech Solutions Ltd',
    industry: 'Financial Technology Solutions',
    taxId: '29AAACE0009T1Z9',
    contactPerson: 'Pooja Disale',
    contactEmail: 'pooja.disale@ecovis.com',
    contactPhone: '+91 80 2888 1009',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP004',
    status: 'active',
    onboardingDate: '2023-10-01',
    type: 'internal'
  },
  {
    id: 'int-legal',
    code: 'GRP-LEG-10',
    name: 'ECOVIS Legal & Secretarial Advisors',
    industry: 'Corporate Secretarial & Legal Advisory',
    taxId: '07AAACE0010U1Z0',
    contactPerson: 'Tammay Vilas',
    contactEmail: 'tammay.vilas@ecovis.com',
    contactPhone: '+91 11 2888 1010',
    primaryLegalEntityId: 'le-del',
    assignedPartnerId: 'EMP003',
    status: 'active',
    onboardingDate: '2023-11-01',
    type: 'internal'
  },
  {
    id: 'int-bss',
    code: 'GRP-BSS-11',
    name: 'ECOVIS Business Support Services',
    industry: 'Administrative Support & Operations',
    taxId: '27AAACE0011V1Z1',
    contactPerson: 'Shweta Chaudhari',
    contactEmail: 'shweta.chaudhari@ecovis.com',
    contactPhone: '+91 22 2888 1011',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2023-12-01',
    type: 'internal'
  },
  {
    id: 'int-singapore',
    code: 'GRP-SIN-12',
    name: 'ECOVIS Singapore Regional Hub',
    industry: 'International Advisory & Holding',
    taxId: 'UEN20238888Z',
    contactPerson: 'Suraj Rajbhar',
    contactEmail: 'suraj.rajbhar@ecovis.com',
    contactPhone: '+65 6789 0123',
    primaryLegalEntityId: 'le-sin',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-01-01',
    type: 'internal'
  },
  {
    id: 'int-payroll',
    code: 'GRP-PAY-13',
    name: 'ECOVIS Payroll Bureau India',
    industry: 'Payroll Processing & HR Outsourcing',
    taxId: '27AAACE0013W1Z2',
    contactPerson: 'Rahul Sharma',
    contactEmail: 'rahul.sharma@ecovis.com',
    contactPhone: '+91 22 2888 1013',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-02-01',
    type: 'internal'
  },
  {
    id: 'int-tpcenter',
    code: 'GRP-TPC-14',
    name: 'ECOVIS Transfer Pricing Center',
    industry: 'Cross-Border Tax Economics',
    taxId: '27AAACE0014X1Z3',
    contactPerson: 'Bharat Mishra',
    contactEmail: 'bharat.mishra@ecovis.com',
    contactPhone: '+91 22 2888 1014',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-03-01',
    type: 'internal'
  },
  {
    id: 'int-wealth',
    code: 'GRP-WLT-15',
    name: 'ECOVIS Wealth & Asset Management',
    industry: 'Wealth Planning & Family Office',
    taxId: '27AAACE0015Y1Z4',
    contactPerson: 'Sudhir Bhosale',
    contactEmail: 'sudhir.bhosale@ecovis.com',
    contactPhone: '+91 22 2888 1015',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-04-01',
    type: 'internal'
  },
  {
    id: 'int-academy',
    code: 'GRP-ACA-16',
    name: 'ECOVIS Academy & Corporate Research',
    industry: 'Professional Education & Research',
    taxId: '27AAACE0016Z1Z5',
    contactPerson: 'Namita Chaudhary',
    contactEmail: 'namita.chaudhary@ecovis.com',
    contactPhone: '+91 22 2888 1016',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-05-01',
    type: 'internal'
  }
];

// Employee Pool for assignments
const EMPLOYEE_NAMES = [
  'Deepa Rathi',
  'Namita Chaudhary',
  'Namdev Malusare',
  'Sudhir Bhosale',
  'Mukesh Singh',
  'Sanjana Konda',
  'Aryan Singh',
  'Pooja Disale',
  'Tammay Vilas',
  'Shweta Chaudhari',
  'Suraj Rajbhar',
  'Rahul Sharma',
  'Bharat Mishra'
];

// Helper to seed realistic engagements and tasks relative to current system date
function generateSeedEngagementsAndTasks() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed (e.g. 9 for Oct)

  // Current month: YYYY-MM
  const formatMonth = (y: number, mIdx: number) => {
    const d = new Date(y, mIdx, 1);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  };

  const prevMonthKey = formatMonth(currentYear, currentMonthIdx - 1);
  const currMonthKey = formatMonth(currentYear, currentMonthIdx);
  const nextMonthKey = formatMonth(currentYear, currentMonthIdx + 1);
  const olderMonthKey = formatMonth(currentYear, currentMonthIdx - 2);

  const allParties = [...INITIAL_CLIENTS, ...INITIAL_INTERNAL_COMPANIES];
  const engagements: ClientServiceEngagement[] = [];
  const taskInstances: ServiceTaskInstance[] = [];

  let engCounter = 1;
  let instCounter = 1;

  // Distribute services to clients (1 to 5 services each) and internal companies (2 to 4 services each)
  allParties.forEach((party, pIdx) => {
    const isInternal = party.type === 'internal';
    // Decide which services to assign
    let assignedServiceIds: string[] = [];
    if (isInternal) {
      // Group entities commonly receive Accounting, GST, Payroll, TDS
      const commonPool = ['srv-accounting', 'srv-gst-compliance', 'srv-payroll-outsourcing', 'srv-tds'];
      const extraPool = ['srv-roc', 'srv-cfo', 'srv-stat-audit'];
      assignedServiceIds = [...commonPool.slice(0, 2 + (pIdx % 3))];
      if (pIdx % 3 === 0) assignedServiceIds.push(extraPool[pIdx % extraPool.length]);
    } else {
      // External clients get 2-5 services
      const count = 2 + (pIdx % 4);
      assignedServiceIds = INITIAL_SERVICE_CATALOGUE.slice(0, count).map(s => s.id);
    }

    assignedServiceIds.forEach((serviceId, sIdx) => {
      const service = INITIAL_SERVICE_CATALOGUE.find(s => s.id === serviceId)!;
      const engId = `eng-${party.id}-${service.id}`;
      const collaboratorIndex = (pIdx + sIdx) % EMPLOYEE_NAMES.length;
      const collaboratorName = EMPLOYEE_NAMES[collaboratorIndex];

      const frequency: RecurrenceFrequency =
        serviceId === 'srv-stat-audit' ? 'yearly' :
        serviceId === 'srv-it-audit' ? 'quarterly' :
        serviceId === 'srv-income-tax' ? 'quarterly' :
        serviceId === 'srv-transfer-pricing' ? 'yearly' :
        serviceId === 'srv-roc' ? 'quarterly' : 'monthly';

      const engagement: ClientServiceEngagement = {
        id: engId,
        tenantId: 'tenant-ecovis-global',
        clientId: party.id,
        serviceId: service.id,
        servicingLegalEntityId: party.primaryLegalEntityId || 'le-mum',
        billingType: isInternal ? 'fixed_fee' : (service.standardHourlyRate > 3500 ? 'time_and_materials' : 'monthly_retainer'),
        contractValue: service.standardHourlyRate * 40,
        currency: 'INR',
        status: 'active',
        startDate: '2025-01-01',
        selectedTemplateTaskIds: service.deliverables.map(d => d.id),
        customTasks: [],
        collaborators: [
          {
            userId: `EMP00${(collaboratorIndex % 5) + 1}`,
            userName: collaboratorName,
            userEmail: `${collaboratorName.toLowerCase().replace(' ', '.')}@ecovis.com`,
            homeLegalEntityId: party.primaryLegalEntityId || 'le-mum',
            homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
            engagementRole: collaboratorIndex % 2 === 0 ? 'manager' : 'associate',
            allocatedHours: 40
          }
        ],
        recurrence: {
          frequency,
          startDate: '2025-01-01',
          dayOfMonth: 10 + ((pIdx + sIdx) % 15),
          leadDays: 7,
          isActive: true,
          lastRunAt: new Date(currentYear, currentMonthIdx, 1).toISOString(),
          nextScheduledDate: new Date(currentYear, currentMonthIdx + 1, 1).toISOString()
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z'
      };

      engagements.push(engagement);

      // --- GENERATE TASKS ---
      // For each deliverable in the service, generate task instances for:
      // 1. Previous Month (Sep 2026) -> completed or done
      // 2. Current Month (Oct 2026) -> mix of Pending, In Progress, In Review, and Done
      // 3. Next Month (Nov 2026) -> Scheduled / pending
      // 4. Carried Over tasks from older/prev month that were unfinished!
      service.deliverables.forEach((del, dIdx) => {
        const isOneTime = (pIdx + sIdx + dIdx) % 5 === 0;
        const taskKind: TaskKind = isOneTime ? 'one-time' : 'recurring';
        const assignedEmp = EMPLOYEE_NAMES[(collaboratorIndex + dIdx) % EMPLOYEE_NAMES.length];

        // 1. Current Month Task (due in current month)
        const dueDay = Math.min(28, 5 + ((pIdx * 3 + dIdx * 4) % 23));
        const currDueDate = `${currMonthKey}-${String(dueDay).padStart(2, '0')}`;
        const isOverdueInCurrent = dueDay < now.getDate() && ((pIdx + dIdx) % 4 === 0);

        let currStatus: TaskStatus = 'pending';
        if ((pIdx + dIdx) % 3 === 0) currStatus = 'in-progress';
        else if ((pIdx + dIdx) % 5 === 0) currStatus = 'review';
        else if ((pIdx + dIdx) % 7 === 0) currStatus = 'completed';

        const subtasksWithStatus = del.subtasks.map((st, sIndex) => ({
          id: `st-${instCounter}-${sIndex}`,
          title: st.title,
          status: (currStatus === 'completed' || sIndex === 0) ? ('completed' as const) : ('pending' as const),
          done: currStatus === 'completed' || sIndex === 0,
          assignee: assignedEmp
        }));

        taskInstances.push({
          id: `task-inst-${instCounter++}`,
          tenantId: 'tenant-ecovis-global',
          engagementId: engId,
          clientId: party.id,
          serviceId: service.id,
          serviceCode: service.code,
          serviceTitle: service.title,
          clientName: party.name,
          taskId: del.id,
          taskTitle: isOneTime ? `[Bespoke] ${del.title}` : del.title,
          description: del.description,
          periodKey: isOneTime ? 'ONE-OFF' : `${currMonthKey}-M`,
          idempotencyKey: `${party.id}_${service.id}_${del.id}_${currMonthKey}`,
          dueDate: `${currDueDate}T18:00:00.000Z`,
          priority: del.priority,
          status: currStatus,
          progress: currStatus === 'completed' ? 100 : (currStatus === 'in-progress' ? 50 : 0),
          assignedTo: (pIdx === 2 && dIdx === 1) ? 'Unassigned' : assignedEmp,
          assignedToId: `EMP00${((collaboratorIndex + dIdx) % 5) + 1}`,
          assignedLegalEntityId: party.primaryLegalEntityId || 'le-mum',
          isCrossEntity: (pIdx % 3 === 0),
          contributors: [EMPLOYEE_NAMES[(collaboratorIndex + 1) % EMPLOYEE_NAMES.length]],
          subtasks: subtasksWithStatus,
          executionSteps: del.executionSteps.map((es, idx) => ({ id: `es-${idx}`, text: es.text, completed: currStatus === 'completed' })),
          history: [
            {
              id: `h-${Date.now()}-${instCounter}`,
              user: 'System Scheduler',
              avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
              action: 'created',
              details: `Auto-generated instance for cycle ${currMonthKey}`,
              timestamp: new Date(currentYear, currentMonthIdx, 1)
            }
          ],
          isCustomTask: isOneTime,
          estimatedHours: del.estimatedHours,
          actualHours: currStatus === 'completed' ? del.estimatedHours : (currStatus === 'in-progress' ? del.estimatedHours / 2 : 0),
          kind: taskKind,
          recurrenceFrequency: frequency,
          createdAt: new Date(currentYear, currentMonthIdx, 1).toISOString(),
          updatedAt: new Date(currentYear, currentMonthIdx, Math.max(1, dueDay - 1)).toISOString(),
          createdBy: 'System Scheduler',
          updatedBy: assignedEmp
        });

        // 2. Previous Month Task (Sep 2026)
        if ((pIdx + dIdx) % 2 === 0) {
          const prevDueDay = Math.min(28, 10 + (pIdx % 15));
          const prevDueDate = `${prevMonthKey}-${String(prevDueDay).padStart(2, '0')}`;
          const prevStatus: TaskStatus = ((pIdx + dIdx) % 6 === 0) ? 'pending' : 'completed';

          taskInstances.push({
            id: `task-inst-${instCounter++}`,
            tenantId: 'tenant-ecovis-global',
            engagementId: engId,
            clientId: party.id,
            serviceId: service.id,
            serviceCode: service.code,
            serviceTitle: service.title,
            clientName: party.name,
            taskId: del.id,
            taskTitle: del.title,
            description: del.description,
            periodKey: `${prevMonthKey}-M`,
            idempotencyKey: `${party.id}_${service.id}_${del.id}_${prevMonthKey}`,
            dueDate: `${prevDueDate}T18:00:00.000Z`,
            priority: del.priority,
            status: prevStatus,
            progress: prevStatus === 'completed' ? 100 : 25,
            assignedTo: assignedEmp,
            assignedToId: `EMP00${((collaboratorIndex + dIdx) % 5) + 1}`,
            assignedLegalEntityId: party.primaryLegalEntityId || 'le-mum',
            isCrossEntity: false,
            contributors: [],
            subtasks: del.subtasks.map((st, sIndex) => ({
              id: `st-prev-${instCounter}-${sIndex}`,
              title: st.title,
              status: prevStatus === 'completed' ? 'completed' : 'pending',
              done: prevStatus === 'completed',
              assignee: assignedEmp
            })),
            executionSteps: del.executionSteps.map((es, idx) => ({ id: `es-${idx}`, text: es.text, completed: prevStatus === 'completed' })),
            history: [
              {
                id: `h-prev-${instCounter}`,
                user: 'System Scheduler',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                action: 'created',
                details: `Dispatched for cycle ${prevMonthKey}`,
                timestamp: new Date(currentYear, currentMonthIdx - 1, 1)
              }
            ],
            isCustomTask: false,
            estimatedHours: del.estimatedHours,
            actualHours: prevStatus === 'completed' ? del.estimatedHours : 4,
            kind: 'recurring',
            recurrenceFrequency: frequency,
            createdAt: new Date(currentYear, currentMonthIdx - 1, 1).toISOString(),
            updatedAt: new Date(currentYear, currentMonthIdx - 1, 28).toISOString(),
            createdBy: 'System Scheduler',
            updatedBy: assignedEmp
          });
        }

        // 3. Next Month Task (Nov 2026) - Scheduled
        if ((pIdx + dIdx) % 3 === 0) {
          const nextDueDay = Math.min(28, 15 + (pIdx % 10));
          const nextDueDate = `${nextMonthKey}-${String(nextDueDay).padStart(2, '0')}`;

          taskInstances.push({
            id: `task-inst-${instCounter++}`,
            tenantId: 'tenant-ecovis-global',
            engagementId: engId,
            clientId: party.id,
            serviceId: service.id,
            serviceCode: service.code,
            serviceTitle: service.title,
            clientName: party.name,
            taskId: del.id,
            taskTitle: del.title,
            description: del.description,
            periodKey: `${nextMonthKey}-M`,
            idempotencyKey: `${party.id}_${service.id}_${del.id}_${nextMonthKey}`,
            dueDate: `${nextDueDate}T18:00:00.000Z`,
            priority: del.priority,
            status: 'pending',
            progress: 0,
            assignedTo: assignedEmp,
            assignedToId: `EMP00${((collaboratorIndex + dIdx) % 5) + 1}`,
            assignedLegalEntityId: party.primaryLegalEntityId || 'le-mum',
            isCrossEntity: false,
            contributors: [],
            subtasks: del.subtasks.map((st, sIndex) => ({
              id: `st-next-${instCounter}-${sIndex}`,
              title: st.title,
              status: 'pending',
              done: false,
              assignee: assignedEmp
            })),
            executionSteps: del.executionSteps.map((es, idx) => ({ id: `es-${idx}`, text: es.text, completed: false })),
            history: [
              {
                id: `h-next-${instCounter}`,
                user: 'System Scheduler',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                action: 'created',
                details: `Scheduled recurring cycle for ${nextMonthKey}`,
                timestamp: new Date(currentYear, currentMonthIdx, 25)
              }
            ],
            isCustomTask: false,
            estimatedHours: del.estimatedHours,
            actualHours: 0,
            kind: 'recurring',
            recurrenceFrequency: frequency,
            createdAt: new Date(currentYear, currentMonthIdx, 25).toISOString(),
            updatedAt: new Date(currentYear, currentMonthIdx, 25).toISOString(),
            createdBy: 'System Scheduler',
            updatedBy: 'System Scheduler'
          });
        }

        // 4. Carried over overdue task from older month (e.g. Aug or Sep)
        if ((pIdx === 0 && dIdx === 0) || (pIdx === 3 && dIdx === 1) || (pIdx === 6 && dIdx === 0) || (pIdx === 14 && dIdx === 1)) {
          const carriedDueDate = `${olderMonthKey}-25`;
          taskInstances.push({
            id: `task-inst-carried-${instCounter++}`,
            tenantId: 'tenant-ecovis-global',
            engagementId: engId,
            clientId: party.id,
            serviceId: service.id,
            serviceCode: service.code,
            serviceTitle: service.title,
            clientName: party.name,
            taskId: del.id,
            taskTitle: `[Overdue Carried-Over] ${del.title}`,
            description: `${del.description} (Carried over from prior audit cycle - requires urgent partner sign-off)`,
            periodKey: `${olderMonthKey}-M`,
            idempotencyKey: `${party.id}_${service.id}_${del.id}_${olderMonthKey}_carried`,
            dueDate: `${carriedDueDate}T18:00:00.000Z`,
            priority: 'high',
            status: 'pending',
            progress: 30,
            assignedTo: assignedEmp,
            assignedToId: `EMP00${((collaboratorIndex + dIdx) % 5) + 1}`,
            assignedLegalEntityId: party.primaryLegalEntityId || 'le-mum',
            isCrossEntity: true,
            contributors: ['Deepa Rathi'],
            subtasks: del.subtasks.map((st, sIndex) => ({
              id: `st-carried-${instCounter}-${sIndex}`,
              title: st.title,
              status: sIndex === 0 ? 'completed' : 'pending',
              done: sIndex === 0,
              assignee: assignedEmp
            })),
            executionSteps: del.executionSteps.map((es, idx) => ({ id: `es-${idx}`, text: es.text, completed: false })),
            history: [
              {
                id: `h-carried-${instCounter}`,
                user: 'System Auditor',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                action: 'status_change' as const,
                details: `Carried over due to pending client documentation from ${olderMonthKey}`,
                timestamp: new Date(currentYear, currentMonthIdx, 2)
              }
            ],
            isCustomTask: false,
            estimatedHours: del.estimatedHours,
            actualHours: 6,
            kind: 'recurring',
            recurrenceFrequency: frequency,
            createdAt: new Date(currentYear, currentMonthIdx - 2, 1).toISOString(),
            updatedAt: new Date(currentYear, currentMonthIdx, 5).toISOString(),
            createdBy: 'System Scheduler',
            updatedBy: assignedEmp
          });
        }
      });
    });
  });

  return { engagements, taskInstances };
}

// Pre-compute initial seed
export const { engagements: INITIAL_ENGAGEMENTS, taskInstances: INITIAL_TASK_INSTANCES } = generateSeedEngagementsAndTasks();

// --- INITIAL TIMESHEET ENTRIES ---
export const INITIAL_TIMESHEETS: ServiceTimesheetEntry[] = [
  {
    id: 'ts-01',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-cl-tata-srv-stat-audit',
    clientId: 'cl-tata',
    clientName: 'Tata Sons & Group Enterprises',
    serviceId: 'srv-stat-audit',
    serviceTitle: 'Statutory Financial Audit & Tax Filing',
    taskTitle: 'Trial Balance Ingestion & Risk Assessment',
    userId: 'EMP002',
    userName: 'Namita Chaudhary',
    userLegalEntityId: 'le-mum',
    userLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
    isCrossEntityCollaboration: false,
    date: '2026-10-24',
    hours: 8,
    isBillable: true,
    hourlyRate: 3500,
    totalBilledAmount: 28000,
    description: 'Completed analytical review check and trial balance discrepancy audit.',
    status: 'submitted',
    submittedAt: '2026-10-24T17:30:00Z',
    createdAt: '2026-10-24T17:30:00Z',
    history: [{ id: 'th-1', action: 'submitted', user: 'Namita Chaudhary', timestamp: '2026-10-24T17:30:00Z' }]
  },
  {
    id: 'ts-02',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-cl-reliance-srv-gst-compliance',
    clientId: 'cl-reliance',
    clientName: 'Reliance Retail & Logistics Ltd',
    serviceId: 'srv-gst-compliance',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskTitle: 'Sales & Outward Supply Data Ingestion (GSTR-1)',
    userId: 'EMP003',
    userName: 'Namdev Malusare',
    userLegalEntityId: 'le-del',
    userLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
    isCrossEntityCollaboration: true,
    date: '2026-10-25',
    hours: 6.5,
    isBillable: true,
    hourlyRate: 2800,
    totalBilledAmount: 18200,
    description: 'Matched B2B invoices with E-way bill portal and identified missing credit notes.',
    status: 'submitted',
    submittedAt: '2026-10-25T18:15:00Z',
    createdAt: '2026-10-25T18:15:00Z',
    history: [{ id: 'th-2', action: 'submitted', user: 'Namdev Malusare', timestamp: '2026-10-25T18:15:00Z' }]
  },
  {
    id: 'ts-03',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-int-holdings-srv-accounting',
    clientId: 'int-holdings',
    clientName: 'ECOVIS RKCA Holdings Ltd',
    serviceId: 'srv-accounting',
    serviceTitle: 'Accounting & Bookkeeping Services',
    taskTitle: 'Bank & Payment Gateway Reconciliations',
    userId: 'EMP005',
    userName: 'Mukesh Singh',
    userLegalEntityId: 'le-blr',
    userLegalEntityName: 'ECOVIS Digital Solutions - Bengaluru',
    isCrossEntityCollaboration: true,
    date: '2026-10-26',
    hours: 7,
    isBillable: true,
    hourlyRate: 2600,
    totalBilledAmount: 18200,
    description: 'Intercompany reconciliation across Mumbai and Singapore branch transactions.',
    status: 'submitted',
    submittedAt: '2026-10-26T19:00:00Z',
    createdAt: '2026-10-26T19:00:00Z',
    history: [{ id: 'th-3', action: 'submitted', user: 'Mukesh Singh', timestamp: '2026-10-26T19:00:00Z' }]
  },
  {
    id: 'ts-04',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-cl-zomato-srv-payroll-outsourcing',
    clientId: 'cl-zomato',
    clientName: 'Zomato Media & Hyperlocal Tech',
    serviceId: 'srv-payroll-outsourcing',
    serviceTitle: 'End-to-End Payroll & Statutory Processing',
    taskTitle: 'Monthly Attendance & LOP Computation',
    userId: 'EMP007',
    userName: 'Aryan Singh',
    userLegalEntityId: 'le-del',
    userLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
    isCrossEntityCollaboration: false,
    date: '2026-10-27',
    hours: 8,
    isBillable: true,
    hourlyRate: 2400,
    totalBilledAmount: 19200,
    description: 'Calculated biometric LOP days and generated provisional payroll register for 1,200 employees.',
    status: 'submitted',
    submittedAt: '2026-10-27T16:45:00Z',
    createdAt: '2026-10-27T16:45:00Z',
    history: [{ id: 'th-4', action: 'submitted', user: 'Aryan Singh', timestamp: '2026-10-27T16:45:00Z' }]
  }
];

// --- INITIAL AUDIT LOGS ---
export const INITIAL_AUDIT_LOGS: ServiceAuditEntry[] = [
  {
    id: 'aud-01',
    tenantId: 'tenant-ecovis-global',
    timestamp: '2026-10-28T06:00:00Z',
    actorId: 'EMP001',
    actorName: 'Deepa Rathi',
    actorLegalEntity: 'ECOVIS RKCA - Mumbai HQ',
    action: 'SERVICE_ENGAGEMENT_RENEWED',
    category: 'engagement',
    targetType: 'client_service_engagement',
    targetId: 'eng-cl-tata-srv-stat-audit',
    details: 'Renewed annual statutory audit engagement for Tata Sons & Group Enterprises.'
  },
  {
    id: 'aud-02',
    tenantId: 'tenant-ecovis-global',
    timestamp: '2026-10-27T14:20:00Z',
    actorId: 'EMP001',
    actorName: 'Deepa Rathi',
    actorLegalEntity: 'ECOVIS RKCA - Mumbai HQ',
    action: 'RECURRING_CYCLE_GENERATED',
    category: 'task_generation',
    targetType: 'recurrence_job',
    targetId: 'job-cycle-2026-10',
    details: 'Dispatched monthly recurrence cycle for October 2026 across 28 active entities.'
  }
];

// --- STORE IMPLEMENTATION ---

class ServiceManagementStore {
  private services: ServiceTemplate[] = [];
  private clients: Client[] = [];
  private internalCompanies: Client[] = [];
  private engagements: ClientServiceEngagement[] = [];
  private taskInstances: ServiceTaskInstance[] = [];
  private timesheets: ServiceTimesheetEntry[] = [];
  private auditLogs: ServiceAuditEntry[] = [];
  private legalEntities: LegalEntity[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  private loadState() {
    try {
      const storedServices = localStorage.getItem('ecovis_srv_services');
      const storedClients = localStorage.getItem('ecovis_srv_clients');
      const storedInternals = localStorage.getItem('ecovis_srv_internals');
      const storedEngagements = localStorage.getItem('ecovis_srv_engagements');
      const storedTasks = localStorage.getItem('ecovis_srv_tasks_v2');
      const storedTimesheets = localStorage.getItem('ecovis_srv_timesheets');
      const storedAudits = localStorage.getItem('ecovis_srv_audits');

      this.services = storedServices ? JSON.parse(storedServices) : [...INITIAL_SERVICE_CATALOGUE];
      this.clients = storedClients ? JSON.parse(storedClients) : [...INITIAL_CLIENTS];
      this.internalCompanies = storedInternals ? JSON.parse(storedInternals) : [...INITIAL_INTERNAL_COMPANIES];
      this.engagements = storedEngagements ? JSON.parse(storedEngagements) : [...INITIAL_ENGAGEMENTS];
      this.taskInstances = storedTasks ? JSON.parse(storedTasks) : [...INITIAL_TASK_INSTANCES];
      this.timesheets = storedTimesheets ? JSON.parse(storedTimesheets) : [...INITIAL_TIMESHEETS];
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [...INITIAL_AUDIT_LOGS];
      this.legalEntities = [...INITIAL_LEGAL_ENTITIES];
    } catch (e) {
      this.services = [...INITIAL_SERVICE_CATALOGUE];
      this.clients = [...INITIAL_CLIENTS];
      this.internalCompanies = [...INITIAL_INTERNAL_COMPANIES];
      this.engagements = [...INITIAL_ENGAGEMENTS];
      this.taskInstances = [...INITIAL_TASK_INSTANCES];
      this.timesheets = [...INITIAL_TIMESHEETS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.legalEntities = [...INITIAL_LEGAL_ENTITIES];
    }
  }

  public saveState() {
    try {
      localStorage.setItem('ecovis_srv_services', JSON.stringify(this.services));
      localStorage.setItem('ecovis_srv_clients', JSON.stringify(this.clients));
      localStorage.setItem('ecovis_srv_internals', JSON.stringify(this.internalCompanies));
      localStorage.setItem('ecovis_srv_engagements', JSON.stringify(this.engagements));
      localStorage.setItem('ecovis_srv_tasks_v2', JSON.stringify(this.taskInstances));
      localStorage.setItem('ecovis_srv_timesheets', JSON.stringify(this.timesheets));
      localStorage.setItem('ecovis_srv_audits', JSON.stringify(this.auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  // --- GETTERS ---
  public getServices(): ServiceTemplate[] { return this.services; }
  public getClients(): Client[] { return this.clients; }
  public getInternalCompanies(): Client[] { return this.internalCompanies; }
  public getAllParties(): Client[] { return [...this.clients, ...this.internalCompanies]; }
  public getEngagements(): ClientServiceEngagement[] { return this.engagements; }
  public getTaskInstances(): ServiceTaskInstance[] { return this.taskInstances; }
  public getTimesheets(): ServiceTimesheetEntry[] { return this.timesheets; }
  public getAuditLogs(): ServiceAuditEntry[] { return this.auditLogs; }
  public getLegalEntities(): LegalEntity[] { return this.legalEntities; }

  // --- TASK OPERATIONS ---
  public updateTaskInstance(id: string, updates: Partial<ServiceTaskInstance>, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== id) return t;
      const historyEntry: TaskHistory = {
        id: `h-${Date.now()}`,
        user: actor.name,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        action: updates.status ? ('status_change' as const) : ('commented' as const),
        details: updates.status ? `Status changed to ${updates.status}` : 'Task updated',
        timestamp: new Date()
      };
      return {
        ...t,
        ...updates,
        updatedBy: actor.name,
        updatedAt: new Date().toISOString(),
        history: [historyEntry, ...(t.history || [])]
      };
    });
    this.saveState();
  }

  public updateSubtask(taskInstanceId: string, subtaskId: string, done: boolean, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== taskInstanceId) return t;
      const updatedSubtasks = (t.subtasks || []).map(st => {
        if (st.id !== subtaskId) return st;
        return {
          ...st,
          done,
          status: done ? ('completed' as const) : ('pending' as const)
        };
      });

      // Recalculate progress
      const total = updatedSubtasks.length;
      const completedCount = updatedSubtasks.filter(st => st.done || st.status === 'completed').length;
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : t.progress;

      return {
        ...t,
        subtasks: updatedSubtasks,
        progress,
        updatedBy: actor.name,
        updatedAt: new Date().toISOString()
      };
    });
    this.saveState();
  }

  public addSubtask(taskInstanceId: string, title: string, assignee: string, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== taskInstanceId) return t;
      const newSubtask = {
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        status: 'pending' as const,
        done: false,
        assignee: assignee || t.assignedTo
      };
      const updatedSubtasks = [...(t.subtasks || []), newSubtask];
      const completedCount = updatedSubtasks.filter(st => st.done || st.status === 'completed').length;
      const progress = Math.round((completedCount / updatedSubtasks.length) * 100);

      return {
        ...t,
        subtasks: updatedSubtasks,
        progress,
        updatedBy: actor.name,
        updatedAt: new Date().toISOString()
      };
    });
    this.saveState();
  }

  public reassignTask(taskInstanceId: string, newAssignee: string, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== taskInstanceId) return t;
      const historyEntry: TaskHistory = {
        id: `h-${Date.now()}`,
        user: actor.name,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        action: 'assignment' as const,
        details: `Reassigned from ${t.assignedTo} to ${newAssignee}`,
        timestamp: new Date()
      };
      return {
        ...t,
        assignedTo: newAssignee,
        updatedBy: actor.name,
        updatedAt: new Date().toISOString(),
        history: [historyEntry, ...(t.history || [])]
      };
    });
    this.saveState();
  }

  public changeTaskStatus(taskInstanceId: string, newStatus: TaskStatus, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== taskInstanceId) return t;
      const historyEntry: TaskHistory = {
        id: `h-${Date.now()}`,
        user: actor.name,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        action: 'status_change',
        details: `Status updated to ${newStatus}`,
        timestamp: new Date()
      };
      return {
        ...t,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : (newStatus === 'in-progress' ? 50 : (newStatus === 'pending' ? 0 : t.progress)),
        updatedBy: actor.name,
        updatedAt: new Date().toISOString(),
        history: [historyEntry, ...(t.history || [])]
      };
    });
    this.saveState();
  }

  // --- CATALOGUE & ENGAGEMENT OPERATIONS ---
  public addServiceTemplate(template: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>, actor: { id: string; name: string; entity: string }): ServiceTemplate {
    const newService: ServiceTemplate = {
      ...template,
      id: `srv-${Date.now()}`,
      shortTitle: template.shortTitle || template.title.split(' ')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.services.push(newService);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'SERVICE_CATALOGUE_CREATED',
      category: 'catalogue',
      targetType: 'service_template',
      targetId: newService.id,
      details: `Created new service template: ${newService.title} (${newService.code})`
    });
    this.saveState();
    return newService;
  }

  public updateServiceTemplate(id: string, updates: Partial<ServiceTemplate>, actor: { id: string; name: string; entity: string }): void {
    this.services = this.services.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    });
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'SERVICE_CATALOGUE_UPDATED',
      category: 'catalogue',
      targetType: 'service_template',
      targetId: id,
      details: `Updated service template metadata for ${id}`
    });
    this.saveState();
  }

  public createEngagement(
    engagement: Omit<ClientServiceEngagement, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string; entity: string }
  ): ClientServiceEngagement {
    const newEng: ClientServiceEngagement = {
      ...engagement,
      id: `eng-${engagement.clientId}-${engagement.serviceId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.engagements.push(newEng);

    const party = this.getAllParties().find(p => p.id === newEng.clientId);
    const service = this.services.find(s => s.id === newEng.serviceId);

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'ENGAGEMENT_CREATED',
      category: 'engagement',
      targetType: 'client_service_engagement',
      targetId: newEng.id,
      details: `Subscribed ${party?.name || 'Party'} to service "${service?.title || 'Service'}" (${newEng.billingType})`
    });

    // Spawn initial tasks for the current cycle
    const now = new Date();
    const currMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.generateRecurringTasksForEngagement(newEng.id, actor, `${currMonthKey}-M`);

    this.saveState();
    return newEng;
  }

  // --- RECURRENCE DISPATCH ENGINE ---
  public generateRecurringTasksForEngagement(
    engagementId: string,
    actor: { id: string; name: string; entity: string },
    forcedPeriodKey?: string
  ): { spawnedCount: number; skippedCount: number; periodKey: string } {
    const engagement = this.engagements.find(e => e.id === engagementId);
    if (!engagement) return { spawnedCount: 0, skippedCount: 0, periodKey: 'NONE' };

    const service = this.services.find(s => s.id === engagement.serviceId);
    if (!service) return { spawnedCount: 0, skippedCount: 0, periodKey: 'NONE' };

    const party = this.getAllParties().find(p => p.id === engagement.clientId);
    const now = new Date();
    const periodKey = forcedPeriodKey || `${now.getFullYear()}-M${String(now.getMonth() + 1).padStart(2, '0')}`;

    let spawnedCount = 0;
    let skippedCount = 0;

    for (const deliverableId of engagement.selectedTemplateTaskIds) {
      const templateTask = service.deliverables.find(d => d.id === deliverableId);
      if (!templateTask) continue;

      const idempotencyKey = `${engagement.clientId}_${engagement.serviceId}_${templateTask.id}_${periodKey}`;
      const existing = this.taskInstances.find(t => t.idempotencyKey === idempotencyKey);

      if (existing) {
        skippedCount++;
        continue;
      }

      const assignedCollab = engagement.collaborators[0];
      const dueDate = new Date(now.getFullYear(), now.getMonth(), engagement.recurrence.dayOfMonth || 15).toISOString();

      const newInst: ServiceTaskInstance = {
        id: `task-inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tenantId: 'tenant-ecovis-global',
        engagementId: engagement.id,
        clientId: engagement.clientId,
        serviceId: engagement.serviceId,
        serviceCode: service.code,
        serviceTitle: service.title,
        clientName: party?.name || 'Party',
        taskId: templateTask.id,
        taskTitle: templateTask.title,
        description: templateTask.description,
        periodKey,
        idempotencyKey,
        dueDate,
        priority: templateTask.priority,
        status: 'pending',
        progress: 0,
        assignedTo: assignedCollab?.userName || 'Deepa Rathi',
        assignedToId: assignedCollab?.userId || 'EMP001',
        assignedLegalEntityId: assignedCollab?.homeLegalEntityId || engagement.servicingLegalEntityId,
        isCrossEntity: assignedCollab ? assignedCollab.homeLegalEntityId !== engagement.servicingLegalEntityId : false,
        contributors: [],
        subtasks: templateTask.subtasks.map(st => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: st.title,
          status: 'pending',
          done: false,
          assignee: assignedCollab?.userName || 'Deepa Rathi'
        })),
        executionSteps: templateTask.executionSteps.map(es => ({
          id: `es-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: es.text,
          completed: false
        })),
        history: [
          {
            id: `h-${Date.now()}`,
            user: actor.name,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            action: 'created',
            details: `Dispatched recurring cycle ${periodKey}`,
            timestamp: new Date()
          }
        ],
        isCustomTask: false,
        estimatedHours: templateTask.estimatedHours,
        actualHours: 0,
        kind: 'recurring',
        recurrenceFrequency: engagement.recurrence.frequency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: actor.name,
        updatedBy: actor.name
      };

      this.taskInstances.unshift(newInst);
      spawnedCount++;
    }

    // 2. Process Custom Client Tasks
    for (const customTask of (engagement.customTasks || [])) {
      const idempotencyKey = `${engagement.clientId}_${engagement.serviceId}_${customTask.id}_${periodKey}`;
      const existing = this.taskInstances.find(t => t.idempotencyKey === idempotencyKey);

      if (existing) {
        skippedCount++;
        continue;
      }

      const assignedCollab = engagement.collaborators[0];
      const dueDate = new Date(now.getFullYear(), now.getMonth(), engagement.recurrence.dayOfMonth || 15).toISOString();

      const newInst: ServiceTaskInstance = {
        id: `task-inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        tenantId: 'tenant-ecovis-global',
        engagementId: engagement.id,
        clientId: engagement.clientId,
        serviceId: engagement.serviceId,
        serviceCode: service.code,
        serviceTitle: service.title,
        clientName: party?.name || 'Party',
        taskId: customTask.id,
        taskTitle: customTask.title,
        description: customTask.description,
        periodKey,
        idempotencyKey,
        dueDate,
        priority: customTask.priority,
        status: 'pending',
        progress: 0,
        assignedTo: assignedCollab?.userName || 'Deepa Rathi',
        assignedToId: assignedCollab?.userId || 'EMP001',
        assignedLegalEntityId: assignedCollab?.homeLegalEntityId || engagement.servicingLegalEntityId,
        isCrossEntity: assignedCollab ? assignedCollab.homeLegalEntityId !== engagement.servicingLegalEntityId : false,
        contributors: [],
        subtasks: (customTask.subtasks || []).map(st => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: st.title,
          status: 'pending',
          done: false,
          assignee: assignedCollab?.userName || 'Deepa Rathi'
        })),
        executionSteps: (customTask.executionSteps || []).map(es => ({
          id: `es-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: es.text,
          completed: false
        })),
        history: [
          {
            id: `h-${Date.now()}`,
            user: actor.name,
            avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
            action: 'created',
            details: `Dispatched bespoke task for cycle ${periodKey}`,
            timestamp: new Date()
          }
        ],
        isCustomTask: true,
        estimatedHours: customTask.estimatedHours,
        actualHours: 0,
        kind: 'recurring',
        recurrenceFrequency: engagement.recurrence.frequency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: actor.name,
        updatedBy: actor.name
      };

      this.taskInstances.unshift(newInst);
      spawnedCount++;
    }

    this.saveState();
    return { spawnedCount, skippedCount, periodKey };
  }

  // Backward compatible aliases
  public addService(template: any, actor: any) {
    return this.addServiceTemplate(template, actor);
  }

  public addEngagement(eng: any, actor: any) {
    return this.createEngagement(eng, actor);
  }

  public addCustomTaskToEngagement(
    engagementId: string,
    customTask: Omit<CustomClientTask, 'id' | 'isCustom' | 'createdAt'>,
    actor: { id: string; name: string; entity: string }
  ): CustomClientTask {
    const engagement = this.engagements.find(e => e.id === engagementId);
    if (!engagement) throw new Error('Engagement not found');

    const newTask: CustomClientTask = {
      ...customTask,
      id: `ctask-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    engagement.customTasks = [...(engagement.customTasks || []), newTask];
    this.saveState();
    return newTask;
  }

  public runAllRecurrences(actor: { id: string; name: string; entity: string }, targetMonthStr?: string): { totalSpawned: number; totalSkipped: number; details: string[] } {
    let totalSpawned = 0;
    let totalSkipped = 0;
    const details: string[] = [];

    const periodKey = targetMonthStr ? `${targetMonthStr}-M` : undefined;

    this.engagements.filter(e => e.status === 'active' && e.recurrence.isActive).forEach(eng => {
      const res = this.generateRecurringTasksForEngagement(eng.id, actor, periodKey);
      totalSpawned += res.spawnedCount;
      totalSkipped += res.skippedCount;
      const party = this.getAllParties().find(p => p.id === eng.clientId);
      details.push(`${party?.name || eng.clientId}: spawned ${res.spawnedCount}, skipped ${res.skippedCount} (${res.periodKey})`);
    });

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'RECURRING_TASKS_BATCH_RUN',
      category: 'task_generation',
      targetType: 'recurrence_job',
      targetId: 'all-engagements',
      details: `Generated recurring tasks for ${targetMonthStr || 'current cycle'}: ${totalSpawned} spawned, ${totalSkipped} skipped duplicates.`
    });

    this.saveState();
    return { totalSpawned, totalSkipped, details };
  }

  // --- TIMESHEETS ---
  public logTimesheet(
    entry: Omit<ServiceTimesheetEntry, 'id' | 'tenantId' | 'totalBilledAmount' | 'status' | 'createdAt' | 'history'>,
    actor: { id: string; name: string; entity: string }
  ): ServiceTimesheetEntry {
    const totalBilledAmount = entry.isBillable ? (entry.hours * entry.hourlyRate) : 0;
    const newEntry: ServiceTimesheetEntry = {
      ...entry,
      id: `ts-${Date.now()}`,
      tenantId: 'tenant-ecovis-global',
      totalBilledAmount,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      history: [
        { id: `th-${Date.now()}`, action: 'submitted', user: actor.name, timestamp: new Date().toISOString() }
      ]
    };

    this.timesheets.unshift(newEntry);

    if (newEntry.taskInstanceId) {
      this.taskInstances = this.taskInstances.map(ti => {
        if (ti.id === newEntry.taskInstanceId) {
          return { ...ti, actualHours: (ti.actualHours || 0) + newEntry.hours };
        }
        return ti;
      });
    }

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'TIMESHEET_SUBMITTED',
      category: 'timesheet',
      targetType: 'service_timesheet',
      targetId: newEntry.id,
      details: `Logged ${newEntry.hours} hrs for party "${newEntry.clientName}" on task "${newEntry.taskTitle}".`
    });

    this.saveState();
    return newEntry;
  }

  public approveTimesheet(id: string, actor: { id: string; name: string; entity: string }): void {
    this.timesheets = this.timesheets.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: 'approved',
        approvedBy: actor.name,
        approvedAt: new Date().toISOString(),
        history: [
          ...t.history,
          { id: `th-${Date.now()}`, action: 'approved', user: actor.name, timestamp: new Date().toISOString() }
        ]
      };
    });

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'TIMESHEET_APPROVED',
      category: 'timesheet',
      targetType: 'service_timesheet',
      targetId: id,
      details: `Approved timesheet entry ${id}.`
    });

    this.saveState();
  }

  public rejectTimesheet(id: string, reason: string, actor: { id: string; name: string; entity: string }): void {
    this.timesheets = this.timesheets.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status: 'rejected',
        rejectionReason: reason,
        history: [
          ...t.history,
          { id: `th-${Date.now()}`, action: 'rejected', user: actor.name, timestamp: new Date().toISOString(), note: reason }
        ]
      };
    });

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'TIMESHEET_REJECTED',
      category: 'timesheet',
      targetType: 'service_timesheet',
      targetId: id,
      details: `Rejected timesheet entry ${id}: ${reason}`
    });

    this.saveState();
  }

  private logAudit(entry: Omit<ServiceAuditEntry, 'id' | 'tenantId' | 'timestamp'>) {
    const log: ServiceAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tenantId: 'tenant-ecovis-global',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
  }

  public resetToSampleData() {
    try {
      localStorage.removeItem('ecovis_srv_services');
      localStorage.removeItem('ecovis_srv_clients');
      localStorage.removeItem('ecovis_srv_internals');
      localStorage.removeItem('ecovis_srv_engagements');
      localStorage.removeItem('ecovis_srv_tasks_v2');
      localStorage.removeItem('ecovis_srv_timesheets');
      localStorage.removeItem('ecovis_srv_audits');
    } catch (e) {
      // ignore
    }
    const { engagements, taskInstances } = generateSeedEngagementsAndTasks();
    this.services = [...INITIAL_SERVICE_CATALOGUE];
    this.clients = [...INITIAL_CLIENTS];
    this.internalCompanies = [...INITIAL_INTERNAL_COMPANIES];
    this.engagements = engagements;
    this.taskInstances = taskInstances;
    this.timesheets = [...INITIAL_TIMESHEETS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveState();
  }
}

export const serviceManagementStore = new ServiceManagementStore();
