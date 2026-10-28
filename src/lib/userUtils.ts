import { UserProfile } from './supabase';

export function getUserFullName(profile: UserProfile | null): string {
  return profile?.full_name || 'User';
}

export function getUserEmail(profile: UserProfile | null): string {
  return profile?.email || '';
}

export function getUserAvatarUrl(profile: UserProfile | null): string {
  return profile?.profile_picture_url || '';
}

export function isTaskAssignedToUser(taskAssignedTo: string, profile: UserProfile | null): boolean {
  if (!profile) return false;
  return taskAssignedTo === profile.full_name;
}

export function isUserContributor(contributors: string[] | undefined, profile: UserProfile | null): boolean {
  if (!profile || !contributors) return false;
  return contributors.includes(profile.full_name);
}

export function isTaskOwnedOrContributedByUser(
  taskAssignedTo: string,
  contributors: string[] | undefined,
  profile: UserProfile | null
): boolean {
  return isTaskAssignedToUser(taskAssignedTo, profile) || isUserContributor(contributors, profile);
}

export function hasAdminAccess(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.access_level >= 4;
}
