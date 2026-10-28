"use client";

import React, { useState } from "react";
import { Download, Filter, Calendar } from '../icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

interface ActivityLog {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
  type: 'role_change' | 'permission_grant' | 'project_assign' | 'user_create';
}

const AccessReports: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState('all');

  const mockLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'Bharat Mishra',
      action: 'Role Changed',
      details: 'Sanjana Konda promoted from Employee to Manager',
      type: 'role_change',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      user: 'HR Admin',
      action: 'User Created',
      details: 'New employee Rahul Sharma added to Development team',
      type: 'user_create',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: 'Shweta Chaudhari',
      action: 'Project Assignment',
      details: 'Aryan Singh assigned to HRMS UI Overhaul project',
      type: 'project_assign',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      user: 'HR Admin',
      action: 'Permission Updated',
      details: 'Granted "can_create_projects" to Pooja Disale',
      type: 'permission_grant',
    },
  ];

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'role_change':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      case 'permission_grant':
        return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'project_assign':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400';
      case 'user_create':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Filter Activity Logs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Action Type
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="role_change">Role Changes</option>
              <option value="permission_grant">Permission Updates</option>
              <option value="project_assign">Project Assignments</option>
              <option value="user_create">User Creation</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full">
              <Filter size={16} className="mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing {mockLogs.length} activity logs
        </p>
        <Button variant="secondary">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {mockLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {log.action}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {log.details}
                    </p>
                  </div>
                  <Badge className={getTypeBadgeColor(log.type)}>
                    {log.action}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span>By {log.user}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(log.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Summary Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">24</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Total Changes</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Role Changes</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Permission Updates</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">4</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">New Users</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccessReports;
