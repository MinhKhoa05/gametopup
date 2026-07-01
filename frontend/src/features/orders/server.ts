import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createOrder,
  getMyOrders,
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
  list: (filter: OrderFilter | null) => ["orders", "list", filter] as const,
  recent: (limit: number) => ["orders", "recent", limit] as const,
  history: (orderId: number | null) => ["orders", "history", orderId] as const,
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

