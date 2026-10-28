"use client";

import React, { useState, useMemo } from "react";
import { projects, Task } from '../../data/mockData';
import { ChevronRight } from '../icons';
import ProjectModal from './ProjectModal';
import { AnimatePresence } from 'framer-motion';
import { ProjectGridCard } from './ProjectGridCard';
import { Button } from '../ui/Button';
import type { Page } from '../../App';

interface ActiveProjectsProps {
  setCurrentPage?: (page: Page) => void;
  tasks?: Task[];
  onUpdateTask?: (task: Task) => void;
}

const ActiveProjects: React.FC<ActiveProjectsProps> = ({ setCurrentPage, tasks, onUpdateTask }) => {
    const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

    // Sort projects: delayed > at-risk > on-track, then by due date (ascending)
    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => {
            const statusOrder: Record<string, number> = { 'delayed': 0, 'at-risk': 1, 'on-track': 2 };
            const statusA = statusOrder[a.status] ?? 3;
            const statusB = statusOrder[b.status] ?? 3;
            
            if (statusA !== statusB) return statusA - statusB;
            return a.deadline.getTime() - b.deadline.getTime();
        });
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Active Projects</h2>
                {setCurrentPage && (
                    <Button variant="ghost" size="sm" onClick={() => setCurrentPage('Projects')} className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300">
                        View All <ChevronRight size={16} className="ml-1" />
                    </Button>
                )}
            </div>
            {/* Layout: Horizontal scroll on mobile/tablet (< lg), Grid on desktop (>= lg) */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-x-0 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0">
                {sortedProjects.slice(0, 4).map(project => (
                    <div key={project.id} className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 flex-shrink-0 w-full lg:w-auto h-full">
                        <ProjectGridCard project={project} onClick={() => setSelectedProject(project)} />
                    </div>
                ))}
            </div>
            <AnimatePresence>
                {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} tasks={tasks} onTaskUpdate={onUpdateTask} />}
            </AnimatePresence>
        </div>
    );
};

export default ActiveProjects;