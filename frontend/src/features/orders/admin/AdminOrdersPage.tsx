import { useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

import { useAuthUserQuery } from '@/features/auth/server';
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

import type { AdminOrderFilter } from './api';
import { useAdminOrdersPageState, useAdminOrdersSection } from './hooks';
import { AdminOrderDialog } from './components/AdminOrderDialog';
import { AdminOrderItem } from './components/AdminOrderItem';

export function AdminOrdersPage() {
  const authQuery = useAuthUserQuery();
  const [filter, setFilter] = useState<AdminOrderFilter>('watching');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const section = useAdminOrdersSection(filter);
  const state = useAdminOrdersPageState(section.orders, filter, setFilter);

  const selectedOrder = useMemo(
    () => state.filteredOrders.find((order) => order.id === selectedOrderId) ?? null,
    [selectedOrderId, state.filteredOrders],
  );
  const orderGroups = useMemo(
    () => groupItemsByDate(state.filteredOrders, (count) => `${count} đơn`),
    [state.filteredOrders],
  );

  function resetFilters() {
    setFilter('watching');
    state.setQuery('');
  }

  function closeDetail() {
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
            onChange={state.setQuery}
            placeholder="Tìm mã đơn, user, game, gói, UID..."
            value={state.query}
          />

          <FilterChipGroup
            ariaLabel="Lọc trạng thái đơn hàng"
            items={state.filters.map((option) => ({
              value: option.key,
              label: option.label,
            }))}
            onChange={(value) => setFilter(value as AdminOrderFilter)}
            value={state.filter}
          />
        </div>

        {section.loading && state.filteredOrders.length === 0 ? (
          <LoadingState title="Đang tải đơn hàng..." />
        ) : state.filteredOrders.length === 0 ? (
          <EmptyState
            description="Không có đơn nào khớp với bộ lọc hiện tại."
            title="Không tìm thấy đơn hàng phù hợp."
          >
            {(state.query.trim() || filter !== 'watching') && (
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
              hasMore={section.hasMore}
              isLoading={section.isLoadingMore}
              onLoadMore={section.loadMore}
            />
          </div>
        )}
      </div>

      <AdminOrderDialog
        busy={section.busy}
        currentAdminId={authQuery.data?.id ?? null}
        onCancelOrder={section.cancelOrder}
        onClose={closeDetail}
        onCompleteOrder={section.completeOrder}
        onPickOrder={section.pickOrder}
        order={selectedOrder}
      />
    </>
  );
}
