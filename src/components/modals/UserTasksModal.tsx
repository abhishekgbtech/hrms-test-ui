
"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Calendar, CheckCircle2, Circle, Plus, Users } from "../icons";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Task } from "../../data/mockData";

interface UserTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatarUrl: string;
  };
  onAssignNewTask: () => void;
  tasks?: Task[]; // Receive global tasks
}

export const UserTasksModal: React.FC<UserTasksModalProps> = ({ isOpen, onClose, user, onAssignNewTask, tasks = [] }) => {
  // Filter tasks from the Master List for this specific user (Assignee or Contributor)
  const userTasks = tasks.filter(task => 
    (task.assignedTo === user.name || task.contributors?.includes(user.name)) && 
    task.status !== 'completed' // Optionally filter out completed
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 gap-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
             </Avatar>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {user.name}'s Tasks
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userTasks.length} Active Tasks</p>
             </div>
          </div>
          <Button size="sm" className="ml-auto bg-cyan-600 text-white hover:bg-cyan-700" onClick={onAssignNewTask}>
            <Plus size={16} className="mr-1.5" /> Assign Task
          </Button>
        </DialogHeader>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
            {userTasks.length > 0 ? (
                userTasks.map(task => {
                    const isContributor = task.contributors?.includes(user.name);
                    
                    return (
                        <div key={task.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className={`
                                    ${task.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20' : 
                                    task.priority === 'medium' ? 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20' : 
                                    'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20'} capitalize
                                `}>
                                    {task.priority} Priority
                                </Badge>
                                {task.status === 'completed' ? 
                                    <CheckCircle2 className="text-emerald-500 h-5 w-5" /> : 
                                    <Circle className="text-slate-300 h-5 w-5" />
                                }
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
                                {isContributor && (
                                    <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                        <Users size={10} /> Contributor
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                                {task.projectName && <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 rounded">{task.projectName}</span>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> {format(task.dueDate, 'MMM dd, yyyy')}
                                </span>
                                <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {task.status.replace('-', ' ')}
                                </span>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                    <CheckCircle2 size={48} className="mb-3 opacity-20" />
                    <p>No tasks assigned yet.</p>
                </div>
            )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <DialogClose asChild>
            <Button variant="secondary" className="w-full sm:w-auto">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
