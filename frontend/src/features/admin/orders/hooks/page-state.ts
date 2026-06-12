import { useMemo, useState } from 'react';
import type { Order } from '@/features/orders/types';

type OrderFilter = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

const ORDER_FILTER_OPTIONS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const ORDER_STATUS_LABEL_BY_STATUS: Record<number, string> = {
  1: 'Chờ thanh toán',
  2: 'Đã thanh toán',
  3: 'Đang xử lý',
  4: 'Hoàn thành',
  5: 'Đã hủy',
};

export function useAdminOrdersPageState(orders: Order[]) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && order.status === 1) ||
        (filter === 'paid' && order.status === 2) ||
        (filter === 'processing' && order.status === 3) ||
        (filter === 'completed' && order.status === 4) ||
        (filter === 'cancelled' && order.status === 5);

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
