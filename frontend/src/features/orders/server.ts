import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelOrder, getMyOrders, payOrder, placeOrder } from './api';
import { walletKeys } from '@/features/wallet/server';
import type { CancelOrderInput, PayOrderInput, PlaceOrderInput } from './types';

export const orderKeys = {
  all: ['orders'] as const,
  myOrders: ['orders', 'me'] as const,
};

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: getMyOrders,
  });
}

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlaceOrderInput) => placeOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã tạo đơn hàng. Vui lòng thanh toán để hoàn tất đơn hàng.');
    },
  });
}

export function usePayOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PayOrderInput) => payOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã thanh toán đơn hàng.');
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CancelOrderInput) => cancelOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã hủy đơn hàng.');
    },
  });
}
