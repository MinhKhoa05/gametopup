import { useMemo, useState } from 'react';
import { statusLabel } from '@/lib/labels';
import type { Order } from '@/features/orders/orders.types';
import { useAdminOrderMutations, useAdminOrdersQuery } from '@/features/admin/api/admin-orders.service';

export function useAdminOrdersSection() {
  const ordersQuery = useAdminOrdersQuery();
  const orderMutations = useAdminOrderMutations();

  const orders = ordersQuery.data ?? [];
  const loading = ordersQuery.isPending && !ordersQuery.data;
  const busy = [orderMutations.pick.isPending, orderMutations.complete.isPending, orderMutations.cancel.isPending].some(Boolean);

  return {
    busy,
    cancelOrder: async (orderId: number) => {
      await orderMutations.cancel.mutateAsync({ orderId });
    },
    completeOrder: async (orderId: number) => {
      await orderMutations.complete.mutateAsync({ orderId });
    },
    loading,
    orders,
    pickOrder: async (orderId: number) => {
      await orderMutations.pick.mutateAsync({ orderId });
    },
  };
}

type OrderFilter = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

const FILTERS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export function useAdminOrdersPanel(orders: Order[]) {
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

      return [String(order.id), String(order.userId), String(order.gamePackageId), order.gameAccountInfo, statusLabel(order.status)].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [filter, orders, query]);

  return {
    FILTERS,
    filter,
    filteredOrders,
    query,
    setFilter,
    setQuery,
  };
}
