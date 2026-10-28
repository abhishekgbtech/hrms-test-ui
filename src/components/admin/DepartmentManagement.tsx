"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import { Plus, Building, Users, Edit } from '../icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Loader2 } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string | null;
  department_head_id: string | null;
  office_id: string | null;
  is_active: boolean;
  created_at: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Total Departments: {departments.length}
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Create Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Building size={24} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{dept.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {dept.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {dept.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                {dept.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>0 employees</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Edit size={14} />
              Edit Department
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
