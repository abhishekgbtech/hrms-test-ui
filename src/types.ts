export type Page =
  | 'Dashboard'
  | 'Projects'
  | 'Work Schedule'
  | 'My Tasks'
  | 'Team Projects'
  | 'Folders'
  | 'Ticket Generation'
  | 'Admin Panel'
  | 'Seed Employees'
  | 'Add Project'
  | 'Org Hierarchy'
  | 'Service Management';

export type Theme = 'light' | 'dark';

export type PrimaryColor = 'cyan' | 'blue' | 'purple' | 'orange' | 'emerald' | 'red';

export type {
  Task,
  TaskHistory,
  SubTask,
  ExecutionStep,
  ProjectTeamMember,
  Note,
  SavedPrompt,
} from './data/mockData';

export type { EmployeeData } from './data/employeesData';
export type { UserProfile, Project, Task as SupabaseTask, Folder } from './lib/supabase';
