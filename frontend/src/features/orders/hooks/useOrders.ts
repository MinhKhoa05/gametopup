import { useMemo, useState } from "react";
import { useMyOrdersQuery } from "@/features/orders/server";
import type { Order, OrderFilter } from "@/features/orders/types";
import type { FilterChipGroupItem } from "@/shared/components";
import { filterByQuery } from "@/shared/lib/search";

export type OrderStatusFilter = OrderFilter | null;

type OrderFilters = {
  search: string;
  status: OrderStatusFilter;
};

export const STATUS_OPTIONS = [
  { label: "Cần theo dõi", value: "watching" },
  { label: "Tất cả", value: null },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đang xử lý", value: "processing" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
] satisfies readonly FilterChipGroupItem<OrderStatusFilter>[];

function getOrderSearchText(
  order: Pick<Order, "gameName" | "packageName" | "gameAccountInfo" | "id">,
) {
  return [
    order.gameName,
    order.packageName,
    order.gameAccountInfo,
    String(order.id),
  ].join(" ");
}

export function useOrders() {
  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "watching",
  });

  const ordersQuery = useMyOrdersQuery(filters.status);

  const orders = useMemo(() => {
    return filterByQuery(
      ordersQuery.items,
      filters.search,
      getOrderSearchText,
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [ordersQuery.items, filters.search]);

  const stats = {
    active: orders.filter((order) => order.status === 1 || order.status === 2).length,
    completed: orders.filter((order) => order.status === 3).length,
    total: orders.length,
    amount: orders.reduce((sum, order) => sum + order.packagePrice, 0),
  };

  return {
    orders,
    filters,
    setFilters,
    hasMoreOrders: ordersQuery.hasMore,
    isLoadingMoreOrders: ordersQuery.isLoadingMore,
    loadMoreOrders: ordersQuery.loadMore,
    isLoading: ordersQuery.isPending && ordersQuery.data === undefined,
    isError: ordersQuery.isError,
    stats,
  };
}
