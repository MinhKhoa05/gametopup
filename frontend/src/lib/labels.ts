import { User } from '../types';

export function userDisplayName(user: User | null) {
  return user?.name || user?.username || user?.email || 'Khách';
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
