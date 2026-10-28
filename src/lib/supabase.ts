import { createClient } from '@supabase/supabase-js';
import { employeesData } from '../data/employeesData';
import { projects as mockProjects } from '../data/mockData';
import { serviceManagementStore } from '../services/serviceManagementData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type UserProfile = {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  primary_role: 'employee' | 'manager' | 'hr' | 'business_head' | 'admin';
  access_level: number;
  is_manager: boolean;
  is_department_head: boolean;
  can_create_projects: boolean;
  can_view_team_workload: boolean;
  can_access_team_projects: boolean;
  can_view_all_folders: boolean;
  can_manage_tasks?: boolean;
  can_approve_leave?: boolean;
  can_view_reports?: boolean;
  can_manage_team?: boolean;
  department_id: string | null;
  office_id: string | null;
  manager_id: string | null;
  profile_picture_url: string | null;
  phone: string | null;
  designation: string | null;
  date_of_joining: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string | null;
  end_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  budget: number;
  spent_budget: number;
  project_manager_id: string | null;
  department_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  project_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  status: 'todo' | 'in_progress' | 'review' | 'blocked' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  start_date: string | null;
  completion_date: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Folder = {
  id: string;
  name: string;
  description: string | null;
  folder_type: 'personal' | 'project' | 'department' | 'company';
  project_id: string | null;
  department_id: string | null;
  owner_id: string | null;
  parent_folder_id: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export function employeeToProfile(emp: any): UserProfile {
  return {
    id: emp.employee_id || 'EMP001',
    employee_id: emp.employee_id || 'EMP001',
    full_name: emp.full_name || 'User',
    email: emp.email || '',
    primary_role: emp.primary_role || 'employee',
    access_level: emp.access_level || 1,
    is_manager: emp.primary_role === 'manager' || (emp.access_level ?? 0) >= 3,
    is_department_head: (emp.access_level ?? 0) >= 4,
    can_create_projects: (emp.access_level ?? 0) >= 2,
    can_view_team_workload: (emp.access_level ?? 0) >= 2,
    can_access_team_projects: (emp.access_level ?? 0) >= 2,
    can_view_all_folders: (emp.access_level ?? 0) >= 3,
    can_manage_tasks: true,
    can_approve_leave: (emp.access_level ?? 0) >= 3,
    can_view_reports: (emp.access_level ?? 0) >= 2,
    can_manage_team: (emp.access_level ?? 0) >= 3,
    department_id: 'dept-1',
    office_id: 'off-1',
    manager_id: null,
    profile_picture_url: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150`,
    phone: '+91 98765 43210',
    designation: emp.designation || 'Consultant',
    date_of_joining: '2023-01-15',
    status: emp.status || 'active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2026-10-22T00:00:00Z',
  };
}

// In-memory mock storage and event system
const authListeners: Set<(event: string, session: any) => void> = new Set();
const STORAGE_KEY = 'ecovis_auth_user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: any) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

const mockDepartments = [
  { id: 'dept-1', name: 'Business Advisory', description: 'Business advisory and consulting' },
  { id: 'dept-2', name: 'Tax & Compliance', description: 'Taxation and corporate compliance' },
  { id: 'dept-3', name: 'Audit & Assurance', description: 'Auditing and financial reporting' },
  { id: 'dept-4', name: 'IT & Digital', description: 'Technology and software solutions' },
  { id: 'dept-5', name: 'Human Resources', description: 'People operations and talent' },
];

const mockOffices = [
  { id: 'off-1', name: 'Mumbai HQ', city: 'Mumbai', address: 'Bandra Kurla Complex' },
  { id: 'off-2', name: 'New Delhi Branch', city: 'New Delhi', address: 'Connaught Place' },
  { id: 'off-3', name: 'Bengaluru Tech Hub', city: 'Bengaluru', address: 'Indiranagar' },
  { id: 'off-4', name: 'Pune Regional', city: 'Pune', address: 'Shivaji Nagar' },
];

class MockQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private countMode?: string;
  private isHead: boolean = false;
  private sortField?: string;
  private sortAsc: boolean = true;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: { count?: string; head?: boolean }) {
    if (options?.count) this.countMode = options.count;
    if (options?.head) this.isHead = options.head;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item: any) => item[field] === value);
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.sortField = field;
    this.sortAsc = options?.ascending ?? true;
    return this;
  }

  update(updates: any) {
    return {
      eq: (field: string, val: any) => {
        return Promise.resolve({ data: updates, error: null });
      },
      then: (resolve: any) => resolve({ data: updates, error: null }),
    };
  }

  insert(record: any) {
    return Promise.resolve({ data: record, error: null });
  }

  upsert(record: any) {
    return Promise.resolve({ data: record, error: null });
  }

  delete() {
    return {
      eq: () => Promise.resolve({ data: null, error: null }),
    };
  }

  private getData(): any[] {
    let list: any[] = [];
    if (this.table === 'user_profiles') {
      list = employeesData.map(employeeToProfile);
    } else if (this.table === 'departments') {
      list = [...mockDepartments];
    } else if (this.table === 'offices') {
      list = [...mockOffices];
    } else if (this.table === 'projects') {
      list = mockProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: (p as any).description || (p as any).company || 'Project description',
        status: 'active',
        priority: 'high',
        start_date: '2026-01-01',
        end_date: '2026-12-31',
        estimated_hours: 100,
        actual_hours: 45,
        budget: 50000,
        spent_budget: 20000,
        project_manager_id: 'EMP001',
        department_id: 'dept-1',
        created_by: 'EMP001',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-10-22T00:00:00Z',
      }));
    } else if (this.table === 'project_members') {
      list = [
        { id: 'pm-1', project_id: '1', user_id: 'EMP001' },
        { id: 'pm-2', project_id: '1', user_id: 'EMP002' },
        { id: 'pm-3', project_id: '2', user_id: 'EMP003' },
      ];
    } else if (this.table === 'services') {
      list = serviceManagementStore.getServices();
    } else if (this.table === 'clients') {
      list = serviceManagementStore.getClients();
    } else if (this.table === 'client_service_engagements') {
      list = serviceManagementStore.getEngagements();
    } else if (this.table === 'service_task_instances') {
      list = serviceManagementStore.getTaskInstances();
    } else if (this.table === 'service_timesheets') {
      list = serviceManagementStore.getTimesheets();
    }

    for (const filter of this.filters) {
      list = list.filter(filter);
    }

    if (this.sortField) {
      const sf = this.sortField;
      const asc = this.sortAsc;
      list.sort((a, b) => {
        const valA = a[sf] ?? '';
        const valB = b[sf] ?? '';
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }

    return list;
  }

  async maybeSingle() {
    const list = this.getData();
    return { data: list.length > 0 ? list[0] : null, error: null };
  }

  async single() {
    const list = this.getData();
    return { data: list.length > 0 ? list[0] : null, error: null };
  }

  then(onfulfilled: (value: any) => any, onrejected?: (reason: any) => any) {
    const data = this.getData();
    const count = data.length;
    const result = {
      data: this.isHead ? null : data,
      count,
      error: null,
    };
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

const mockClient = {
  auth: {
    getSession: async () => {
      const user = getStoredUser() || {
        id: employeesData[0].employee_id,
        email: employeesData[0].email,
        user_metadata: { full_name: employeesData[0].full_name },
      };
      return {
        data: {
          session: user ? { user } : null,
        },
        error: null,
      };
    },
    getUser: async () => {
      const user = getStoredUser();
      return { data: { user }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      authListeners.add(callback);
      const user = getStoredUser() || {
        id: employeesData[0].employee_id,
        email: employeesData[0].email,
        user_metadata: { full_name: employeesData[0].full_name },
      };
      // notify immediately
      setTimeout(() => {
        callback('SIGNED_IN', { user });
      }, 0);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      const found = employeesData.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        return {
          data: { user: null, session: null },
          error: new Error('User not found. Try deepa.rathi@ecovis.com with password 911'),
        };
      }
      if (password && password !== '911' && password !== found.password) {
        return {
          data: { user: null, session: null },
          error: new Error('Invalid password. Default password is 911'),
        };
      }
      const user = {
        id: found.employee_id,
        email: found.email,
        user_metadata: { full_name: found.full_name },
      };
      const session = { user };
      setStoredUser(user);
      authListeners.forEach(cb => cb('SIGNED_IN', session));
      return {
        data: { user, session },
        error: null,
      };
    },
    signOut: async () => {
      setStoredUser(null);
      authListeners.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },
  },
  from: (table: string) => new MockQueryBuilder(table),
};

export const supabase = (!supabaseUrl || !supabaseAnonKey)
  ? (mockClient as any)
  : createClient(supabaseUrl, supabaseAnonKey);
