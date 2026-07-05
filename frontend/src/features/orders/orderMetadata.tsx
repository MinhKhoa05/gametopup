import type { ComponentType, ReactNode } from 'react';
import {
  CheckCircle2,
  CircleCheckBig,
  CircleX,
  Clock3,
  Cog,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

import type { FilterChipGroupItem } from '@/shared/components';
import { OrderStatus, type OrderFilter } from './types';

export type OrderStatusFilter = OrderFilter | null;

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

type OrderStatusMeta = {
  icon?: ReactNode;
  label: string;
  tone: BadgeTone;
};

export const ORDER_STATUS_FILTER_OPTIONS = [
  { label: 'Cần theo dõi', value: 'watching' },
  { label: 'Tất cả', value: null },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
] satisfies readonly FilterChipGroupItem<OrderStatusFilter>[];

const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  [OrderStatus.Pending]: {
    label: 'Chờ xử lý',
    tone: 'warning',
    icon: <Clock3 size={14} />,
  },
  [OrderStatus.Processing]: {
    label: 'Đang xử lý',
    tone: 'primary',
    icon: <LoaderCircle size={14} />,
  },
  [OrderStatus.Completed]: {
    label: 'Hoàn thành',
    tone: 'success',
    icon: <CheckCircle2 size={14} />,
  },
  [OrderStatus.Cancelled]: {
    label: 'Đã hủy',
    tone: 'danger',
    icon: <XCircle size={14} />,
  },
};

export const ORDER_TIMELINE_STATUS_META: Record<
  OrderStatus,
  {
    color: string;
    description: string;
    icon: ComponentType<{ size?: number; className?: string }>;
    title: string;
  }
> = {
  [OrderStatus.Pending]: {
    icon: Clock3,
    title: 'Đơn hàng đã được ghi nhận',
    color: 'text-amber-400',
    description:
      'Yêu cầu mua gói đã được ghi nhận và đang chờ quản trị viên tiếp nhận.',
  },
  [OrderStatus.Processing]: {
    icon: Cog,
    title: ORDER_STATUS_META[OrderStatus.Processing].label,
    color: 'text-cyan-400',
    description: 'Quản trị viên tiếp nhận và đang xử lý đơn hàng.',
  },
  [OrderStatus.Completed]: {
    icon: CircleCheckBig,
    title: ORDER_STATUS_META[OrderStatus.Completed].label,
    color: 'text-emerald-400',
    description: 'Đơn hàng đã được hoàn tất.',
  },
  [OrderStatus.Cancelled]: {
    icon: CircleX,
    title: ORDER_STATUS_META[OrderStatus.Cancelled].label,
    color: 'text-red-400',
    description: 'Đơn hàng đã bị hủy.',
  },
};

export function getOrderStatusMeta(status: OrderStatus | number): OrderStatusMeta {
  return ORDER_STATUS_META[status as OrderStatus] ?? {
    label: `Trạng thái ${status}`,
    tone: 'neutral',
  };
}

export function getOrderStatusLabel(status: OrderStatus | number) {
  return getOrderStatusMeta(status).label;
}

export function canUserCancelOrder(status: OrderStatus) {
  return status === OrderStatus.Pending;
}
