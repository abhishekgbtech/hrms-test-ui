"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import { Briefcase, Users, UserPlus } from '../icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loader2 } from 'lucide-react';

interface ProjectWithMembers {
  id: string;
  name: string;
  description: string | null;
  status: string;
  memberCount: number;
}

const ProjectMemberManagement: React.FC = () => {
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .order('name');

      if (error) throw error;

      const projectsWithMembers = await Promise.all(
        (data || []).map(async (project: any) => {
          const { count } = await supabase
            .from('project_members')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          return {
            ...project,
            memberCount: count || 0,
          };
        })
      );

      setProjects(projectsWithMembers);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'planning':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage team member assignments for all projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <Briefcase size={24} className="text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {project.name}
                  </h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </div>

            {project.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <Users size={16} />
              <span>{project.memberCount} team members</span>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <UserPlus size={14} />
              Manage Members
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectMemberManagement;
