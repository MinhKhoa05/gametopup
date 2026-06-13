import { useEffect, useMemo, useState } from 'react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { TrustSection } from '@/shared/components';
import { useCancelOrderMutation, useMyOrdersQuery } from '@/features/orders/server';
import { useGamesQuery } from '@/features/games/server';
import { OrderHistoryControls, OrderHistoryHero, OrderHistoryList, OrderHistoryStats, OrderDetailPanel, buildOrderHistoryItems, type OrderHistoryFilterState } from '@/features/orders/components/OrderHistorySections';

const DEFAULT_FILTERS: OrderHistoryFilterState = {
  game: 'all',
  search: '',
  sort: 'newest',
  status: 'all',
  time: 'all',
};

const PAGE_SIZE = 5;

export function OrdersPage() {
  const ordersQuery = useMyOrdersQuery();
  const gamesQuery = useGamesQuery();
  const cancelOrderMutation = useCancelOrderMutation();

  const [filters, setFilters] = useState<OrderHistoryFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const orders = ordersQuery.data ?? [];
  const games = gamesQuery.data ?? [];

  const orderItems = useMemo(() => buildOrderHistoryItems(orders, games), [games, orders]);

  const gameOptions = useMemo(() => {
    const unique = new Map<string, string>();

    for (const item of orderItems) {
      if (!unique.has(item.gameKey)) {
        unique.set(item.gameKey, item.gameName);
      }
    }

    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [orderItems]);

  const filteredItems = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return orderItems.filter((item) => {
      if (filters.game !== 'all' && item.gameKey !== filters.game) {
        return false;
      }

      if (filters.status !== 'all' && item.statusGroup !== filters.status) {
        return false;
      }

      if (filters.time !== 'all' && !matchesTimeFilter(item.order.createdAt, filters.time)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        item.orderCode,
        item.gameName,
        item.packageName,
        item.gameAccountInfo,
        item.amountLabel,
        item.statusLabel,
      ].some((value) => value.toLowerCase().includes(keyword));
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
    if (!sortedItems.length) {
      return null;
    }

    return sortedItems.find((item) => item.order.id === selectedOrderId) ?? sortedItems[0];
  }, [selectedOrderId, sortedItems]);

  const stats = useMemo(() => buildStats(orderItems), [orderItems]);
  const isLoading = ordersQuery.isPending && orders.length === 0;
  const isError = ordersQuery.isError && orders.length === 0;

  async function handleCancel(orderId: number) {
    await cancelOrderMutation.mutateAsync({ orderId });
  }

  return (
    <div className="relative isolate overflow-hidden">
      <OrdersBackground />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <OrderHistoryHero />

          <OrderHistoryStats stats={stats} />

          <OrderHistoryControls
            filters={filters}
            gameOptions={gameOptions}
            onChange={(next) => {
              setFilters(next);
              setPage(1);
            }}
          />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.28fr)_minmax(340px,0.92fr)] lg:items-start">
            <section className="gt-surface grid gap-4 rounded-[26px] border border-white/10 p-4 sm:p-5">
              {isLoading ? (
                <OrderHistoryListSkeleton />
              ) : isError ? (
                <OrderHistoryState
                  title="Không tải được đơn hàng"
                  description={ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Đã xảy ra lỗi khi tải lịch sử đơn hàng.'}
                />
              ) : pageItems.length ? (
                <>
                  <OrderHistoryList
                    items={pageItems}
                    selectedOrderId={selectedOrderId}
                    onSelect={setSelectedOrderId}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </>
              ) : (
                <OrderHistoryState
                  title="Không có đơn hàng phù hợp"
                  description={filters.search.trim() ? 'Thử đổi từ khóa hoặc bộ lọc để xem kết quả khác.' : 'Đơn hàng sẽ xuất hiện ở đây sau khi bạn đặt nạp game.'}
                />
              )}
            </section>

            <OrderDetailPanel
              busy={cancelOrderMutation.isPending}
              onCancel={handleCancel}
              orderItem={selectedOrder}
            />
          </div>

          <TrustSection />
        </div>
      </AppPageContainer>
    </div>
  );
}

function OrdersBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:72px_72px]" />
    </>
  );
}

function sortOrderHistoryItems(items: ReturnType<typeof buildOrderHistoryItems>, sort: OrderHistoryFilterState['sort']) {
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

function matchesTimeFilter(createdAt: string, timeFilter: OrderHistoryFilterState['time']) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) {
    return false;
  }

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

function buildStats(items: ReturnType<typeof buildOrderHistoryItems>) {
  return {
    total: items.length,
    pending: items.filter((item) => item.statusGroup === 'pending').length,
    completed: items.filter((item) => item.statusGroup === 'completed').length,
    processing: items.filter((item) => item.statusGroup === 'processing').length,
    canceled: items.filter((item) => item.statusGroup === 'canceled').length,
  };
}

function OrderHistoryState({ description, title }: { description: string; title: string }) {
  return (
    <div className="grid gap-2 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6">
      <h2 className="m-0 text-[1.15rem] font-black tracking-[-0.03em] text-white">{title}</h2>
      <p className="m-0 max-w-xl text-sm leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function OrderHistoryListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải lịch sử đơn hàng">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid gap-4 rounded-[24px] border border-white/10 bg-[rgba(8,20,40,0.6)] p-4 sm:grid-cols-[112px_minmax(0,1fr)_auto]">
          <div className="aspect-square max-h-[112px] w-full animate-pulse rounded-[20px] bg-white/6" />
          <div className="grid gap-3">
            <div className="h-5 w-52 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-36 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/6" />
          </div>
          <div className="grid justify-items-end gap-3">
            <div className="h-7 w-24 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
