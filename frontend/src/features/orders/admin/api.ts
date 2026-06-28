import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { AdminOrder } from '@/features/orders/types';

export const adminOrdersKeys = {
  all: ['admin', 'orders'] as const,
};

export type AdminOrderActionInput = {
  orderId: number;
};

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<AdminOrder[]>>('/api/admin/orders');
  return response.data.data;
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
