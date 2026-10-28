"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';
import { Plus, MapPin, Building, Users, Edit } from '../icons';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loader2 } from 'lucide-react';

interface Office {
  id: string;
  name: string;
  location: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

const OfficeManagement: React.FC = () => {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffices();
  }, []);

  const loadOffices = async () => {
    try {
      const { data, error } = await supabase
        .from('offices')
        .select('*')
        .order('name');

      if (error) throw error;
      setOffices(data || []);
    } catch (error) {
      console.error('Error loading offices:', error);
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
            Total Offices: {offices.length}
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Office
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offices.map((office) => (
          <Card key={office.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <Building size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{office.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={14} className="text-slate-400" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {office.location || 'No location'}
                    </p>
                  </div>
                </div>
              </div>
              <Badge className={office.is_active ? "bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400"}>
                {office.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {office.address && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {office.address}
              </p>
            )}

            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>0 employees</span>
              </div>
              <div className="flex items-center gap-2">
                <Building size={16} />
                <span>0 departments</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Edit size={14} />
              Edit Office
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OfficeManagement;
