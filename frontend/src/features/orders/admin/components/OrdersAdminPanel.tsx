import { CheckCircle2, CircleSlash, Clock3, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AdminOrder } from '@/features/orders/types';
import type { User } from '@/features/auth/types';
import { Badge, Button, DetailRow, EmptyState, FilterChipGroup, ImageBox, LoadingState, MediaListItem, PanelShell, SearchBar, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';

type OrderFilter = 'active' | 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

type OrdersAdminPanelState = {
  filters: Array<{ key: OrderFilter; label: string }>;
  filter: OrderFilter;
  filteredOrders: AdminOrder[];
  query: string;
  setFilter: (value: OrderFilter) => void;
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
  orders: AdminOrder[];
  state: OrdersAdminPanelState;
}) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const selectedOrder = useMemo(
    () => state.filteredOrders.find((order) => order.id === selectedOrderId) ?? state.filteredOrders[0] ?? null,
    [selectedOrderId, state.filteredOrders],
  );
  const selectedActionState = selectedOrder ? getOrderActionState(selectedOrder, currentUser?.id ?? null) : null;
  const summary = useMemo(() => summarizeOrders(orders), [orders]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Đơn hàng"
            titleClassName="text-[1.2rem]"
            description="Ưu tiên đơn cần xử lý trước, rồi mở chi tiết để thao tác."
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="warning">Chờ {summary.pending}</Badge>
                <Badge tone="primary">Đang xử lý {summary.processing}</Badge>
                <Badge tone="success">Xong {summary.completed}</Badge>
                <Badge tone="danger">Hủy {summary.cancelled}</Badge>
              </div>
            }
          />

          <SearchBar
            value={state.query}
            placeholder="Tìm mã đơn, user, gói, tài khoản game..."
            onChange={state.setQuery}
            dense
          />

          <FilterChipGroup
            items={state.filters.map((option) => ({ value: option.key, label: option.label }))}
            value={state.filter}
            onChange={(value) => state.setFilter(value as OrderFilter)}
          />

          {loading ? (
            <LoadingState title="Dang tai don hang..." />
          ) : state.filteredOrders.length ? (
            <div className="grid gap-3">
              {state.filteredOrders.map((order) => {
                const isSelected = order.id === selectedOrder?.id;

                return (
                  <MediaListItem
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    selected={isSelected}
                    leading={<ImageBox src={DEFAULT_IMAGE_SRC} alt="" className="object-cover" />}
                    title={`Đơn #${order.id}`}
                    subtitle={`User #${order.userId} · Gói #${order.gamePackageId}`}
                    meta={`${order.gameAccountInfo} · ${formatDate(order.createdAt)}`}
                    titleAccessory={<OrderStatusBadge status={order.status} />}
                    trailing={<strong className="text-[1.02rem] font-black tracking-[-0.04em] text-cyan-100 gt-tabular">{formatCurrency(order.packagePrice)}</strong>}
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
            description="Kiểm tra nhanh rồi thao tác bước tiếp theo."
            action={selectedOrder ? <OrderStatusBadge status={selectedOrder.status} /> : undefined}
          />

          {!selectedOrder ? (
            <EmptyState title="Chưa chọn đơn hàng" description="Chọn một đơn bên trái để xem chi tiết và thao tác." />
          ) : (
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[22px] border border-cyan/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.72))] p-4 shadow-[0_18px_48px_rgba(2,6,23,0.24)]">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                  <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-slate-950/30">
                    <ImageBox src={DEFAULT_IMAGE_SRC} alt="" className="aspect-square object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan">Đơn #{selectedOrder.id}</p>
                        <strong className="mt-1 block text-2xl font-black tracking-[-0.04em] text-white">{formatCurrency(selectedOrder.packagePrice)}</strong>
                        <span className="mt-1 block truncate text-sm text-slate-300">User #{selectedOrder.userId} · Gói #{selectedOrder.gamePackageId}</span>
                      </div>
                      <OrderStatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[16px] border border-white/[0.08] bg-slate-950/24 px-3 py-2.5">
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">UID / Server / Nhân vật</span>
                  <strong className="mt-1 block break-words text-sm font-black text-white">{selectedOrder.gameAccountInfo}</strong>
                </div>
              </div>

              {selectedActionState?.kind === 'pick' || selectedActionState?.kind === 'act' ? (
                <div className="flex flex-wrap gap-2.5">
                  {selectedActionState.kind === 'pick' ? (
                    <Button variant="primary" disabled={busy} onClick={() => void onPickOrder(selectedOrder.id)}>
                      <Send size={16} />
                      Tiếp nhận
                    </Button>
                  ) : null}

                  {selectedActionState.kind === 'act' ? (
                    <>
                      <Button variant="primary" disabled={busy} onClick={() => void onCompleteOrder(selectedOrder.id)}>
                        <CheckCircle2 size={16} />
                        Hoàn thành
                      </Button>
                      <Button variant="secondary" disabled={busy} onClick={() => void onCancelOrder(selectedOrder.id)}>
                        <CircleSlash size={16} />
                        Hủy đơn
                      </Button>
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="grid gap-2 rounded-[20px] border border-white/[0.07] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-slate-200">
                <DetailRow label="Ngày tạo">{formatDate(selectedOrder.createdAt)}</DetailRow>
                <DetailRow label="Người xử lý">{selectedOrder.assignedTo ? `#${selectedOrder.assignedTo}` : 'Chưa phân công'}</DetailRow>
                <DetailRow label="Cập nhật lần cuối">{formatDate(selectedOrder.updatedAt)}</DetailRow>
              </div>

              {selectedActionState ? (
                <div className="grid gap-2 rounded-[20px] border border-white/[0.07] bg-[rgba(255,255,255,0.035)] px-4 py-4">
                  <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Ghi chú xử lý</span>
                  <div className="rounded-[18px] border border-cyan/10 bg-cyan/5 px-4 py-3 text-sm font-medium leading-6 text-cyan-50">
                    {selectedActionState.message}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </PanelShell>
    </div>
  );
}

function summarizeOrders(orders: AdminOrder[]) {
  return orders.reduce(
    (result, order) => {
      if (order.status === 1) result.pending += 1;
      if (order.status === 2) result.processing += 1;
      if (order.status === 3) result.completed += 1;
      if (order.status === 4) result.cancelled += 1;
      return result;
    },
    { pending: 0, processing: 0, completed: 0, cancelled: 0 },
  );
}

function canPick(order: AdminOrder) {
  return order.status === 1;
}

function canAct(order: AdminOrder, currentAdminId: number | null) {
  return order.status === 2 && order.assignedTo === currentAdminId;
}

function getOrderActionState(order: AdminOrder, currentAdminId: number | null) {
  if (canPick(order)) {
    return {
      kind: 'pick' as const,
      message: 'Đơn đang chờ. Nếu thông tin đúng, tiếp nhận để bắt đầu xử lý.',
    };
  }

  if (canAct(order, currentAdminId)) {
    return {
      kind: 'act' as const,
      message: 'Đơn đang ở tay bạn. Hoàn thành khi đã giao xong, hoặc hủy nếu không thể xử lý.',
    };
  }

  if (order.status === 2 && order.assignedTo && order.assignedTo !== currentAdminId) {
    return {
      kind: 'locked' as const,
      message: `Đơn này đang được admin #${order.assignedTo} xử lý.`,
    };
  }

  return {
    kind: 'none' as const,
    message: 'Không có thao tác nào cho trạng thái hiện tại.',
  };
}

