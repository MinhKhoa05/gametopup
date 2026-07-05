import { useMemo, useState } from "react";
import { useMyOrderStatsQuery, useMyOrdersQuery } from "@/features/orders/server";
import type { Order } from "@/features/orders/types";
import { ORDER_STATUS_FILTER_OPTIONS, type OrderStatusFilter } from "@/features/orders/orderMetadata";
import { filterByQuery } from "@/shared/lib/search";

type OrderFilters = {
  search: string;
  status: OrderStatusFilter;
};

export const STATUS_OPTIONS = ORDER_STATUS_FILTER_OPTIONS;

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
  const statsQuery = useMyOrderStatsQuery();

  const orders = useMemo(() => {
    return filterByQuery(
      ordersQuery.items,
      filters.search,
      getOrderSearchText,
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [ordersQuery.items, filters.search]);

  return {
    orders,
    filters,
    setFilters,
    hasMoreOrders: ordersQuery.hasMore,
    isLoadingMoreOrders: ordersQuery.isLoadingMore,
    loadMoreOrders: ordersQuery.loadMore,
    isLoading: ordersQuery.isPending && ordersQuery.data === undefined,
    isError: ordersQuery.isError,
    stats: statsQuery.data,
  };
}
