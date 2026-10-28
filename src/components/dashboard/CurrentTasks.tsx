
import React from "react";
import { ChevronRight, Plus } from '../icons';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import type { Task } from '../../data/mockData';
import type { Page } from '../../App';

const priorityStyles: { [key: string]: string } = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-emerald-500',
};

const TaskCard: React.FC<{ task: Task; onClick: () => void; }> = ({ task, onClick }) => {
  const timeDiff = task.dueDate.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const timeLeft = daysLeft > 1 ? `${daysLeft} days left` 
    : daysLeft === 1 ? 'Due tomorrow'
    : timeDiff >= 0 ? 'Due today'
    : `Overdue by ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'}`;

  return (
    <div 
        onClick={onClick} 
        className={`w-64 h-36 flex-shrink-0 flex flex-col justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-l-4 border-slate-200 dark:border-slate-700 ${priorityStyles[task.priority]} shadow-sm transition-all duration-200 hover:shadow-lg hover:border-l-cyan-500 cursor-pointer`}
    >
      <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate max-w-[60%]">{task.projectName}</span>
            <span className={`text-[10px] font-bold ${daysLeft <= 1 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{timeLeft}</span>
          </div>
          
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 leading-relaxed">
            {task.title}
          </h3>
      </div>
      
      <div className="flex items-center gap-3 pt-2">
        <Progress value={task.progress || 0} className="h-1.5 flex-1" />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-8 text-right">{task.progress || 0}%</span>
      </div>
    </div>
  );
};

interface CurrentTasksProps {
    tasks: Task[];
    setCurrentPage: (page: Page) => void;
    onTaskClick: (task: Task) => void;
    onAddTaskClick: () => void;
    title?: string;
    className?: string;
    hideHeader?: boolean;
}

const CurrentTasks: React.FC<CurrentTasksProps> = ({ 
    tasks, 
    setCurrentPage, 
    onTaskClick, 
    onAddTaskClick, 
    title = "Your Current Tasks", 
    className,
    hideHeader = false 
}) => {
    // We filter for active tasks here to ensure the view is clean
    const currentTasks = tasks
        .filter(task => task.status !== 'completed')
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className={`relative ${className}`}>
      {!hideHeader && (
          <div className="flex flex-row justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {title}
                <span className="text-xs font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{currentTasks.length}</span>
            </h2>
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage('My Tasks')} className="h-8 text-xs">
                    View All <ChevronRight size={14} className="ml-1" />
                </Button>
            </div>
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

        {currentTasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
        
        {currentTasks.length === 0 && (
            <div className="w-64 flex-shrink-0 h-36 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-sm">No tasks assigned.</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default CurrentTasks;
