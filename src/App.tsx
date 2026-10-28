import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import AddProject from './pages/AddProject';
import TeamProjects from './pages/TeamProjects';
import MyTasks from './pages/MyTasks';
import WorkSchedule from './pages/WorkSchedule';
import Folders from './pages/Folders';
import AdminPanel from './pages/AdminPanel';
import SeedEmployees from './pages/SeedEmployees';
import TicketGeneration from './pages/TicketGeneration';
import OrgHierarchy from './pages/OrgHierarchy';
import ServiceManagement from './pages/ServiceManagement';
import Layout from './components/layout/Layout';
import TaskModal from './components/dashboard/TaskModal';
import { tasks as initialTasks, initialNotes, initialPrompts } from './data/mockData';
import type { Task, Note, SavedPrompt } from './data/mockData';
import type { Page, Theme, PrimaryColor } from './types';

export type { Page, Theme, PrimaryColor };

const ROUTE_TO_PAGE: Record<string, Page> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/add-project': 'Add Project',
  '/team-projects': 'Team Projects',
  '/tasks': 'My Tasks',
  '/schedule': 'Work Schedule',
  '/folders': 'Folders',
  '/tickets': 'Ticket Generation',
  '/hierarchy': 'Org Hierarchy',
  '/services': 'Service Management',
  '/admin': 'Admin Panel',
  '/seed': 'Seed Employees',
};

const PAGE_TO_ROUTE: Record<Page, string> = {
  'Dashboard': '/',
  'Projects': '/projects',
  'Add Project': '/add-project',
  'Team Projects': '/team-projects',
  'My Tasks': '/tasks',
  'Work Schedule': '/schedule',
  'Folders': '/folders',
  'Ticket Generation': '/tickets',
  'Org Hierarchy': '/hierarchy',
  'Service Management': '/services',
  'Admin Panel': '/admin',
  'Seed Employees': '/seed',
};

const COLOR_PALETTES: Record<PrimaryColor, Record<string, string>> = {
  cyan: {
    '--primary-50': '#ecfeff',
    '--primary-100': '#cffafe',
    '--primary-200': '#a5f3fc',
    '--primary-300': '#67e8f9',
    '--primary-400': '#22d3ee',
    '--primary-500': '#06b6d4',
    '--primary-600': '#0891b2',
    '--primary-700': '#0e7490',
    '--primary-800': '#155e75',
    '--primary-900': '#164e63',
    '--primary-950': '#083344',
  },
  blue: {
    '--primary-50': '#eff6ff',
    '--primary-100': '#dbeafe',
    '--primary-200': '#bfdbfe',
    '--primary-300': '#93c5fd',
    '--primary-400': '#60a5fa',
    '--primary-500': '#3b82f6',
    '--primary-600': '#2563eb',
    '--primary-700': '#1d4ed8',
    '--primary-800': '#1e40af',
    '--primary-900': '#1e3a8a',
    '--primary-950': '#172554',
  },
  purple: {
    '--primary-50': '#faf5ff',
    '--primary-100': '#f3e8ff',
    '--primary-200': '#e9d5ff',
    '--primary-300': '#d8b4fe',
    '--primary-400': '#c084fc',
    '--primary-500': '#a855f7',
    '--primary-600': '#9333ea',
    '--primary-700': '#7e22ce',
    '--primary-800': '#6b21a8',
    '--primary-900': '#581c87',
    '--primary-950': '#3b0764',
  },
  orange: {
    '--primary-50': '#fff7ed',
    '--primary-100': '#ffedd5',
    '--primary-200': '#fed7aa',
    '--primary-300': '#fdba74',
    '--primary-400': '#fb923c',
    '--primary-500': '#f97316',
    '--primary-600': '#ea580c',
    '--primary-700': '#c2410c',
    '--primary-800': '#9a3412',
    '--primary-900': '#7c2d12',
    '--primary-950': '#431407',
  },
  emerald: {
    '--primary-50': '#ecfdf5',
    '--primary-100': '#d1fae5',
    '--primary-200': '#a7f3d0',
    '--primary-300': '#6ee7b7',
    '--primary-400': '#34d399',
    '--primary-500': '#10b981',
    '--primary-600': '#059669',
    '--primary-700': '#047857',
    '--primary-800': '#065f46',
    '--primary-900': '#064e3b',
    '--primary-950': '#022c22',
  },
  red: {
    '--primary-50': '#fef2f2',
    '--primary-100': '#fee2e2',
    '--primary-200': '#fecaca',
    '--primary-300': '#fca5a5',
    '--primary-400': '#f87171',
    '--primary-500': '#ef4444',
    '--primary-600': '#dc2626',
    '--primary-700': '#b91c1c',
    '--primary-800': '#991b1b',
    '--primary-900': '#7f1d1d',
    '--primary-950': '#450a0a',
  },
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-slate-600 dark:text-slate-400 font-medium text-sm">Loading ECOVIS...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

interface AppLayoutContext {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  notes: Note[];
  prompts: SavedPrompt[];
  setCurrentPage: (page: Page) => void;
  onTaskClick: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onAddTaskClick: () => void;
  onAddNote: (note: Note) => void;
  onAddPrompt: (prompt: SavedPrompt) => void;
}

function AuthenticatedApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // App Theme & Appearance State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ecovis_theme') as Theme) || 'light';
  });
  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(() => {
    return (localStorage.getItem('ecovis_primary_color') as PrimaryColor) || 'cyan';
  });

  // App Business Data State
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks);
  const [notes, setNotes] = useState<Note[]>(() => initialNotes);
  const [prompts, setPrompts] = useState<SavedPrompt[]>(() => initialPrompts);

  // Modals State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Apply Theme
  useEffect(() => {
    localStorage.setItem('ecovis_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Primary Color Palette
  useEffect(() => {
    localStorage.setItem('ecovis_primary_color', primaryColor);
    const palette = COLOR_PALETTES[primaryColor] || COLOR_PALETTES.cyan;
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, val]) => {
      root.style.setProperty(key, String(val));
    });
  }, [primaryColor]);

  // Derive Current Page from URL
  const currentPage: Page = useMemo(() => {
    return ROUTE_TO_PAGE[location.pathname] || 'Dashboard';
  }, [location.pathname]);

  const handleNavigate = useCallback((page: Page) => {
    const route = PAGE_TO_ROUTE[page] || '/';
    navigate(route);
  }, [navigate]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
  }, []);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(prev => prev && prev.id === updatedTask.id ? updatedTask : prev);
  }, []);

  const handleAddTask = useCallback((newTask: any) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      projectName: newTask.projectName || 'General',
      priority: newTask.priority || 'medium',
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(Date.now() + 86400000 * 7),
      progress: 0,
      status: 'pending',
      assignedTo: newTask.assignedTo || 'Deepa Rathi',
      contributors: newTask.contributors || [],
      history: [
        {
          id: `hist-${Date.now()}`,
          user: 'You',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          action: 'created',
          details: 'Created task',
          timestamp: new Date(),
        }
      ],
      subtasks: newTask.subtasks || [],
    };
    setTasks(prev => [task, ...prev]);
    setIsAddTaskOpen(false);
  }, []);

  const handleAddNote = useCallback((note: Note) => {
    setNotes(prev => [note, ...prev]);
  }, []);

  const handleAddPrompt = useCallback((prompt: SavedPrompt) => {
    setPrompts(prev => [prompt, ...prev]);
  }, []);

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={handleNavigate}
      theme={theme}
      setTheme={setTheme}
      primaryColor={primaryColor}
      setPrimaryColor={setPrimaryColor}
      isAddTaskOpen={isAddTaskOpen}
      setIsAddTaskOpen={setIsAddTaskOpen}
      onAddTask={handleAddTask}
    >
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              setCurrentPage={handleNavigate}
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onAddTaskClick={() => setIsAddTaskOpen(true)}
              onUpdateTask={handleUpdateTask}
              notes={notes}
              prompts={prompts}
              onAddNote={handleAddNote}
              onAddPrompt={handleAddPrompt}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              setCurrentPage={handleNavigate}
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
            />
          }
        />
        <Route
          path="/add-project"
          element={
            <AddProject
              setCurrentPage={handleNavigate}
              notes={notes}
              onAddNote={handleAddNote}
            />
          }
        />
        <Route
          path="/team-projects"
          element={
            <TeamProjects
              tasks={tasks}
              onUpdateTask={handleUpdateTask}
            />
          }
        />
        <Route
          path="/tasks"
          element={
            <MyTasks
              tasks={tasks}
              setTasks={setTasks}
              onTaskClick={handleTaskClick}
            />
          }
        />
        <Route
          path="/schedule"
          element={<WorkSchedule tasks={tasks} />}
        />
        <Route path="/folders" element={<Folders />} />
        <Route path="/tickets" element={<TicketGeneration />} />
        <Route path="/hierarchy" element={<OrgHierarchy />} />
        <Route path="/services" element={<ServiceManagement />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/seed" element={<SeedEmployees />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
      />
    </Layout>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/signin" element={user ? <Navigate to="/" replace /> : <SignIn />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
