import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { CancelOrderInput, Order, PurchaseOrderInput } from './types';

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders/me');
  return response.data.data;
}

export async function purchaseOrder(payload: PurchaseOrderInput) {
  const response = await api.post<ApiResponse<number>>('/api/orders/purchase', payload);
  return response.data.data;
}

export async function cancelOrder({ orderId }: CancelOrderInput) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/cancel`);
  return response.data.data;
}
