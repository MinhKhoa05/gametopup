import { useMemo, useState } from 'react';
import type { AdminOrder } from '@/features/orders/types';
import type { AdminOrderFilter } from '../api';

const ORDER_FILTER_OPTIONS: Array<{ key: AdminOrderFilter; label: string }> = [
  { key: 'watching', label: 'Cần xử lý' },
  { key: null, label: 'Tất cả' },
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

export function useAdminOrdersPageState(
  orders: AdminOrder[],
  filter: AdminOrderFilter,
  setFilter: (filter: AdminOrderFilter) => void,
) {
  const [query, setQuery] = useState('');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) =>
      [
        String(order.id),
        String(order.userId),
        String(order.packageId),
        order.gameAccountInfo,
        ORDER_STATUS_LABEL_BY_STATUS[order.status] ?? `Trạng thái ${order.status}`,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [orders, query]);

  return {
    filters: ORDER_FILTER_OPTIONS,
    filter,
    filteredOrders,
    query,
    setFilter,
    setQuery,
  };
}
