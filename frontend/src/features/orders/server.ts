import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelOrder, createOrder, getMyOrders } from './api';
import { walletKeys } from '@/features/wallet/server';
import type { CancelOrderInput, CreateOrderInput } from './types';

export const orderKeys = {
  all: ['orders'] as const,
  myOrders: ['orders', 'my'] as const,
};

export function useMyOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: getMyOrders,
    enabled,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderInput) => createOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã mua gói thành công.');
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
