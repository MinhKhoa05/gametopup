import { CheckCircle2, CircleSlash, Clock3, Send, TriangleAlert, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Order } from '@/features/orders/types';
import type { User } from '@/features/auth/types';
import { Badge, Button, DetailRow, EmptyState, FilterChip, IconBox, RecordRow, SearchBar, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { getOrderStatusMeta as getSharedOrderStatusMeta } from '@/features/orders/lib/orderStatus';

type OrdersAdminPanelState = {
  filters: Array<{ key: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'; label: string }>;
  filter: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';
  filteredOrders: Order[];
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
  orders: Order[];
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
      <div className="gt-surface grid gap-4">
        <SectionHeading
          title="Bộ lọc đơn hàng"
          action={
            <div className="flex flex-wrap gap-2">
              <Badge tone="warning">Chờ xử lý {summary.pending}</Badge>
              <Badge tone="primary">Đang xử lý {summary.processing}</Badge>
              <Badge tone="success">Thành công {summary.completed}</Badge>
              <Badge tone="danger">Đã hủy {summary.cancelled}</Badge>
            </div>
          }
        />
        <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm theo mã đơn, user, package..." />
        <div className="flex flex-wrap gap-2.5">
          {state.filters.map((item) => (
            <FilterChip
              key={item.key}
              active={state.filter === item.key}
              onClick={() => state.setFilter(item.key)}
            >
              {item.label}
            </FilterChip>
          ))}
        </div>

        {loading && state.filteredOrders.length === 0 ? (
          <div className="grid gap-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : state.filteredOrders.length === 0 ? (
          <EmptyState>Không tìm thấy đơn hàng phù hợp.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {state.filteredOrders.map((order) => {
              const isActive = order.id === selectedOrder?.id;
              const statusMeta = getOrderStatusMeta(order.status);
              const total = order.total ?? order.unitPrice;

              return (
                <button
                  key={order.id}
                  type="button"
                  className={isActive ? 'card admin-orders-page__item admin-orders-page__item--active' : 'card admin-orders-page__item'}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <RecordRow className="grid-cols-[auto_minmax(0,1fr)_auto]">
                    <IconBox size="md" className="font-black text-[0.8rem]">
                      #{order.id}
                    </IconBox>
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-bold text-white">Đơn #{order.id}</strong>
                      <small className="block truncate text-xs text-slate-400">
                        User #{order.userId} · Gói #{order.gamePackageId}
                      </small>
                      <small className="block truncate text-xs text-slate-500">
                        {order.gameAccountInfo}
                        {order.assignedTo ? ` · Giao cho #${order.assignedTo}` : ''}
                      </small>
                    </div>
                    <div className="grid justify-items-end gap-1">
                      <Badge tone={statusMeta.tone} icon={statusMeta.icon}>
                        {statusMeta.label}
                      </Badge>
                      <strong className="text-sm text-white">{formatCurrency(total)}</strong>
                    </div>
                  </RecordRow>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <aside className="gt-surface grid gap-4 sticky top-24">
        <SectionHeading
          title="Xử lý đơn hàng"
          description="Khu này chỉ làm đúng 3 việc: nhận đơn, hoàn thành hoặc huỷ nếu đơn đang đúng trạng thái."
          action={selectedOrder ? <Badge tone={getOrderStatusMeta(selectedOrder.status).tone}>{getOrderStatusMeta(selectedOrder.status).label}</Badge> : undefined}
        />

        {!selectedOrder ? (
          <EmptyState title="Chưa chọn đơn hàng" description="Chọn một đơn bên trái để xem chi tiết và thao tác." />
        ) : (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-cyan/15 bg-cyan/8 p-4">
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

            <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-200">
              <DetailRow label="User" value={`#${selectedOrder.userId}`} />
              <DetailRow label="Gói" value={`#${selectedOrder.gamePackageId}`} />
              <DetailRow label="Tài khoản game" value={selectedOrder.gameAccountInfo} />
              <DetailRow label="Giao cho" value={selectedOrder.assignedTo ? `#${selectedOrder.assignedTo}` : 'Chưa phân công'} />
              <DetailRow label="Tạo lúc" value={formatDate(selectedOrder.createdAt)} />
              <DetailRow label="Cập nhật" value={formatDate(selectedOrder.updatedAt)} />
              <DetailRow label="Giá đơn vị" value={formatCurrency(selectedOrder.unitPrice)} />
            </div>

            <div className="grid gap-2 text-sm leading-6 text-slate-200">
              {selectedOrder.assignedTo && currentUser?.id && selectedOrder.assignedTo !== currentUser.id && selectedOrder.status === 2 ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">Đơn này đang được admin khác xử lý. Mình chỉ xem được trạng thái, không nhận thao tác.</div>
              ) : null}

              {selectedOrder.status === 2 && selectedOrder.assignedTo === currentUser?.id ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">Đơn này đang ở tay mình, có thể hoàn thành hoặc huỷ nếu cần.</div>
              ) : null}

              {!canPick(selectedOrder) && !canAct(selectedOrder, currentUser?.id ?? null) ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">Hiện tại không có thao tác phù hợp cho trạng thái này.</div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
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
                Hủy đơn
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function summarizeOrders(orders: Order[]) {
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

function canPick(order: Order) {
  return order.status === 1;
}

function canAct(order: Order, currentAdminId: number | null) {
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
