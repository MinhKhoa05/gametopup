import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cancelOrder, getMyOrders, purchaseOrder } from './api';
import { walletKeys } from '@/features/wallet/server';
import type { CancelOrderInput, PurchaseOrderInput } from './types';

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

export function usePurchaseOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseOrderInput) => purchaseOrder(payload),
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
