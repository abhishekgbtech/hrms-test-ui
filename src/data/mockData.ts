/**
 * MOCK DATA - TEMPORARY DEMO DATA
 *
 * This file contains mock/demo data for development and testing purposes.
 * Employee data is now managed through Supabase (see employeesData.ts).
 *
 * TODO: Migrate projects, tasks, and other data to Supabase database.
 */

import { format } from 'date-fns';

export type TaskHistory = {
  id: string;
  user: string;
  avatarUrl: string;
  action: 'created' | 'commented' | 'status_change' | 'priority_change' | 'assignment' | 'contribution_added';
  details: string; // The comment, or "from 'pending' to 'in-progress'"
  timestamp: Date;
};

export type SubTask = {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed';
    assignee: string;
    dueDate?: Date;
    priority?: 'high' | 'medium' | 'low';
    description?: string;
};

export type ExecutionStep = {
    id: string;
    text: string;
    completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  projectName: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  progress: number;
  status: 'in-progress' | 'pending' | 'completed';
  assignedTo: string;
  contributors?: string[]; // Added contributors field
  history: TaskHistory[];
  subtasks?: SubTask[];
  executionSteps?: ExecutionStep[];
};

export type ProjectTeamMember = {
  name: string;
  avatarUrl: string;
  handle: string;
  email: string;
  phone: string; // Added phone
  role: string;
};

export type Project = {
  id: string;
  name: string;
  company: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  progress: number;
  teamMembers: ProjectTeamMember[];
  deadline: Date;
  totalTasks: number;
  completedTasks: number;
};

// New Data Types
export type Note = {
    id: string;
    title: string;
    content: string;
    date: Date;
    tags?: string[];
};

export type SavedPrompt = {
    id: string;
    title: string;
    content: string;
    category: 'General' | 'Coding' | 'Email' | 'Creative';
};

export const initialNotes: Note[] = [
    { id: 'n1', title: 'Meeting Minutes - Q1 Review', content: 'Discussed revenue targets and hiring plans for the next quarter.', date: new Date(), tags: ['meeting', 'strategy'] },
    { id: 'n2', title: 'Design System Ideas', content: 'Explore glassmorphism for the new dashboard cards. Use cyan as primary accent.', date: new Date(), tags: ['design', 'ui'] }
];

export const initialPrompts: SavedPrompt[] = [
    { id: 'p1', title: 'Professional Email', content: 'Draft a professional email to a client regarding [Topic], ensuring a polite tone and highlighting [Key Point].', category: 'Email' },
    { id: 'p2', title: 'Code Refactor', content: 'Analyze the following code for performance optimizations and readability improvements.', category: 'Coding' },
    { id: 'p3', title: 'Daily Standup', content: 'Summarize tasks completed yesterday, planned for today, and any blockers.', category: 'General' }
];

export const user = {
  name: 'Bharat Mishra',
  // FIX: Added avatar and designation for components/Header.tsx
  avatar: 'BM',
  designation: 'Sr. Frontend Engineer',
  avatarUrl: 'https://i.pravatar.cc/150?u=bharat',
  email: 'b.mishra@ecovis.com',
  phone: '+91 98765 43210',
  handle: '@bmishra',
  // FIX: Added punchInStatus for components/Dashboard.tsx
  punchInStatus: {
    punchedIn: true,
    lastPunchInTime: new Date(new Date().setHours(new Date().getHours() - 2)),
  }
};

export const notifications = [
    {
        id: "1",
        sender: {
            name: "Sanjana Konda",
            initials: "SK",
            avatarUrl: 'https://i.pravatar.cc/150?u=sanjana',
        },
        message: "Hey, can we discuss the project timeline?",
        time: "5 minutes ago",
        read: false,
    },
    {
        id: "2",
        sender: {
            name: "Aryan Singh",
            initials: "AS",
            avatarUrl: 'https://i.pravatar.cc/150?u=aryan',
        },
        message: "I've uploaded the design files you requested",
        time: "10 minutes ago",
        read: false,
    },
    {
        id: "3",
        sender: {
            name: "Tammay Vilas",
            initials: "TV",
            avatarUrl: 'https://i.pravatar.cc/150?u=tammay',
        },
        message: "The client meeting has been rescheduled to tomorrow",
        time: "1 hour ago",
        read: true,
    },
    {
        id: "4",
        sender: {
            name: "Pooja Disale",
            initials: "PD",
            avatarUrl: 'https://i.pravatar.cc/150?u=pooja',
        },
        message: "Please review the latest changes to the documentation",
        time: "2 hours ago",
        read: true,
    },
    {
        id: "5",
        sender: {
            name: "Shweta Chaudhari",
            initials: "SC",
            avatarUrl: 'https://i.pravatar.cc/150?u=shweta',
        },
        message: "Don't forget about our team meeting at 3 PM today",
        time: "3 hours ago",
        read: false,
    },
];

// --- Dynamic Date Setup ---
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);


export const tasks: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Q1 financial report for review',
    description: 'Compile all departmental financial data from the last quarter, cross-reference with last year\'s report for growth analysis, and prepare a concise summary for the executive team. Ensure all figures are double-checked for accuracy before submission.',
    projectName: 'Financial Audits',
    priority: 'high',
    dueDate: tomorrow,
    progress: 75,
    status: 'in-progress',
    assignedTo: 'Bharat Mishra',
    contributors: ['Sanjana Konda'], // Example contributor
    executionSteps: [
        { id: 'step-1', text: 'Collect data from Sales Dept', completed: true },
        { id: 'step-2', text: 'Collect data from Marketing Dept', completed: true },
        { id: 'step-3', text: 'Draft initial summary', completed: false },
        { id: 'step-4', text: 'Proofread for errors', completed: false },
    ],
    history: [
      { id: 'h-1-1', user: 'Sanjana Konda', avatarUrl: 'https://i.pravatar.cc/150?u=sanjana', action: 'created', details: 'Created the task.', timestamp: new Date(new Date().setDate(today.getDate() - 2)) },
      { id: 'h-1-2', user: 'Sanjana Konda', avatarUrl: 'https://i.pravatar.cc/150?u=sanjana', action: 'assignment', details: 'Assigned to Bharat Mishra.', timestamp: new Date(new Date().setDate(today.getDate() - 2)) },
      { id: 'h-1-3', user: 'Bharat Mishra', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', action: 'status_change', details: "Changed status from Pending to In Progress.", timestamp: yesterday },
      { id: 'h-1-4', user: 'Bharat Mishra', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', action: 'commented', details: 'The initial draft is complete. I will now proceed with the data validation phase.', timestamp: today },
    ]
  },
  {
    id: 'task-2',
    title: 'Prepare presentation for BRG client meeting',
    description: 'Create a compelling presentation for the upcoming meeting with BRG. The deck should cover project milestones achieved, the roadmap for the next phase, and address any client feedback from the last session.',
    projectName: 'Client Onboarding',
    priority: 'high',
    dueDate: new Date(new Date().setDate(today.getDate() + 3)),
    progress: 30,
    status: 'in-progress',
    assignedTo: 'Sanjana Konda',
    contributors: ['Bharat Mishra'], // Example contributor
    history: [
       { id: 'h-2-1', user: 'Bharat Mishra', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', action: 'created', details: 'Created the task.', timestamp: yesterday },
       { id: 'h-2-2', user: 'Bharat Mishra', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', action: 'commented', details: 'Please ensure we cover the new branding guidelines from the last email.', timestamp: yesterday },
    ]
  },
  {
    id: 'task-3',
    title: 'Review new hire applications for Frontend Dev',
    description: 'Screen the latest batch of applications for the Senior Frontend Developer position. Shortlist the top 5 candidates based on experience with React, TypeScript, and modern state management libraries. Schedule initial interviews.',
    projectName: 'Recruitment Q1',
    priority: 'medium',
    dueDate: nextWeek,
    progress: 10,
    status: 'pending',
    assignedTo: 'Bharat Mishra',
    history: [
       { id: 'h-3-1', user: 'Sanjana Konda', avatarUrl: 'https://i.pravatar.cc/150?u=sanjana', action: 'created', details: 'Created the task.', timestamp: today },
    ]
  },
  {
    id: 'task-4',
    title: 'Submit weekly timesheet',
    description: 'Complete and submit the timesheet for the current week, ensuring all hours are logged accurately against the correct projects and tasks. This is required for payroll processing.',
    projectName: 'Internal Admin',
    priority: 'low',
    dueDate: today,
    progress: 90,
    status: 'in-progress',
    assignedTo: 'Bharat Mishra',
    history: [
        { id: 'h-4-1', user: 'System', avatarUrl: '', action: 'created', details: 'Recurring task created.', timestamp: lastWeek },
    ]
  },
  {
    id: 'task-5',
    title: 'Deploy hotfix for Client Portal V2',
    description: 'A critical bug was reported on the client portal. A hotfix needs to be deployed to the production environment immediately.',
    projectName: 'Client Portal V2',
    priority: 'high',
    dueDate: yesterday, // Overdue
    progress: 95,
    status: 'in-progress',
    assignedTo: 'Suraj Rajbhar',
    contributors: ['Bharat Mishra', 'Aryan Singh'],
    history: [
        { id: 'h-5-1', user: 'Shweta Chaudhari', avatarUrl: 'https://i.pravatar.cc/150?u=shweta', action: 'created', details: 'Critical issue reported by client.', timestamp: new Date(new Date().setDate(today.getDate() - 2))},
    ]
  }
];

const dateStr = (date: Date) => format(date, 'yyyy-MM-dd');

export const calendarEvents = [
    { id: 'event-1', date: dateStr(today), time: '09:00', type: 'meeting', title: 'Daily Stand-up' },
    { id: 'event-2', date: dateStr(today), time: '11:00', type: 'meeting', title: 'Project Review: HRMS' },
    { id: 'event-3', date: dateStr(tomorrow), time: '15:00', type: 'meeting', title: '1-on-1 with Sanjana' },
    { id: 'event-4', date: dateStr(nextWeek), time: '10:00', type: 'meeting', title: 'HRMS UI Overhaul - Sprint Planning' },
    { id: 'event-5', date: dateStr(new Date(new Date().setDate(today.getDate() + 10))), time: '14:00', type: 'meeting', title: 'Client Call - BRG' },
];

export type EventType = 'birthday' | 'holiday' | 'company_event';

export interface CompanyEvent {
    id: string;
    title: string;
    date: Date;
    type: EventType;
    user?: {
        name: string;
        avatarUrl: string;
        email?: string;
        phone?: string;
    };
    description?: string;
    location?: string;
    time?: string;
}

export const companyEvents: CompanyEvent[] = [
    {
        id: 'evt-1',
        title: "Rahul's Birthday",
        date: new Date(), // Today
        type: 'birthday',
        user: {
            name: "Rahul Sharma",
            avatarUrl: "https://i.pravatar.cc/150?u=rahul",
            email: "rahul.sharma@ecovis.com",
            phone: "+91 98765 00001"
        },
        description: "Turns 28 today!",
        location: "Office Breakout Area",
        time: "4:00 PM"
    },
    {
        id: 'evt-2',
        title: "Town Hall",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        type: 'company_event',
        description: "Quarterly updates on company performance and Q4 goals.",
        location: "Main Conference Hall & Zoom",
        time: "10:00 AM"
    },
    {
        id: 'evt-3',
        title: "Diwali Celebration",
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        type: 'holiday',
        description: "Office closed. Celebration on previous day evening with snacks and games.",
        location: "Office Premises",
        time: "5:00 PM"
    }
];

// FIX: Added pendingApprovals export for components/Dashboard.tsx
export const pendingApprovals = 5;

// FIX: Added teamStatus export for components/Dashboard.tsx
export const teamStatus = {
    active: 3,
    onLeave: 1,
};

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'HRMS UI Overhaul',
    company: 'ECOVIS RKCA',
    status: 'on-track',
    progress: 65,
    teamMembers: [
      { name: 'Sanjana Konda', avatarUrl: 'https://i.pravatar.cc/150?u=sanjana', handle: '@sanjana', email: 's.konda@ecovis.com', phone: '+91 98765 12345', role: 'UI/UX Designer' },
      { name: 'Aryan Singh', avatarUrl: 'https://i.pravatar.cc/150?u=aryan', handle: '@aryan', email: 'a.singh@ecovis.com', phone: '+91 98765 67890', role: 'Backend Developer' },
      { name: 'Pooja Disale', avatarUrl: 'https://i.pravatar.cc/150?u=pooja', handle: '@pooja', email: 'p.disale@ecovis.com', phone: '+91 98765 11223', role: 'UI/UX Designer' },
    ],
    deadline: new Date(new Date().setDate(today.getDate() + 45)),
    totalTasks: 50,
    completedTasks: 32,
  },
  {
    id: 'proj-2',
    name: 'Forensic Audit Automation',
    company: 'FinTech Solutions',
    status: 'at-risk',
    progress: 30,
    teamMembers: [
      { name: 'Tammay Vilas', avatarUrl: 'https://i.pravatar.cc/150?u=tammay', handle: '@tammay', email: 't.vilas@ecovis.com', phone: '+91 98765 33445', role: 'QA Engineer' },
      { name: 'Bharat Mishra', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', handle: '@bmishra', email: 'b.mishra@ecovis.com', phone: '+91 98765 43210', role: 'Sr. Frontend Engineer' },
    ],
    deadline: new Date(new Date().setDate(today.getDate() + 15)),
    totalTasks: 25,
    completedTasks: 5,
  },
  {
    id: 'proj-3',
    name: 'Client Portal V2',
    company: 'Bright Future Inc.',
    status: 'delayed',
    progress: 80,
    teamMembers: [
       { name: 'Shweta Chaudhari', avatarUrl: 'https://i.pravatar.cc/150?u=shweta', handle: '@shweta', email: 's.chaudhari@ecovis.com', phone: '+91 98765 55667', role: 'Project Manager' },
       { name: 'Suraj Rajbhar', avatarUrl: 'https://i.pravatar.cc/150?u=suraj', handle: '@suraj', email: 's.rajbhar@ecovis.com', phone: '+91 98765 99887', role: 'Fullstack Developer' },
    ],
    deadline: yesterday,
    totalTasks: 80,
    completedTasks: 64,
  },
];

export const dailyTimeline = [
    { time: '09:00', type: 'meeting', title: 'Daily Stand-up', duration: 15, location: 'Virtual (Google Meet)', status: 'completed' },
    { time: '09:30', type: 'task', title: 'Work on: Q4 Financial Report', duration: 90, status: 'in-progress' },
    { time: '11:00', type: 'meeting', title: 'Project Review: Forensic Audit', duration: 60, location: 'Conference Room A', status: 'scheduled' },
    { time: '12:00', type: 'break', title: 'Lunch Break', duration: 60, status: 'scheduled' },
    { time: '13:00', type: 'task', title: 'Work on: BRG Client Presentation', duration: 120, status: 'scheduled' },
    { time: '15:00', type: 'meeting', title: '1-on-1 with Sanjana', duration: 30, location: 'Virtual', status: 'scheduled' },
    { time: '16:00', type: 'task', title: 'Code Review: Client Portal V2', duration: 60, status: 'scheduled' },
];

export const team = [
    { name: 'Sanjana Konda', role: 'Frontend Developer', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=sanjana', email: 's.konda@ecovis.com', phone: '+91 98765 12345' },
    { name: 'Aryan Singh', role: 'Backend Developer', status: 'in-meeting', avatarUrl: 'https://i.pravatar.cc/150?u=aryan', email: 'a.singh@ecovis.com', phone: '+91 98765 67890' },
    { name: 'Pooja Disale', role: 'UI/UX Designer', status: 'on-leave', avatarUrl: 'https://i.pravatar.cc/150?u=pooja', email: 'p.disale@ecovis.com', phone: '+91 98765 11223' },
    { name: 'Tammay Vilas', role: 'QA Engineer', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=tammay', email: 't.vilas@ecovis.com', phone: '+91 98765 33445' },
    { name: 'Shweta Chaudhari', role: 'Project Manager', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=shweta', email: 's.chaudhari@ecovis.com', phone: '+91 98765 55667' },
    { name: 'Suraj Rajbhar', role: 'Fullstack Developer', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=suraj', email: 's.rajbhar@ecovis.com', phone: '+91 98765 99887' },
    { name: 'Rahul Sharma', role: 'Intern', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=rahul', email: 'rahul.sharma@ecovis.com', phone: '+91 98765 00001' },
    { name: 'Bharat Mishra', role: 'Sr. Frontend Engineer', status: 'available', avatarUrl: 'https://i.pravatar.cc/150?u=bharat', email: 'b.mishra@ecovis.com', phone: '+91 98765 43210' },
];

export type FileMetadata = {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
};

export type FolderNode = {
    id: string;
    name: string;
    type: 'folder' | 'file';
    children?: FolderNode[];
    files?: FileMetadata[];
    content?: string;
};

export const consultingFolderStructure: FolderNode[] = [
    {
        id: 'root-1',
        name: 'Client Projects',
        type: 'folder',
        children: [
            {
                id: 'client-1',
                name: 'Acme Corp',
                type: 'folder',
                children: [
                    { id: 'c1-doc1', name: 'Strategy_Q4.pdf', type: 'file' },
                    { id: 'c1-doc2', name: 'Financial_Model_v2.xlsx', type: 'file' },
                    {
                        id: 'c1-meeting',
                        name: 'Meeting Notes',
                        type: 'folder',
                        children: [
                            { id: 'c1-m1', name: 'Kickoff_Minutes.docx', type: 'file' },
                            { id: 'c1-m2', name: 'Weekly_Sync.txt', type: 'file' },
                        ]
                    }
                ],
                files: [
                    { id: 'c1-doc1', name: 'Strategy_Q4.pdf', size: 2400000, type: 'application/pdf', url: '#' },
                    { id: 'c1-doc2', name: 'Financial_Model_v2.xlsx', size: 1500000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', url: '#' }
                ],
                content: "Project Objectives:\n- Increase market share by 15%\n- Optimize supply chain logistics\n\nKey Stakeholders:\n- John Doe (CEO)\n- Jane Smith (COO)"
            },
            {
                id: 'client-2',
                name: 'Globex Inc',
                type: 'folder',
                children: [],
                files: [],
                content: "Pending initial kickoff meeting scheduled for next Monday."
            }
        ]
    },
    {
        id: 'root-2',
        name: 'Internal Resources',
        type: 'folder',
        children: [
            { id: 'res-1', name: 'Templates', type: 'folder', children: [] },
            { id: 'res-2', name: 'Best Practices', type: 'folder', children: [] },
            { id: 'res-3', name: 'Employee Handbook.pdf', type: 'file' }
        ],
        content: "Repository for all internal standard operating procedures and templates."
    }
];
