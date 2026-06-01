import { User } from '../types';

export function isAdminUser(user: User | null) {
  const role = normalizeRole(user?.role);
  return role === 'admin' || role === '1';
}

function normalizeRole(role: User['role']) {
  if (role == null) return '';
  return String(role).trim().toLowerCase();
}
