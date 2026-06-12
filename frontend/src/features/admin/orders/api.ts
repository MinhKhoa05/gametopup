import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { Order } from '@/features/orders/types';

export const adminOrdersKeys = {
  all: ['admin', 'orders'] as const,
};

export type AdminOrderActionInput = {
  orderId: number;
};

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function pickAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/pick`);
}

export async function completeAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/complete`);
}

export async function cancelAdminOrder({ orderId }: AdminOrderActionInput) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/cancel`);
}
