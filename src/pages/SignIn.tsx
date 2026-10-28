import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
        <div className="flex justify-center mb-8">
          <svg className="w-16 h-16" viewBox="0 0 32 32">
            <defs>
              <radialGradient cx="21.152%" cy="86.063%" fx="21.152%" fy="86.063%" r="79.941%" id="logo-grad">
                <stop stopColor="#FECACA" offset="0%"></stop>
                <stop stopColor="#EF4444" offset="25.871%"></stop>
                <stop stopColor="#991B1B" offset="100%"></stop>
              </radialGradient>
            </defs>
            <path d="M18.277.16C26.035 1.267 32 7.938 32 16c0 8.837-7.163 16-16 16S0 24.837 0 16C0 10.327 3.928 3.822 9.498.16L16 14.598l2.277-14.438z" fill="url(#logo-grad)"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-2">
          Welcome to ECOVIS
        </h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
          Sign in to access your workspace
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ecovis.com"
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmail('deepa.rathi@ecovis.com');
              setPassword('911');
            }}
          >
            Use Demo Account (Deepa Rathi)
          </Button>
        </form>

        <div className="mt-6 text-center space-y-1">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Demo account: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">deepa.rathi@ecovis.com</span>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Default password for all accounts: <span className="font-mono font-semibold">911</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
