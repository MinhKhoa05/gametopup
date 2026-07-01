import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type { AdminOrder, OrderFilter } from '@/features/orders/types';

export const adminOrdersKeys = {
  all: ['admin', 'orders'] as const,
  list: (filter: AdminOrderFilter) => ['admin', 'orders', 'list', filter] as const,
};

export type AdminOrderFilter = OrderFilter | null;

export type AdminOrderActionInput = {
  orderId: number;
};

type AdminOrderParams = CursorParams<OrderFilter>;

export async function getAdminOrders(params: AdminOrderParams = {}) {
  return getCursorPage<AdminOrder, OrderFilter>('/api/admin/orders', params);
}

export async function pickAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/admin/orders/${orderId}/pick`);
}

export async function completeAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/admin/orders/${orderId}/complete`);
}

export async function cancelAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/admin/orders/${orderId}/cancel`);
}
