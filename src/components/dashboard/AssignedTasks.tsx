
import React from "react";
import { ChevronRight, Plus } from '../icons';
import { Button } from '../ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/Avatar';
import type { Task } from '../../data/mockData';
import type { Page } from '../../App';
import { team } from '../../data/mockData';

const statusColors: { [key: string]: string } = {
  'in-progress': 'bg-cyan-500',
  'pending': 'bg-amber-500',
  'completed': 'bg-emerald-500',
};

const AssignedTaskCard: React.FC<{ task: Task; onClick: () => void; }> = ({ task, onClick }) => {
  // Find assignee avatar
  const assigneeData = team.find(m => m.name === task.assignedTo);
  const assigneeInitials = task.assignedTo.split(' ').map(n => n[0]).join('').substring(0, 2);

  return (
    <div 
        onClick={onClick} 
        className="w-64 h-36 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-cyan-500/50 cursor-pointer group"
    >
      <div>
          <div className="flex justify-between items-start mb-2 gap-2">
             <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-6 w-6 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src={assigneeData?.avatarUrl} />
                    <AvatarFallback className="text-[9px]">{assigneeInitials}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{task.assignedTo}</span>
             </div>
             <div className={`w-2 h-2 rounded-full shrink-0 ${statusColors[task.status] || 'bg-slate-400'}`} title={task.status}></div>
          </div>
          
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 leading-relaxed group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
            {task.title}
          </h3>
      </div>
      
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
        <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[70%]">{task.projectName}</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{task.progress || 0}%</span>
        </div>
      </div>
    </div>
  );
};

interface AssignedTasksProps {
    tasks: Task[];
    setCurrentPage: (page: Page) => void;
    onTaskClick: (task: Task) => void;
    onAddTaskClick: () => void;
    hideHeader?: boolean;
}

const AssignedTasks: React.FC<AssignedTasksProps> = ({ tasks, setCurrentPage, onTaskClick, onAddTaskClick, hideHeader = false }) => {
    const activeTasks = tasks
        .filter(task => task.status !== 'completed')
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="relative">
      {!hideHeader && (
          <div className="flex flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Team Workload
                <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{activeTasks.length}</span>
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentPage('Team Projects')} className="h-8 text-xs">
                View Projects <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
      )}
      
      <div className="flex space-x-4 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
        {/* Add Task Empty Card */}
        <div 
            onClick={onAddTaskClick}
            className="w-24 flex-shrink-0 h-36 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-200 cursor-pointer group"
        >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 flex items-center justify-center transition-colors">
                <Plus size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 text-center px-1 leading-tight">Add Task</span>
        </div>

        {activeTasks.length > 0 ? (
            activeTasks.map(task => <AssignedTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)
        ) : (
            <div className="w-64 flex-shrink-0 h-36 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                Team is all caught up.
            </div>
        )}
      </div>
    </div>
  );
};

export default AssignedTasks;
