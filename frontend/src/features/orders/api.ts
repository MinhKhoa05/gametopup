import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type {
  CreateOrderInput,
  CreateOrderResponse,
  AdminOrder,
  OrderFilter,
  OrderHistory,
  OrderStats,
  Order,
} from './types';

type OrderListParams = CursorParams<OrderFilter>;
export type AdminOrderFilter = OrderFilter | null;

type AdminOrderParams = CursorParams<OrderFilter>;

export async function getMyOrders(params: OrderListParams = {}) {
  return getCursorPage<Order, OrderFilter>('/api/orders', params);
}

export async function getAdminOrders(params: AdminOrderParams = {}) {
  return getCursorPage<AdminOrder, OrderFilter>('/api/admin/orders', params);
}

export async function getMyOrderStats() {
  const response = await api.get<ApiResponse<OrderStats>>('/api/orders/stats');
  return response.data.data;
}

export async function createOrder(payload: CreateOrderInput) {
  const response = await api.post<ApiResponse<CreateOrderResponse | number>>('/api/orders', payload);
  const data = response.data.data;

  if (typeof data === 'number') {
    return data;
  }

  return data.orderId;
}

export async function cancelOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/cancel`);
}

export async function pickOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/admin/orders/${orderId}/pick`);
}

export async function completeOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/admin/orders/${orderId}/complete`);
}

export async function getOrderHistory(orderId: number) {
  const response = await api.get<ApiResponse<OrderHistory[]>>(`/api/orders/${orderId}/history`);
  return response.data.data;
}
