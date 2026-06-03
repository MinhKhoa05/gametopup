import { useMemo, useState } from 'react';
import { CheckCircle2, CircleSlash, Send, TriangleAlert } from 'lucide-react';
import { AsyncActionExecutor } from '../../hooks/common/useAsyncAction';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import { classNames } from '../../lib/ui';
import type { Order } from '../../types';
import { cancelOrder, completeOrder, pickOrder } from '../../services/admin.api';
import { AdminSkeleton, EmptyLine, PanelTitle, SearchBox, StatusPill } from './AdminShared';
import { Badge } from '../common/Badge';
import { useAuthStore } from '../../store/auth.store';

type OrderFilter = 'all' | 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

const FILTERS: Array<{ key: OrderFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ thanh toán' },
  { key: 'paid', label: 'Đã thanh toán' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

export function OrdersAdminPanel({
  busy,
  execute,
  loading,
  orders,
  refresh,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  loading: boolean;
  orders: Order[];
  refresh: () => Promise<void>;
}) {
  const currentUser = useAuthStore((state) => state.user);
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

  async function handleAction(action: () => Promise<unknown>, refreshNote: string) {
    await execute(action, { successMessage: refreshNote, onSuccess: refresh });
  }

  return (
    <div className="grid gap-5">
      <div className="gametopup-surface grid gap-4">
        <PanelTitle title="Bộ lọc đơn hàng" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm theo mã đơn, user, package..." />
        <div className="admin-filter-row">
          {FILTERS.map((item) => (
            <button key={item.key} type="button" className={classNames('admin-filter-chip', filter === item.key && 'active')} onClick={() => setFilter(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gametopup-surface">
        <PanelTitle title="Danh sách đơn hàng" />

        {loading && filteredOrders.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredOrders.length === 0 ? (
          <EmptyLine text="Không tìm thấy đơn hàng phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredOrders.map((order) => {
              const isProcessing = order.status === 3;
              const canPick = order.status === 2;
              const canComplete = isProcessing && order.assignedTo === currentUser?.id;
              const canCancel = isProcessing && order.assignedTo === currentUser?.id;

              return (
                <article className="gametopup-record-row admin-table-row order" key={order.id}>
                  <div className="admin-row-icon">#{order.id}</div>
                  <div>
                    <strong>
                      Đơn #{order.id} · User #{order.userId} · Gói #{order.gamePackageId}
                    </strong>
                    <small>
                      {order.gameAccountInfo} · SL {order.quantity} · {formatDate(order.createdAt)}
                    </small>
                    <small>
                      Cập nhật: {formatDate(order.updatedAt)}
                      {order.assignedTo ? ` · Giao cho #${order.assignedTo}` : ''}
                    </small>
                  </div>

                  <div className="admin-order-values">
                    <b>{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                    <StatusPill active={order.status === 4} />
                  </div>

                  <div className="admin-order-status">
                    <Badge tone={toneForStatus(order.status)}>{statusLabel(order.status)}</Badge>
                  </div>

                  <div className="admin-order-actions">
                    {canPick && (
                      <button type="button" className="btn-secondary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void handleAction(() => pickOrder(order.id), `Đã tiếp nhận đơn #${order.id}.`)}>
                        <Send size={16} />
                        Tiếp nhận
                      </button>
                    )}

                    {canComplete && (
                      <button type="button" className="btn-primary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void handleAction(() => completeOrder(order.id), `Đã hoàn thành đơn #${order.id}.`)}>
                        <CheckCircle2 size={16} />
                        Hoàn thành
                      </button>
                    )}

                    {canCancel && (
                      <button type="button" className="btn-secondary min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void handleAction(() => cancelOrder(order.id), `Đã hủy đơn #${order.id}.`)}>
                        <CircleSlash size={16} />
                        Hủy
                      </button>
                    )}

                    {!canPick && !canComplete && !canCancel && (
                      <span className="admin-action-note">
                        <TriangleAlert size={14} />
                        {isProcessing && order.assignedTo !== currentUser?.id ? 'Đơn đang được admin khác xử lý.' : 'Không có thao tác phù hợp.'}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function toneForStatus(status: number) {
  switch (status) {
    case 1:
      return 'warning';
    case 2:
      return 'info';
    case 3:
      return 'default';
    case 4:
      return 'success';
    case 5:
      return 'danger';
    default:
      return 'default';
  }
}
