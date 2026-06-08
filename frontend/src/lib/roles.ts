import { User } from '@/features/user/user.types';

export function isAdminUser(user: User | null) {
  const role = normalizeRoleValue(user?.role);
  return role === 'admin' || role === '1';
}

export function normalizeRoleValue(role: User['role']) {
  if (role == null) return '';
  return String(role).trim().toLowerCase();
}
