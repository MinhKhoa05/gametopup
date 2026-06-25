import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { CancelOrderInput, CreateOrderInput, OrderHistoryResponse, OrderResponse } from './types';

export async function getMyOrders() {
  const response = await api.get<ApiResponse<OrderResponse[]>>('/api/orders');
  return response.data.data;
}

export async function getOrder(orderId: number) {
  const response = await api.get<ApiResponse<OrderResponse>>(`/api/orders/${orderId}`);
  return response.data.data;
}

export async function createOrder(payload: CreateOrderInput) {
  const response = await api.post<ApiResponse<number>>('/api/orders', payload);
  return response.data.data;
}

export async function cancelOrder({ orderId }: CancelOrderInput) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/cancel`);
  return response.data.data;
}

export async function getOrderHistory(orderId: number) {
  const response = await api.get<ApiResponse<OrderHistoryResponse[]>>(`/api/orders/${orderId}/history`);
  return response.data.data;
}
