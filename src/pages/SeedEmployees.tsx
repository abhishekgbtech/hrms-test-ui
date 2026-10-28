import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { employeesData } from '../data/employeesData';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';

const SeedEmployees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/seed-employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({ employees: employeesData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed employees');
      }

      setResults(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while seeding employees');
      console.error('Seeding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Seed Employees
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Import {employeesData.length} employees into the system
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
            What this does:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Creates authentication accounts for all employees</li>
            <li>• Sets default password "911" for all accounts</li>
            <li>• Assigns appropriate roles and access levels</li>
            <li>• Creates user profiles with employee information</li>
            <li>• Skips employees that already exist in the system</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {employeesData.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <p className="text-xs text-green-600 dark:text-green-400 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {employeesData.filter(e => e.status === 'active').length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">Inactive</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {employeesData.filter(e => e.status === 'inactive').length}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
              <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Managers+</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {employeesData.filter(e => e.access_level >= 2).length}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSeed}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Seeding Employees...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Start Employee Seeding
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                  Error
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {results && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                    {results.message}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Total</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        {results.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Successful</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        {results.successful}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 dark:text-green-400">Failed</p>
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        {results.failed}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {results.results.errors.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                  Errors ({results.results.errors.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.results.errors.map((err: any, idx: number) => (
                    <div
                      key={idx}
                      className="text-xs text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/20 rounded p-2"
                    >
                      <span className="font-medium">{err.email}:</span> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Role Distribution
        </h3>
        <div className="space-y-3">
          {[
            { role: 'business_head', label: 'Business Heads', level: 4 },
            { role: 'hr', label: 'HR', level: 3 },
            { role: 'manager', label: 'Managers', level: 2 },
            { role: 'employee', label: 'Employees', level: 1 },
          ].map(({ role, label, level }) => {
            const count = employeesData.filter(e => e.primary_role === role).length;
            return (
              <div key={role} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Access Level {level}</p>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeedEmployees;
