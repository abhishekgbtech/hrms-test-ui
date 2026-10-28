import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  Search,
  X,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Folder,
  Shield,
  Users,
  Check,
  AlertTriangle,
  Info,
  Download,
  Layers,
  Table,
  RotateCcw,
  ChevronRight,
  ExternalLink,
  Building2,
  UserCheck
} from 'lucide-react';
import { employeesData, EmployeeData } from '../data/employeesData';

// --- DATA STRUCTURES FROM REFERENCE ---

export interface PermissionNode {
  id: string;
  name: string;
  key?: string;
  type: 'root' | 'role' | 'module' | 'permission';
  scope?: string;
  color?: string;
  description?: string;
  meaning?: string;
  roles?: string[];
  rules?: string[];
  children?: PermissionNode[];
  _children?: PermissionNode[] | null;
}

export const hrmsHierarchyData: PermissionNode = {
  id: "root",
  name: "Tenant System Root",
  type: "root",
  scope: "Tenant-Wide",
  color: "#8b5cf6",
  children: [
    {
      id: "super_admin",
      name: "Super Admin",
      type: "role",
      scope: "Tenant-Wide (Break-Glass)",
      color: "#a855f7",
      description: "Platform-level administrator with complete break-glass access to every module and settings.",
      children: [
        {
          id: "sa_config",
          name: "Platform Config & Tenant Setup",
          type: "module",
          children: [
            {
              id: "sa_cfg_1",
              name: "Notification Templates Authoring",
              key: "cfg:notification:write",
              type: "permission",
              meaning: "Author text and triggers for system-wide notifications and scheduled email alerts.",
              scope: "Tenant-wide",
              roles: ["Super Admin"],
              rules: ["Super Admin exclusive feature.", "Directly updates core templates across all entities."]
            },
            {
              id: "sa_cfg_2",
              name: "Tenant System Settings",
              key: "cfg:system:manage",
              type: "permission",
              meaning: "Configure release modes, global OT multipliers, feature gates, and system security flags.",
              scope: "Tenant-wide",
              roles: ["Super Admin"],
              rules: ["Changes take effect tenant-wide immediately.", "Requires dual-factor authentication on production."]
            }
          ]
        },
        {
          id: "sa_roles",
          name: "Users & Custom Roles",
          type: "module",
          children: [
            {
              id: "sa_role_1",
              name: "Custom Role Builder",
              key: "role:custom:build",
              type: "permission",
              meaning: "Build tailored permission bundles when no baseline role fits exact organizational needs.",
              scope: "Tenant-wide",
              roles: ["Super Admin"],
              rules: ["Allows creating Expense Approver, Compliance Auditor, and specialized entity roles.", "Changes audited in immutable ledger."]
            }
          ]
        }
      ]
    },
    {
      id: "admin",
      name: "Tenant Admin",
      type: "role",
      scope: "Legal Entity Scope",
      color: "#3b82f6",
      description: "Org-structure, business units, branches, and statutory registration manager.",
      children: [
        {
          id: "adm_org",
          name: "Organization Architecture",
          type: "module",
          children: [
            {
              id: "adm_org_1",
              name: "Legal Entity CRUD",
              key: "org:legal_entity:manage",
              type: "permission",
              meaning: "Create, update, and manage legal corporate entities and subsidiaries.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Admin"],
              rules: ["Prerequisite for all employee master records and bank disbursement channels."]
            },
            {
              id: "adm_org_2",
              name: "Cost Center & Org Units",
              key: "org:unit:manage",
              type: "permission",
              meaning: "Build departments, branches, divisions, and cost centers.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Admin"],
              rules: ["Cost Centers automatically route expense approvals and departmental budget rollups."]
            }
          ]
        },
        {
          id: "adm_statutory",
          name: "Statutory Setup",
          type: "module",
          children: [
            {
              id: "adm_stat_1",
              name: "Statutory Rule Versioning",
              key: "statutory:rule:manage",
              type: "permission",
              meaning: "Configure PF, ESIC, Professional Tax, and TDS deduction parameters and tables.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Admin"],
              rules: ["Approved statutory rules feed payroll calculation engine directly."]
            }
          ]
        }
      ]
    },
    {
      id: "hr",
      name: "HR Manager",
      type: "role",
      scope: "Legal Entity Scope",
      color: "#06b6d4",
      description: "Broadest operational role managing full employee lifecycle, compensation, and leave policies.",
      children: [
        {
          id: "hr_emp",
          name: "Employee Lifecycle & Onboarding",
          type: "module",
          children: [
            {
              id: "hr_emp_1",
              name: "New Hire Onboarding",
              key: "employee:onboard:execute",
              type: "permission",
              meaning: "Create Employee Master records via manual form, bulk upload, or offer conversion.",
              scope: "Legal Entity",
              roles: ["Super Admin", "HR"],
              rules: ["Sole entrance into the Employee Master.", "Enforces mandatory tax ID verification before activation."]
            },
            {
              id: "hr_emp_2",
              name: "Statutory ID Unmask",
              key: "employee:id:reveal",
              type: "permission",
              meaning: "Reveal masked PAN, Aadhaar/UAN, and Bank account numbers for verification.",
              scope: "Legal Entity",
              roles: ["Super Admin", "HR", "Payroll Admin"],
              rules: ["Audited action logged with millisecond timestamp & user IP address."]
            }
          ]
        },
        {
          id: "hr_comp",
          name: "Compensation Management",
          type: "module",
          children: [
            {
              id: "hr_comp_1",
              name: "Submit Compensation Revision",
              key: "comp:revision:submit",
              type: "permission",
              meaning: "Propose salary component revisions, promotions, and bonus payouts for employees.",
              scope: "Legal Entity",
              roles: ["Super Admin", "HR"],
              rules: ["Must be approved by business head or payroll admin before taking effect."]
            },
            {
              id: "hr_comp_2",
              name: "Approve Compensation Revision",
              key: "comp:revision:approve",
              type: "permission",
              meaning: "Approve proposed salary structure revisions and benefits allocations.",
              scope: "Legal Entity",
              roles: ["Super Admin", "HR", "Payroll Admin"],
              rules: ["Supersedes existing active pay structure effective from the specified cycle."]
            }
          ]
        },
        {
          id: "hr_payroll_signoff",
          name: "Payroll Sign-Off",
          type: "module",
          children: [
            {
              id: "hr_pay_sign",
              name: "Approve Payroll Run",
              key: "payroll:run:approve",
              type: "permission",
              meaning: "Sign off on calculated monthly payroll runs after statutory reconciliation.",
              scope: "Legal Entity",
              roles: ["Super Admin", "HR", "Payroll Admin"],
              rules: ["HR can approve runs, but CANNOT execute/compute payroll runs (separation of duties)."]
            }
          ]
        }
      ]
    },
    {
      id: "payroll_admin",
      name: "Payroll Administrator",
      type: "role",
      scope: "Legal Entity Scope",
      color: "#10b981",
      description: "Dedicated execution role for monthly payroll calculations, deductions, and payslips.",
      children: [
        {
          id: "pay_exec",
          name: "Payroll Processing Engine",
          type: "module",
          children: [
            {
              id: "pay_exec_1",
              name: "Create & Compute Payroll Run",
              key: "payroll:run:create",
              type: "permission",
              meaning: "Initiate and execute monthly payroll computations across all legal units.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Payroll Admin"],
              rules: ["HR role cannot create runs (segregation of duty enforcement)."]
            },
            {
              id: "pay_exec_2",
              name: "Generate & Release Payslips",
              key: "payroll:payslip:release",
              type: "permission",
              meaning: "Produce employee payslips and publish them to individual employee self-service portals.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Payroll Admin"],
              rules: ["Requires HR sign-off if release gating is activated in Tenant Settings."]
            }
          ]
        }
      ]
    },
    {
      id: "finance",
      name: "Accountant / Finance",
      type: "role",
      scope: "Legal Entity Scope",
      color: "#84cc16",
      description: "Disbursement confirmation, bank file exports, Form 16, and expense reimbursement payouts.",
      children: [
        {
          id: "fin_disburse",
          name: "Disbursement & Accounting",
          type: "module",
          children: [
            {
              id: "fin_dis_1",
              name: "Mark Payroll as Paid",
              key: "payroll:disburse:mark_paid",
              type: "permission",
              meaning: "Confirm bank disbursement status and reconcile payroll against general ledger.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Payroll Admin", "Finance"],
              rules: ["Cannot approve payroll runs; strictly executes payment confirmation."]
            },
            {
              id: "fin_dis_2",
              name: "Form 16 Tax File Generation",
              key: "tax:form16:generate",
              type: "permission",
              meaning: "Generate year-end Form 16 Part A/B certificates for filing.",
              scope: "Legal Entity",
              roles: ["Super Admin", "Finance", "Payroll Admin"],
              rules: ["Requires all 12 monthly runs in financial year to be marked approved and locked."]
            }
          ]
        }
      ]
    },
    {
      id: "manager",
      name: "People Manager",
      type: "role",
      scope: "Department / Direct Reports",
      color: "#14b8a6",
      description: "Line manager overseeing team attendance, leave approvals, shifts, and timesheets.",
      children: [
        {
          id: "mgr_approvals",
          name: "Team Approvals Queue",
          type: "module",
          children: [
            {
              id: "mgr_app_1",
              name: "Approve Team Leave",
              key: "leave:request:approve",
              type: "permission",
              meaning: "Approve or reject time off and casual/sick leave requests for direct reports.",
              scope: "Direct Reports",
              roles: ["Super Admin", "HR", "Manager"],
              rules: ["Self-approval blocked outright. Debits leave balance upon final approval."]
            },
            {
              id: "mgr_app_2",
              name: "Attendance Regularization Approve",
              key: "attendance:regularize:approve",
              type: "permission",
              meaning: "Approve biometric punch correction and missed clock-in/out requests.",
              scope: "Direct Reports",
              roles: ["Super Admin", "HR", "Manager"],
              rules: ["Self-approval blocked outright. Automatically recalibrates overtime hours."]
            },
            {
              id: "mgr_app_3",
              name: "Edit Team Timesheet",
              key: "timesheet:entry:edit",
              type: "permission",
              meaning: "Modify team member timesheet records before final project cost submission.",
              scope: "Direct Reports",
              roles: ["Manager"],
              rules: ["Editing an Approved entry forces status back to Submitted for re-approval."]
            }
          ]
        }
      ]
    },
    {
      id: "project_manager",
      name: "Project Manager",
      type: "role",
      scope: "Assigned Project Scope",
      color: "#0284c7",
      description: "Scope minted per assigned project to manage tasks, milestones, and project timesheets.",
      children: [
        {
          id: "pm_workspace",
          name: "Project & Task Management",
          type: "module",
          children: [
            {
              id: "pm_ws_1",
              name: "Approve Project Timesheet",
              key: "timesheet:project:approve",
              type: "permission",
              meaning: "Approve billable hours logged against assigned client project.",
              scope: "Assigned Project",
              roles: ["Super Admin", "HR", "Project Manager"],
              rules: ["Feeds project cost calculation and client billing invoices."]
            },
            {
              id: "pm_ws_2",
              name: "Approve / Reject Task",
              key: "task:review:approve",
              type: "permission",
              meaning: "Mark task milestone completed or request rework with feedback.",
              scope: "Assigned Project",
              roles: ["Super Admin", "Project Manager"],
              rules: ["Assignee self-approval is restricted on UI."]
            }
          ]
        }
      ]
    },
    {
      id: "employee",
      name: "Employee Baseline",
      type: "role",
      scope: "Self Scope Only",
      color: "#f59e0b",
      description: "Universal baseline access granted to every active login for self-service.",
      children: [
        {
          id: "emp_self",
          name: "My Workspace Self-Service",
          type: "module",
          children: [
            {
              id: "emp_sf_1",
              name: "Punch Attendance",
              key: "attendance:punch:self",
              type: "permission",
              meaning: "Record daily clock-in/out timestamps with geofence verification.",
              scope: "Self",
              roles: ["Employee (All)"],
              rules: ["Geofenced if enabled by Office Management policy."]
            },
            {
              id: "emp_sf_2",
              name: "Apply Leave",
              key: "leave:request:create",
              type: "permission",
              meaning: "Submit personal leave requests with attachments and reason.",
              scope: "Self",
              roles: ["Employee (All)"],
              rules: ["Triggers manager notification and locks concurrent dates."]
            },
            {
              id: "emp_sf_3",
              name: "File Expense Claim",
              key: "expense:claim:create",
              type: "permission",
              meaning: "Submit reimbursement claims with receipts, category, and tax breakdown.",
              scope: "Self",
              roles: ["Employee (All)"],
              rules: ["Drafts remain strictly private to employee until submitted to Cost Center approver."]
            }
          ]
        }
      ]
    },
    {
      id: "expense_approver",
      name: "Expense Approver (Custom)",
      type: "role",
      scope: "Cost Center Scope",
      color: "#ec4899",
      description: "Tenant-built custom role required to approve expense claims for a cost center.",
      children: [
        {
          id: "exp_app_mod",
          name: "Expense Inbox",
          type: "module",
          children: [
            {
              id: "exp_app_1",
              name: "Approve Expense Claim",
              key: "expense:claim:approve",
              type: "permission",
              meaning: "Approve reimbursement claims within assigned cost center spending thresholds.",
              scope: "Cost Center",
              roles: ["Super Admin", "Expense Approver"],
              rules: ["Must be configured by Tenant Admin under Organization Units."]
            }
          ]
        }
      ]
    },
    {
      id: "auditor",
      name: "Auditor",
      type: "role",
      scope: "Tenant-Wide Audit Log",
      color: "#64748b",
      description: "Read-only compliance reviewer for security audits and ISO/statutory oversight.",
      children: [
        {
          id: "aud_mod",
          name: "Audit & Compliance",
          type: "module",
          children: [
            {
              id: "aud_1",
              name: "View Audit Log",
              key: "audit:log:view",
              type: "permission",
              meaning: "Inspect system audit trails, access logs, and export security reports.",
              scope: "Tenant-wide",
              roles: ["Super Admin", "Auditor"],
              rules: ["Strictly read-only access; write or delete operations are disabled at engine level."]
            }
          ]
        }
      ]
    }
  ]
};

// Matrix Data from reference
export const matrixData = [
  { module: "Organization Setup", feature: "Legal Entity / Org Unit Management", key: "org:manage", permissions: { super_admin: "FULL", admin: "FULL", hr: "VIEW", payroll_admin: "NONE", finance: "NONE", manager: "NONE", project_manager: "NONE", recruiter: "NONE", employee: "NONE", auditor: "VIEW" } },
  { module: "Users & Roles", feature: "Create Users & Custom Roles", key: "role:manage", permissions: { super_admin: "FULL", admin: "CREATE", hr: "NONE", payroll_admin: "NONE", finance: "NONE", manager: "NONE", project_manager: "NONE", recruiter: "NONE", employee: "NONE", auditor: "VIEW" } },
  { module: "Employee Master", feature: "Employee Profile Lifecycle", key: "employee:profile", permissions: { super_admin: "FULL", admin: "NONE", hr: "FULL", payroll_admin: "VIEW", finance: "NONE", manager: "TEAM VIEW", project_manager: "NONE", recruiter: "NONE", employee: "SELF VIEW", auditor: "VIEW" } },
  { module: "Attendance", feature: "Punch / Regularization Approval", key: "attendance:regularize", permissions: { super_admin: "FULL", admin: "NONE", hr: "FULL", payroll_admin: "NONE", finance: "NONE", manager: "APPROVE", project_manager: "NONE", recruiter: "NONE", employee: "PUNCH/FILE", auditor: "VIEW" } },
  { module: "Leave", feature: "Leave Request & Approval", key: "leave:request", permissions: { super_admin: "FULL", admin: "NONE", hr: "FULL", payroll_admin: "NONE", finance: "NONE", manager: "APPROVE", project_manager: "NONE", recruiter: "NONE", employee: "APPLY", auditor: "VIEW" } },
  { module: "Compensation", feature: "Salary Structure Revisions", key: "comp:revision", permissions: { super_admin: "FULL", admin: "NONE", hr: "SUBMIT/APPROVE", payroll_admin: "APPROVE", finance: "NONE", manager: "NONE", project_manager: "NONE", recruiter: "NONE", employee: "NONE", auditor: "VIEW" } },
  { module: "Payroll Runs", feature: "Create & Execute Payroll Runs", key: "payroll:run:create", permissions: { super_admin: "FULL", admin: "NONE", hr: "SIGN-OFF ONLY", payroll_admin: "FULL", finance: "MARK PAID", manager: "NONE", project_manager: "NONE", recruiter: "NONE", employee: "PAYSLIP VIEW", auditor: "VIEW" } },
  { module: "Timesheets", feature: "Log & Approve Timesheets", key: "timesheet:entry", permissions: { super_admin: "FULL", admin: "NONE", hr: "EXPORT", payroll_admin: "NONE", finance: "NONE", manager: "EDIT TEAM", project_manager: "APPROVE", recruiter: "NONE", employee: "LOG/SUBMIT", auditor: "VIEW" } },
  { module: "Expense Claims", feature: "Submit & Approve Expenses", key: "expense:claim", permissions: { super_admin: "FULL", admin: "NONE", hr: "NONE", payroll_admin: "REIMBURSE", finance: "PROCESS", manager: "NONE", project_manager: "NONE", recruiter: "NONE", employee: "SUBMIT", auditor: "VIEW" } },
  { module: "Recruitment", feature: "Requisition & Offer Lifecycle", key: "recruitment:offer", permissions: { super_admin: "FULL", admin: "NONE", hr: "VIEW", payroll_admin: "NONE", finance: "NONE", manager: "NONE", project_manager: "NONE", recruiter: "FULL", employee: "NONE", auditor: "VIEW" } }
];

export default function OrgHierarchy() {
  const [activeTab, setActiveTab] = useState<'mindmap' | 'matrix' | 'reporting'>('mindmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<PermissionNode | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [matrixFilter, setMatrixFilter] = useState('ALL');
  const [reportingSearch, setReportingSearch] = useState('');
  const [reportingRoleFilter, setReportingRoleFilter] = useState('ALL');

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const rootNodeRef = useRef<d3.HierarchyNode<PermissionNode> | null>(null);

  // Grouped employees for Reporting Hierarchy view
  const reportingHierarchy = useMemo(() => {
    const businessHead = employeesData.find(e => e.primary_role === 'business_head') || employeesData[0];
    const admins = employeesData.filter(e => e.primary_role === 'admin' && e.employee_id !== businessHead.employee_id);
    const hrs = employeesData.filter(e => e.primary_role === 'hr');
    const managers = employeesData.filter(e => e.primary_role === 'manager');
    const regularEmployees = employeesData.filter(e => e.primary_role === 'employee');

    return {
      businessHead,
      admins,
      hrs,
      managers,
      regularEmployees,
      totalCount: employeesData.length,
      activeCount: employeesData.filter(e => e.status === 'active').length,
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    return employeesData.filter(emp => {
      const matchSearch =
        !reportingSearch ||
        emp.full_name.toLowerCase().includes(reportingSearch.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(reportingSearch.toLowerCase()) ||
        emp.designation.toLowerCase().includes(reportingSearch.toLowerCase());
      const matchRole = reportingRoleFilter === 'ALL' || emp.primary_role === reportingRoleFilter;
      return matchSearch && matchRole;
    });
  }, [reportingSearch, reportingRoleFilter]);

  // Initializing D3 Mind-Map
  useEffect(() => {
    if (activeTab !== 'mindmap' || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 650;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g').attr('id', 'zoomGroup');
    gRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial transform: centered vertically with left margin
    svg.call(zoom.transform, d3.zoomIdentity.translate(90, height / 2).scale(0.85));

    const root = d3.hierarchy<PermissionNode>(hrmsHierarchyData, d => d.children);
    (root as any).x0 = height / 2;
    (root as any).y0 = 0;

    // Initially collapse deep nodes beyond depth 1
    const collapseDeep = (d: any) => {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapseDeep);
        d.children = null;
      }
    };

    if (root.children) {
      root.children.forEach(collapseDeep);
    }

    rootNodeRef.current = root;
    renderTree(root);

    function renderTree(source: any) {
      const treeLayout = d3.tree<PermissionNode>().nodeSize([40, 250]);
      const treeData = treeLayout(root);

      const nodes = treeData.descendants();
      const links = treeData.links();

      nodes.forEach((d: any) => {
        d.y = d.depth * 230;
      });

      // Nodes
      let nodeIdCounter = 0;
      const node = g.selectAll<SVGGElement, d3.HierarchyNode<PermissionNode>>('g.node')
        .data(nodes, (d: any) => d.data.id || (d.data.id = ++nodeIdCounter));

      const nodeEnter = node.enter().append('g')
        .attr('class', 'node cursor-pointer')
        .attr('transform', () => `translate(${source.y0 || 0},${source.x0 || 0})`)
        .on('click', (event, d: any) => {
          if (d.data.type === 'permission') {
            setSelectedNode(d.data);
            setIsDrawerOpen(true);
          } else {
            if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            renderTree(d);
          }
        });

      // Node circles
      nodeEnter.append('circle')
        .attr('r', 1e-6)
        .attr('fill', (d: any) => d._children ? '#3b82f6' : (d.data.color || '#94a3b8'))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Node label
      nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', (d: any) => d.children || d._children ? -14 : 14)
        .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
        .text((d: any) => d.data.name)
        .attr('class', 'text-xs font-semibold fill-slate-800 dark:fill-slate-100 select-none')
        .style('fill-opacity', 1e-6);

      // Node tag / key
      nodeEnter.append('text')
        .attr('dy', '1.65em')
        .attr('x', (d: any) => d.children || d._children ? -14 : 14)
        .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
        .text((d: any) => d.data.scope ? `[${d.data.scope}]` : (d.data.key ? d.data.key : ''))
        .attr('class', 'text-[10px] fill-slate-400 dark:fill-slate-500 font-mono select-none');

      // Node Updates
      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate.transition().duration(350)
        .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

      nodeUpdate.select('circle')
        .attr('r', (d: any) => d.data.type === 'permission' ? 7 : (d.data.type === 'role' ? 12 : 9))
        .attr('fill', (d: any) => d._children ? '#f59e0b' : (d.data.color || (d.data.type === 'permission' ? '#10b981' : '#64748b')))
        .attr('stroke', (d: any) => d.data.type === 'role' ? '#3b82f6' : '#ffffff')
        .attr('stroke-width', 2);

      nodeUpdate.selectAll('text').style('fill-opacity', 1);

      // Exiting nodes
      const nodeExit = node.exit().transition().duration(350)
        .attr('transform', () => `translate(${source.y},${source.x})`)
        .remove();

      nodeExit.select('circle').attr('r', 1e-6);
      nodeExit.selectAll('text').style('fill-opacity', 1e-6);

      // Links
      const diagonal = (s: any, d: any) => {
        return `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`;
      };

      const link = g.selectAll<SVGPathElement, d3.HierarchyLink<PermissionNode>>('path.link')
        .data(links, (d: any) => d.target.data.id);

      const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link stroke-slate-300 dark:stroke-slate-700')
        .attr('fill', 'none')
        .attr('stroke-width', 1.75)
        .attr('stroke-linecap', 'round')
        .attr('d', () => {
          const o = { x: source.x0, y: source.y0 };
          return diagonal(o, o);
        });

      const linkUpdate = linkEnter.merge(link);

      linkUpdate.transition().duration(350)
        .attr('d', (d: any) => diagonal(d.source, d.target));

      link.exit().transition().duration(350)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      nodes.forEach((d: any) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current || !svgRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      svg.attr('width', w).attr('height', h);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Handle Search Filtering on D3 Nodes
  useEffect(() => {
    if (activeTab !== 'mindmap' || !rootNodeRef.current || !gRef.current) return;

    if (!searchQuery.trim()) {
      d3.selectAll('.node').classed('highlighted-node ring-4 ring-amber-400', false);
      return;
    }

    const q = searchQuery.toLowerCase();

    // Expand all nodes recursively so search matches show
    const expandAll = (d: any) => {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expandAll);
      }
    };

    expandAll(rootNodeRef.current);

    // Re-render
    const treeLayout = d3.tree<PermissionNode>().nodeSize([40, 250]);
    treeLayout(rootNodeRef.current);

    // Match detection
    d3.selectAll('g.node').each(function(d: any) {
      const nameMatch = d.data.name?.toLowerCase().includes(q);
      const keyMatch = d.data.key?.toLowerCase().includes(q);
      const roleMatch = d.data.roles?.some((r: string) => r.toLowerCase().includes(q));
      const match = Boolean(nameMatch || keyMatch || roleMatch);

      const circle = d3.select(this).select('circle');
      if (match) {
        circle
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 4)
          .classed('animate-pulse', true);
      } else {
        circle
          .attr('stroke', d.data.type === 'role' ? '#3b82f6' : '#ffffff')
          .attr('stroke-width', 2)
          .classed('animate-pulse', false);
      }
    });
  }, [searchQuery, activeTab]);

  // Toolbar Actions
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current && containerRef.current) {
      const h = containerRef.current.clientHeight || 650;
      d3.select(svgRef.current).transition().duration(400).call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(90, h / 2).scale(0.85)
      );
    }
  };

  const handleExpandAll = () => {
    if (!rootNodeRef.current || !gRef.current) return;
    const expandAll = (d: any) => {
      if (d._children) {
        d.children = d._children;
        d._children = null;
      }
      if (d.children) {
        d.children.forEach(expandAll);
      }
    };
    expandAll(rootNodeRef.current);
    // Trigger redraw
    const svg = d3.select(svgRef.current);
    svg.dispatch('zoom');
    // Force re-mount or tree layout update
    setActiveTab(prev => prev);
  };

  const handleCollapseAll = () => {
    if (!rootNodeRef.current) return;
    const collapseAll = (d: any) => {
      if (d.children && d.depth > 0) {
        d._children = d.children;
        d._children.forEach(collapseAll);
        d.children = null;
      }
    };
    collapseAll(rootNodeRef.current);
    setActiveTab(prev => prev);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hrmsHierarchyData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "hrms-rbac-hierarchy.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Matrix Filtered Data
  const modulesList = useMemo(() => {
    return ['ALL', ...Array.from(new Set(matrixData.map(m => m.module)))];
  }, []);

  const filteredMatrix = useMemo(() => {
    if (matrixFilter === 'ALL') return matrixData;
    return matrixData.filter(item => item.module === matrixFilter);
  }, [matrixFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Top Banner Navigation */}
      <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Organization & RBAC Hierarchy
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-full border border-cyan-200 dark:border-cyan-800">
                Interactive Mind-Map
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Explore Tenant Role Hierarchies, Module Permissions, and ECOVIS Employee Reporting Structure
            </p>
          </div>
        </div>

        {/* View Switcher Tabs & Tools */}
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative w-48 sm:w-64 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={activeTab === 'reporting' ? "Search employees, IDs, titles..." : "Search role, module or permission..."}
              value={activeTab === 'reporting' ? reportingSearch : searchQuery}
              onChange={(e) => {
                if (activeTab === 'reporting') setReportingSearch(e.target.value);
                else setSearchQuery(e.target.value);
              }}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
            />
            {(searchQuery || reportingSearch) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setReportingSearch('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('mindmap')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'mindmap'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">RBAC Mind Map</span>
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Permission Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('reporting')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center space-x-1.5 ${
                activeTab === 'reporting'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Org Reporting</span>
            </button>
          </div>

          {/* Export JSON button */}
          <button
            onClick={handleExportJson}
            title="Export RBAC Schema JSON"
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="flex-1 relative overflow-hidden flex">

        {/* TAB 1: D3 MIND-MAP CANVAS VIEW */}
        {activeTab === 'mindmap' && (
          <div ref={containerRef} className="flex-1 relative h-full w-full bg-slate-100/60 dark:bg-slate-950/60">
            {/* Canvas Control Toolbar */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col space-y-1 text-slate-700 dark:text-slate-300">
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset View"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="border-t border-slate-200 dark:border-slate-800 my-1" />
              <button
                onClick={handleExpandAll}
                title="Expand All Nodes"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCollapseAll}
                title="Collapse All Nodes"
                className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scope Level Badges Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 dark:border-slate-800 hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-2">
                Scope & Hierarchy Tiers
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shadow-sm" />
                  <span>Tenant / Platform Wide</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shadow-sm" />
                  <span>Legal Entity Scope</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500 inline-block shadow-sm" />
                  <span>Department / Team Scope</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm" />
                  <span>Self / Employee Baseline</span>
                </div>
              </div>
            </div>

            {/* Hint Badge Top-Right */}
            <div className="absolute top-4 right-4 z-10 hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <Info className="w-3.5 h-3.5 text-cyan-500" />
              <span>Click roles to expand/collapse. Click green permission nodes to view details & rules.</span>
            </div>

            {/* Interactive D3 SVG */}
            <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          </div>
        )}

        {/* TAB 2: ROLE PERMISSION COMPARISON MATRIX VIEW */}
        {activeTab === 'matrix' && (
          <div className="flex-1 h-full w-full overflow-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Matrix Header & Filter */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Role Permission Comparison Matrix
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cross-compare tenant roles to inspect authorized actions, permission bounds, and governance boundaries.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Module:</label>
                  <select
                    value={matrixFilter}
                    onChange={(e) => setMatrixFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-200"
                  >
                    {modulesList.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod === 'ALL' ? 'All Modules' : mod}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matrix Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                        <th className="p-3.5 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 w-64 shadow-sm">
                          Module / Capability
                        </th>
                        <th className="p-3.5 text-center min-w-[100px] bg-purple-500/10 text-purple-700 dark:text-purple-300">
                          Super Admin
                        </th>
                        <th className="p-3.5 text-center min-w-[100px]">Tenant Admin</th>
                        <th className="p-3.5 text-center min-w-[100px] bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          HR Manager
                        </th>
                        <th className="p-3.5 text-center min-w-[100px]">Payroll Admin</th>
                        <th className="p-3.5 text-center min-w-[100px]">Finance</th>
                        <th className="p-3.5 text-center min-w-[100px] bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          Manager
                        </th>
                        <th className="p-3.5 text-center min-w-[100px]">Project Manager</th>
                        <th className="p-3.5 text-center min-w-[100px]">Recruiter</th>
                        <th className="p-3.5 text-center min-w-[100px] bg-amber-500/10 text-amber-700 dark:text-amber-300">
                          Employee
                        </th>
                        <th className="p-3.5 text-center min-w-[100px]">Auditor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredMatrix.map((row) => (
                        <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="font-medium text-slate-900 dark:text-white">{row.feature}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">
                              {row.module} • {row.key}
                            </div>
                          </td>
                          {[
                            row.permissions.super_admin,
                            row.permissions.admin,
                            row.permissions.hr,
                            row.permissions.payroll_admin,
                            row.permissions.finance,
                            row.permissions.manager,
                            row.permissions.project_manager,
                            row.permissions.recruiter,
                            row.permissions.employee,
                            row.permissions.auditor,
                          ].map((val, idx) => {
                            let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-400";
                            if (val.includes("FULL") || val === "APPROVE" || val === "EXECUTE") {
                              badgeStyle = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800";
                            } else if (val.includes("SUBMIT") || val.includes("CREATE") || val.includes("APPLY") || val.includes("TEAM")) {
                              badgeStyle = "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-300 dark:border-blue-800";
                            } else if (val.includes("VIEW") || val.includes("REIMBURSE") || val.includes("PROCESS") || val.includes("SIGN-OFF")) {
                              badgeStyle = "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-300 dark:border-amber-800";
                            } else if (val === "NONE") {
                              badgeStyle = "text-slate-300 dark:text-slate-700";
                            }
                            return (
                              <td key={idx} className="p-3 text-center border-r border-slate-100 dark:border-slate-800/60">
                                <span className={`px-2 py-0.5 rounded text-[10px] inline-block ${badgeStyle}`}>
                                  {val}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPANY ORGANIZATIONAL & REPORTING HIERARCHY */}
        {activeTab === 'reporting' && (
          <div className="flex-1 h-full w-full overflow-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Org Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">ECOVIS</div>
                    <div className="text-[11px] text-slate-500">Legal Entity Org</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {reportingHierarchy.totalCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Total Workforce</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {reportingHierarchy.activeCount}
                    </div>
                    <div className="text-[11px] text-slate-500">Active Status</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      5 Roles
                    </div>
                    <div className="text-[11px] text-slate-500">Access Tiers</div>
                  </div>
                </div>
              </div>

              {/* Executive Level (Tier 1) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 flex items-center space-x-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Executive Leadership Tier (Level 4)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                    Directs Entire Organization
                  </span>
                </div>

                <div className="p-4 rounded-xl border-2 border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                      {reportingHierarchy.businessHead.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {reportingHierarchy.businessHead.full_name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-600 text-white font-semibold">
                          Business Head
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        {reportingHierarchy.businessHead.employee_id} • {reportingHierarchy.businessHead.email}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span>Access Level: <strong className="text-purple-600 dark:text-purple-400">4 (Executive)</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">● Active</span>
                  </div>
                </div>
              </div>

              {/* Operational & Departmental Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Tier:</label>
                  <select
                    value={reportingRoleFilter}
                    onChange={(e) => setReportingRoleFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">All Roles ({employeesData.length})</option>
                    <option value="business_head">Business Head</option>
                    <option value="admin">Admins</option>
                    <option value="hr">HR Managers</option>
                    <option value="manager">Managers</option>
                    <option value="employee">Employees</option>
                  </select>
                </div>
                <div className="text-xs text-slate-500">
                  Showing {filteredEmployees.length} of {employeesData.length} team members
                </div>
              </div>

              {/* Workforce Employee Directory Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredEmployees.map((emp) => {
                  const roleColors: Record<string, string> = {
                    business_head: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                    admin: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                    hr: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
                    manager: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border-teal-200 dark:border-teal-800",
                    employee: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800",
                  };

                  return (
                    <div
                      key={emp.employee_id}
                      className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-400 dark:hover:border-cyan-600 transition flex items-start space-x-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center shrink-0">
                        {emp.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {emp.full_name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${roleColors[emp.primary_role] || 'bg-slate-100'}`}>
                            {emp.primary_role.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {emp.designation} • {emp.employee_id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                          {emp.email}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PERMISSION DETAILS SLIDE-OVER DRAWER */}
        <aside
          className={`w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800 h-full flex flex-col z-30 transform transition-transform duration-300 absolute right-0 top-0 shadow-2xl ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {selectedNode?.name || "Permission Specification"}
              </h3>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
            {/* Permission Identifier */}
            <div className="bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                Permission Key / Identifier
              </div>
              <code className="text-cyan-600 dark:text-cyan-400 font-mono text-xs break-all font-semibold">
                {selectedNode?.key || selectedNode?.id || "N/A"}
              </code>
            </div>

            {/* Scope Enforcement */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Scope Enforcement Tier
              </div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800">
                <Shield className="w-3.5 h-3.5" />
                <span>{selectedNode?.scope || "Tenant-wide Scope"}</span>
              </div>
            </div>

            {/* Plain English Explanation */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                What it Means in Simple Terms
              </div>
              <p className="leading-relaxed text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {selectedNode?.meaning || selectedNode?.description || "Select any permission node in the Mind-Map to inspect its operational boundaries and workflow rules."}
              </p>
            </div>

            {/* Authorized Roles */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Roles Authorized to Perform This
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode?.roles && selectedNode.roles.length > 0 ? (
                  selectedNode.roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-semibold text-[11px] border border-cyan-200 dark:border-cyan-800"
                    >
                      {r}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Inherited via parent role permission bundle</span>
                )}
              </div>
            </div>

            {/* Workflow & Safety Guardrails */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3.5">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
                <span>Workflow & Safety Rules</span>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                {selectedNode?.rules && selectedNode.rules.length > 0 ? (
                  selectedNode.rules.map((rule, idx) => (
                    <li key={idx} className="leading-normal">{rule}</li>
                  ))
                ) : (
                  <li>Standard audit logging and RBAC enforcement checks apply.</li>
                )}
              </ul>
            </div>

            {/* Audit Trail Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <div className="font-bold text-amber-700 dark:text-amber-400 text-[11px] mb-1 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Compliance & Audit Trail</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal">
                All operations executed under this key generate an immutable entry in the Tenant Audit Log with full actor IP, timestamp, and before/after delta snapshots.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
