
"use client";

import React, { useState } from "react";
import { projects, team, Task } from '../data/mockData';
import { Search, MoreVertical, Briefcase, Mail, Phone as PhoneIcon, Filter, Plus, ChevronRight } from '../components/icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn, handleContactAction } from "../lib/utils";
import { MemberProfileDropdown } from "../components/dashboard/MemberProfileDropdown";
import ProjectModal from '../components/dashboard/ProjectModal';
import { AnimatePresence, motion } from "framer-motion";

// --- Components ---

const TeamMemberRow = ({ member, tasks }: { member: typeof team[0], tasks?: Task[] }) => {
    const statusConfig = {
        available: { color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: "Available" },
        'in-meeting': { color: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30", label: "In Meeting" },
        'on-leave': { color: "bg-slate-500", text: "text-slate-700 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", label: "On Leave" },
    }[member.status] || { color: "bg-slate-500", text: "text-slate-500", bg: "bg-slate-100", label: member.status };

    const handleAction = (type: 'email' | 'phone', value: string) => {
        handleContactAction(type, value, () => {
            // Optional: You could show a toast here
            console.log(`Copied ${type}: ${value}`);
        });
    };

    return (
        <div className="group flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                    <MemberProfileDropdown user={member} triggerType="avatar-only" tasks={tasks} />
                    <span className={cn("absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900", statusConfig.color)}></span>
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{member.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.role}</p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
                 {/* Status Badge */}
                 <div className={cn("px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5", statusConfig.bg, statusConfig.text)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.color)}></span>
                    {statusConfig.label}
                 </div>
                 
                 {/* Quick Contacts */}
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => handleAction('email', member.email)} className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-full transition-colors" title={member.email}>
                        <Mail size={16} />
                    </button>
                    <button onClick={() => handleAction('phone', member.phone)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-full transition-colors" title={member.phone}>
                        <PhoneIcon size={16} />
                    </button>
                 </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <MoreVertical size={16} />
                </Button>
            </div>
        </div>
    );
};

const ProjectListRow = ({ project, onClick, tasks }: { project: typeof projects[0]; onClick: () => void; tasks?: Task[] }) => {
    const daysLeft = Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    const statusColor = {
        'on-track': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        'at-risk': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        'delayed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }[project.status];

    return (
        <div 
            onClick={onClick}
            className="group flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-cyan-500/30 hover:shadow-md transition-all cursor-pointer"
        >
            {/* Icon/Logo Placeholder - using first letter of company */}
            <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
                {project.company.charAt(0)}
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">{project.name}</h3>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider", statusColor)}>
                        {project.status.replace('-', ' ')}
                    </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{project.company}</p>
            </div>

            {/* Progress */}
            <div className="w-full md:w-32 lg:w-48 shrink-0">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{project.progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${project.progress}%` }} />
                </div>
            </div>

            {/* Team */}
            <div className="flex -space-x-2 shrink-0">
                {project.teamMembers.slice(0, 4).map((m, i) => (
                    <div key={i} className="relative z-0 hover:z-10 transition-all">
                        <MemberProfileDropdown 
                            user={m}
                            triggerType="avatar-only"
                            avatarClassName="h-8 w-8 border-2 border-white dark:border-slate-800 ring-1 ring-slate-100 dark:ring-slate-700"
                            tasks={tasks}
                        />
                    </div>
                ))}
                {project.teamMembers.length > 4 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 ring-1 ring-slate-100 dark:ring-slate-700">
                        +{project.teamMembers.length - 4}
                    </div>
                )}
            </div>

            {/* Deadline & Arrow */}
            <div className="flex items-center justify-between md:justify-end gap-4 min-w-[120px]">
                <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Deadline</p>
                    <p className={cn("text-sm font-semibold", daysLeft < 0 ? "text-red-500" : "text-slate-700 dark:text-slate-200")}>
                        {project.deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                </div>
                <div className="h-8 w-8 flex items-center justify-center rounded-full bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                    <ChevronRight className="text-slate-300 group-hover:text-cyan-600 transition-colors" size={18} />
                </div>
            </div>
        </div>
    )
}

// --- Main Page Component ---

interface TeamProjectsProps {
    tasks?: Task[];
    onUpdateTask?: (task: Task) => void;
}

function TeamProjects({ tasks, onUpdateTask }: TeamProjectsProps) {
    const [mainTab, setMainTab] = useState<'directory' | 'projects'>('directory');
    const [activeRoleTab, setActiveRoleTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

    // Mock roles based on data
    const roles = ['All', 'Developer', 'Designer', 'QA', 'Manager'];

    const filteredTeam = team.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              member.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeRoleTab === 'All' || member.role.includes(activeRoleTab);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            
            {/* Top Navigation Bar */}
            <div className="flex items-center space-x-8 pb-2 border-b border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setMainTab('directory')}
                    className={cn(
                        "text-xl font-bold flex items-center gap-2 transition-colors relative pb-2",
                        mainTab === 'directory' ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                    )}
                >
                    Team Directory
                    <span className={cn(
                        "text-xs font-normal px-2 py-0.5 rounded-full transition-colors",
                        mainTab === 'directory' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                    )}>{team.length}</span>
                    {mainTab === 'directory' && (
                        <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400" />
                    )}
                </button>

                <button 
                    onClick={() => setMainTab('projects')}
                    className={cn(
                        "text-xl font-bold flex items-center gap-2 transition-colors relative pb-2",
                        mainTab === 'projects' ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400"
                    )}
                >
                    Team Projects
                    <span className={cn(
                        "text-xs font-normal px-2 py-0.5 rounded-full transition-colors",
                        mainTab === 'projects' ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-600"
                    )}>{projects.length}</span>
                    {mainTab === 'projects' && (
                        <motion.div layoutId="mainTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {mainTab === 'directory' ? (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="h-full flex flex-col bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
                    >
                        {/* Directory Header & Controls */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 space-y-6 bg-white dark:bg-slate-900">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Team Members</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team members, roles, and availability.</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                        <Input 
                                            placeholder="Search members..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-9 h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-cyan-500"
                                        />
                                    </div>
                                    <Button variant="outline" size="icon" className="shrink-0 h-10 w-10">
                                        <Filter size={16} />
                                    </Button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
                                {roles.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setActiveRoleTab(role)}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium transition-all whitespace-nowrap relative",
                                            activeRoleTab === role 
                                                ? "text-cyan-600 dark:text-cyan-400" 
                                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                        )}
                                    >
                                        {role}
                                        {activeRoleTab === role && (
                                            <motion.div 
                                                layoutId="activeRoleTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400 rounded-t-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team List */}
                        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
                            {filteredTeam.length > 0 ? (
                                <div className="flex flex-col">
                                    {filteredTeam.map((member, index) => (
                                        <motion.div
                                            key={member.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <TeamMemberRow member={member} tasks={tasks} />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 pb-20">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                        <Search size={24} className="opacity-30" />
                                    </div>
                                    <p className="font-medium">No members found</p>
                                    <p className="text-sm opacity-70">Try adjusting your filters or search query.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="h-full overflow-y-auto pb-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Active Projects</h2>
                                <Button size="sm" onClick={() => console.log('New Project')}>
                                    <Plus size={16} className="mr-2" /> New Project
                                </Button>
                            </div>
                            
                            <div className="space-y-3">
                                {projects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <ProjectListRow project={project} onClick={() => setSelectedProject(project)} tasks={tasks} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedProject && (
                    <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} tasks={tasks} onTaskUpdate={onUpdateTask} />
                )}
            </AnimatePresence>
        </div>
    );
}

export default TeamProjects;
