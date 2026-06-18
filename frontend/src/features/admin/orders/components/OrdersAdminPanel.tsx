import { CheckCircle2, CircleSlash, Clock3, Send, TriangleAlert, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AdminOrderSummary } from '@/features/orders/types';
import type { User } from '@/features/auth/types';
import { Badge, Button, DetailRow, EmptyState, FilterChipGroup, ImageBox, MediaListItem, PanelShell, SearchBar, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { getOrderStatusMeta as getSharedOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';

type OrdersAdminPanelState = {
  filters: Array<{ key: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'; label: string }>;
  filter: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';
  filteredOrders: AdminOrderSummary[];
  query: string;
  setFilter: (value: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled') => void;
  setQuery: (value: string) => void;
};

export function OrdersAdminPanel({
  busy,
  currentUser,
  loading,
  onCancelOrder,
  onCompleteOrder,
  onPickOrder,
  orders,
  state,
}: {
  busy: boolean;
  currentUser: User | null;
  loading: boolean;
  onCancelOrder: (orderId: number) => Promise<void>;
  onCompleteOrder: (orderId: number) => Promise<void>;
  onPickOrder: (orderId: number) => Promise<void>;
  orders: AdminOrderSummary[];
  state: OrdersAdminPanelState;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const selectedOrder = useMemo(
    () => state.filteredOrders.find((order) => order.id === selectedOrderId) ?? state.filteredOrders[0] ?? null,
    [selectedOrderId, state.filteredOrders],
  );

  const summary = useMemo(() => summarizeOrders(orders), [orders]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Đơn hàng"
            titleClassName="text-[1.2rem]"
            description="Xử lý đơn theo trạng thái, giữ đúng luồng tiếp nhận → hoàn thành → đóng."
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="warning">Chờ xử lý {summary.pending}</Badge>
                <Badge tone="primary">Đang xử lý {summary.processing}</Badge>
                <Badge tone="success">Thành công {summary.completed}</Badge>
                <Badge tone="danger">Đã hủy {summary.cancelled}</Badge>
              </div>
            }
          />

          <SearchBar
            value={state.query}
            placeholder="Tìm kiếm đơn hàng, mã đơn..."
            onChange={(value) => {
              state.setQuery(value);
            }}
            dense
          />

          <FilterChipGroup
            items={state.filters.map((option) => ({ value: option.key, label: option.label }))}
            value={state.filter}
            onChange={(value) => state.setFilter(value as typeof state.filter)}
          />

          {loading ? (
            <OrderListSkeleton />
          ) : state.filteredOrders.length ? (
            <div className="grid gap-3">
              {state.filteredOrders.map((order) => {
                const isSelected = order.id === selectedOrder?.id;
                const statusMeta = getOrderStatusMeta(order.status);
                const total = order.total;

                return (
                  <MediaListItem
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    selected={isSelected}
                    leading={<ImageBox src={DEFAULT_IMAGE_SRC} alt="" className="object-cover" />}
                    title={`Đơn #${order.id}`}
                    subtitle={`User #${order.userId} · Gói #${order.gamePackageId}`}
                    meta={`${order.gameAccountInfo} · ${formatDate(order.createdAt)}`}
                    titleAccessory={<Badge tone={statusMeta.tone} icon={statusMeta.icon}>{statusMeta.label}</Badge>}
                    trailing={<strong className="text-[1.02rem] font-black tracking-[-0.04em] text-cyan-100 gt-tabular">{formatCurrency(total)}</strong>}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState title="Không tìm thấy đơn hàng phù hợp." description="Thử đổi từ khóa hoặc bộ lọc hiện tại." />
          )}
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Xử lý đơn hàng"
            titleClassName="text-[1.2rem]"
            description="Nhận đơn, hoàn thành hoặc huỷ nếu đơn đang ở trạng thái phù hợp."
            action={selectedOrder ? <Badge tone={getOrderStatusMeta(selectedOrder.status).tone}>{getOrderStatusMeta(selectedOrder.status).label}</Badge> : undefined}
          />

          {!selectedOrder ? (
            <EmptyState title="Chưa chọn đơn hàng" description="Chọn một đơn bên trái để xem chi tiết và thao tác." />
          ) : (
            <div className="grid gap-4">
              <div className="rounded-[20px] border border-cyan/15 bg-cyan/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan">Đang xem</p>
                    <strong className="mt-1 block text-xl font-black text-white">#{selectedOrder.id}</strong>
                    <span className="mt-1 block text-sm text-slate-300">User #{selectedOrder.userId}</span>
                  </div>
                  <Badge tone={getOrderStatusMeta(selectedOrder.status).tone} icon={getOrderStatusMeta(selectedOrder.status).icon}>
                    {getOrderStatusMeta(selectedOrder.status).label}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-1.5 text-sm leading-6 text-slate-200">
                  <span className="font-semibold text-white">{formatCurrency(selectedOrder.total ?? selectedOrder.unitPrice)}</span>
                  <span className="break-words text-slate-200">{selectedOrder.gameAccountInfo}</span>
                </div>
              </div>

              <div className="grid gap-2 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-200">
                <DetailRow label="User">{`#${selectedOrder.userId}`}</DetailRow>
                <DetailRow label="Gói">{`#${selectedOrder.gamePackageId}`}</DetailRow>
                <DetailRow label="Tài khoản game">{selectedOrder.gameAccountInfo}</DetailRow>
                <DetailRow label="Giao cho">{selectedOrder.assignedTo ? `#${selectedOrder.assignedTo}` : 'Chưa phân công'}</DetailRow>
                <DetailRow label="Tạo lúc">{formatDate(selectedOrder.createdAt)}</DetailRow>
                <DetailRow label="Cập nhật">{formatDate(selectedOrder.updatedAt)}</DetailRow>
                <DetailRow label="Giá đơn vị">{formatCurrency(selectedOrder.unitPrice)}</DetailRow>
              </div>

              <div className="grid gap-2 text-sm leading-6 text-slate-200">
                {selectedOrder.assignedTo && currentUser?.id && selectedOrder.assignedTo !== currentUser.id && selectedOrder.status === 2 ? (
                  <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">Đơn này đang được admin khác xử lý. Mình chỉ xem được trạng thái.</div>
                ) : null}

                {selectedOrder.status === 2 && selectedOrder.assignedTo === currentUser?.id ? (
                  <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">Đơn này đang ở tay mình, có thể hoàn thành hoặc huỷ nếu cần.</div>
                ) : null}

                {!canPick(selectedOrder) && !canAct(selectedOrder, currentUser?.id ?? null) ? (
                  <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-4 py-3">Hiện tại không có thao tác phù hợp cho trạng thái này.</div>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button variant="accent" disabled={busy || !canPick(selectedOrder)} onClick={() => void onPickOrder(selectedOrder.id)}>
                  <Send size={16} />
                  Tiếp nhận
                </Button>
                <Button variant="secondary" disabled={busy || !canAct(selectedOrder, currentUser?.id ?? null)} onClick={() => void onCompleteOrder(selectedOrder.id)}>
                  <CheckCircle2 size={16} />
                  Hoàn thành
                </Button>
                <Button variant="secondary" disabled={busy || !canAct(selectedOrder, currentUser?.id ?? null)} onClick={() => void onCancelOrder(selectedOrder.id)}>
                  <CircleSlash size={16} />
                  Huỷ đơn
                </Button>
              </div>
            </div>
          )}
        </div>
      </PanelShell>
    </div>
  );
}

function summarizeOrders(orders: AdminOrderSummary[]) {
  return orders.reduce(
    (result, order) => {
      result.total += 1;
      result.value += order.total ?? order.unitPrice;
      if (order.status === 1) result.pending += 1;
      if (order.status === 2) result.processing += 1;
      if (order.status === 3) result.completed += 1;
      if (order.status === 4) result.cancelled += 1;
      return result;
    },
    { total: 0, value: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 },
  );
}

function canPick(order: AdminOrderSummary) {
  return order.status === 1;
}

function canAct(order: AdminOrderSummary, currentAdminId: number | null) {
  return order.status === 2 && order.assignedTo === currentAdminId;
}

function getOrderStatusMeta(status: number) {
  return getSharedOrderStatusMeta(status, getOrderStatusIcon(status));
}

function getOrderStatusIcon(status: number) {
  const icons = {
    1: <Clock3 size={14} />,
    2: <Send size={14} />,
    3: <CheckCircle2 size={14} />,
    4: <XCircle size={14} />,
  } as const;

  return icons[status as keyof typeof icons] ?? <TriangleAlert size={14} />;
}

function OrderListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải đơn hàng">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid gap-4 rounded-[20px] border border-white/[0.06] bg-white/[0.025] p-3 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center">
          <div className="aspect-square animate-pulse rounded-[18px] bg-white/6" />
          <div className="grid gap-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-white/6" />
            <div className="h-3.5 w-52 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/6" />
          </div>
          <div className="grid justify-items-end gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-14 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
