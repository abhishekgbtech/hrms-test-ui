"use client";

import React from "react";
import { Shield, Lock, Unlock, UserCheck } from '../icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface RolePermission {
  name: string;
  enabled: boolean;
}

interface Role {
  name: string;
  level: number;
  color: string;
  description: string;
  userCount: number;
  permissions: RolePermission[];
}

const RolesPermissions: React.FC = () => {
  const roles: Role[] = [
    {
      name: 'Employee',
      level: 1,
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      description: 'Basic access to personal tasks and projects',
      userCount: 45,
      permissions: [
        { name: 'View own tasks', enabled: true },
        { name: 'View assigned projects', enabled: true },
        { name: 'View own folders', enabled: true },
        { name: 'Create tasks', enabled: false },
        { name: 'View team workload', enabled: false },
      ],
    },
    {
      name: 'Manager',
      level: 2,
      color: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400',
      description: 'Can manage team members and their tasks',
      userCount: 12,
      permissions: [
        { name: 'View own tasks', enabled: true },
        { name: 'View assigned projects', enabled: true },
        { name: 'View own folders', enabled: true },
        { name: 'View team workload', enabled: true },
        { name: 'Manage team tasks', enabled: true },
        { name: 'Access team projects', enabled: true },
        { name: 'Create projects', enabled: false },
      ],
    },
    {
      name: 'HR',
      level: 3,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
      description: 'Full access to employee management and HR operations',
      userCount: 5,
      permissions: [
        { name: 'All Manager permissions', enabled: true },
        { name: 'Manage all employees', enabled: true },
        { name: 'Create/edit departments', enabled: true },
        { name: 'Create/edit offices', enabled: true },
        { name: 'View all folders', enabled: true },
        { name: 'Create projects', enabled: true },
        { name: 'Manage permissions', enabled: true },
      ],
    },
    {
      name: 'Business Head',
      level: 4,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400',
      description: 'Complete visibility and control over all operations',
      userCount: 3,
      permissions: [
        { name: 'All HR permissions', enabled: true },
        { name: 'View all projects', enabled: true },
        { name: 'View financial data', enabled: true },
        { name: 'Access all reports', enabled: true },
        { name: 'Manage system settings', enabled: false },
      ],
    },
    {
      name: 'Admin',
      level: 5,
      color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400',
      description: 'Full system access and configuration',
      userCount: 2,
      permissions: [
        { name: 'All permissions', enabled: true },
        { name: 'System configuration', enabled: true },
        { name: 'User management', enabled: true },
        { name: 'Security settings', enabled: true },
        { name: 'Database access', enabled: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage role-based access control and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.name} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <Shield size={24} className="text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Access Level {role.level}
                  </p>
                </div>
              </div>
              <Badge className={role.color}>
                {role.userCount} users
              </Badge>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {role.description}
            </p>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Permissions
              </p>
              {role.permissions.map((permission) => (
                <div
                  key={permission.name}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {permission.name}
                  </span>
                  {permission.enabled ? (
                    <UserCheck size={16} className="text-green-500" />
                  ) : (
                    <Lock size={16} className="text-slate-400" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Permission Hierarchy
        </h3>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Permissions are inherited based on access levels:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>Level 1 (Employee):</strong> Basic access to assigned work</span>
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>Level 2 (Manager):</strong> Team management capabilities</span>
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>Level 3 (HR):</strong> Organization-wide employee management</span>
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>Level 4 (Business Head):</strong> Strategic oversight and reporting</span>
            </li>
            <li className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span><strong>Level 5 (Admin):</strong> Full system control</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default RolesPermissions;
