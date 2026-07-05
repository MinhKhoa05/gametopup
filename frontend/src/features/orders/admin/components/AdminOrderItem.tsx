import { ImageBox, MediaListItem } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { AdminOrder } from '@/features/orders/types';

type AdminOrderItemProps = {
  order: AdminOrder;
  selected?: boolean;
  onClick: () => void;
};

export function AdminOrderItem({ order, selected = false, onClick }: AdminOrderItemProps) {
  return (
    <MediaListItem
      className="p-3"
      leading={<ImageBox src={order.packageImageUrl} alt="" className="object-cover" />}
      meta={`User #${order.userId} · Tạo ${formatDate(order.createdAt)}`}
      onClick={onClick}
      selected={selected}
      subtitle={`Đơn #${order.id} · ${order.gameAccountInfo}`}
      title={`${order.gameName} · ${order.packageName}`}
      titleAccessory={<OrderStatusBadge status={order.status} />}
      trailing={
        <div className="flex flex-col items-end gap-1">
          <strong className="text-sm font-black gt-text">
            {formatCurrency(order.packagePrice)}
          </strong>
          <span className="max-w-[11rem] truncate text-xs font-semibold gt-text-disabled">
            {order.assignedTo ? `Admin #${order.assignedTo}` : 'Chưa phân công'}
          </span>
        </div>
      }
    />
  );
}
