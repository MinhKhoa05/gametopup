import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type ApiResponse } from '../lib/api';
import type { Order } from '../types';

export const ordersQueryKey = ['orders'] as const;

type PlaceOrderPayload = {
  gamePackageId: number;
  quantity: number;
  gameAccountInfo: string;
};

type PayOrderPayload = {
  orderId: number;
};

// ==========================================
// 1. API SERVICES
// ==========================================
export async function getMyOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders/me');
  return response.data.data;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const response = await api.post<ApiResponse<number>>('/api/orders/place', payload);
  return response.data.data;
}

export async function payOrder(payload: PayOrderPayload) {
  const response = await api.post<ApiResponse<unknown>>(`/api/orders/${payload.orderId}/pay`);
  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS
// ==========================================
export function useOrdersQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: getMyOrders,
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
    meta: { persist: true },
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  function refreshOrderData() {
    queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }

  const place = useMutation({
    mutationFn: placeOrder,
    onSuccess: function handlePlaceOrderSuccess() {
      refreshOrderData();
      toast.success('Đặt hàng thành công. Vui lòng thanh toán để hoàn tất đơn hàng.');
    },
  });

  const pay = useMutation({
    mutationFn: payOrder,
    onSuccess: function handlePayOrderSuccess() {
      refreshOrderData();
      toast.success('Thanh toán đơn hàng thành công.');
    },
  });

  return { place, pay };
}
