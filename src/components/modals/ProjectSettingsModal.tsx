
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { projects } from "../../data/mockData";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: typeof projects[0];
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, project }) => {
  const [status, setStatus] = useState(project.status);
  const [name, setName] = useState(project.name);
  const [company, setCompany] = useState(project.company);

  const handleSave = () => {
      console.log("Saving project settings:", { id: project.id, name, company, status });
      // In a real app, dispatch an update action here
      onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Edit Project Permissions & Status
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
            <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
                <Label>Company / Client</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <div className="space-y-2">
                <Label>Project Status</Label>
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="on-track">On Track</SelectItem>
                        <SelectItem value="at-risk">At Risk</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    Changing status will notify all team members.
                </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                <Label className="text-red-600 dark:text-red-400">Danger Zone</Label>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                    <div className="text-sm">
                        <p className="font-medium text-red-800 dark:text-red-300">Archive Project</p>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70">Make read-only for all users</p>
                    </div>
                    <Button size="sm" variant="destructive">Archive</Button>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
