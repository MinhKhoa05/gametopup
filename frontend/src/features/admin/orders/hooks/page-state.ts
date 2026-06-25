import { useMemo, useState } from 'react';
import type { AdminOrder } from '@/features/orders/types';

type OrderFilter = 'active' | 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

const ORDER_FILTER_OPTIONS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'active', label: 'Cần xử lý' },
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Thành công' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const ORDER_STATUS_LABEL_BY_STATUS: Record<number, string> = {
  1: 'Chờ xử lý',
  2: 'Đang xử lý',
  3: 'Thành công',
  4: 'Đã hủy',
};

export function useAdminOrdersPageState(orders: AdminOrder[]) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('active');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        (filter === 'active' && (order.status === 1 || order.status === 2)) ||
        filter === 'all' ||
        (filter === 'pending' && order.status === 1) ||
        (filter === 'processing' && order.status === 2) ||
        (filter === 'completed' && order.status === 3) ||
        (filter === 'cancelled' && order.status === 4);

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [String(order.id), String(order.userId), String(order.gamePackageId), order.gameAccountInfo, ORDER_STATUS_LABEL_BY_STATUS[order.status] ?? `Trạng thái ${order.status}`].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [filter, orders, query]);

  return {
    filters: ORDER_FILTER_OPTIONS,
    filter,
    filteredOrders,
    query,
    setFilter,
    setQuery,
  };
}
