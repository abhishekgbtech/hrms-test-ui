import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, UserProfile } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  canViewTeamWorkload: () => boolean;
  canAccessTeamProjects: () => boolean;
  canCreateProjects: () => boolean;
  isManager: () => boolean;
  isHR: () => boolean;
  isBusinessHead: () => boolean;
  canViewAllFolders: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth when database is disconnected
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const canViewTeamWorkload = () => {
    return profile?.can_view_team_workload === true;
  };

  const canAccessTeamProjects = () => {
    return profile?.can_access_team_projects === true;
  };

  const canCreateProjects = () => {
    return profile?.can_create_projects === true || (profile?.access_level ?? 0) >= 3;
  };

  const isManager = () => {
    return profile?.is_manager === true;
  };

  const isHR = () => {
    return profile?.access_level === 3;
  };

  const isBusinessHead = () => {
    return profile?.access_level === 4;
  };

  const canViewAllFolders = () => {
    return profile?.can_view_all_folders === true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        canViewTeamWorkload,
        canAccessTeamProjects,
        canCreateProjects,
        isManager,
        isHR,
        isBusinessHead,
        canViewAllFolders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
