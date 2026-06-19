import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelOrder, createOrder, getMyOrders, getOrderTimeline } from './api';
import { walletKeys } from '@/features/wallet/server';

export const orderKeys = {
  all: ['orders'] as const,
  timeline: (orderId: number) => ['orders', 'timeline', orderId] as const,
  myOrders: ['orders', 'my'] as const,
};

export function useMyOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: getMyOrders,
    enabled,
  });
}

export function useOrderTimelineQuery(orderId: number | null, enabled = true) {
  return useQuery({
    queryKey: orderId == null ? orderKeys.all : orderKeys.timeline(orderId),
    queryFn: () => {
      if (orderId == null) {
        throw new Error('Order id is required.');
      }
      return getOrderTimeline(orderId);
    },
    enabled: enabled && orderId != null,
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
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
    mutationFn: cancelOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã hủy đơn hàng.');
    },
  });
}
