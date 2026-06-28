import { CheckCircle2, Clock3, LoaderCircle, XCircle } from "lucide-react";

import { Badge } from "@/shared/components";
import { OrderStatus } from "../types";

const ORDER_STATUS_META = {
  [OrderStatus.Pending]: {
    label: "Chờ xử lý",
    tone: "warning",
    icon: <Clock3 size={14} />,
  },
  [OrderStatus.Processing]: {
    label: "Đang xử lý",
    tone: "primary",
    icon: <LoaderCircle size={14} />,
  },
  [OrderStatus.Completed]: {
    label: "Hoàn thành",
    tone: "success",
    icon: <CheckCircle2 size={14} />,
  },
  [OrderStatus.Cancelled]: {
    label: "Đã hủy",
    tone: "danger",
    icon: <XCircle size={14} />,
  },
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status] ?? {
    label: `Trạng thái ${status}`,
    tone: "neutral" as const,
  };

  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}
