"use client";

import React, { useState, useEffect } from "react";
import { supabase, UserProfile } from '../../lib/supabase';
import { X } from '../icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { cn } from '../../lib/utils';

interface AddEditEmployeeModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onSave: () => void;
}

const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({ user, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    employee_id: user?.employee_id || '',
    phone: user?.phone || '',
    designation: user?.designation || '',
    primary_role: user?.primary_role || 'employee',
    department_id: user?.department_id || '',
    office_id: user?.office_id || '',
    manager_id: user?.manager_id || '',
    date_of_joining: user?.date_of_joining || '',
    status: user?.status || 'active',
  });

  const tabs = ['Basic Info', 'Job Details', 'Reporting', 'Permissions'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        const { error } = await supabase
          .from('user_profiles')
          .update(formData)
          .eq('id', user.id);

        if (error) throw error;
      } else {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration is missing');
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/create-employee`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            password: '911'
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create employee');
        }
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.message || 'Error saving user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="employee_id">Employee ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation || ''}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="primary_role">Role *</Label>
              <select
                id="primary_role"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                value={formData.primary_role}
                onChange={(e) => setFormData({ ...formData, primary_role: e.target.value as any })}
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
                <option value="business_head">Business Head</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <Label htmlFor="date_of_joining">Date of Joining</Label>
              <Input
                id="date_of_joining"
                type="date"
                value={formData.date_of_joining || ''}
                onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="manager_id">Reporting Manager</Label>
              <select
                id="manager_id"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                value={formData.manager_id || ''}
                onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
              >
                <option value="">No Manager</option>
              </select>
            </div>
            <div>
              <Label htmlFor="department_id">Department</Label>
              <select
                id="department_id"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              >
                <option value="">No Department</option>
              </select>
            </div>
            <div>
              <Label htmlFor="office_id">Office Location</Label>
              <select
                id="office_id"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                value={formData.office_id || ''}
                onChange={(e) => setFormData({ ...formData, office_id: e.target.value })}
              >
                <option value="">No Office</option>
              </select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Permissions are automatically set based on the selected role. You can override specific permissions after saving.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Can Create Projects</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Auto-set by role</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Can View Team Workload</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Auto-set by role</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Can Access Team Projects</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Auto-set by role</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {user ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setCurrentTab(index)}
                className={cn(
                  "px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                  currentTab === index
                    ? "text-red-600 dark:text-red-400 border-red-600 dark:border-red-400"
                    : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </form>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          {currentTab > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentTab(currentTab - 1)}
            >
              Previous
            </Button>
          )}
          {currentTab < tabs.length - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentTab(currentTab + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : user ? 'Save Changes' : 'Create Employee'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditEmployeeModal;
