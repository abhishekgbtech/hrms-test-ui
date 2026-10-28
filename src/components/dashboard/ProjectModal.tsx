"use client";

import React, { useState, useEffect } from "react";
import { ProjectDetailView, ProjectDetailViewProps, TaskItem } from './ProjectDetailView';
import { projects, team, user, Task } from '../../data/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, PartyPopper, Trophy, ArrowRight } from "../icons";
import { Button } from "../ui/Button";
import { format } from 'date-fns';

interface ProjectModalProps {
  project: typeof projects[0] | null;
  onClose: () => void;
  tasks?: Task[]; // Accept global tasks
  onTaskUpdate?: (task: Task) => void;
}

const CelebrationOverlay = ({ onClose }: { onClose: () => void }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[60] flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl"
    >
        <div className="text-center space-y-6 max-w-md p-8 relative">
            {/* Background decoration */}
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"
            />
            
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20"
            >
                <Trophy size={48} className="text-white" />
            </motion.div>

            <div className="space-y-2">
                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-slate-800 dark:text-slate-100"
                >
                    Project Completed!
                </motion.h2>
                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-500 dark:text-slate-400"
                >
                    All tasks have been finished successfully. Outstanding work!
                </motion.p>
            </div>

            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
            >
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold">Tasks</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">100%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                    <p className="text-xl font-bold text-emerald-500">Done</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-4"
            >
                <Button size="lg" onClick={onClose} className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                    Close & Archive <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
        </div>
    </motion.div>
);

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, tasks: globalTasks = [], onTaskUpdate }) => {
  // Local state for the modal view
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [projectStatus, setProjectStatus] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize data when project opens
  useEffect(() => {
    if (project) {
        setProjectStatus(project.status);
        
        // Use Global Tasks to populate the view.
        // We filter for main tasks or flattened subtasks. 
        // For the Project Plan view, we probably prefer the hierarchical structure if we had it, but flattened is easier for now to sync with global.
        const projectSpecificTasks = globalTasks.filter(t => t.projectName === project.name && !t.description.startsWith('[Subtask of:')); 

        // Map global tasks to View model
        const mappedTasks: TaskItem[] = projectSpecificTasks.map(t => {
            const assigneeMember = team.find(m => m.name === t.assignedTo) || { name: t.assignedTo, avatarUrl: 'https://i.pravatar.cc/150?u=unknown' };
            if(t.assignedTo === user.name) assigneeMember.avatarUrl = user.avatarUrl;

            return {
                id: t.id,
                title: t.title,
                status: t.status === 'in-progress' ? 'In Progress' : t.status === 'completed' ? 'Completed' : 'Pending',
                priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1) as any,
                dueDate: format(t.dueDate, 'MMM d, yyyy'),
                assignee: { name: t.assignedTo, avatarUrl: assigneeMember.avatarUrl },
                subtasks: t.subtasks?.map(st => {
                        const subAssigneeMember = team.find(m => m.name === st.assignee) || { name: st.assignee, avatarUrl: 'https://i.pravatar.cc/150?u=unknown' };
                        if(st.assignee === user.name) subAssigneeMember.avatarUrl = user.avatarUrl;

                        return {
                        id: st.id,
                        title: st.title,
                        status: st.status === 'in-progress' ? 'In Progress' : st.status === 'completed' ? 'Completed' : 'Pending',
                        priority: (st.priority ? st.priority.charAt(0).toUpperCase() + st.priority.slice(1) : 'Medium') as any,
                        dueDate: st.dueDate ? format(st.dueDate, 'MMM d, yyyy') : 'No Date',
                        assignee: { name: st.assignee, avatarUrl: subAssigneeMember.avatarUrl }
                        }
                }) || []
            };
        });
        setTasks(mappedTasks);
        setShowCelebration(false);
    }
  }, [project, globalTasks]);

  if (!project) return null;
  
  const handleStatusChange = (id: string, newStatus: TaskItem['status']) => {
    // Sync with Master List
    if (onTaskUpdate) {
        const taskToUpdate = globalTasks.find(t => t.id === id);
        if (taskToUpdate) {
            const mappedStatus = newStatus.toLowerCase().replace(' ', '-') as 'pending' | 'in-progress' | 'completed';
            const updatedTask = { 
                ...taskToUpdate, 
                status: mappedStatus,
                progress: mappedStatus === 'completed' ? 100 : mappedStatus === 'in-progress' ? 50 : 0
            };
            onTaskUpdate(updatedTask);
        }
    }

    // Local check for completion celebration (visual only, actual data update flows via props)
    const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
    );
    const allCompleted = updatedTasks.every(t => t.status === 'Completed');
    if (allCompleted && projectStatus !== 'Completed') {
        setTimeout(() => setShowCelebration(true), 500);
    }
  };

  // Map project data to Detail View props
  const detailViewData: Omit<ProjectDetailViewProps, 'onClose'> = {
    breadcrumbs: [{ label: 'Dashboard', href: '#' }, { label: 'Projects', href: '#' }, { label: 'Details', href: '#' }],
    title: project.name,
    company: project.company,
    status: projectStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    assignees: project.teamMembers,
    dateRange: {
        start: 'Nov 1, 2025', 
        end: project.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    },
    tags: [
        { label: 'Development', variant: 'default' },
        { label: 'UI/UX', variant: 'secondary' },
        { label: 'Priority: High', variant: 'destructive' }
    ],
    description: `This project focuses on ${project.name.toLowerCase()} to improve overall system efficiency and user experience. The team is currently working on key deliverables expected to be completed by end of month.`,
    attachments: [
        { name: 'Project_Specs.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'Design_System.fig', size: '14 MB', type: 'figma' },
        { name: 'Assets.zip', size: '45 MB', type: 'other' }
    ],
    tasks: tasks,
    onTaskStatusChange: handleStatusChange,
    globalTasks: globalTasks
  };

  return (
      <AnimatePresence>
        {project && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-5xl max-h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ProjectDetailView {...detailViewData} onClose={onClose} />
                    
                    {/* Celebration Overlay */}
                    <AnimatePresence>
                        {showCelebration && <CelebrationOverlay onClose={onClose} />}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
  );
};

export default ProjectModal;