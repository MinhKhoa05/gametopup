export type UserRoleValue = '0' | '1' | '2';

const USER_ROLE_LABEL_BY_VALUE: Record<UserRoleValue, string> = {
  '0': 'Member',
  '1': 'Admin',
  '2': 'Staff',
};

export function normalizeUserRoleValue(role: number | string | null | undefined) {
  return String(role ?? '').trim().toLowerCase();
}

export function formatUserRoleLabel(role?: number | string) {
  const normalizedRole = normalizeUserRoleValue(role);

  if (normalizedRole === 'admin') return 'Admin';
  if (normalizedRole === 'staff') return 'Staff';
  if (normalizedRole === 'member') return 'Member';

  return USER_ROLE_LABEL_BY_VALUE[normalizedRole as UserRoleValue] ?? (normalizedRole || 'Unknown');
}

export function isAdminUserRole(role?: number | string) {
  const normalizedRole = normalizeUserRoleValue(role);
  return normalizedRole === '1' || normalizedRole === 'admin';
}
