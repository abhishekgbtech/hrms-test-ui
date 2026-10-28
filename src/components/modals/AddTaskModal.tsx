
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { DatePicker } from "../ui/DatePicker";
import { projects, team } from "../../data/mockData";
import { Calendar, FileText, Users, Flag, X, User } from "../icons";
import { Card, CardContent, CardHeader, CardFooter } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";
import { MemberSelect } from "../ui/MemberSelect";
import { useAuth } from '../../contexts/AuthContext';
import { getUserFullName, getUserAvatarUrl } from '../../lib/userUtils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: any) => void;
  initialAssignee?: string; // New prop
}

const priorityMap: { [key: string]: { text: string; iconColor: string; badge: string } } = {
  high: { text: 'High', iconColor: 'text-red-500', badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' },
  medium: { text: 'Medium', iconColor: 'text-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' },
  low: { text: 'Low', iconColor: 'text-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' },
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {icon}
            <span>{label}</span>
        </div>
        <div className="pl-6 text-base font-medium text-slate-800 dark:text-slate-100 w-full">
            {children}
        </div>
    </div>
);

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, initialAssignee }) => {
  const { profile } = useAuth();
  const currentUserName = getUserFullName(profile);
  const currentUserAvatar = getUserAvatarUrl(profile);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState("medium");
  const [projectName, setProjectName] = useState("");
  const [assignee, setAssignee] = useState(currentUserName);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Contributors State
  const [contributors, setContributors] = useState<string[]>([]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setPriority("medium");
      setProjectName("");
      setAssignee(initialAssignee || currentUserName); // Use initialAssignee if provided
      setComment("");
      setContributors([]);
      setErrors({});
    }
  }, [isOpen, initialAssignee]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = "Required";
    // Project name is now optional
    if (!dueDate) newErrors.dueDate = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || "No description provided.",
      dueDate: dueDate || new Date(),
      priority,
      projectName: projectName || "General", // Default to "General" if not specified
      assignedTo: assignee,
      contributors: contributors, // Add selected contributors
      status: 'pending',
      progress: 0,
      history: [
        {
          id: `h-${Date.now()}`,
          user: currentUserName,
          avatarUrl: currentUserAvatar,
          action: 'created',
          details: 'Created the task.',
          timestamp: new Date()
        },
        ...(comment ? [{
            id: `h-${Date.now()}-comment`,
            user: currentUserName,
            avatarUrl: currentUserAvatar,
            action: 'commented',
            details: comment,
            timestamp: new Date()
        }] : [])
      ]
    };

    onAddTask(newTask);
    onClose();
  };

  const handleAddContributor = (name: string) => {
      if (!contributors.includes(name) && name !== assignee) {
          setContributors([...contributors, name]);
      }
  };

  const handleRemoveContributor = (name: string) => {
      setContributors(contributors.filter(c => c !== name));
  };

  const currentPriority = priorityMap[priority];
  const statusBadge = "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"; // Pending status style

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden flex flex-col flex-1 border-none shadow-2xl bg-white dark:bg-slate-900">
              {/* Header */}
              <CardHeader className="flex-shrink-0 flex flex-row items-start justify-between bg-slate-50/50 dark:bg-slate-900/50 p-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2 w-full mr-8">
                    <Badge className={cn('capitalize w-fit pointer-events-none', statusBadge)}>Pending</Badge>
                    <div className="relative">
                        <Input
                            placeholder="Task Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={cn(
                                "text-xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-600 rounded-none",
                                errors.title ? "placeholder:text-red-300" : ""
                            )}
                            autoFocus
                        />
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-2 -mr-2 flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </Button>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto flex-1 space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm">Description</h3>
                    <Textarea
                      placeholder="Add a description..."
                      className="min-h-[80px] resize-none border-none shadow-none p-0 focus-visible:ring-0 bg-transparent placeholder:text-slate-400 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <DetailItem icon={<Calendar size={16} />} label="Due Date">
                          <div className={errors.dueDate ? "rounded-md ring-1 ring-red-500" : ""}>
                            <DatePicker date={dueDate} setDate={setDueDate} />
                          </div>
                      </DetailItem>

                      <DetailItem icon={<Flag size={16} className={currentPriority.iconColor} />} label="Priority">
                           <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger className="border-0 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 px-2 h-8 -ml-2 w-full shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                      </DetailItem>

                      <DetailItem icon={<FileText size={16} />} label="Project (Optional)">
                         <Select value={projectName} onValueChange={setProjectName}>
                            <SelectTrigger className="border-0 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 px-2 h-8 -ml-2 w-full shadow-none focus:ring-0">
                              <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="General">General</SelectItem>
                              {projects.map((p) => (
                                <SelectItem key={p.id} value={p.name}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </DetailItem>

                      <DetailItem icon={<Users size={16} />} label="Assign To">
                           {/* Using MemberSelect for searchable large list */}
                           <div className="-ml-2 w-full">
                                <MemberSelect 
                                    value={assignee}
                                    onChange={setAssignee}
                                    className="border-0 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 shadow-none h-8 px-2"
                                />
                           </div>
                      </DetailItem>
                  </div>

                  {/* Contributors Section */}
                  <div className="space-y-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                          <User size={14} className="text-slate-500" /> 
                          Contributors
                      </h3>
                      <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          {contributors.map(contributor => (
                              <Badge key={contributor} variant="secondary" className="pl-1 pr-2 py-1 gap-1.5 flex items-center">
                                  <Avatar className="h-5 w-5">
                                      <AvatarImage src={team.find(t => t.name === contributor)?.avatarUrl || currentUserAvatar} />
                                      <AvatarFallback>{contributor.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {contributor}
                                  <button onClick={() => handleRemoveContributor(contributor)} className="hover:text-red-500 transition-colors">
                                      <X size={12} />
                                  </button>
                              </Badge>
                          ))}
                          
                          <div className="flex-1 min-w-[200px]">
                              <MemberSelect 
                                  placeholder="+ Add contributor"
                                  onChange={handleAddContributor}
                                  exclude={[assignee, ...contributors]}
                                  className="border-0 bg-transparent shadow-none h-8 text-xs px-2 hover:bg-transparent text-slate-500"
                              />
                          </div>
                      </div>
                  </div>

                  {/* Activity (Comment) Section */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 text-sm">Activity</h3>
                      <div className="flex gap-3 items-start">
                          <Avatar className="h-8 w-8 mt-1">
                              <AvatarImage src={currentUserAvatar} />
                              <AvatarFallback>{currentUserName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                               <Textarea 
                                  className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 min-h-[80px] resize-none text-sm"
                                  placeholder="Add an initial comment or note..."
                                  value={comment}
                                  onChange={(e) => setComment(e.target.value)}
                               />
                          </div>
                      </div>
                  </div>
              </CardContent>

              <CardFooter className="flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  Create Task
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
