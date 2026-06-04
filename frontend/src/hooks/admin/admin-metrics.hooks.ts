import { useMemo } from 'react';
import { useAdminOrdersQuery, useAdminPackagesQuery, useAdminUsersQuery } from '../../services/admin';
import { useGamesQuery } from '../../services/games';
import type { AdminCatalogMetrics } from '../../types/admin.type';

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useAdminMetrics() {
  const gamesQuery = useGamesQuery();
  const packagesQuery = useAdminPackagesQuery();
  const ordersQuery = useAdminOrdersQuery();
  const usersQuery = useAdminUsersQuery();

  const metrics = useMemo<AdminCatalogMetrics>(() => {
    const orders = ordersQuery.data ?? [];
    const paidRevenue = orders
      .filter((order) => order.status !== 5)
      .reduce((sum, order) => sum + (order.total ?? order.unitPrice * order.quantity), 0);

    return {
      activeGames: (gamesQuery.data ?? []).filter((game) => game.isActive).length,
      totalPackages: (packagesQuery.data ?? []).length,
      disabledPackages: (packagesQuery.data ?? []).filter((item) => !item.isActive).length,
      ordersToday: orders.filter((order) => isToday(order.createdAt)).length,
      paidRevenue,
      pendingOrders: orders.filter((order) => order.status === 1 || order.status === 2 || order.status === 3).length,
      totalUsers: (usersQuery.data ?? []).length,
      activeUsers: (usersQuery.data ?? []).filter((user) => user.isActive !== false).length,
    };
  }, [gamesQuery.data, ordersQuery.data, packagesQuery.data, usersQuery.data]);

  return metrics;
}
