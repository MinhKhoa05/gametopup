import { ImageBox, MediaListItem } from "@/shared/components";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { Order } from "@/features/orders/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

type OrderListItemProps = {
  order: Order;
  onClick?: () => void;
};

export function OrderListItem({
  order,
  onClick,
}: OrderListItemProps) {
  return (
    <MediaListItem
      onClick={onClick}
      leading={
        <ImageBox
          src={order.packageImageUrl}
          alt={order.packageName}
          className="object-cover"
        />
      }
      title={order.gameName}
      subtitle={order.packageName}
      meta={`Đơn #${order.id} • ${order.gameAccountInfo}`}
      titleAccessory={<OrderStatusBadge status={order.status} />}
      trailing={
        <div className="text-right">
          <div className="text-xs text-slate-400">
            {formatDate(order.createdAt)}
          </div>

          <strong className="gt-tabular font-black text-cyan-100">
            {formatCurrency(order.packagePrice)}
          </strong>
        </div>
      }
    />
  );
}