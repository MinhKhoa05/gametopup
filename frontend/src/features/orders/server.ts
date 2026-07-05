import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelOrder,
  completeOrder,
  createOrder,
  getAdminOrders,
  getMyOrderStats,
  getMyOrders,
  getOrderHistory,
  pickOrder,
} from "./api";
import type { AdminOrder, Order, OrderFilter } from "./types";
import type { AdminOrderFilter } from "./api";
import { walletKeys } from "@/features/wallet/server";
import { useCursorPageQuery } from "@/shared/hooks/useCursorPageQuery";

const ORDERS_STALE_TIME = 1000 * 30;
const ORDER_DETAIL_STALE_TIME = 1000 * 15;
const ORDERS_GC_TIME = 1000 * 60 * 5;
const ORDERS_PAGE_SIZE = 10;
const ADMIN_ORDERS_PAGE_SIZE = 20;

export const orderKeys = {
  all: ["orders"] as const,
  list: (filter: OrderFilter | null) => ["orders", "list", filter] as const,
  recent: (limit: number) => ["orders", "recent", limit] as const,
  stats: () => ["orders", "stats"] as const,
  history: (orderId: number | null) => ["orders", "history", orderId] as const,
};

export const adminOrdersKeys = {
  all: ['admin', 'orders'] as const,
  list: (filter: AdminOrderFilter) => ['admin', 'orders', 'list', filter] as const,
};

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: orderKeys.recent(limit),
    queryFn: async () => {
      const page = await getMyOrders({ limit });
      return page.items;
    },
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useMyOrdersQuery(filter: OrderFilter | null, enabled = true) {
  return useCursorPageQuery<Order>({
    queryKey: orderKeys.list(filter),
    queryFn: (cursor) =>
      getMyOrders({ cursor, filter, limit: ORDERS_PAGE_SIZE }),
    enabled,
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    persist: true,
  });
}

export function useAdminOrdersQuery(filter: AdminOrderFilter) {
  return useCursorPageQuery<AdminOrder>({
    queryKey: adminOrdersKeys.list(filter),
    queryFn: (cursor) =>
      getAdminOrders({ cursor, filter, limit: ADMIN_ORDERS_PAGE_SIZE }),
    keepPreviousData: true,
    staleTime: ORDERS_STALE_TIME,
  });
}

export function useMyOrderStatsQuery() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: getMyOrderStats,
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useOrderHistoryQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderKeys.history(orderId),
    queryFn: () => getOrderHistory(orderId!),
    enabled: orderId !== null,
    staleTime: ORDER_DETAIL_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });

      toast.success('Đơn hàng đã được tạo thành công.');
    },
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });

      toast.success('Đã hủy đơn hàng.');
    },
  });
}

export function usePickOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pickOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã tiếp nhận đơn hàng.');
    },
  });
}

export function useCompleteOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOrder,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Đã hoàn thành đơn hàng.');
    },
  });
}
