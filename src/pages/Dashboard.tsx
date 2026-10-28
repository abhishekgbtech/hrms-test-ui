
"use client";

import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import CurrentTasks from '../components/dashboard/CurrentTasks';
import AssignedTasks from '../components/dashboard/AssignedTasks';
import ActiveProjects from '../components/dashboard/ActiveProjects';
import AttendanceCard from '../components/dashboard/AttendanceCard';
import QuickActions from '../components/dashboard/QuickActions';
import TeamWidget from '../components/dashboard/TeamWidget';
import type { Page } from '../App';
import { Task, Note, SavedPrompt } from '../data/mockData';
import { Button } from "../components/ui/Button";
import { ChevronRight } from "../components/icons";
import { cn } from "../lib/utils";
import { getUserFullName } from '../lib/userUtils';

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTaskClick: () => void;
  onUpdateTask?: (task: Task) => void;
  notes: Note[];
  prompts: SavedPrompt[];
  onAddNote: (note: Note) => void;
  onAddPrompt: (prompt: SavedPrompt) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    setCurrentPage,
    tasks,
    onTaskClick,
    onAddTaskClick,
    onUpdateTask,
    notes,
    prompts,
    onAddNote,
    onAddPrompt
}) => {
  const { canViewTeamWorkload, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'myTasks' | 'teamWorkload'>('myTasks');
  const showTeamWorkload = canViewTeamWorkload();
  const currentUserName = getUserFullName(profile);

  // Filter tasks based on assignment OR contribution
  const myTasks = tasks.filter(t => t.assignedTo === currentUserName || t.contributors?.includes(currentUserName));

  // Team workload excludes tasks assigned to me, but might show tasks I contribute to if someone else owns them?
  // Simplest interpretation: Team workload = everything NOT assigned to me.
  const teamTasks = tasks.filter(t => t.assignedTo !== currentUserName);

  // Calculate counts for active tasks (not completed) to show in tabs
  const activeMyTasksCount = myTasks.filter(t => t.status !== 'completed').length;
  const activeTeamTasksCount = teamTasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="space-y-6">
      {/* Tabbed Task Section */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setActiveTab('myTasks')}
                    className={cn(
                        "text-xl font-bold flex items-center gap-2 transition-colors",
                        activeTab === 'myTasks' ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                    )}
                  >
                      My Tasks
                      <span className={cn(
                          "text-xs font-normal px-2 py-0.5 rounded-full transition-colors",
                          activeTab === 'myTasks' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                      )}>{activeMyTasksCount}</span>
                  </button>

                  {showTeamWorkload && (
                    <button
                      onClick={() => setActiveTab('teamWorkload')}
                      className={cn(
                          "text-xl font-bold flex items-center gap-2 transition-colors",
                          activeTab === 'teamWorkload' ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                      )}
                    >
                        Team Workload
                        <span className={cn(
                            "text-xs font-normal px-2 py-0.5 rounded-full transition-colors",
                            activeTab === 'teamWorkload' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                        )}>{activeTeamTasksCount}</span>
                    </button>
                  )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(activeTab === 'myTasks' ? 'My Tasks' : 'Team Projects')}
                className="h-8 text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
              >
                  {activeTab === 'myTasks' ? 'View All' : 'View Projects'} <ChevronRight size={14} className="ml-1" />
              </Button>
          </div>

          <div className="min-h-[160px]">
            {activeTab === 'myTasks' ? (
                <CurrentTasks 
                    tasks={myTasks} 
                    setCurrentPage={setCurrentPage} 
                    onTaskClick={onTaskClick} 
                    onAddTaskClick={onAddTaskClick}
                    hideHeader={true}
                />
            ) : (
                <AssignedTasks 
                    tasks={teamTasks}
                    setCurrentPage={setCurrentPage}
                    onTaskClick={onTaskClick}
                    onAddTaskClick={onAddTaskClick}
                    hideHeader={true}
                />
            )}
          </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AttendanceCard tasks={tasks} />
          <ActiveProjects setCurrentPage={setCurrentPage} tasks={tasks} onUpdateTask={onUpdateTask} />
        </div>
        <div className="space-y-6">
          <QuickActions 
            setCurrentPage={setCurrentPage} 
            notes={notes}
            prompts={prompts}
            onAddNote={onAddNote}
            onAddPrompt={onAddPrompt}
          />
          <TeamWidget setCurrentPage={setCurrentPage} tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
