
"use client";

import React, { useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import {
  FileText,
  Figma,
  Calendar,
  Tag,
  Paperclip,
  Users,
  MoreHorizontal,
  Download,
  Plus,
  ArrowRight,
  Edit,
  X,
  Share2,
  ChevronDown,
  List,
  GitBranch,
  Briefcase,
  ChevronRight,
  CornerDownRight,
  Flag,
  User
} from "../icons";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
} from "../ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import ProjectPlan from "./ProjectPlan";
import { MemberProfileDropdown } from "./MemberProfileDropdown";
import { projects, Task, team } from "../../data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/Avatar";

// Type Definitions
type Assignee = {
  name: string;
  avatarUrl: string;
  email?: string;
  phone?: string;
};

type ProjectTag = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

type Attachment = {
  name: string;
  size: string;
  type: "pdf" | "figma" | "other";
};

export type TaskItem = {
  id: string;
  title: string;
  status: "Completed" | "In Progress" | "Pending";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  assignee: Assignee;
  subtasks?: TaskItem[];
};

export type ProjectDetailViewProps = {
  breadcrumbs: { label: string; href: string }[];
  title: string;
  company: string;
  status: string;
  assignees: Assignee[];
  dateRange: {
    start: string;
    end: string;
  };
  tags: ProjectTag[];
  description: string;
  attachments: Attachment[];
  tasks: TaskItem[];
  onClose: () => void;
  onTaskStatusChange?: (id: string, status: TaskItem["status"]) => void;
  globalTasks?: Task[]; // Received global tasks
};

// Helper component for interactive status badge
const TaskStatusSelector = ({ status, onChange }: { status: TaskItem["status"], onChange?: (s: TaskItem["status"]) => void }) => {
  const statusStyles = {
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-700/60 hover:bg-green-200 dark:hover:bg-green-900/60",
    "In Progress": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/60 hover:bg-yellow-200 dark:hover:bg-yellow-900/60",
    Pending: "bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-800/60",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
            disabled={!onChange}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 dark:focus:ring-offset-slate-900", 
                statusStyles[status],
                !onChange && "cursor-default opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
        >
          {status}
          {onChange && <ChevronDown className="ml-1 h-3 w-3 opacity-50" />}
        </button>
      </DropdownMenuTrigger>
      {onChange && (
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChange("Pending"); }}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChange("In Progress"); }}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onChange("Completed"); }}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

// Helper to get file icon
const FileIcon = ({ type }: { type: Attachment["type"] }) => {
  if (type === "pdf") return <FileText className="h-6 w-6 text-red-500" />;
  if (type === "figma") return <Figma className="h-6 w-6 text-purple-500" />;
  return <Paperclip className="h-6 w-6 text-slate-500" />;
};

const getBadgeVariantClass = (variant: string) => {
  switch(variant) {
    case 'secondary': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-transparent';
    case 'destructive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-transparent';
    case 'outline': return 'text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800';
    default: return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 border-transparent';
  }
}

export function ProjectDetailView({
  breadcrumbs,
  title,
  company,
  status,
  assignees,
  dateRange,
  tags,
  description,
  attachments,
  tasks,
  onClose,
  onTaskStatusChange,
  globalTasks
}: ProjectDetailViewProps) {
  const [view, setView] = useState<'list' | 'plan'>('list');
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  
  // Find the actual project object to pass to settings
  const currentProject = projects.find(p => p.name === title);

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Calculate unique contributors for this project
  const projectContributors = useMemo(() => {
    if (!globalTasks) return [];
    
    const uniqueUsers = new Set<string>();
    
    // Filter tasks belonging to this project
    const projectTasks = globalTasks.filter(t => t.projectName === title);
    
    projectTasks.forEach(t => {
        // Add Assignee
        if(t.assignedTo && t.assignedTo !== 'Unassigned') uniqueUsers.add(t.assignedTo);
        // Add Contributors
        if(t.contributors) t.contributors.forEach(c => uniqueUsers.add(c));
        // Add Subtask Assignees
        if(t.subtasks) t.subtasks.forEach(st => {
            if(st.assignee && st.assignee !== 'Unassigned') uniqueUsers.add(st.assignee);
        });
    });

    // Map names to user objects (from team mock data or fallback)
    return Array.from(uniqueUsers).map(name => {
        const teamMember = team.find(m => m.name === name);
        return {
            name: name,
            avatarUrl: teamMember?.avatarUrl || 'https://i.pravatar.cc/150?u=unknown',
            role: teamMember?.role || 'Contributor',
            email: teamMember?.email || '',
            phone: teamMember?.phone || ''
        };
    });
  }, [globalTasks, title]);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    },
  };

  // Transform hierarchical tasks for ProjectPlan
  const planTasks = useMemo(() => {
    return tasks.map((task, index) => ({
        id: task.id,
        title: task.title,
        description: `Due: ${task.dueDate} - Assigned to: ${task.assignee.name}`,
        status: task.status.toLowerCase().replace(' ', '-'),
        priority: task.priority.toLowerCase(),
        level: 0,
        dependencies: index > 0 ? [tasks[index-1].id] : [],
        subtasks: task.subtasks?.map(sub => ({
            id: sub.id,
            title: sub.title,
            description: `Due: ${sub.dueDate}`,
            status: sub.status.toLowerCase().replace(' ', '-'),
            priority: sub.priority.toLowerCase(),
            tools: []
        })) || []
    }));
  }, [tasks]);

  return (
    <Card className="w-full max-w-5xl mx-auto overflow-hidden border-none shadow-2xl shadow-slate-200/50 dark:shadow-black/50 bg-white dark:bg-slate-900 max-h-[90vh] flex flex-col">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col h-full min-h-0">
        {/* Header Section */}
        <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <span className={index === breadcrumbs.length - 1 ? "font-semibold text-slate-800 dark:text-slate-200" : ""}>{breadcrumb.label}</span>
                  {index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex"><Share2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hidden sm:flex"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </motion.div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
            {/* Title Section */}
            <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</motion.h1>

            {/* Meta Info Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Company / Client</p>
                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {company}
                        </p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MoreHorizontal className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Status</p>
                        <Badge className="mt-1 font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/60">
                            <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                            {status}
                        </Badge>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Project Manager</p>
                        <div className="flex items-center -space-x-2 mt-1">
                          {assignees.map(assignee => (
                              <MemberProfileDropdown
                                key={assignee.name}
                                user={{
                                  name: assignee.name,
                                  handle: '@' + assignee.name.toLowerCase().replace(/\s+/g, ''),
                                  avatarUrl: assignee.avatarUrl,
                                  email: assignee.email || 'contact@example.com',
                                  phone: assignee.phone || '+1 234 567 8900'
                                }}
                                triggerType="avatar-only"
                                project={currentProject}
                                tasks={globalTasks}
                              />
                          ))}
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Date</p>
                        <p className="font-medium flex items-center gap-2 mt-1 text-slate-800 dark:text-slate-200">
                            {dateRange.start} <ArrowRight className="h-4 w-4 text-slate-500 dark:text-slate-400" /> {dateRange.end}
                        </p>
                    </div>
                </div>
                 <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Tags</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {tags.map((tag) => <Badge key={tag.label} className={getBadgeVariantClass(tag.variant)}>{tag.label}</Badge>)}
                        </div>
                    </div>
                </div>
                
                {/* Project Contributors Section */}
                <div className="flex items-start gap-3">
                    <User className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Project Contributors</p>
                        <div className="flex items-center -space-x-2 mt-1 flex-wrap">
                            {projectContributors.length > 0 ? projectContributors.map(contributor => (
                                <MemberProfileDropdown
                                    key={contributor.name}
                                    user={{
                                        name: contributor.name,
                                        handle: '@' + contributor.name.toLowerCase().replace(/\s+/g, ''),
                                        avatarUrl: contributor.avatarUrl,
                                        email: contributor.email || 'contact@example.com',
                                        phone: contributor.phone || '+1 234 567 8900',
                                        role: contributor.role
                                    }}
                                    triggerType="avatar-only"
                                    avatarClassName="w-7 h-7 ring-2 ring-white dark:ring-slate-900"
                                    tasks={globalTasks}
                                />
                            )) : <span className="text-xs text-slate-400 italic">No tasks assigned yet.</span>}
                        </div>
                    </div>
                </div>

                 <div className="flex items-start gap-3 col-span-1 md:col-span-2 lg:col-span-3">
                    <FileText className="h-5 w-5 mt-0.5 text-slate-500 dark:text-slate-400" />
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Description</p>
                        <p className="mt-1 text-slate-700 dark:text-slate-300">{description}</p>
                    </div>
                </div>
            </motion.div>

            {/* Attachments Section */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                        <Paperclip className="h-5 w-5 text-slate-500 dark:text-slate-400"/>
                        Attachment <Badge className="bg-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200">{attachments.length}</Badge>
                    </h3>
                    <Button variant="ghost" size="sm" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700"><Download className="h-4 w-4 mr-2" />Download All</Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attachments.map(file => (
                        <div key={file.name} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                            <FileIcon type={file.type} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate text-slate-800 dark:text-slate-200">{file.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{file.size}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <Plus className="h-6 w-6 text-slate-400"/>
                    </div>
                </div>
            </motion.div>
            
            {/* Task List Section */}
            <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Task List</h3>
                    <div className="flex items-center gap-3">
                        {view === 'plan' && (
                            <Button
                                size="sm"
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                onClick={() => {
                                    alert('This feature will convert the plan into actual project tasks, subtasks, and assignments in the database. Implementation coming soon!');
                                }}
                            >
                                <ArrowRight size={14} className="mr-1.5" />
                                Implement this plan
                            </Button>
                        )}
                        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <button
                                onClick={() => setView('list')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                                    view === 'list'
                                        ? "bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                <List size={14} />
                                List
                            </button>
                            <button
                                onClick={() => setView('plan')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-2",
                                    view === 'plan'
                                        ? "bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                )}
                            >
                                <GitBranch size={14} />
                                Plan
                            </button>
                        </div>
                    </div>
                </div>
                
                {view === 'list' ? (
                    <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                    <TableHead className="w-[40%]">Task Name</TableHead>
                                    <TableHead className="w-[20%]">Assignee</TableHead>
                                    <TableHead className="w-[20%]">Status</TableHead>
                                    <TableHead className="w-[20%] text-right">Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => (
                                    <React.Fragment key={task.id}>
                                        <TableRow 
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                            onClick={() => toggleTask(task.id)}
                                        >
                                            <TableCell className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <div className={cn("transition-transform duration-200", expandedTasks.includes(task.id) ? "rotate-90" : "")}>
                                                    <ChevronRight size={16} className="text-slate-400" />
                                                </div>
                                                {task.title}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <MemberProfileDropdown 
                                                        user={{
                                                            name: task.assignee.name,
                                                            avatarUrl: task.assignee.avatarUrl,
                                                            email: task.assignee.email || 'user@ecovis.com',
                                                            phone: task.assignee.phone || '',
                                                            role: 'Member'
                                                        }}
                                                        triggerType="avatar-only"
                                                        avatarClassName="h-6 w-6"
                                                        tasks={globalTasks}
                                                    />
                                                    <span className="text-sm text-slate-600 dark:text-slate-300">{task.assignee.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <TaskStatusSelector 
                                                    status={task.status} 
                                                    onChange={onTaskStatusChange ? (newStatus) => onTaskStatusChange(task.id, newStatus) : undefined}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right text-slate-500 dark:text-slate-400">{task.dueDate}</TableCell>
                                        </TableRow>
                                        
                                        {/* Nested Subtasks */}
                                        {expandedTasks.includes(task.id) && task.subtasks && task.subtasks.map(subtask => (
                                            <TableRow key={subtask.id} className="bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                                <TableCell className="pl-10 relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600">
                                                        <CornerDownRight size={14} />
                                                    </div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">{subtask.title}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 opacity-80" onClick={(e) => e.stopPropagation()}>
                                                        <MemberProfileDropdown 
                                                            user={{
                                                                name: subtask.assignee.name,
                                                                avatarUrl: subtask.assignee.avatarUrl,
                                                                email: subtask.assignee.email || 'user@ecovis.com',
                                                                phone: subtask.assignee.phone || '',
                                                                role: 'Member'
                                                            }}
                                                            triggerType="avatar-only"
                                                            avatarClassName="h-5 w-5"
                                                            tasks={globalTasks}
                                                        />
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{subtask.assignee.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs font-normal border-slate-200 dark:border-slate-700 text-slate-500">
                                                        {subtask.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-slate-400">{subtask.dueDate}</TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden space-y-3">
                        {tasks.map((task) => (
                            <div key={task.id} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex-1 mr-2">{task.title}</h4>
                                    <TaskStatusSelector 
                                        status={task.status} 
                                        onChange={onTaskStatusChange ? (newStatus) => onTaskStatusChange(task.id, newStatus) : undefined}
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <MemberProfileDropdown 
                                            user={{
                                                name: task.assignee.name,
                                                avatarUrl: task.assignee.avatarUrl,
                                                email: task.assignee.email || 'user@ecovis.com',
                                                phone: task.assignee.phone || '',
                                                role: 'Member'
                                            }}
                                            triggerType="avatar-only"
                                            avatarClassName="h-6 w-6"
                                            tasks={globalTasks}
                                        />
                                        <span>{task.assignee.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {task.dueDate}
                                    </div>
                                </div>

                                {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="pl-4 border-l-2 border-slate-100 dark:border-slate-800 space-y-2 pt-1">
                                        {task.subtasks.map(sub => (
                                            <div key={sub.id} className="flex justify-between items-center text-xs">
                                                <span className="text-slate-600 dark:text-slate-300 truncate mr-2">{sub.title}</span>
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-slate-200 dark:border-slate-700">
                                                    {sub.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 min-h-[300px]">
                        <ProjectPlan tasks={planTasks} />
                    </div>
                )}
            </motion.div>
        </CardContent>
      </motion.div>
    </Card>
  );
}
