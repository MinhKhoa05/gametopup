import type { ReactNode } from 'react';

export type OrderStatusMeta = {
  icon?: ReactNode;
  label: string;
  variant: 'accent' | 'danger' | 'default' | 'success' | 'warning';
};

const ORDER_STATUS_LABEL_BY_STATUS = {
  1: 'Chờ xử lý',
  2: 'Đang xử lý',
  3: 'Thành công',
  4: 'Đã hủy',
} as const;

const ORDER_STATUS_VARIANT_BY_STATUS = {
  1: 'warning',
  2: 'accent',
  3: 'success',
  4: 'danger',
} as const;

export function getOrderStatusMeta(status: number, icon?: ReactNode): OrderStatusMeta {
  return {
    icon,
    label: ORDER_STATUS_LABEL_BY_STATUS[status as keyof typeof ORDER_STATUS_LABEL_BY_STATUS] ?? `Trạng thái ${status}`,
    variant: ORDER_STATUS_VARIANT_BY_STATUS[status as keyof typeof ORDER_STATUS_VARIANT_BY_STATUS] ?? 'default',
  };
}
