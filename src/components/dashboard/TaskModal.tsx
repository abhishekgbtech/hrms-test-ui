
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Task, TaskHistory, ExecutionStep, team } from '../../data/mockData';
import { X, Calendar, FileText, Users, Flag, CheckCircle2, CheckSquare, MessageSquare, Plus, Trash2, User } from '../icons';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { cn } from '../../lib/utils';
import { user as currentUser } from '../../data/mockData';
import { formatDistanceToNow } from 'date-fns';
import { Slider } from '../ui/Slider';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { MemberSelect } from "../ui/MemberSelect";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate?: (task: Task) => void;
}

const priorityMap = {
  high: { text: 'High', iconColor: 'text-red-500', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
  medium: { text: 'Medium', iconColor: 'text-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
  low: { text: 'Low', iconColor: 'text-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
};

const statusMap: { [key: string]: {text: string, badge: string} } = {
  'pending': { text: 'Pending', badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' },
  'in-progress': { text: 'In Progress', badge: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300' },
  'completed': { text: 'Completed', badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' },
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {icon}
            <span>{label}</span>
        </div>
        <div className="pl-6 text-base font-medium text-slate-800 dark:text-slate-100">
            {children}
        </div>
    </div>
);

const HistoryItem: React.FC<{ item: TaskHistory }> = ({ item }) => {
    return (
        <div className="flex items-start gap-3 text-sm">
            <Avatar className="h-7 w-7">
                <AvatarImage src={item.avatarUrl} />
                <AvatarFallback>{item.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{item.user}</span>
                    <span className="text-slate-500 dark:text-slate-400"> {item.action.replace('_', ' ')}</span>
                </p>
                <p className="mt-0.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                    {item.details}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </p>
            </div>
        </div>
    );
};

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdate }) => {
    const [newComment, setNewComment] = useState('');
    const [progress, setProgress] = useState(0);
    const [activeTab, setActiveTab] = useState<'steps' | 'activity'>('steps');
    const [newStepText, setNewStepText] = useState('');

    // Sync progress and steps when task changes
    useEffect(() => {
        if (task) {
            setProgress(task.progress || 0);
        }
    }, [task]);

    if (!task) return null;
    
    const priority = priorityMap[task.priority];
    const status = statusMap[task.status];

    // Activity Handlers
    const handleAddComment = () => {
        if (!newComment.trim()) return;
        if (onUpdate && task) {
            const newHistoryItem: TaskHistory = {
                id: `h-${Date.now()}`,
                user: currentUser.name,
                avatarUrl: currentUser.avatarUrl,
                action: 'commented',
                details: newComment,
                timestamp: new Date()
            };
            onUpdate({ ...task, history: [...task.history, newHistoryItem] });
        }
        setNewComment('');
    };

    // Progress Handler
    const handleProgressChange = (newProgress: number) => {
        setProgress(newProgress);
        if (onUpdate && task) {
            onUpdate({ ...task, progress: newProgress });
        }
    };

    const handleMarkComplete = () => {
        const completedProgress = 100;
        setProgress(completedProgress);
        if (onUpdate && task) {
            onUpdate({ 
                ...task, 
                progress: completedProgress, 
                status: 'completed' 
            });
        }
    };

    // Step Handlers
    const handleAddStep = () => {
        if (!newStepText.trim()) return;
        if (onUpdate && task) {
            const newStep: ExecutionStep = {
                id: `step-${Date.now()}`,
                text: newStepText,
                completed: false
            };
            const updatedSteps = [...(task.executionSteps || []), newStep];
            onUpdate({ ...task, executionSteps: updatedSteps });
        }
        setNewStepText('');
    };

    const handleToggleStep = (stepId: string) => {
        if (onUpdate && task && task.executionSteps) {
            const updatedSteps = task.executionSteps.map(step => 
                step.id === stepId ? { ...step, completed: !step.completed } : step
            );
            onUpdate({ ...task, executionSteps: updatedSteps });
        }
    };

    const handleDeleteStep = (stepId: string) => {
        if (onUpdate && task && task.executionSteps) {
            const updatedSteps = task.executionSteps.filter(step => step.id !== stepId);
            onUpdate({ ...task, executionSteps: updatedSteps });
        }
    };

    const handleStepKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddStep();
        }
    }

    // Contributor Handlers
    const handleAddContributor = (name: string) => {
        if (onUpdate && task) {
            const currentContributors = task.contributors || [];
            if (!currentContributors.includes(name) && name !== task.assignedTo) {
                const newHistoryItem: TaskHistory = {
                    id: `h-${Date.now()}`,
                    user: currentUser.name,
                    avatarUrl: currentUser.avatarUrl,
                    action: 'contribution_added',
                    details: `Added ${name} as a contributor.`,
                    timestamp: new Date()
                };
                onUpdate({ 
                    ...task, 
                    contributors: [...currentContributors, name],
                    history: [...task.history, newHistoryItem]
                });
            }
        }
    };

    const handleRemoveContributor = (name: string) => {
        if (onUpdate && task) {
            const currentContributors = task.contributors || [];
            const updatedContributors = currentContributors.filter(c => c !== name);
            onUpdate({ ...task, contributors: updatedContributors });
        }
    };

    return (
        <AnimatePresence>
            {task && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Card className="overflow-hidden flex flex-col flex-1">
                            <CardHeader className="flex-shrink-0 flex flex-row items-start justify-between bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <Badge className={cn('capitalize', status.badge)}>{status.text.replace('-', ' ')}</Badge>
                                        {progress === 100 && (
                                            <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Done
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{task.title}</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-1 -mr-1">
                                    <X size={20} />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-6 overflow-y-auto flex-1">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Description</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {task.description}
                                        </p>
                                    </div>

                                    {/* Progress Slider Section */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Task Progress</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Drag to update completion status</p>
                                            </div>
                                            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                                                {progress}%
                                            </span>
                                        </div>
                                        <Slider 
                                            value={progress} 
                                            onValueChange={handleProgressChange} 
                                            className="mt-2"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <DetailItem icon={<Calendar size={16} />} label="Due Date">
                                            {task.dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </DetailItem>
                                         <DetailItem icon={<Flag size={16} className={priority.iconColor} />} label="Priority">
                                            <Badge className={cn('capitalize', priority.badge)}>{priority.text}</Badge>
                                        </DetailItem>
                                         <DetailItem icon={<FileText size={16} />} label="Project">
                                            {task.projectName}
                                        </DetailItem>
                                        <DetailItem icon={<Users size={16} />} label="Assignee">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={team.find(t => t.name === task.assignedTo)?.avatarUrl || ''} />
                                                    <AvatarFallback>{task.assignedTo.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <span>{task.assignedTo}</span>
                                            </div>
                                        </DetailItem>
                                    </div>

                                    {/* Contributors Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                                <User size={14} className="text-slate-500" />
                                                Contributors
                                            </h3>
                                            <div className="w-[160px]">
                                                <MemberSelect 
                                                    placeholder="+ Add Member"
                                                    onChange={handleAddContributor}
                                                    exclude={[task.assignedTo, ...(task.contributors || [])]}
                                                    className="h-7 text-xs border-0 bg-transparent shadow-none hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 min-h-[32px] items-center p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800">
                                            {(!task.contributors || task.contributors.length === 0) && (
                                                <span className="text-xs text-slate-400 italic px-1">No additional contributors.</span>
                                            )}
                                            {task.contributors?.map(contributor => (
                                                <Badge key={contributor} variant="secondary" className="pl-1 pr-2 py-1 gap-1.5 flex items-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={team.find(t => t.name === contributor)?.avatarUrl || currentUser.avatarUrl} />
                                                        <AvatarFallback>{contributor.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    {contributor}
                                                    <button onClick={() => handleRemoveContributor(contributor)} className="hover:text-red-500 transition-colors ml-1">
                                                        <X size={12} />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-200 dark:border-slate-700/50 pt-6">
                                        {/* Tabs */}
                                        <div className="flex space-x-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 mb-6">
                                            <button
                                                onClick={() => setActiveTab('steps')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
                                                    activeTab === 'steps' 
                                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                )}
                                            >
                                                <CheckSquare size={16} />
                                                Steps
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('activity')}
                                                className={cn(
                                                    "flex-1 flex items-center justify-center gap-2 rounded-md py-1.5 text-sm font-medium transition-all",
                                                    activeTab === 'activity' 
                                                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" 
                                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                )}
                                            >
                                                <MessageSquare size={16} />
                                                Activity
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="min-h-[200px]">
                                            {activeTab === 'steps' ? (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Input 
                                                            placeholder="Add a step..." 
                                                            value={newStepText}
                                                            onChange={(e) => setNewStepText(e.target.value)}
                                                            onKeyDown={handleStepKeyDown}
                                                            className="flex-1"
                                                        />
                                                        <Button size="icon" onClick={handleAddStep} disabled={!newStepText.trim()}>
                                                            <Plus size={18} />
                                                        </Button>
                                                    </div>
                                                    
                                                    {!task.executionSteps || task.executionSteps.length === 0 ? (
                                                        <p className="text-center text-slate-400 text-sm py-8 italic">No steps added yet.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {task.executionSteps.map(step => (
                                                                <div 
                                                                    key={step.id} 
                                                                    className={cn(
                                                                        "group flex items-center gap-3 p-3 rounded-lg border transition-all",
                                                                        step.completed 
                                                                            ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" 
                                                                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-200 dark:hover:border-cyan-800"
                                                                    )}
                                                                >
                                                                    <button 
                                                                        onClick={() => handleToggleStep(step.id)}
                                                                        className={cn(
                                                                            "flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                                            step.completed 
                                                                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                                                                : "bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 hover:border-cyan-500 dark:hover:border-cyan-400"
                                                                        )}
                                                                    >
                                                                        {step.completed && <CheckCircle2 size={14} />}
                                                                    </button>
                                                                    <span className={cn(
                                                                        "flex-1 text-sm transition-all",
                                                                        step.completed ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 dark:text-slate-200"
                                                                    )}>
                                                                        {step.text}
                                                                    </span>
                                                                    <button 
                                                                        onClick={() => handleDeleteStep(step.id)}
                                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-5">
                                                    <div className="max-h-[300px] overflow-y-auto space-y-5 pr-2">
                                                        {task.history.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(item => <HistoryItem key={item.id} item={item} />)}
                                                    </div>
                                                    <div className="mt-4 flex items-start gap-3 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                                                        <Avatar className="h-8 w-8 mt-1">
                                                            <AvatarImage src={currentUser.avatarUrl} />
                                                            <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <textarea
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                placeholder="Add a comment..."
                                                                className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm ring-offset-white dark:ring-offset-slate-900 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                                                                rows={2}
                                                            />
                                                            <div className="flex justify-end mt-2">
                                                                <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                                                                    Comment
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                             <CardFooter className="flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 p-4 flex justify-end gap-2">
                                <Button variant="secondary" onClick={onClose}>Close</Button>
                                {task.status !== 'completed' && task.assignedTo === currentUser.name &&
                                    <Button onClick={handleMarkComplete}>Mark as Complete</Button>
                                }
                             </CardFooter>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskModal;
