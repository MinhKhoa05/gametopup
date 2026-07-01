import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelOrder,
  createOrder,
  getMyOrdersCursor,
  getMyOrders,
  getOrder,
  getOrderHistory,
} from "./api";
import type { Order, OrderFilter } from "./types";
import { walletKeys } from "@/features/wallet/server";
import { useCursorPageQuery } from "@/shared/hooks/useCursorPageQuery";

const ORDERS_STALE_TIME = 1000 * 30;
const ORDER_DETAIL_STALE_TIME = 1000 * 15;
const ORDERS_GC_TIME = 1000 * 60 * 5;
const ORDERS_PAGE_SIZE = 10;

export const orderKeys = {
  all: ["orders"] as const,
  myOrders: ["orders", "my"] as const,
  cursor: (filter: OrderFilter | null) => ["orders", "cursor", filter] as const,
  detail: (orderId: number | null) => ["orders", "detail", orderId] as const,
  history: (orderId: number | null) => ["orders", "history", orderId] as const,
};

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: () => getMyOrders(),
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useRecentOrders(limit = 5) {
  return useQuery({
    queryKey: [...orderKeys.myOrders, "recent", limit] as const,
    queryFn: () => getMyOrders(limit),
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useMyOrdersCursorQuery(filter: OrderFilter | null, enabled = true) {
  return useCursorPageQuery<Order>({
    queryKey: orderKeys.cursor(filter),
    queryFn: (cursor) =>
      getMyOrdersCursor({ cursor, filter, limit: ORDERS_PAGE_SIZE }),
    enabled,
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    persist: true,
  });
}

export function useOrderQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId!),
    enabled: orderId !== null,
    staleTime: ORDER_DETAIL_STALE_TIME,
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
      queryClient.invalidateQueries({ queryKey: walletKeys.all });

      toast.success("Đã hủy đơn hàng.");
    },
  });
}
