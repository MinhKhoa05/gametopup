import { ImageBox, MediaListItem } from '@/shared/components';
import { formatCurrency, formatDateTimeCompact } from '@/shared/lib/format';
import { formatOrderId } from '../utils';
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
      meta={
        <span className="text-xs font-medium gt-text-muted">
          User #{order.userId} • {formatOrderId(order.id)} • {formatDateTimeCompact(order.createdAt)}
        </span>
      }
      onClick={onClick}
      selected={selected}
      subtitle={
        <span className="text-xs">
          <span className="gt-text-soft">Tài khoản: </span>
          <span className="font-semibold gt-text">{order.gameAccountInfo}</span>
        </span>
      }
      title={
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="truncate font-bold gt-text">
            {order.packageName}
          </span>
          <span className="truncate text-xs font-normal gt-text-muted">
            ({order.gameName})
          </span>
        </span>
      }
      trailing={
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
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
