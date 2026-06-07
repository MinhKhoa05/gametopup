import { CheckCircle2, CircleSlash, Send, TriangleAlert } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import type { Order, User } from '../../types';
import { useAdminOrdersPanel } from '../../hooks/admin/admin-orders.hook';
import { AdminSkeleton } from './AdminShared';
import { Badge, Button, EmptyState, IconBox, RecordRow, SearchBar, SectionHeading } from '../ui';

export function OrdersAdminPanel({
  busy,
  loading,
  orders,
  currentUser,
  onPickOrder,
  onCompleteOrder,
  onCancelOrder,
}: {
  busy: boolean;
  loading: boolean;
  orders: Order[];
  currentUser: User | null;
  onPickOrder: (orderId: number) => Promise<void>;
  onCompleteOrder: (orderId: number) => Promise<void>;
  onCancelOrder: (orderId: number) => Promise<void>;
}) {
  const { FILTERS, filter, filteredOrders, query, setFilter, setQuery } = useAdminOrdersPanel(orders);

  return (
    <div className="grid gap-5">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Bộ lọc đơn hàng" />
        <SearchBar className="mb-4" inputClassName="text-sm" value={query} onChange={setQuery} placeholder="Tìm theo mã đơn, user, package..." />
        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? 'accent' : 'default'}
              className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="gt-surface">
        <SectionHeading title="Danh sách đơn hàng" />

        {loading && filteredOrders.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredOrders.length === 0 ? (
          <EmptyState>Không tìm thấy đơn hàng phù hợp.</EmptyState>
        ) : (
          <div className="admin-table">
            {filteredOrders.map((order) => {
              const isProcessing = order.status === 3;
              const canPick = order.status === 2;
              const canComplete = isProcessing && order.assignedTo === currentUser?.id;
              const canCancel = isProcessing && order.assignedTo === currentUser?.id;

              return (
                <RecordRow className="grid-cols-[auto_minmax(0,1.2fr)_minmax(140px,auto)_auto_auto]" key={order.id}>
                  <IconBox size="md" className="font-black text-[0.8rem]">
                    #{order.id}
                  </IconBox>
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

                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <b>{formatCurrency(order.total ?? order.unitPrice * order.quantity)}</b>
                    <Badge variant={order.status === 4 ? 'success' : 'default'} icon={order.status === 4 ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}>
                      {order.status === 4 ? 'Bật' : 'Tắt'}
                    </Badge>
                  </div>

                  <div className="flex justify-end max-[700px]:justify-start">
                    <Badge variant={toneForStatus(order.status)}>{statusLabel(order.status)}</Badge>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 max-[700px]:justify-start">
                    {canPick && (
                      <Button className="min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onPickOrder(order.id)}>
                        <Send size={16} />
                        Tiếp nhận
                      </Button>
                    )}

                    {canComplete && (
                      <Button variant="accent" className="min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onCompleteOrder(order.id)}>
                        <CheckCircle2 size={16} />
                        Hoàn thành
                      </Button>
                    )}

                    {canCancel && (
                      <Button className="min-h-10 px-4 py-2 text-sm" disabled={busy} onClick={() => void onCancelOrder(order.id)}>
                        <CircleSlash size={16} />
                        Hủy
                      </Button>
                    )}

                    {!canPick && !canComplete && !canCancel && (
                      <Badge className="gap-1.5 text-slate-300">
                        <TriangleAlert size={14} />
                        {isProcessing && order.assignedTo !== currentUser?.id ? 'Đơn đang được admin khác xử lý.' : 'Không có thao tác phù hợp.'}
                      </Badge>
                    )}
                  </div>
                </RecordRow>
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
      return 'accent';
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
