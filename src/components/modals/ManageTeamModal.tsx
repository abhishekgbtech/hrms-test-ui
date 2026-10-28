
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { projects } from "../../data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Plus, Trash2 } from "../icons";

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatarUrl: string;
    role?: string;
  };
}

export const ManageTeamModal: React.FC<ManageTeamModalProps> = ({ isOpen, onClose, user }) => {
  // Mock state to track which projects the user belongs to
  // In a real app, this would come from the backend
  const [userProjects, setUserProjects] = useState<string[]>(
    projects.filter(p => p.teamMembers.some(m => m.name === user.name)).map(p => p.id)
  );

  const handleToggleProject = (projectId: string) => {
    if (userProjects.includes(projectId)) {
        setUserProjects(prev => prev.filter(id => id !== projectId));
    } else {
        setUserProjects(prev => [...prev, projectId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
             <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
             </Avatar>
             <div>
                <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Manage Team Membership
                </DialogTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role || 'Team Member'}</p>
             </div>
          </div>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
                Select the projects <strong>{user.name}</strong> should be a part of:
            </p>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {projects.map(project => {
                    const isMember = userProjects.includes(project.id);
                    return (
                        <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <div>
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{project.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{project.company}</p>
                            </div>
                            
                            <Button 
                                size="sm" 
                                variant={isMember ? "destructive" : "outline"}
                                className={isMember ? "bg-red-100 text-red-600 hover:bg-red-200 border-transparent dark:bg-red-900/20 dark:text-red-400" : "border-cyan-200 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-400"}
                                onClick={() => handleToggleProject(project.id)}
                            >
                                {isMember ? (
                                    <>
                                        <Trash2 size={14} className="mr-1.5" /> Remove
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} className="mr-1.5" /> Add
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
