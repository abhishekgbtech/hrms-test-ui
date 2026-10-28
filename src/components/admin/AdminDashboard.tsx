"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import { Users, Building, Briefcase, Shield, TrendingUp, UserPlus } from '../icons';
import { Card } from '../ui/Card';
import { Loader2 } from 'lucide-react';

interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  totalProjects: number;
  managerCount: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [usersResult, deptsResult, projectsResult] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact' }),
        supabase.from('departments').select('*', { count: 'exact' }),
        supabase.from('projects').select('*', { count: 'exact' }),
      ]);

      const activeUsers = usersResult.data?.filter((u: any) => u.status === 'active').length || 0;
      const managers = usersResult.data?.filter((u: any) => u.is_manager).length || 0;

      setStats({
        totalEmployees: usersResult.count || 0,
        activeEmployees: activeUsers,
        totalDepartments: deptsResult.count || 0,
        totalProjects: projectsResult.count || 0,
        managerCount: managers,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      subtitle: `${stats?.activeEmployees || 0} active`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Departments',
      value: stats?.totalDepartments || 0,
      subtitle: 'Active departments',
      icon: Building,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Projects',
      value: stats?.totalProjects || 0,
      subtitle: 'Total projects',
      icon: Briefcase,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      title: 'Managers',
      value: stats?.managerCount || 0,
      subtitle: 'Team managers',
      icon: Shield,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {stat.subtitle}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-cyan-500" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-4 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <UserPlus size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Add New Employee</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a new user account</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Building size={20} className="text-green-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Create Department</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Set up a new department</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Briefcase size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Assign Project Members</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage project team assignments</p>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-left rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <Shield size={20} className="text-orange-500" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Manage Permissions</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Update user roles and access</p>
              </div>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-medium">New employee added</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Rahul Sharma joined Development team</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-medium">Role updated</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Sanjana Konda promoted to Manager</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-100 font-medium">Department created</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Marketing department established</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
