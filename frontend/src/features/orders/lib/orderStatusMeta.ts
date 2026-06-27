import { OrderStatus } from "../types";

export type OrderStatusTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type OrderStatusMeta = {
  label: string;
  tone: OrderStatusTone;
};

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  [OrderStatus.Pending]: {
    label: "Chờ xử lý",
    tone: "warning",
  },
  [OrderStatus.Processing]: {
    label: "Đang xử lý",
    tone: "primary",
  },
  [OrderStatus.Completed]: {
    label: "Hoàn thành",
    tone: "success",
  },
  [OrderStatus.Cancelled]: {
    label: "Đã hủy",
    tone: "danger",
  },
};

export function getOrderStatusMeta(status: OrderStatus): OrderStatusMeta {
  return ORDER_STATUS_META[status];
}
