/**
 * Service Management Module - Core Domain Models & Recurrence Engine
 * Supports Tenant-level Service Catalogue, Multi-Client Engagements,
 * Cross-Legal-Entity Collaboration, Idempotent Recurring Schedules,
 * Client-specific Timesheets, and Audit Tracking.
 */

import { SubTask, ExecutionStep, TaskHistory } from '../data/mockData';
import { employeesData } from '../data/employeesData';

// --- DOMAIN TYPES ---

export type RecurrenceFrequency = 'one-off' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

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
  category: 'Audit & Assurance' | 'Tax & Regulatory' | 'Corporate Advisory' | 'Payroll & HR Outsourcing' | 'Risk & Compliance' | 'Digital & IT Audit';
  description: string;
  department: string;
  standardHourlyRate: number; // In tenant base currency (e.g., INR / USD)
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
  startDate: string; // ISO date
  endDate?: string;
  dayOfMonth?: number; // 1-31 (for monthly/quarterly/yearly)
  dayOfWeek?: number; // 0-6 (0=Sunday, for weekly)
  monthOfQuarter?: number; // 1, 2, 3
  monthOfYear?: number; // 1-12
  leadDays: number; // Days before due date to spawn task instance
  isActive: boolean;
  lastRunAt?: string;
  nextScheduledDate?: string;
}

export interface ClientServiceEngagement {
  id: string;
  tenantId: string;
  clientId: string;
  serviceId: string;
  servicingLegalEntityId: string;
  billingType: 'fixed_fee' | 'time_and_materials' | 'monthly_retainer' | 'contingent';
  contractValue: number;
  currency: string;
  status: 'active' | 'draft' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  selectedTemplateTaskIds: string[]; // Subset of template deliverables chosen for this client
  customTasks: CustomClientTask[]; // Bespoke tasks without touching the master template!
  collaborators: EngagementCollaborator[]; // Cross-legal-entity teams!
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
  periodKey: string; // e.g. "2026-M10", "2026-Q4", "2026-W43", "ONE-OFF"
  idempotencyKey: string; // Unique: ${clientId}_${serviceId}_${taskId}_${periodKey}
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'blocked';
  progress: number;
  assignedTo: string;
  assignedToId?: string;
  assignedLegalEntityId: string;
  isCrossEntity: boolean;
  contributors: string[];
  subtasks: SubTask[];
  executionSteps: ExecutionStep[];
  history: TaskHistory[];
  isCustomTask: boolean;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  updatedAt: string;
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

// --- INITIAL MOCK DATA ---

export const INITIAL_LEGAL_ENTITIES: LegalEntity[] = [
  { id: 'le-mum', code: 'ECV-MUM', name: 'ECOVIS RKCA - Mumbai HQ', country: 'India', city: 'Mumbai', taxRegistrationNumber: '27AAACE1234F1Z1', currency: 'INR' },
  { id: 'le-del', code: 'ECV-DEL', name: 'ECOVIS RKCA - New Delhi Branch', country: 'India', city: 'New Delhi', taxRegistrationNumber: '07AAACE1234F1Z8', currency: 'INR' },
  { id: 'le-blr', code: 'ECV-BLR', name: 'ECOVIS Digital Solutions - Bengaluru', country: 'India', city: 'Bengaluru', taxRegistrationNumber: '29AAACE1234F1Z3', currency: 'INR' },
  { id: 'le-pun', code: 'ECV-PUN', name: 'ECOVIS Advisory - Pune Regional', country: 'India', city: 'Pune', taxRegistrationNumber: '27AAACE5678G2Z2', currency: 'INR' },
  { id: 'le-sin', code: 'ECV-SIN', name: 'ECOVIS Global Advisory Pte Ltd', country: 'Singapore', city: 'Singapore', taxRegistrationNumber: 'UEN20239999X', currency: 'SGD' },
];

export const INITIAL_SERVICE_CATALOGUE: ServiceTemplate[] = [
  {
    id: 'srv-stat-audit',
    code: 'SRV-AUD-01',
    title: 'Statutory Financial Audit & Tax Filing',
    category: 'Audit & Assurance',
    description: 'Comprehensive statutory audit of financial statements in accordance with applicable accounting standards and statutory regulations.',
    department: 'Audit & Assurance',
    standardHourlyRate: 3500,
    currency: 'INR',
    estimatedDurationDays: 45,
    tags: ['Statutory', 'IFRS', 'Audit', 'Year-End'],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    deliverables: [
      {
        id: 'del-stat-1',
        title: 'Trial Balance & Ledger Verification',
        description: 'Detailed sampling and reconciliation of ledger balances against trial balance and bank statements.',
        estimatedHours: 40,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-stat-1', title: 'Bank Reconciliations Audit', estimatedHours: 12 },
          { id: 'st-stat-2', title: 'Fixed Assets Register Verification', estimatedHours: 14 },
          { id: 'st-stat-3', title: 'Accounts Payable Sampling', estimatedHours: 14 }
        ],
        executionSteps: [
          { id: 'es-1', text: 'Obtain certified Trial Balance' },
          { id: 'es-2', text: 'Perform substantive audit sampling' },
          { id: 'es-3', text: 'Validate closing stock inventory valuation' }
        ]
      },
      {
        id: 'del-stat-2',
        title: 'Statutory Disclosures & Notes Preparation',
        description: 'Drafting mandatory notes on accounts, related party transactions, and contingent liabilities.',
        estimatedHours: 30,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-stat-4', title: 'Related Party Disclosures Review', estimatedHours: 15 },
          { id: 'st-stat-5', title: 'Contingent Liability Assessment', estimatedHours: 15 }
        ],
        executionSteps: [
          { id: 'es-4', text: 'Review board minutes for disclosures' },
          { id: 'es-5', text: 'Formulate CARO reporting points' }
        ]
      },
      {
        id: 'del-stat-3',
        title: 'Independent Auditor Report Issuance',
        description: 'Final sign-off, partner review meeting, and issuance of unmodified/modified audit opinion.',
        estimatedHours: 15,
        priority: 'high',
        requiredRole: 'partner',
        subtasks: [
          { id: 'st-stat-6', title: 'Partner Clearance & Peer Review', estimatedHours: 10 },
          { id: 'st-stat-7', title: 'UDIN Generation & MCA Filing', estimatedHours: 5 }
        ],
        executionSteps: [
          { id: 'es-6', text: 'Conduct closing audit committee presentation' },
          { id: 'es-7', text: 'Sign and generate UDIN certificate' }
        ]
      }
    ]
  },
  {
    id: 'srv-gst-compliance',
    code: 'SRV-TAX-02',
    title: 'Monthly GST Retainer & GSTR-1/3B Compliance',
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
        estimatedHours: 14,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-pay-3', title: 'PF ECR File Generation', estimatedHours: 7 },
          { id: 'st-pay-4', title: 'ESIC & PT Deductions Summary', estimatedHours: 7 }
        ],
        executionSteps: [
          { id: 'es-pay-3', text: 'Generate master bank payment text file' },
          { id: 'es-pay-4', text: 'File PF ECR on EPFO portal' }
        ]
      }
    ]
  },
  {
    id: 'srv-it-soc2',
    code: 'SRV-IT-04',
    title: 'SOC2 Type II & ISO 27001 Security Audit',
    category: 'Digital & IT Audit',
    description: 'In-depth security controls testing, cloud architecture assessment, vulnerability review, and compliance report.',
    department: 'IT & Digital',
    standardHourlyRate: 4800,
    currency: 'INR',
    estimatedDurationDays: 60,
    tags: ['SOC2', 'ISO27001', 'Cybersecurity', 'Cloud Audit'],
    isActive: true,
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2026-02-20T00:00:00Z',
    deliverables: [
      {
        id: 'del-soc-1',
        title: 'Trust Services Criteria Gap Analysis',
        description: 'Evaluate security, availability, and confidentiality policies against SOC2 criteria.',
        estimatedHours: 35,
        priority: 'high',
        requiredRole: 'senior_associate',
        subtasks: [
          { id: 'st-soc-1', title: 'Access Control & IAM Review', estimatedHours: 18 },
          { id: 'st-soc-2', title: 'Encryption & Key Management Audit', estimatedHours: 17 }
        ],
        executionSteps: [
          { id: 'es-soc-1', text: 'Inspect AWS/GCP IAM roles and least-privilege policies' },
          { id: 'es-soc-2', text: 'Review MFA enforcement logs' }
        ]
      },
      {
        id: 'del-soc-2',
        title: 'Evidence Sampling & Continuous Control Testing',
        description: 'Collect 12-month evidence of automated backups, change management tickets, and penetration test remediations.',
        estimatedHours: 45,
        priority: 'high',
        requiredRole: 'manager',
        subtasks: [
          { id: 'st-soc-3', title: 'CI/CD Change Approval Audit', estimatedHours: 20 },
          { id: 'st-soc-4', title: 'Incident Response Drills Review', estimatedHours: 25 }
        ],
        executionSteps: [
          { id: 'es-soc-3', text: 'Pull GitHub PR peer reviews and merge approvals' },
          { id: 'es-soc-4', text: 'Verify automated daily database snapshot retention' }
        ]
      }
    ]
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-tata',
    code: 'CLI-TATA',
    name: 'Tata Consumer Products Ltd',
    industry: 'FMCG & Retail',
    taxId: '27AAACT0001B1Z2',
    contactPerson: 'Vikram Roy',
    contactEmail: 'vikram.roy@tataconsumer.com',
    contactPhone: '+91 22 6665 8282',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001', // Deepa Rathi
    status: 'active',
    onboardingDate: '2024-04-01'
  },
  {
    id: 'cli-rel',
    code: 'CLI-REL',
    name: 'Reliance Digital Life Logistics',
    industry: 'Logistics & Supply Chain',
    taxId: '27AAACR9999K1Z5',
    contactPerson: 'Ananya Sharma',
    contactEmail: 'ananya.sharma@ril.com',
    contactPhone: '+91 22 3555 1000',
    primaryLegalEntityId: 'le-mum',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-06-15'
  },
  {
    id: 'cli-infy',
    code: 'CLI-INFY',
    name: 'Infosys Cloud Platforms Unit',
    industry: 'Information Technology',
    taxId: '29AAACI1111C1Z4',
    contactPerson: 'Karthik Raman',
    contactEmail: 'karthik.raman@infosys.com',
    contactPhone: '+91 80 2852 0261',
    primaryLegalEntityId: 'le-blr',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2024-08-01'
  },
  {
    id: 'cli-adani',
    code: 'CLI-ADANI',
    name: 'Adani Green Solar Assets',
    industry: 'Renewable Energy',
    taxId: '07AAACA4444G1Z9',
    contactPerson: 'Mehul Mehta',
    contactEmail: 'mehul.mehta@adani.com',
    contactPhone: '+91 11 4152 7000',
    primaryLegalEntityId: 'le-del',
    assignedPartnerId: 'EMP001',
    status: 'active',
    onboardingDate: '2025-01-10'
  }
];

export const INITIAL_ENGAGEMENTS: ClientServiceEngagement[] = [
  {
    id: 'eng-tata-audit',
    tenantId: 'tenant-ecovis-global',
    clientId: 'cli-tata',
    serviceId: 'srv-stat-audit',
    servicingLegalEntityId: 'le-mum',
    billingType: 'fixed_fee',
    contractValue: 850000,
    currency: 'INR',
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    selectedTemplateTaskIds: ['del-stat-1', 'del-stat-2', 'del-stat-3'],
    customTasks: [
      {
        id: 'cust-tata-1',
        title: 'Special Supply Chain ESG Compliance Assessment',
        description: 'Client-specific verification of greenhouse gas emissions declarations from major tea packaging vendors.',
        estimatedHours: 25,
        priority: 'high',
        isCustom: true,
        createdAt: '2026-02-15T00:00:00Z',
        subtasks: [
          { id: 'cst-1', title: 'Vendor ESG Certificates Audit', description: 'Review ISO 14001 certs' },
          { id: 'cst-2', title: 'Carbon Offset Receipts Verification' }
        ],
        executionSteps: [
          { id: 'ces-1', text: 'Request Scope 3 documentation from procurement' },
          { id: 'ces-2', text: 'Cross-check against carbon registry' }
        ]
      }
    ],
    collaborators: [
      {
        userId: 'EMP001',
        userName: 'Deepa Rathi',
        userEmail: 'deepa.rathi@ecovis.com',
        homeLegalEntityId: 'le-mum',
        homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        engagementRole: 'engagement_partner',
        allocatedHours: 20
      },
      {
        userId: 'EMP002',
        userName: 'Namita Chaudhary',
        userEmail: 'namita.chaudhary@ecovis.com',
        homeLegalEntityId: 'le-del', // CROSS-LEGAL-ENTITY!
        homeLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
        engagementRole: 'manager',
        allocatedHours: 60
      },
      {
        userId: 'EMP003',
        userName: 'Namdev Malusare',
        userEmail: 'namdev.malusare@ecovis.com',
        homeLegalEntityId: 'le-mum',
        homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        engagementRole: 'senior_associate',
        allocatedHours: 80
      }
    ],
    recurrence: {
      frequency: 'yearly',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      monthOfYear: 3,
      dayOfMonth: 31,
      leadDays: 30,
      isActive: true,
      lastRunAt: '2026-03-01T00:00:00Z',
      nextScheduledDate: '2027-03-01T00:00:00Z'
    },
    notes: 'Key client for western region. Close coordination between Mumbai HQ and New Delhi Branch.',
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z'
  },
  {
    id: 'eng-rel-gst',
    tenantId: 'tenant-ecovis-global',
    clientId: 'cli-rel',
    serviceId: 'srv-gst-compliance',
    servicingLegalEntityId: 'le-mum',
    billingType: 'monthly_retainer',
    contractValue: 90000,
    currency: 'INR',
    status: 'active',
    startDate: '2026-01-01',
    selectedTemplateTaskIds: ['del-gst-1', 'del-gst-2', 'del-gst-3'],
    customTasks: [
      {
        id: 'cust-rel-1',
        title: 'E-Way Bill Geofence Distance Discrepancy Reconciliation',
        description: 'Specific to logistics fleets moving across state borders with e-way bill validity issues.',
        estimatedHours: 15,
        priority: 'medium',
        isCustom: true,
        createdAt: '2026-01-20T00:00:00Z',
        subtasks: [
          { id: 'cst-rel-1', title: 'GPS tracking vs E-Way Bill route check' }
        ],
        executionSteps: [
          { id: 'ces-rel-1', text: 'Obtain transport log file' }
        ]
      }
    ],
    collaborators: [
      {
        userId: 'EMP001',
        userName: 'Deepa Rathi',
        userEmail: 'deepa.rathi@ecovis.com',
        homeLegalEntityId: 'le-mum',
        homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        engagementRole: 'engagement_partner',
        allocatedHours: 10
      },
      {
        userId: 'EMP004',
        userName: 'Sudhir Bhosale',
        userEmail: 'sudhir.bhosale@ecovis.com',
        homeLegalEntityId: 'le-pun', // CROSS-LEGAL-ENTITY!
        homeLegalEntityName: 'ECOVIS Advisory - Pune Regional',
        engagementRole: 'senior_associate',
        allocatedHours: 40
      }
    ],
    recurrence: {
      frequency: 'monthly',
      startDate: '2026-01-01',
      dayOfMonth: 11,
      leadDays: 7,
      isActive: true,
      lastRunAt: '2026-10-04T00:00:00Z',
      nextScheduledDate: '2026-11-04T00:00:00Z'
    },
    notes: 'Monthly compliance retainer. Invoices must be reconciled before the 11th of every month.',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-10-04T00:00:00Z'
  },
  {
    id: 'eng-infy-soc2',
    tenantId: 'tenant-ecovis-global',
    clientId: 'cli-infy',
    serviceId: 'srv-it-soc2',
    servicingLegalEntityId: 'le-blr',
    billingType: 'time_and_materials',
    contractValue: 1200000,
    currency: 'INR',
    status: 'active',
    startDate: '2026-02-01',
    selectedTemplateTaskIds: ['del-soc-1', 'del-soc-2'],
    customTasks: [],
    collaborators: [
      {
        userId: 'EMP001',
        userName: 'Deepa Rathi',
        userEmail: 'deepa.rathi@ecovis.com',
        homeLegalEntityId: 'le-mum', // CROSS-LEGAL-ENTITY LEAD!
        homeLegalEntityName: 'ECOVIS RKCA - Mumbai HQ',
        engagementRole: 'engagement_partner',
        allocatedHours: 25
      },
      {
        userId: 'EMP005',
        userName: 'Mukesh Singh',
        userEmail: 'mukesh.singh@ecovis.com',
        homeLegalEntityId: 'le-blr',
        homeLegalEntityName: 'ECOVIS Digital Solutions - Bengaluru',
        engagementRole: 'manager',
        allocatedHours: 70
      }
    ],
    recurrence: {
      frequency: 'quarterly',
      startDate: '2026-02-01',
      monthOfQuarter: 3,
      dayOfMonth: 30,
      leadDays: 15,
      isActive: true,
      lastRunAt: '2026-09-15T00:00:00Z',
      nextScheduledDate: '2026-12-15T00:00:00Z'
    },
    notes: 'Quarterly continuous compliance testing across AWS and Azure infrastructure.',
    createdAt: '2026-01-28T00:00:00Z',
    updatedAt: '2026-09-15T00:00:00Z'
  }
];

export const INITIAL_TASK_INSTANCES: ServiceTaskInstance[] = [
  {
    id: 'inst-1',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-rel-gst',
    clientId: 'cli-rel',
    clientName: 'Reliance Digital Life Logistics',
    serviceId: 'srv-gst-compliance',
    serviceCode: 'SRV-TAX-02',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskId: 'del-gst-1',
    taskTitle: 'Sales & Outward Supply Data Ingestion (GSTR-1)',
    description: 'Ingest monthly invoices, validate HSN codes, and generate e-invoicing discrepancy report.',
    periodKey: '2026-M10',
    idempotencyKey: 'cli-rel_srv-gst-compliance_del-gst-1_2026-M10',
    dueDate: '2026-10-11T23:59:59Z',
    priority: 'high',
    status: 'completed',
    progress: 100,
    assignedTo: 'Sudhir Bhosale',
    assignedToId: 'EMP004',
    assignedLegalEntityId: 'le-pun',
    isCrossEntity: true,
    contributors: ['Deepa Rathi'],
    subtasks: [
      { id: 'st-inst-1', title: 'B2B Invoice Validation', status: 'completed', assignee: 'Sudhir Bhosale' },
      { id: 'st-inst-2', title: 'B2C and Export Invoices Reconciliation', status: 'completed', assignee: 'Sudhir Bhosale' }
    ],
    executionSteps: [
      { id: 'es-inst-1', text: 'Download ERP Sales register', completed: true },
      { id: 'es-inst-2', text: 'Cross-verify with E-way Bill portal', completed: true }
    ],
    history: [
      { id: 'h-inst-1', user: 'System Recurrence Engine', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', action: 'created', details: 'Task instance spawned for cycle 2026-M10 (Idempotency Key: cli-rel_srv-gst-compliance_del-gst-1_2026-M10)', timestamp: new Date('2026-10-04T00:00:00Z') },
      { id: 'h-inst-2', user: 'Sudhir Bhosale', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', action: 'status_change', details: 'Changed status from in-progress to completed.', timestamp: new Date('2026-10-10T14:30:00Z') }
    ],
    isCustomTask: false,
    estimatedHours: 16,
    actualHours: 15.5,
    createdAt: '2026-10-04T00:00:00Z',
    updatedAt: '2026-10-10T14:30:00Z'
  },
  {
    id: 'inst-2',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-rel-gst',
    clientId: 'cli-rel',
    clientName: 'Reliance Digital Life Logistics',
    serviceId: 'srv-gst-compliance',
    serviceCode: 'SRV-TAX-02',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskId: 'del-gst-2',
    taskTitle: 'GSTR-2B Input Tax Credit (ITC) Reconciliation',
    description: 'Match vendor uploaded invoices against GSTR-2B to maximize eligible credit and identify defaulting suppliers.',
    periodKey: '2026-M10',
    idempotencyKey: 'cli-rel_srv-gst-compliance_del-gst-2_2026-M10',
    dueDate: '2026-10-14T23:59:59Z',
    priority: 'high',
    status: 'in-progress',
    progress: 65,
    assignedTo: 'Sudhir Bhosale',
    assignedToId: 'EMP004',
    assignedLegalEntityId: 'le-pun',
    isCrossEntity: true,
    contributors: ['Deepa Rathi'],
    subtasks: [
      { id: 'st-inst-3', title: 'Auto-drafted ITC 2B Ingestion', status: 'completed', assignee: 'Sudhir Bhosale' },
      { id: 'st-inst-4', title: 'Vendor Discrepancy Notice Drafts', status: 'in-progress', assignee: 'Sudhir Bhosale' }
    ],
    executionSteps: [
      { id: 'es-inst-3', text: 'Run 2B automated matching script', completed: true },
      { id: 'es-inst-4', text: 'Segregate blocked credits under Sec 17(5)', completed: false }
    ],
    history: [
      { id: 'h-inst-3', user: 'System Recurrence Engine', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', action: 'created', details: 'Task instance spawned for cycle 2026-M10', timestamp: new Date('2026-10-04T00:00:00Z') }
    ],
    isCustomTask: false,
    estimatedHours: 20,
    actualHours: 12,
    createdAt: '2026-10-04T00:00:00Z',
    updatedAt: '2026-10-23T11:00:00Z'
  },
  {
    id: 'inst-3',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-rel-gst',
    clientId: 'cli-rel',
    clientName: 'Reliance Digital Life Logistics',
    serviceId: 'srv-gst-compliance',
    serviceCode: 'SRV-TAX-02',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskId: 'cust-rel-1',
    taskTitle: 'E-Way Bill Geofence Distance Discrepancy Reconciliation',
    description: 'Specific to logistics fleets moving across state borders with e-way bill validity issues.',
    periodKey: '2026-M10',
    idempotencyKey: 'cli-rel_srv-gst-compliance_cust-rel-1_2026-M10',
    dueDate: '2026-10-18T23:59:59Z',
    priority: 'medium',
    status: 'in-progress',
    progress: 40,
    assignedTo: 'Sudhir Bhosale',
    assignedToId: 'EMP004',
    assignedLegalEntityId: 'le-pun',
    isCrossEntity: true,
    contributors: [],
    subtasks: [
      { id: 'st-inst-5', title: 'GPS tracking vs E-Way Bill route check', status: 'in-progress', assignee: 'Sudhir Bhosale' }
    ],
    executionSteps: [
      { id: 'es-inst-5', text: 'Obtain transport log file', completed: true }
    ],
    history: [
      { id: 'h-inst-4', user: 'System Recurrence Engine', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', action: 'created', details: 'Custom client task instance spawned for cycle 2026-M10', timestamp: new Date('2026-10-04T00:00:00Z') }
    ],
    isCustomTask: true,
    estimatedHours: 15,
    actualHours: 6,
    createdAt: '2026-10-04T00:00:00Z',
    updatedAt: '2026-10-24T09:00:00Z'
  },
  {
    id: 'inst-4',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-tata-audit',
    clientId: 'cli-tata',
    clientName: 'Tata Consumer Products Ltd',
    serviceId: 'srv-stat-audit',
    serviceCode: 'SRV-AUD-01',
    serviceTitle: 'Statutory Financial Audit & Tax Filing',
    taskId: 'cust-tata-1',
    taskTitle: 'Special Supply Chain ESG Compliance Assessment',
    description: 'Client-specific verification of greenhouse gas emissions declarations from major tea packaging vendors.',
    periodKey: '2026-Q1',
    idempotencyKey: 'cli-tata_srv-stat-audit_cust-tata-1_2026-Q1',
    dueDate: '2026-03-31T23:59:59Z',
    priority: 'high',
    status: 'completed',
    progress: 100,
    assignedTo: 'Namita Chaudhary',
    assignedToId: 'EMP002',
    assignedLegalEntityId: 'le-del',
    isCrossEntity: true,
    contributors: ['Deepa Rathi', 'Namdev Malusare'],
    subtasks: [
      { id: 'st-inst-6', title: 'Vendor ESG Certificates Audit', status: 'completed', assignee: 'Namita Chaudhary' },
      { id: 'st-inst-7', title: 'Carbon Offset Receipts Verification', status: 'completed', assignee: 'Namita Chaudhary' }
    ],
    executionSteps: [
      { id: 'es-inst-6', text: 'Request Scope 3 documentation from procurement', completed: true },
      { id: 'es-inst-7', text: 'Cross-check against carbon registry', completed: true }
    ],
    history: [
      { id: 'h-inst-5', user: 'System Recurrence Engine', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', action: 'created', details: 'Spawned for 2026-Q1', timestamp: new Date('2026-02-15T00:00:00Z') }
    ],
    isCustomTask: true,
    estimatedHours: 25,
    actualHours: 24,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-28T16:00:00Z'
  }
];

export const INITIAL_TIMESHEETS: ServiceTimesheetEntry[] = [
  {
    id: 'ts-1',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-rel-gst',
    clientId: 'cli-rel',
    clientName: 'Reliance Digital Life Logistics',
    serviceId: 'srv-gst-compliance',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskInstanceId: 'inst-1',
    taskTitle: 'Sales & Outward Supply Data Ingestion (GSTR-1)',
    userId: 'EMP004',
    userName: 'Sudhir Bhosale',
    userLegalEntityId: 'le-pun',
    userLegalEntityName: 'ECOVIS Advisory - Pune Regional',
    isCrossEntityCollaboration: true,
    date: '2026-10-09',
    hours: 8,
    isBillable: true,
    hourlyRate: 2800,
    totalBilledAmount: 22400,
    description: 'Cleaned and validated 1,450 outward sales invoices and verified HSN tax rate slabs.',
    status: 'approved',
    submittedAt: '2026-10-09T18:00:00Z',
    approvedBy: 'Deepa Rathi',
    approvedAt: '2026-10-10T10:15:00Z',
    createdAt: '2026-10-09T17:45:00Z',
    history: [
      { id: 'th-1', action: 'submitted', user: 'Sudhir Bhosale', timestamp: '2026-10-09T18:00:00Z' },
      { id: 'th-2', action: 'approved', user: 'Deepa Rathi', timestamp: '2026-10-10T10:15:00Z', note: 'Accurate billing reconciled with client scope.' }
    ]
  },
  {
    id: 'ts-2',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-rel-gst',
    clientId: 'cli-rel',
    clientName: 'Reliance Digital Life Logistics',
    serviceId: 'srv-gst-compliance',
    serviceTitle: 'Monthly GST Retainer & GSTR-1/3B Compliance',
    taskInstanceId: 'inst-2',
    taskTitle: 'GSTR-2B Input Tax Credit (ITC) Reconciliation',
    userId: 'EMP004',
    userName: 'Sudhir Bhosale',
    userLegalEntityId: 'le-pun',
    userLegalEntityName: 'ECOVIS Advisory - Pune Regional',
    isCrossEntityCollaboration: true,
    date: '2026-10-12',
    hours: 6.5,
    isBillable: true,
    hourlyRate: 2800,
    totalBilledAmount: 18200,
    description: 'Ingested GSTR-2B json and matched 820 supplier entries. Drafted notices for 14 missing supplier invoices.',
    status: 'submitted',
    submittedAt: '2026-10-12T19:00:00Z',
    createdAt: '2026-10-12T18:50:00Z',
    history: [
      { id: 'th-3', action: 'submitted', user: 'Sudhir Bhosale', timestamp: '2026-10-12T19:00:00Z' }
    ]
  },
  {
    id: 'ts-3',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-tata-audit',
    clientId: 'cli-tata',
    clientName: 'Tata Consumer Products Ltd',
    serviceId: 'srv-stat-audit',
    serviceTitle: 'Statutory Financial Audit & Tax Filing',
    taskInstanceId: 'inst-4',
    taskTitle: 'Special Supply Chain ESG Compliance Assessment',
    userId: 'EMP002',
    userName: 'Namita Chaudhary',
    userLegalEntityId: 'le-del',
    userLegalEntityName: 'ECOVIS RKCA - New Delhi Branch',
    isCrossEntityCollaboration: true,
    date: '2026-03-24',
    hours: 7.5,
    isBillable: true,
    hourlyRate: 3500,
    totalBilledAmount: 26250,
    description: 'On-site tea packaging emissions inspection and validation of vendor carbon offsets.',
    status: 'approved',
    submittedAt: '2026-03-24T18:00:00Z',
    approvedBy: 'Deepa Rathi',
    approvedAt: '2026-03-25T09:30:00Z',
    createdAt: '2026-03-24T17:30:00Z',
    history: [
      { id: 'th-4', action: 'submitted', user: 'Namita Chaudhary', timestamp: '2026-03-24T18:00:00Z' },
      { id: 'th-5', action: 'approved', user: 'Deepa Rathi', timestamp: '2026-03-25T09:30:00Z' }
    ]
  },
  {
    id: 'ts-4',
    tenantId: 'tenant-ecovis-global',
    engagementId: 'eng-infy-soc2',
    clientId: 'cli-infy',
    clientName: 'Infosys Cloud Platforms Unit',
    serviceId: 'srv-it-soc2',
    serviceTitle: 'SOC2 Type II & ISO 27001 Security Audit',
    taskTitle: 'Trust Services Criteria Gap Analysis',
    userId: 'EMP005',
    userName: 'Mukesh Singh',
    userLegalEntityId: 'le-blr',
    userLegalEntityName: 'ECOVIS Digital Solutions - Bengaluru',
    isCrossEntityCollaboration: false,
    date: '2026-10-20',
    hours: 5,
    isBillable: true,
    hourlyRate: 4800,
    totalBilledAmount: 24000,
    description: 'Verified automated AWS IAM role rotation and review of S3 bucket encryption policies.',
    status: 'submitted',
    submittedAt: '2026-10-20T17:00:00Z',
    createdAt: '2026-10-20T16:45:00Z',
    history: [
      { id: 'th-6', action: 'submitted', user: 'Mukesh Singh', timestamp: '2026-10-20T17:00:00Z' }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: ServiceAuditEntry[] = [
  {
    id: 'aud-1',
    tenantId: 'tenant-ecovis-global',
    timestamp: '2026-10-24T10:00:00Z',
    actorId: 'EMP001',
    actorName: 'Deepa Rathi',
    actorLegalEntity: 'ECOVIS RKCA - Mumbai HQ',
    action: 'ENGAGEMENT_RECURRENCE_TRIGGERED',
    category: 'task_generation',
    targetType: 'client_service_engagement',
    targetId: 'eng-rel-gst',
    details: 'Recurrence run executed for cycle 2026-M10. 3 task instances confirmed with idempotency guarantee.'
  },
  {
    id: 'aud-2',
    tenantId: 'tenant-ecovis-global',
    timestamp: '2026-10-10T10:15:00Z',
    actorId: 'EMP001',
    actorName: 'Deepa Rathi',
    actorLegalEntity: 'ECOVIS RKCA - Mumbai HQ',
    action: 'TIMESHEET_APPROVED',
    category: 'timesheet',
    targetType: 'service_timesheet',
    targetId: 'ts-1',
    details: 'Approved 8.0 billable hours for Sudhir Bhosale (cross-entity: Pune Regional) for client Reliance Digital.'
  },
  {
    id: 'aud-3',
    tenantId: 'tenant-ecovis-global',
    timestamp: '2026-02-15T14:20:00Z',
    actorId: 'EMP001',
    actorName: 'Deepa Rathi',
    actorLegalEntity: 'ECOVIS RKCA - Mumbai HQ',
    action: 'CUSTOM_TASK_ADDED',
    category: 'engagement',
    targetType: 'client_service_engagement',
    targetId: 'eng-tata-audit',
    details: 'Added custom client deliverable "Special Supply Chain ESG Compliance Assessment" without modifying master template SRV-AUD-01.'
  }
];

// --- LOCAL STORAGE REPOSITORY & RECURRENCE ENGINE ---

const STORAGE_KEY_SERVICES = 'ecovis_service_catalogue_v1';
const STORAGE_KEY_ENGAGEMENTS = 'ecovis_client_engagements_v1';
const STORAGE_KEY_CLIENTS = 'ecovis_clients_v1';
const STORAGE_KEY_TASK_INSTANCES = 'ecovis_service_task_instances_v1';
const STORAGE_KEY_TIMESHEETS = 'ecovis_service_timesheets_v1';
const STORAGE_KEY_AUDIT = 'ecovis_service_audit_v1';

class ServiceManagementStore {
  private services: ServiceTemplate[] = [];
  private clients: Client[] = [];
  private engagements: ClientServiceEngagement[] = [];
  private taskInstances: ServiceTaskInstance[] = [];
  private timesheets: ServiceTimesheetEntry[] = [];
  private auditLogs: ServiceAuditEntry[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const s = localStorage.getItem(STORAGE_KEY_SERVICES);
      this.services = s ? JSON.parse(s) : INITIAL_SERVICE_CATALOGUE;

      const c = localStorage.getItem(STORAGE_KEY_CLIENTS);
      this.clients = c ? JSON.parse(c) : INITIAL_CLIENTS;

      const e = localStorage.getItem(STORAGE_KEY_ENGAGEMENTS);
      this.engagements = e ? JSON.parse(e) : INITIAL_ENGAGEMENTS;

      const ti = localStorage.getItem(STORAGE_KEY_TASK_INSTANCES);
      this.taskInstances = ti ? JSON.parse(ti) : INITIAL_TASK_INSTANCES;

      const ts = localStorage.getItem(STORAGE_KEY_TIMESHEETS);
      this.timesheets = ts ? JSON.parse(ts) : INITIAL_TIMESHEETS;

      const aud = localStorage.getItem(STORAGE_KEY_AUDIT);
      this.auditLogs = aud ? JSON.parse(aud) : INITIAL_AUDIT_LOGS;
    } catch {
      this.services = [...INITIAL_SERVICE_CATALOGUE];
      this.clients = [...INITIAL_CLIENTS];
      this.engagements = [...INITIAL_ENGAGEMENTS];
      this.taskInstances = [...INITIAL_TASK_INSTANCES];
      this.timesheets = [...INITIAL_TIMESHEETS];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_SERVICES, JSON.stringify(this.services));
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(this.clients));
      localStorage.setItem(STORAGE_KEY_ENGAGEMENTS, JSON.stringify(this.engagements));
      localStorage.setItem(STORAGE_KEY_TASK_INSTANCES, JSON.stringify(this.taskInstances));
      localStorage.setItem(STORAGE_KEY_TIMESHEETS, JSON.stringify(this.timesheets));
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditLogs));
    } catch {
      // storage quota or private mode fallback
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // --- GETTERS ---
  public getServices(): ServiceTemplate[] { return [...this.services]; }
  public getClients(): Client[] { return [...this.clients]; }
  public getEngagements(): ClientServiceEngagement[] { return [...this.engagements]; }
  public getTaskInstances(): ServiceTaskInstance[] { return [...this.taskInstances]; }
  public getTimesheets(): ServiceTimesheetEntry[] { return [...this.timesheets]; }
  public getAuditLogs(): ServiceAuditEntry[] { return [...this.auditLogs]; }
  public getLegalEntities(): LegalEntity[] { return [...INITIAL_LEGAL_ENTITIES]; }

  // --- SERVICE CATALOGUE OPERATIONS (Tenant Level, Independent of Legal Entity) ---
  public addService(service: Omit<ServiceTemplate, 'id' | 'createdAt' | 'updatedAt'>, actor: { id: string; name: string; entity: string }): ServiceTemplate {
    const newService: ServiceTemplate = {
      ...service,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.services.unshift(newService);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'SERVICE_CATALOGUE_CREATED',
      category: 'catalogue',
      targetType: 'service_template',
      targetId: newService.id,
      details: `Added new service master "${newService.title}" (${newService.code}) under category ${newService.category}.`
    });
    this.saveState();
    return newService;
  }

  public updateService(id: string, updates: Partial<ServiceTemplate>, actor: { id: string; name: string; entity: string }): void {
    this.services = this.services.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'SERVICE_CATALOGUE_UPDATED',
      category: 'catalogue',
      targetType: 'service_template',
      targetId: id,
      details: `Updated service master template ${id}.`
    });
    this.saveState();
  }

  // --- CLIENT OPERATIONS ---
  public addClient(client: Omit<Client, 'id' | 'onboardingDate'>, actor: { id: string; name: string; entity: string }): Client {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`,
      onboardingDate: new Date().toISOString().split('T')[0],
    };
    this.clients.unshift(newClient);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'CLIENT_ONBOARDED',
      category: 'access',
      targetType: 'client',
      targetId: newClient.id,
      details: `Onboarded client "${newClient.name}" (${newClient.code}).`
    });
    this.saveState();
    return newClient;
  }

  // --- CLIENT ENGAGEMENT OPERATIONS (Assign Services & Cross-Legal-Entity Collaboration) ---
  public addEngagement(engagement: Omit<ClientServiceEngagement, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>, actor: { id: string; name: string; entity: string }): ClientServiceEngagement {
    const newEngagement: ClientServiceEngagement = {
      ...engagement,
      id: `eng-${Date.now()}`,
      tenantId: 'tenant-ecovis-global',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.engagements.unshift(newEngagement);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'ENGAGEMENT_CREATED',
      category: 'engagement',
      targetType: 'client_service_engagement',
      targetId: newEngagement.id,
      details: `Created service subscription for Client ID ${newEngagement.clientId} with ${newEngagement.selectedTemplateTaskIds.length} selected tasks and ${newEngagement.collaborators.length} cross-entity collaborators.`
    });
    this.saveState();

    // Auto-generate initial task instances for current period
    this.generateRecurringTasksForEngagement(newEngagement.id, actor);
    return newEngagement;
  }

  public updateEngagement(id: string, updates: Partial<ClientServiceEngagement>, actor: { id: string; name: string; entity: string }): void {
    this.engagements = this.engagements.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e);
    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'ENGAGEMENT_UPDATED',
      category: 'engagement',
      targetType: 'client_service_engagement',
      targetId: id,
      details: `Safe update to client engagement ${id}. Preserved historical instances.`
    });
    this.saveState();
  }

  // --- BESPOKE CLIENT CUSTOM TASKS (Without Modifying Master Template) ---
  public addCustomTaskToEngagement(
    engagementId: string,
    customTask: Omit<CustomClientTask, 'id' | 'isCustom' | 'createdAt'>,
    actor: { id: string; name: string; entity: string }
  ): CustomClientTask {
    const newTask: CustomClientTask = {
      ...customTask,
      id: `cust-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const engagement = this.engagements.find(e => e.id === engagementId);
    if (!engagement) throw new Error('Engagement not found');

    const updatedCustom = [...(engagement.customTasks || []), newTask];
    this.updateEngagement(engagementId, { customTasks: updatedCustom }, actor);

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'CUSTOM_TASK_ADDED',
      category: 'engagement',
      targetType: 'client_service_engagement',
      targetId: engagementId,
      details: `Added custom deliverable "${newTask.title}" directly to client engagement without changing master template.`
    });

    // Also spawn a task instance for the current active cycle
    const currentPeriodKey = this.computePeriodKey(engagement.recurrence.frequency, new Date());
    this.spawnTaskInstance(
      engagement,
      newTask.id,
      newTask.title,
      newTask.description,
      newTask.priority,
      newTask.estimatedHours,
      currentPeriodKey,
      true,
      newTask.subtasks.map(st => ({
        id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: st.title,
        status: 'pending',
        assignee: engagement.collaborators[0]?.userName || 'Unassigned'
      })),
      newTask.executionSteps.map(es => ({
        id: `es-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: es.text,
        completed: false
      }))
    );

    return newTask;
  }

  // --- RECURRENCE ENGINE WITH IDEMPOTENCY ---
  /**
   * Generates task instances for an engagement for a target period.
   * Guarantees idempotency via `idempotencyKey = ${clientId}_${serviceId}_${taskId}_${periodKey}`.
   */
  public generateRecurringTasksForEngagement(
    engagementId: string,
    actor: { id: string; name: string; entity: string },
    forcedPeriodKey?: string
  ): { spawnedCount: number; skippedCount: number; periodKey: string } {
    const engagement = this.engagements.find(e => e.id === engagementId);
    if (!engagement) return { spawnedCount: 0, skippedCount: 0, periodKey: 'NONE' };

    const service = this.services.find(s => s.id === engagement.serviceId);
    if (!service) return { spawnedCount: 0, skippedCount: 0, periodKey: 'NONE' };

    const periodKey = forcedPeriodKey || this.computePeriodKey(engagement.recurrence.frequency, new Date());
    let spawnedCount = 0;
    let skippedCount = 0;

    // 1. Process Standard Deliverables that were selected for this client
    for (const deliverableId of engagement.selectedTemplateTaskIds) {
      const templateTask = service.deliverables.find(d => d.id === deliverableId);
      if (!templateTask) continue;

      const idempotencyKey = `${engagement.clientId}_${engagement.serviceId}_${templateTask.id}_${periodKey}`;
      const existing = this.taskInstances.find(t => t.idempotencyKey === idempotencyKey);

      if (existing) {
        skippedCount++;
        continue;
      }

      this.spawnTaskInstance(
        engagement,
        templateTask.id,
        templateTask.title,
        templateTask.description,
        templateTask.priority,
        templateTask.estimatedHours,
        periodKey,
        false,
        templateTask.subtasks.map(st => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: st.title,
          status: 'pending',
          assignee: engagement.collaborators[0]?.userName || 'Unassigned'
        })),
        templateTask.executionSteps.map(es => ({
          id: `es-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: es.text,
          completed: false
        }))
      );
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

      this.spawnTaskInstance(
        engagement,
        customTask.id,
        customTask.title,
        customTask.description,
        customTask.priority,
        customTask.estimatedHours,
        periodKey,
        true,
        customTask.subtasks.map(st => ({
          id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: st.title,
          status: 'pending',
          assignee: engagement.collaborators[0]?.userName || 'Unassigned'
        })),
        customTask.executionSteps.map(es => ({
          id: `es-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: es.text,
          completed: false
        }))
      );
      spawnedCount++;
    }

    // Update engagement's last run timestamp
    this.engagements = this.engagements.map(e => e.id === engagementId ? {
      ...e,
      recurrence: {
        ...e.recurrence,
        lastRunAt: new Date().toISOString()
      }
    } : e);

    this.logAudit({
      actorId: actor.id,
      actorName: actor.name,
      actorLegalEntity: actor.entity,
      action: 'RECURRING_TASKS_DISPATCHED',
      category: 'task_generation',
      targetType: 'client_service_engagement',
      targetId: engagementId,
      details: `Generated recurring cycle ${periodKey}: spawned ${spawnedCount} new task instances, skipped ${skippedCount} duplicates via idempotency keys.`
    });

    this.saveState();
    return { spawnedCount, skippedCount, periodKey };
  }

  private spawnTaskInstance(
    engagement: ClientServiceEngagement,
    taskId: string,
    taskTitle: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    estimatedHours: number,
    periodKey: string,
    isCustomTask: boolean,
    subtasks: SubTask[],
    executionSteps: ExecutionStep[]
  ) {
    const client = this.clients.find(c => c.id === engagement.clientId);
    const service = this.services.find(s => s.id === engagement.serviceId);
    const primaryCollaborator = engagement.collaborators[0];

    const isCrossEntity = primaryCollaborator
      ? primaryCollaborator.homeLegalEntityId !== engagement.servicingLegalEntityId
      : false;

    const dueDate = this.computeDueDate(engagement.recurrence, periodKey);

    const instance: ServiceTaskInstance = {
      id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tenantId: 'tenant-ecovis-global',
      engagementId: engagement.id,
      clientId: engagement.clientId,
      serviceId: engagement.serviceId,
      serviceCode: service?.code || 'SRV-GEN',
      serviceTitle: service?.title || 'General Service',
      clientName: client?.name || 'Client',
      taskId,
      taskTitle,
      description,
      periodKey,
      idempotencyKey: `${engagement.clientId}_${engagement.serviceId}_${taskId}_${periodKey}`,
      dueDate,
      priority,
      status: 'pending',
      progress: 0,
      assignedTo: primaryCollaborator?.userName || 'Deepa Rathi',
      assignedToId: primaryCollaborator?.userId || 'EMP001',
      assignedLegalEntityId: primaryCollaborator?.homeLegalEntityId || engagement.servicingLegalEntityId,
      isCrossEntity,
      contributors: engagement.collaborators.slice(1).map(c => c.userName),
      subtasks,
      executionSteps,
      isCustomTask,
      estimatedHours,
      actualHours: 0,
      history: [
        {
          id: `h-${Date.now()}`,
          user: 'Recurrence Dispatcher',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          action: 'created',
          details: `Spawned for recurring period ${periodKey} (Due: ${dueDate.split('T')[0]})`,
          timestamp: new Date()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.taskInstances.unshift(instance);
  }

  public updateTaskInstance(id: string, updates: Partial<ServiceTaskInstance>, actor: { id: string; name: string }): void {
    this.taskInstances = this.taskInstances.map(t => {
      if (t.id !== id) return t;
      const historyEntry: TaskHistory = {
        id: `h-${Date.now()}`,
        user: actor.name,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        action: updates.status ? 'status_change' : 'commented',
        details: updates.status ? `Status changed to ${updates.status}` : 'Task details updated',
        timestamp: new Date()
      };
      return {
        ...t,
        ...updates,
        history: [historyEntry, ...(t.history || [])],
        updatedAt: new Date().toISOString()
      };
    });
    this.saveState();
  }

  // --- CLIENT-SPECIFIC TIMESHEET OPERATIONS ---
  public logTimesheet(entry: Omit<ServiceTimesheetEntry, 'id' | 'tenantId' | 'totalBilledAmount' | 'status' | 'createdAt' | 'history'>, actor: { id: string; name: string; entity: string }): ServiceTimesheetEntry {
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

    // Also increment actual hours on task instance if linked
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
      details: `Logged ${newEntry.hours} hrs for client "${newEntry.clientName}" on task "${newEntry.taskTitle}". Cross-Entity: ${newEntry.isCrossEntityCollaboration}`
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

  // --- AUDIT LOGGER ---
  private logAudit(entry: Omit<ServiceAuditEntry, 'id' | 'tenantId' | 'timestamp'>) {
    const log: ServiceAuditEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tenantId: 'tenant-ecovis-global',
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
  }

  // --- PERIOD & DUE DATE CALCULATION UTILITIES ---
  public computePeriodKey(frequency: RecurrenceFrequency, date: Date): string {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    switch (frequency) {
      case 'daily':
        return `${y}-D${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;
      case 'weekly': {
        const firstDayOfYear = new Date(y, 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        return `${y}-W${String(weekNum).padStart(2, '0')}`;
      }
      case 'monthly':
        return `${y}-M${String(m).padStart(2, '0')}`;
      case 'quarterly': {
        const q = Math.ceil(m / 3);
        return `${y}-Q${q}`;
      }
      case 'yearly':
        return `${y}-FY`;
      case 'one-off':
      default:
        return 'ONE-OFF';
    }
  }

  private computeDueDate(recurrence: RecurrenceConfig, periodKey: string): string {
    const now = new Date();
    const targetDay = recurrence.dayOfMonth || 15;

    if (periodKey.includes('-M')) {
      const parts = periodKey.split('-M');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const due = new Date(year, month, targetDay, 23, 59, 59);
      return due.toISOString();
    }

    if (periodKey.includes('-Q')) {
      const parts = periodKey.split('-Q');
      const year = parseInt(parts[0], 10);
      const quarter = parseInt(parts[1], 10);
      const month = (quarter * 3) - 1; // End of quarter
      const due = new Date(year, month, targetDay, 23, 59, 59);
      return due.toISOString();
    }

    if (periodKey.includes('-FY')) {
      const year = parseInt(periodKey.split('-FY')[0], 10);
      const due = new Date(year, 2, 31, 23, 59, 59); // March 31
      return due.toISOString();
    }

    // Default 7 days from now
    const d = new Date(now.getTime() + 7 * 86400000);
    return d.toISOString();
  }

  public runAllRecurrences(actor: { id: string; name: string; entity: string }): { totalSpawned: number; totalSkipped: number; details: string[] } {
    let totalSpawned = 0;
    let totalSkipped = 0;
    const details: string[] = [];

    this.engagements.filter(e => e.status === 'active' && e.recurrence.isActive).forEach(eng => {
      const res = this.generateRecurringTasksForEngagement(eng.id, actor);
      totalSpawned += res.spawnedCount;
      totalSkipped += res.skippedCount;
      const client = this.clients.find(c => c.id === eng.clientId);
      details.push(`${client?.name || eng.clientId}: spawned ${res.spawnedCount}, skipped ${res.skippedCount} (${res.periodKey})`);
    });

    return { totalSpawned, totalSkipped, details };
  }

  public resetToSampleData() {
    this.services = [...INITIAL_SERVICE_CATALOGUE];
    this.clients = [...INITIAL_CLIENTS];
    this.engagements = [...INITIAL_ENGAGEMENTS];
    this.taskInstances = [...INITIAL_TASK_INSTANCES];
    this.timesheets = [...INITIAL_TIMESHEETS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.saveState();
  }
}

export const serviceManagementStore = new ServiceManagementStore();
