import { useMemo, useState } from "react";
import { useMyOrdersQuery } from "@/features/orders/server";
import { OrderStatus } from "@/features/orders/types";
import type { Order } from "@/features/orders/types";
import type { FilterChipGroupItem } from "@/shared/components";
import { filterByQuery } from "@/shared/lib/search";

const PAGE_SIZE = 6;

export type OrderStatusFilter = "active" | "all" | OrderStatus;

export type OrderFilters = {
  search: string;
  status: OrderStatusFilter;
};

export const STATUS_OPTIONS = [
  { label: "Cần theo dõi", value: "active" },
  { label: "Tất cả", value: "all" },
  { label: "Chờ xử lý", value: OrderStatus.Pending },
  { label: "Đang xử lý", value: OrderStatus.Processing },
  { label: "Hoàn thành", value: OrderStatus.Completed },
  { label: "Đã hủy", value: OrderStatus.Cancelled },
] satisfies readonly FilterChipGroupItem<OrderStatusFilter>[];

function isActiveOrderStatus(status: OrderStatus) {
  return status === OrderStatus.Pending || status === OrderStatus.Processing;
}

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
  const ordersQuery = useMyOrdersQuery();
  const data = ordersQuery.data ?? [];

  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "active",
  });

  const [page, setPage] = useState(1);

  const orders = useMemo(() => {
    const statusFilteredOrders = data.filter((order) => {
      if (filters.status === "active" && !isActiveOrderStatus(order.status)) {
        return false;
      }

      if (
        filters.status !== "active" &&
        filters.status !== "all" &&
        order.status !== filters.status
      ) {
        return false;
      }

      return true;
    });

    return filterByQuery(
      statusFilteredOrders,
      filters.search,
      getOrderSearchText,
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const stats = {
    active: orders.filter((order) => isActiveOrderStatus(order.status)).length,
    completed: orders.filter((x) => x.status === OrderStatus.Completed).length,
    total: orders.length,
    amount: orders.reduce((sum, x) => sum + x.packagePrice, 0),
  };

  return {
    orders: orders.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    ),
    filters,
    setFilters,
    currentPage,
    totalPages,
    setPage,
    isLoading: ordersQuery.isPending && ordersQuery.data === undefined,
    isError: ordersQuery.isError,
    stats,
  };
}

export type OrdersPageState = ReturnType<typeof useOrders>;
