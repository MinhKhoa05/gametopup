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

export const orderKeys = {
  all: ["orders"] as const,
  myOrders: ["orders", "my"] as const,
  detail: (orderId: number) => ["orders", "detail", orderId] as const,
  history: (orderId: number) => ["orders", "history", orderId] as const,
};

export function useMyOrdersQuery() {
  return useQuery({
    queryKey: orderKeys.myOrders,
    queryFn: getMyOrders,
  });
}

export function useRecentOrders(limit = 5) {
  const query = useMyOrdersQuery();

  return {
    ...query,
    data: (query.data ?? []).slice(0, limit),
  };
}

export function useOrderQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderId === null ? orderKeys.all : orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId!),
    enabled: orderId !== null,
  });
}

export function useOrderHistoryQuery(orderId: number | null) {
  return useQuery({
    queryKey: orderId === null ? orderKeys.all : orderKeys.history(orderId),
    queryFn: () => getOrderHistory(orderId!),
    enabled: orderId !== null,
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
