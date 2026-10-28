
"use client";

import React, { useState } from "react";
import { Flag, Check, Trash2, Calendar, Users } from '../components/icons';
import { Task } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getUserFullName } from '../lib/userUtils';

type Status = 'All' | 'Pending' | 'In Progress' | 'Completed';

interface MyTasksProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    onTaskClick: (task: Task) => void;
}

const priorityMap: { [key in 'high' | 'medium' | 'low']: { text: string; iconColor: string; } } = {
    high: { text: 'High', iconColor: 'text-red-500' },
    medium: { text: 'Medium', iconColor: 'text-amber-500' },
    low: { text: 'Low', iconColor: 'text-emerald-500' },
};

interface SwipeableTaskItemProps {
    task: Task;
    onTaskClick: (t: Task) => void;
    onComplete: (id: string) => void;
    currentUserName: string;
}

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({ task, onTaskClick, onComplete, currentUserName }) => {
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [50, 100], [0, 1]);
    const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
    
    // Background color changes based on drag direction
    const backgroundColor = useTransform(x, [-100, 0, 100], ["rgba(239, 68, 68, 0.2)", "rgba(255, 255, 255, 0)", "rgba(16, 185, 129, 0.2)"]);

    const handleDragEnd = (event: any, info: any) => {
        if (info.offset.x > 100) {
            onComplete(task.id);
        } else if (info.offset.x < -100) {
            // Implement delete logic here if needed
            // onDelete(task.id);
        }
    };

    const priority = priorityMap[task.priority];
    const isCompleted = task.status === 'completed';
    const isContributor = task.contributors?.includes(currentUserName);

    const getStatusClass = (status: 'pending' | 'in-progress' | 'completed') => {
         switch (status) {
            case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'in-progress': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    }

    return (
        <motion.div style={{ background: backgroundColor }} className="relative rounded-lg overflow-hidden mb-4">
            {/* Background Layers for Swipe Actions */}
            <motion.div style={{ opacity: backgroundOpacity }} className="absolute inset-y-0 left-0 w-full bg-emerald-500 flex items-center justify-start pl-6 text-white font-bold pointer-events-none z-0 rounded-lg">
                <Check size={24} className="mr-2" /> Complete
            </motion.div>
            <motion.div style={{ opacity: deleteOpacity }} className="absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-6 text-white font-bold pointer-events-none z-0 rounded-lg">
                Delete <Trash2 size={24} className="ml-2" />
            </motion.div>

            {/* Task Content */}
            <motion.div
                drag={!isCompleted ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1} // Resistance feeling
                onDragEnd={handleDragEnd}
                onClick={() => onTaskClick(task)}
                whileTap={{ cursor: "grabbing" }}
                className="bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 transition-colors cursor-grab relative z-10"
            >
                <div className="flex items-center min-w-0 flex-1">
                    <Flag size={16} className={`mr-3 flex-shrink-0 ${priority.iconColor}`} />
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-slate-800 dark:text-slate-100 truncate ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                {task.title}
                            </p>
                            {isContributor && (
                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Users size={10} /> Contributor
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar size={12}/> Due: {task.dueDate.toLocaleDateString()}
                            </span>
                            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600">|</span>
                            <span className="truncate">{task.projectName}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:space-x-4 mt-2 sm:mt-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${getStatusClass(task.status)}`}>
                        {task.status.replace('-', ' ')}
                    </span>
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300" title={task.assignedTo}>
                        {task.assignedTo.split(' ').map(n => n[0]).join('')}
                    </div>
                    {/* Mobile Hint */}
                    {!isCompleted && <span className="sm:hidden text-[10px] text-slate-300 dark:text-slate-600 italic">Swipe to complete</span>}
                </div>
            </motion.div>
        </motion.div>
    );
}

const MyTasks: React.FC<MyTasksProps> = ({ tasks, setTasks, onTaskClick }) => {
    const { profile } = useAuth();
    const [statusFilter, setStatusFilter] = useState<Status>('All');
    const currentUserName = getUserFullName(profile);

    const handleCompleteTask = (taskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, status: 'completed', progress: 100 } : task
            )
        );
    };

    // Filter Logic: Assigned to me OR I am a contributor
    const myRelatedTasks = tasks.filter(t => t.assignedTo === currentUserName || t.contributors?.includes(currentUserName));

    const filteredTasks = myRelatedTasks.filter(task => {
        if (statusFilter === 'All') return true;
        return task.status.replace('-', ' ').toLowerCase() === statusFilter.toLowerCase();
    }).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-140px)]">
            <header className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Tasks ({filteredTasks.length})</h1>
            </header>
            <div className="p-5 flex-1 overflow-hidden flex flex-col">
                {/* Filters */}
                <div className="mb-5 shrink-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Status:</span>
                        {(['All', 'Pending', 'In Progress', 'Completed'] as Status[]).map(status => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === status ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="overflow-y-auto pr-2 -mr-2">
                    <AnimatePresence>
                        {filteredTasks.map(task => (
                            <SwipeableTaskItem
                                key={task.id}
                                task={task}
                                onTaskClick={onTaskClick}
                                onComplete={handleCompleteTask}
                                currentUserName={currentUserName}
                            />
                        ))}
                    </AnimatePresence>
                    {filteredTasks.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-slate-500 dark:text-slate-400">No tasks match the current filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTasks;
