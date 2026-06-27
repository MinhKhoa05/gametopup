import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelOrder,
  createOrder,
  getMyOrders,
  getOrder,
  getOrderHistory,
} from "./api";
import { walletKeys } from "@/features/wallet/server";

const ORDERS_STALE_TIME = 1000 * 30;
const ORDER_DETAIL_STALE_TIME = 1000 * 15;
const ORDERS_GC_TIME = 1000 * 60 * 5;

export const orderKeys = {
  all: ["orders"] as const,
  myOrders: ["orders", "my"] as const,
  detail: (orderId: number | null) => ["orders", "detail", orderId] as const,
  history: (orderId: number | null) => ["orders", "history", orderId] as const,
};

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: getMyOrders,
    staleTime: ORDERS_STALE_TIME,
    gcTime: ORDERS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useRecentOrders(limit = 5) {
  const query = useMyOrdersQuery();

  return {
    ...query,
    data: query.data?.slice(0, limit),
  };
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

      toast.success("Đã mua gói thành công.");
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
