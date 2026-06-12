import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderKeys } from '@/features/orders/server';
import { adminOrdersKeys, cancelAdminOrder, completeAdminOrder, getAdminOrders, pickAdminOrder } from '../api';
import type { AdminOrderActionInput } from '../api';

const STALE_TIME = 1000 * 30;

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: adminOrdersKeys.all,
    queryFn: getAdminOrders,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function usePickAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminOrderActionInput) => pickAdminOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã tiếp nhận đơn hàng.');
    },
  });
}

export function useCompleteAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminOrderActionInput) => completeAdminOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã hoàn thành đơn hàng.');
    },
  });
}

export function useCancelAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminOrderActionInput) => cancelAdminOrder(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã hủy đơn hàng.');
    },
  });
}

export function useAdminOrdersSection() {
  const ordersQuery = useAdminOrdersQuery();
  const orderMutations = {
    pick: usePickAdminOrderMutation(),
    complete: useCompleteAdminOrderMutation(),
    cancel: useCancelAdminOrderMutation(),
  };

  const orders = ordersQuery.data ?? [];
  const loading = ordersQuery.isPending && !ordersQuery.data;
  const busy = [orderMutations.pick.isPending, orderMutations.complete.isPending, orderMutations.cancel.isPending].some(Boolean);

  return {
    busy,
    cancelOrder: async (orderId: number) => {
      await orderMutations.cancel.mutateAsync({ orderId });
    },
    completeOrder: async (orderId: number) => {
      await orderMutations.complete.mutateAsync({ orderId });
    },
    loading,
    orders,
    pickOrder: async (orderId: number) => {
      await orderMutations.pick.mutateAsync({ orderId });
    },
  };
}
