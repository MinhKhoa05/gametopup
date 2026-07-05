import { Badge } from "@/shared/components";
import { OrderStatus } from "../types";
import { getOrderStatusMeta } from "../orderMetadata";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = getOrderStatusMeta(status);

  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}
