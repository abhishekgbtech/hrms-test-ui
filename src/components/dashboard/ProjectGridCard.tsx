

import React from "react";
import { projects } from '../../data/mockData';
import { MoreVertical } from '../icons';

const statusStyles: { [key: string]: { bg: string; text: string; } } = {
  'on-track': { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-300' },
  'at-risk': { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-700 dark:text-amber-300' },
  'delayed': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300' },
};

interface ProjectGridCardProps {
    project: typeof projects[0];
    onClick: () => void;
}

export const ProjectGridCard: React.FC<ProjectGridCardProps> = ({ project, onClick }) => {
    const daysLeft = Math.ceil((project.deadline.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

    return (
        <div 
            onClick={onClick}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md hover:border-cyan-500/50 cursor-pointer flex flex-col h-full"
        >
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[project.status].bg} ${statusStyles[project.status].text}`}>
                        {project.status.replace('-', ' ')}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <MoreVertical size={20} />
                    </button>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-3">{project.name}</h3>
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{project.completedTasks}/{project.totalTasks} Tasks</span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex -space-x-3">
                    {project.teamMembers.slice(0, 3).map(member => (
                        <img key={member.name} src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 object-cover" title={member.name} />
                    ))}
                    {project.teamMembers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                            +{project.teamMembers.length - 3}
                        </div>
                    )}
                </div>
                <span className={`text-sm font-semibold ${daysLeft < 7 ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                </span>
            </div>
        </div>
    );
};