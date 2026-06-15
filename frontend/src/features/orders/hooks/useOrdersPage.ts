import { useEffect, useMemo, useState } from 'react';
import { useCancelOrderMutation, useMyOrdersQuery } from '@/features/orders/server';
import { useGamesQuery } from '@/features/games/server';
import { buildOrderHistoryItems, type OrderHistoryItem } from '@/features/orders/components/OrderHistorySections';

const PAGE_SIZE = 6;

export type StatusGroup = 'all' | 'pending' | 'processing' | 'completed' | 'canceled';

export type OrderFilters = {
  game: string;
  search: string;
  status: StatusGroup;
  time: 'all' | '24h' | '7d' | '30d';
  sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
};

export const DEFAULT_FILTERS: OrderFilters = {
  game: 'all',
  search: '',
  status: 'all',
  time: 'all',
  sort: 'newest',
};

export const STATUS_OPTIONS: Array<{ label: string; value: StatusGroup }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'canceled' },
];

export function useOrdersPage() {
  const ordersQuery = useMyOrdersQuery();
  const gamesQuery = useGamesQuery();
  const cancelOrderMutation = useCancelOrderMutation();

  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const orders = ordersQuery.data ?? [];
  const games = gamesQuery.data ?? [];
  const orderItems = useMemo(() => buildOrderHistoryItems(orders, games), [games, orders]);

  const gameOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of orderItems) {
      if (!unique.has(item.gameKey)) unique.set(item.gameKey, item.gameName);
    }
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [orderItems]);

  const filteredItems = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return orderItems.filter((item) => {
      if (filters.game !== 'all' && item.gameKey !== filters.game) return false;
      if (filters.status !== 'all' && item.statusGroup !== filters.status) return false;
      if (filters.time !== 'all' && !matchesTimeFilter(item.order.createdAt, filters.time)) return false;
      if (!keyword) return true;

      return [item.orderCode, item.gameName, item.packageName, item.gameAccountInfo, item.amountLabel, item.statusLabel].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    });
  }, [filters, orderItems]);

  const sortedItems = useMemo(() => sortOrderHistoryItems(filteredItems, filters.sort), [filteredItems, filters.sort]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!sortedItems.length) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !sortedItems.some((item) => item.order.id === selectedOrderId)) {
      setSelectedOrderId(sortedItems[0].order.id);
    }
  }, [selectedOrderId, sortedItems]);

  const selectedOrder = useMemo(() => {
    if (!sortedItems.length) return null;
    return sortedItems.find((item) => item.order.id === selectedOrderId) ?? sortedItems[0];
  }, [selectedOrderId, sortedItems]);

  const stats = useMemo(() => buildStats(orderItems), [orderItems]);
  const isLoading = ordersQuery.isPending && orders.length === 0;
  const isError = ordersQuery.isError && orders.length === 0;

  async function handleCancel(orderId: number) {
    await cancelOrderMutation.mutateAsync({ orderId });
  }

  return {
    currentPage,
    filters,
    gameOptions,
    handleCancel,
    isError,
    isLoading,
    orderItems,
    pageItems,
    selectedOrder,
    selectedOrderId,
    setFilters,
    setPage,
    setSelectedOrderId,
    stats,
    totalPages,
    cancelBusy: cancelOrderMutation.isPending,
  };
}

export type OrdersPageState = ReturnType<typeof useOrdersPage>;

function sortOrderHistoryItems(items: OrderHistoryItem[], sort: OrderFilters['sort']) {
  const sorted = [...items];

  switch (sort) {
    case 'oldest':
      return sorted.sort((left, right) => left.order.createdAt.localeCompare(right.order.createdAt));
    case 'amount-desc':
      return sorted.sort((left, right) => right.amount - left.amount);
    case 'amount-asc':
      return sorted.sort((left, right) => left.amount - right.amount);
    case 'newest':
    default:
      return sorted.sort((left, right) => right.order.createdAt.localeCompare(left.order.createdAt));
  }
}

function matchesTimeFilter(createdAt: string, timeFilter: OrderFilters['time']) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;

  const diffMs = Date.now() - created;
  const day = 1000 * 60 * 60 * 24;

  switch (timeFilter) {
    case '24h':
      return diffMs <= day;
    case '7d':
      return diffMs <= day * 7;
    case '30d':
      return diffMs <= day * 30;
    case 'all':
    default:
      return true;
  }
}

function buildStats(items: OrderHistoryItem[]) {
  return {
    total: items.length,
    pending: items.filter((item) => item.statusGroup === 'pending').length,
    completed: items.filter((item) => item.statusGroup === 'completed').length,
    processing: items.filter((item) => item.statusGroup === 'processing').length,
    canceled: items.filter((item) => item.statusGroup === 'canceled').length,
  };
}
