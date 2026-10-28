import React from 'react';
import { UserProfile } from '../../lib/supabase';
import { X, Mail, Phone, Calendar, Building, MapPin, User, Shield } from '../icons';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ViewEmployeeModalProps {
  user: UserProfile;
  onClose: () => void;
}

const ViewEmployeeModal: React.FC<ViewEmployeeModalProps> = ({ user, onClose }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'business_head':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400';
      case 'hr':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400';
      case 'manager':
        return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Employee Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex items-start gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <Avatar
                src={user.profile_picture_url || undefined}
                alt={user.full_name}
                fallback={user.full_name.split(' ').map(n => n[0]).join('')}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {user.full_name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {user.designation || 'No designation'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className={getRoleBadgeColor(user.primary_role)}>
                    {user.primary_role.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusBadgeColor(user.status)}>
                    {user.status.replace('_', ' ')}
                  </Badge>
                  {user.is_manager && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400">
                      Manager
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Employee ID</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{user.employee_id}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Employment Details
                </h4>
                <div className="space-y-3">
                  {user.date_of_joining && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Date of Joining</p>
                        <p className="text-sm text-slate-900 dark:text-slate-100">
                          {formatDate(user.date_of_joining)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Access Level</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">Level {user.access_level}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Permissions & Access
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: 'Create Projects', value: user.can_create_projects },
                  { label: 'View Team Workload', value: user.can_view_team_workload },
                  { label: 'Access Team Projects', value: user.can_access_team_projects },
                  { label: 'Manage Tasks', value: user.can_manage_tasks },
                  { label: 'Approve Leave', value: user.can_approve_leave },
                  { label: 'View Reports', value: user.can_view_reports },
                  { label: 'Manage Team', value: user.can_manage_team },
                  { label: 'Department Head', value: user.is_department_head },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                    {value ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
                Additional Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Account Created</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatDate(user.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
                  <span className="text-slate-900 dark:text-slate-100">{formatDate(user.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeModal;
