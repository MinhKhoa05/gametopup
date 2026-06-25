import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { CancelOrderInput, CreateOrderInput, OrderHistory, Order } from './types';

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function getOrder(orderId: number) {
  const response = await api.get<ApiResponse<Order>>(`/api/orders/${orderId}`);
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
  const response = await api.get<ApiResponse<OrderHistory[]>>(`/api/orders/${orderId}/history`);
  return response.data.data;
}
