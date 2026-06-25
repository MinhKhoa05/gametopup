import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import { Badge } from "@/shared/components";
import { getOrderStatusMeta } from "../lib/orderStatus.v2";
import { OrderStatus } from "../types";

type Props = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: Props) {
  const meta = getOrderStatusMeta(status);

  const icon =
    status === OrderStatus.Pending ? (
      <Clock3 size={14} />
    ) : status === OrderStatus.Processing ? (
      <LoaderCircle size={14} />
    ) : status === OrderStatus.Completed ? (
      <CheckCircle2 size={14} />
    ) : (
      <XCircle size={14} />
    );

  return (
    <Badge tone={meta.tone} icon={icon}>
      {meta.label}
    </Badge>
  );
}