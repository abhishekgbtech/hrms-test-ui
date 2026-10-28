"use client";

import React, { useState } from "react";
import { projects, Task } from '../data/mockData';
import { ProjectGridCard } from '../components/dashboard/ProjectGridCard';
import ProjectModal from '../components/dashboard/ProjectModal';
import { AnimatePresence } from 'framer-motion';
import { Plus } from '../components/icons';
import { Button } from '../components/ui/Button';
import type { Page } from '../App';

interface ProjectsProps {
    setCurrentPage: (page: Page) => void;
    tasks?: Task[];
    onUpdateTask?: (task: Task) => void;
}

const Projects: React.FC<ProjectsProps> = ({ setCurrentPage, tasks, onUpdateTask }) => {
    const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

    return (
        <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">All Projects</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all your ongoing projects.</p>
                </div>
                <Button onClick={() => setCurrentPage('Add Project')}>
                    <Plus size={16} className="mr-2" /> New Project
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => 
                    <ProjectGridCard key={project.id} project={project} onClick={() => setSelectedProject(project)} />
                )}
            </div>
             <AnimatePresence>
                {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} tasks={tasks} onTaskUpdate={onUpdateTask} />}
            </AnimatePresence>
        </div>
    );
};

export default Projects;