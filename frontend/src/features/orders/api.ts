import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { CancelOrderInput, Order, PayOrderInput, PlaceOrderInput } from './types';

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders/me');
  return response.data.data;
}

export async function placeOrder(payload: PlaceOrderInput) {
  const response = await api.post<ApiResponse<number>>('/api/orders/place', payload);
  return response.data.data;
}

export async function payOrder({ orderId }: PayOrderInput) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/pay`);
  return response.data.data;
}

export async function cancelOrder({ orderId }: CancelOrderInput) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/cancel`);
  return response.data.data;
}
