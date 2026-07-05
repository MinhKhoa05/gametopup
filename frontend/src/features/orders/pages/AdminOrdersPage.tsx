import { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

import { useAuthUserQuery } from '@/features/auth/server';
import { getOrderStatusLabel, ORDER_STATUS_FILTER_OPTIONS } from '@/features/orders/orderMetadata';
import type { AdminOrder } from '@/features/orders/types';
import {
  Button,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  LoadMoreButton,
  LoadingState,
  PageHero,
  SearchBar,
} from '@/shared/components';
import { groupItemsByDate } from '@/shared/lib/groupByDate';
import { filterByQuery } from '@/shared/lib/search';

import type { AdminOrderFilter } from '../api';
import {
  useAdminOrdersQuery,
  useCancelOrderMutation,
  useCompleteOrderMutation,
  useOrderHistoryQuery,
  usePickOrderMutation,
} from '../server';
import { AdminOrderDialog } from '../components/AdminOrderDialog';
import { AdminOrderItem } from '../components/AdminOrderItem';
import { OrderProcessingHistoryDialog } from '../components/OrderProcessingHistoryDialog';

function getAdminOrderSearchText(order: AdminOrder) {
  return [
    String(order.id),
    String(order.userId),
    String(order.packageId),
    order.gameAccountInfo,
    getOrderStatusLabel(order.status),
  ].join(' ');
}

export function AdminOrdersPage() {
  const authQuery = useAuthUserQuery();
  const [filter, setFilter] = useState<AdminOrderFilter>('watching');
  const [query, setQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [historyOrderId, setHistoryOrderId] = useState<number | null>(null);

  const ordersQuery = useAdminOrdersQuery(filter);
  const historyQuery = useOrderHistoryQuery(historyOrderId);
  const pickOrderMutation = usePickOrderMutation();
  const completeOrderMutation = useCompleteOrderMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const busy = [
    pickOrderMutation.isPending,
    completeOrderMutation.isPending,
    cancelOrderMutation.isPending,
  ].some(Boolean);

  const filteredOrders = useMemo(
    () => filterByQuery(ordersQuery.items, query, getAdminOrderSearchText),
    [ordersQuery.items, query],
  );

  const selectedOrder = useMemo(
    () => filteredOrders.find((order) => order.id === selectedOrderId) ?? null,
    [filteredOrders, selectedOrderId],
  );
  const orderGroups = useMemo(
    () => groupItemsByDate(filteredOrders, (count) => `${count} đơn`),
    [filteredOrders],
  );

  function resetFilters() {
    setFilter('watching');
    setQuery('');
    setSelectedOrderId(null);
  }

  function closeDetail() {
    setSelectedOrderId(null);
  }

  function closeHistory() {
    setHistoryOrderId(null);
  }

  function changeFilter(value: AdminOrderFilter) {
    setFilter(value);
    setSelectedOrderId(null);
  }

  return (
    <>
      <div className="grid gap-5">
        <PageHero
          visual={
            <IconBox size="lg" tone="primary" className="h-[56px] w-[56px] rounded-[18px]">
              <ShoppingBag size={28} strokeWidth={1.8} />
            </IconBox>
          }
          title="Đơn hàng"
          description="Theo dõi và xử lý các đơn nạp game cần admin thao tác."
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <SearchBar
            ariaLabel="Tìm kiếm đơn hàng"
            dense
            onChange={setQuery}
            placeholder="Tìm mã đơn, user, game, gói, UID..."
            value={query}
          />

          <FilterChipGroup
            ariaLabel="Lọc trạng thái đơn hàng"
            items={ORDER_STATUS_FILTER_OPTIONS}
            onChange={(value) => changeFilter(value as AdminOrderFilter)}
            value={filter}
          />
        </div>

        {ordersQuery.isPending && ordersQuery.data === undefined && filteredOrders.length === 0 ? (
          <LoadingState title="Đang tải đơn hàng..." />
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            description="Không có đơn nào khớp với bộ lọc hiện tại."
            title="Không tìm thấy đơn hàng phù hợp."
          >
            {(query.trim() || filter !== 'watching') && (
              <div className="mt-4 flex justify-center">
                <Button onClick={resetFilters} size="sm" variant="primary">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-5">
            <GroupedList
              groups={orderGroups}
              getItemKey={(order) => order.id}
              itemListClassName="space-y-2"
              renderItem={(order) => (
                <AdminOrderItem
                  order={order}
                  selected={order.id === selectedOrderId}
                  onClick={() => setSelectedOrderId(order.id)}
                />
              )}
            />

            <LoadMoreButton
              className="pt-2"
              hasMore={ordersQuery.hasMore}
              isLoading={ordersQuery.isLoadingMore}
              onLoadMore={ordersQuery.loadMore}
            />
          </div>
        )}
      </div>

      <AdminOrderDialog
        busy={busy}
        currentAdminId={authQuery.data?.id ?? null}
        onCancelOrder={cancelOrderMutation.mutateAsync}
        onClose={closeDetail}
        onCompleteOrder={completeOrderMutation.mutateAsync}
        onOpenHistory={setHistoryOrderId}
        onPickOrder={pickOrderMutation.mutateAsync}
        order={selectedOrder}
      />

      <OrderProcessingHistoryDialog
        history={historyQuery.data ?? []}
        loading={historyQuery.isFetching}
        onClose={closeHistory}
        orderId={historyOrderId}
      />
    </>
  );
}
