import { useState } from "react";
import { Activity, BadgeCheck, ClipboardList, Coins, Package } from "lucide-react";
import { STATUS_OPTIONS, useOrders } from "@/features/orders/hooks/useOrders";
import { OrderListItem } from "@/features/orders/components/OrderListItem";
import { OrderDetailDialog } from "../components/OrderDetailDialog";
import {
  Container,
  EmptyState,
  FilterChipGroup,
  IconBox,
  LoadingState,
  PageHero,
  Pagination,
  PanelShell,
  SearchBar,
  StatCard,
} from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import type { Order } from "@/features/orders/types";
import { useOrderHistoryQuery } from "../server";

export function OrdersPage() {
  const {
    orders,
    filters,
    currentPage,
    totalPages,
    isLoading,
    isError,
    setFilters,
    setPage,
    stats,
  } = useOrders();

  function updateFilters(updater: (current: typeof filters) => typeof filters) {
    setFilters(updater);
    setPage(1);
  }

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { data: history = [], isFetching: historyLoading } =
    useOrderHistoryQuery(selectedOrder?.id ?? null);

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
              value={stats.active}
              supporting="Cần xử lý"
            />

            <StatCard
              compact
              tone="success"
              icon={<BadgeCheck size={20} />}
              label="Hoàn thành"
              value={stats.completed}
              supporting="Đã giao"
            />

            <StatCard
              compact
              tone="primary"
              icon={<Package size={20} />}
              label="Tổng đơn"
              value={stats.total}
              supporting="Đơn hàng"
            />

            <StatCard
              compact
              tone="primary"
              icon={<Coins size={20} />}
              label="Tổng chi"
              value={formatCurrency(stats.amount)}
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
                <LoadingState title="Dang tai don hang..." />
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
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <OrderListItem
                        key={order.id}
                        order={order}
                        onClick={() => setSelectedOrder(order)}
                      />
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setPage}
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
