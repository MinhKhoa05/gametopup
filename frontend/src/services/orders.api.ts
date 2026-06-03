import { api, ApiResponse } from '../lib/api';
import { Order } from '../types';

export async function placeOrder(gamePackageId: number, quantity: number, gameAccountInfo: string) {
  const response = await api.post<ApiResponse<Order>>('/api/orders/place', {
    gamePackageId,
    quantity,
    gameAccountInfo,
  });

  return response.data.data;
}

export async function payOrder(orderId: number) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${orderId}/pay`);
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders/me');
  return response.data.data;
}
