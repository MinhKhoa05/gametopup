import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type {
  CreateOrderInput,
  CreateOrderResponse,
  OrderFilter,
  OrderHistory,
  Order,
} from './types';

type OrderListParams = CursorParams<OrderFilter>;

export async function getMyOrders(params: OrderListParams = {}) {
  return getCursorPage<Order, OrderFilter>('/api/orders', params);
}

export async function createOrder(payload: CreateOrderInput) {
  const response = await api.post<ApiResponse<CreateOrderResponse | number>>('/api/orders', payload);
  const data = response.data.data;

  if (typeof data === 'number') {
    return data;
  }

  return data.orderId;
}

export async function getOrderHistory(orderId: number) {
  const response = await api.get<ApiResponse<OrderHistory[]>>(`/api/orders/${orderId}/history`);
  return response.data.data;
}
