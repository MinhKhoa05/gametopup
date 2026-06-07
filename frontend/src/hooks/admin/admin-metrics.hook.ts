import { useMemo } from 'react';
import type { AdminGamePackage, Game, Order, User } from '../../types';
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

export function useAdminMetrics({
  games,
  packages,
  orders,
  users,
}: {
  games: Game[];
  packages: AdminGamePackage[];
  orders: Order[];
  users: User[];
}) {
  const metrics = useMemo<AdminCatalogMetrics>(() => {
    const paidRevenue = orders
      .filter((order) => order.status !== 5)
      .reduce((sum, order) => sum + (order.total ?? order.unitPrice * order.quantity), 0);

    return {
      activeGames: games.filter((game) => game.isActive).length,
      totalPackages: packages.length,
      disabledPackages: packages.filter((item) => !item.isActive).length,
      ordersToday: orders.filter((order) => isToday(order.createdAt)).length,
      paidRevenue,
      pendingOrders: orders.filter((order) => order.status === 1 || order.status === 2 || order.status === 3).length,
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
    };
  }, [games, orders, packages, users]);

  return metrics;
}
