import { ImageBox, MediaListItem } from "@/shared/components";
import { formatCurrency, formatDateTimeCompact } from "@/shared/lib/format";
import { formatOrderId } from "../utils";
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
      leading={<ImageBox src={order.packageImageUrl} alt={order.packageName} />}
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
      subtitle={
        <span className="text-xs">
          <span className="gt-text-soft">Tài khoản: </span>
          <span className="font-semibold gt-text">{order.gameAccountInfo}</span>
        </span>
      }
      meta={
        <span className="text-xs font-medium gt-text-muted">
          {formatOrderId(order.id)} • {formatDateTimeCompact(order.createdAt)}
        </span>
      }
      trailing={
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge status={order.status} />
          <strong className="gt-tabular font-black text-cyan-100">
            {formatCurrency(order.packagePrice)}
          </strong>
        </div>
      }
    />
  );
}
