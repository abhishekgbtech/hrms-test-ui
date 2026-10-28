"use client";

import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Building, MapPin, Briefcase, Folder, Lock, TrendingUp } from '../components/icons';
import { cn } from '../lib/utils';
import AdminDashboard from '../components/admin/AdminDashboard';
import PeopleManagement from '../components/admin/PeopleManagement';
import DepartmentManagement from '../components/admin/DepartmentManagement';
import OfficeManagement from '../components/admin/OfficeManagement';
import ProjectMemberManagement from '../components/admin/ProjectMemberManagement';
import RolesPermissions from '../components/admin/RolesPermissions';
import AccessReports from '../components/admin/AccessReports';

type AdminTab = 'overview' | 'people' | 'departments' | 'offices' | 'projects' | 'roles' | 'reports';

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  minAccessLevel: number;
}

const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp size={18} />, minAccessLevel: 2 },
    { id: 'people', label: 'People', icon: <Users size={18} />, minAccessLevel: 2 },
    { id: 'departments', label: 'Departments', icon: <Building size={18} />, minAccessLevel: 3 },
    { id: 'offices', label: 'Offices', icon: <MapPin size={18} />, minAccessLevel: 3 },
    { id: 'projects', label: 'Project Members', icon: <Briefcase size={18} />, minAccessLevel: 2 },
    { id: 'roles', label: 'Roles & Permissions', icon: <Lock size={18} />, minAccessLevel: 3 },
    { id: 'reports', label: 'Access Reports', icon: <Folder size={18} />, minAccessLevel: 3 },
  ];

  const accessibleTabs = tabs.filter(tab => (profile?.access_level ?? 0) >= tab.minAccessLevel);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboard />;
      case 'people':
        return <PeopleManagement />;
      case 'departments':
        return <DepartmentManagement />;
      case 'offices':
        return <OfficeManagement />;
      case 'projects':
        return <ProjectMemberManagement />;
      case 'roles':
        return <RolesPermissions />;
      case 'reports':
        return <AccessReports />;
      default:
        return <AdminDashboard />;
    }
  };

  if ((profile?.access_level ?? 0) < 2) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <Shield size={64} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-500 dark:text-slate-400">You need manager or higher access to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield size={28} className="text-red-500" />
            Admin Control Panel
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage users, departments, permissions, and access control
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex overflow-x-auto no-scrollbar">
            {accessibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2",
                  activeTab === tab.id
                    ? "text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 bg-red-50 dark:bg-red-950/20"
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
