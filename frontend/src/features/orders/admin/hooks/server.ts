import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderKeys } from '@/features/orders/server';
import type { AdminOrder } from '@/features/orders/types';
import { useCursorPageQuery } from '@/shared/hooks/useCursorPageQuery';
import { adminOrdersKeys, cancelAdminOrder, completeAdminOrder, getAdminOrders, getAdminOrdersCursor, pickAdminOrder } from '../api';
import type { AdminOrderFilter } from '../api';

const STALE_TIME = 1000 * 30;
const ADMIN_ORDERS_PAGE_SIZE = 20;

export function useAdminOrdersQuery(limit?: number) {
  return useQuery({
    queryKey: adminOrdersKeys.all,
    queryFn: () => getAdminOrders(limit),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useAdminOrdersCursorQuery(filter: AdminOrderFilter) {
  return useCursorPageQuery<AdminOrder>({
    queryKey: adminOrdersKeys.cursor(filter),
    queryFn: (cursor) =>
      getAdminOrdersCursor({ cursor, filter, limit: ADMIN_ORDERS_PAGE_SIZE }),
    keepPreviousData: true,
    staleTime: STALE_TIME,
  });
}

export function usePickAdminOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickAdminOrder,
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
    mutationFn: completeAdminOrder,
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
    mutationFn: cancelAdminOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã hủy đơn hàng.');
    },
  });
}

export function useAdminOrdersSection(filter: AdminOrderFilter = null) {
  const ordersQuery = useAdminOrdersCursorQuery(filter);
  const orderMutations = {
    pick: usePickAdminOrderMutation(),
    complete: useCompleteAdminOrderMutation(),
    cancel: useCancelAdminOrderMutation(),
  };

  const orders = ordersQuery.items;
  const loading = ordersQuery.isPending && ordersQuery.data === undefined;
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
    hasMore: ordersQuery.hasMore,
    isLoadingMore: ordersQuery.isLoadingMore,
    loadMore: ordersQuery.loadMore,
    orders,
    pickOrder: async (orderId: number) => {
      await orderMutations.pick.mutateAsync({ orderId });
    },
  };
}
