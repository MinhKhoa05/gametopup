import { useMemo, useState } from "react";
import { useMyOrdersQuery } from "@/features/orders/server";
import { OrderStatus } from "@/features/orders/types";
import type { FilterChipGroupItem } from "@/shared/components";

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

export function useOrders() {
  const { data = [], isPending, isError } = useMyOrdersQuery();

  const [filters, setFilters] = useState<OrderFilters>({
    search: "",
    status: "active",
  });

  const [page, setPage] = useState(1);

  const orders = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return data
      .filter((order) => {
        if (
          filters.status === "active" &&
          ![OrderStatus.Pending, OrderStatus.Processing].includes(order.status)
        ) {
          return false;
        }

        if (
          filters.status !== "active" &&
          filters.status !== "all" &&
          order.status !== filters.status
        ) {
          return false;
        }

        if (!keyword) return true;

        return [
          order.gameName,
          order.packageName,
          order.gameAccountInfo,
          String(order.id),
        ].some((value) => value.toLowerCase().includes(keyword));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, filters]);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const stats = {
    active: orders.filter(
      (x) =>
        x.status === OrderStatus.Pending || x.status === OrderStatus.Processing,
    ).length,
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
    isLoading: isPending,
    isError,
    stats,
  };
}

export type OrdersPageState = ReturnType<typeof useOrders>;
