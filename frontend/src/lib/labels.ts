import { User } from '@/features/user/user.types';
import { normalizeRoleValue } from './roles';

export function userDisplayName(user: User | null) {
  return user?.displayName || user?.email || 'Khách';
}

export function statusLabel(status: number) {
  const labels: Record<number, string> = {
    1: 'Chờ thanh toán',
    2: 'Đã thanh toán',
    3: 'Đang xử lý',
    4: 'Hoàn thành',
    5: 'Đã hủy',
  };

  return labels[status] ?? `Trạng thái ${status}`;
}

export function userRoleLabel(role?: number | string) {
  const value = normalizeRoleValue(role);
  const labels: Record<string, string> = {
    '0': 'Member',
    '1': 'Admin',
    '2': 'Staff',
    admin: 'Admin',
    staff: 'Staff',
    member: 'Member',
  };

  return labels[value] ?? (value || 'Unknown');
}
