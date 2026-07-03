import { useMemo, useState } from "react";
import { Activity, BadgeCheck, ClipboardList, Coins, Package } from "lucide-react";
import { STATUS_OPTIONS, useOrders } from "@/features/orders/hooks/useOrders";
import { OrderListItem } from "@/features/orders/components/OrderListItem";
import { OrderDetailDialog } from "../components/OrderDetailDialog";
import {
  Container,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  LoadMoreButton,
  LoadingState,
  PageHero,
  PanelShell,
  SearchBar,
  StatCard,
} from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import { groupItemsByDate } from "@/shared/lib/groupByDate";
import type { Order } from "@/features/orders/types";
import { useOrderHistoryQuery } from "../server";

export function OrdersPage() {
  const {
    orders,
    filters,
    hasMoreOrders,
    isLoadingMoreOrders,
    isLoading,
    isError,
    setFilters,
    loadMoreOrders,
    stats,
  } = useOrders();

  function updateFilters(updater: (current: typeof filters) => typeof filters) {
    setFilters(updater);
  }

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data: history = [], isFetching: historyLoading } =
    useOrderHistoryQuery(selectedOrder?.id ?? null);
  const orderGroups = useMemo(
    () => groupItemsByDate(orders, (count) => `${count} đơn`),
    [orders],
  );

  const emptyDescription = filters.search
    ? "Không tìm thấy đơn hàng phù hợp."
    : "Các đơn hàng của bạn sẽ xuất hiện tại đây.";

  return (
    <div className="relative isolate overflow-hidden">
      <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <PageHero
            visual={
              <IconBox
                size="lg"
                tone="primary"
                className="h-[62px] w-[62px] rounded-[18px]"
              >
                <ClipboardList size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title="Lịch sử đơn hàng"
            description="Theo dõi trạng thái và lịch sử các đơn nạp game của bạn."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              compact
              tone="warning"
              icon={<Activity size={20} />}
              label="Đang theo dõi"
              value={stats?.watchingOrders ?? 0}
              supporting="Cần xử lý"
            />

            <StatCard
              compact
              tone="success"
              icon={<BadgeCheck size={20} />}
              label="Hoàn thành"
              value={stats?.completedOrders ?? 0}
              supporting="Nạp thành công"
            />

            <StatCard
              compact
              tone="primary"
              icon={<Package size={20} />}
              label="Tổng đơn"
              value={stats?.totalOrders ?? 0}
              supporting="Đơn hàng"
            />

            <StatCard
              compact
              tone="primary"
              icon={<Coins size={20} />}
              label="Tổng chi"
              value={formatCurrency(stats?.totalSpent ?? 0)}
              supporting="Đã thanh toán"
            />
          </div>

          <PanelShell>
            <div className="space-y-6 p-6 lg:p-7">
              <SearchBar
                value={filters.search}
                placeholder="Tìm kiếm đơn hàng..."
                onChange={(search) =>
                  updateFilters((current) => ({
                    ...current,
                    search,
                  }))
                }
              />

              <FilterChipGroup
                items={STATUS_OPTIONS}
                value={filters.status}
                onChange={(status) =>
                  updateFilters((current) => ({
                    ...current,
                    status,
                  }))
                }
              />

              {isLoading ? (
                <LoadingState title="Đang tải đơn hàng..." />
              ) : isError ? (
                <EmptyState
                  title="Không tải được đơn hàng"
                  description="Đã xảy ra lỗi khi tải lịch sử đơn hàng."
                />
              ) : orders.length === 0 ? (
                <EmptyState
                  title="Không có đơn hàng"
                  description={emptyDescription}
                />
              ) : (
                <>
                  <GroupedList
                    groups={orderGroups}
                    getItemKey={(order) => order.id}
                    renderItem={(order) => (
                      <OrderListItem
                        order={order}
                        onClick={() => setSelectedOrder(order)}
                      />
                    )}
                  />

                  <LoadMoreButton
                    className="pt-2"
                    hasMore={hasMoreOrders}
                    isLoading={isLoadingMoreOrders}
                    onLoadMore={loadMoreOrders}
                  />
                </>
              )}
            </div>
          </PanelShell>
        </div>

        <OrderDetailDialog
          order={selectedOrder}
          isOpen={selectedOrder !== null}
          history={history}
          historyLoading={historyLoading}
          onClose={() => setSelectedOrder(null)}
        />
      </Container>
    </div>
  );
}
