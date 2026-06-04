import { useQuery } from '@tanstack/react-query';
import { api, ApiResponse } from '../lib/api';
import { Order } from '../types';

// ==========================================
// 1. API SERVICES (pure server calls)
// ==========================================
export async function placeOrder(gamePackageId: number, quantity: number, gameAccountInfo: string) {
  const response = await api.post<ApiResponse<number>>('/api/orders/place', {
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

export async function pickOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/pick`);
}

export async function completeOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/complete`);
}

export async function cancelOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/cancel`);
}

// ==========================================
// 2. REACT QUERY HOOKS (cache / SWR / background revalidate)
// ==========================================
export const ordersQueryKey = ['orders'] as const;
const USER_ORDERS_STALE_TIME = 1000 * 60 * 2;

export function useOrdersQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: getMyOrders,
    enabled: isLoggedIn,
    placeholderData: (previousData) => previousData,
    staleTime: USER_ORDERS_STALE_TIME,
  });
}
