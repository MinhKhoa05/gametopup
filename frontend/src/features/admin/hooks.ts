import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { gamesKeys } from '@/features/games/server';
import { packagesKeys } from '@/features/packages/server';
import { adminDepositsKeys } from './deposits/api';
import { useAdminDepositRequestsSection } from './deposits/hooks';
import { adminGamesKeys, useAdminGamesSection } from './games/hooks';
import { adminOrdersKeys } from './orders/api';
import { useAdminOrdersSection } from './orders/hooks';
import { adminPackagesKeys } from './packages/api';
import { useAdminPackagesSection } from './packages/hooks';
import { adminUsersKeys } from './users/api';
import { useAdminUsersSection } from './users/hooks';
import { walletKeys } from '@/features/wallet/server';
import type { User } from '@/features/auth/types';
import type { GamePackage } from '@/features/games/types';
import type { AdminGameSummary } from './games/api';
import type { AdminOrderSummary } from '@/features/orders/types';
import { useAdminGamesPageState } from './games/hooks';
import { useAdminPackagesPageState } from './packages/hooks';
import { useAdminOrdersPageState } from './orders/hooks';
import { useAdminDepositRequestsPageState } from './deposits/hooks';
import { useAdminUsersPageState } from './users/hooks';

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
  games: AdminGameSummary[];
  packages: GamePackage[];
  orders: AdminOrderSummary[];
  users: User[];
}) {
  const metrics = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== 4)
      .reduce((sum, order) => sum + (order.total ?? order.unitPrice), 0);

    return {
      activeGames: games.filter((game) => game.isActive).length,
      totalPackages: packages.length,
      disabledPackages: packages.filter((item) => !item.isActive).length,
      ordersToday: orders.filter((order) => isToday(order.createdAt)).length,
      revenue,
      pendingOrders: orders.filter((order) => order.status === 1 || order.status === 2).length,
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
    };
  }, [games, orders, packages, users]);

  return metrics;
}

export function useAdminPage({ user }: { user: User | null }) {
  const queryClient = useQueryClient();
  const gamesSection = useAdminGamesSection();
  const depositsSection = useAdminDepositRequestsSection();
  const packagesSection = useAdminPackagesSection();
  const ordersSection = useAdminOrdersSection();
  const usersSection = useAdminUsersSection();
  const metrics = useAdminMetrics({
    games: gamesSection.games,
    orders: ordersSection.orders,
    packages: packagesSection.packages,
    users: usersSection.users,
  });
  const loading =
    gamesSection.loading || depositsSection.loading || packagesSection.loading || ordersSection.loading || usersSection.loading;
  const busy = gamesSection.busy || depositsSection.busy || packagesSection.busy || ordersSection.busy || usersSection.busy;
  const section = 'dashboard' as const;

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: gamesKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all }),
      queryClient.invalidateQueries({ queryKey: packagesKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminDepositsKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminPackagesKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
      queryClient.invalidateQueries({ queryKey: walletKeys.all }),
    ]);
  };

  return {
    busy,
    cancelOrder: ordersSection.cancelOrder,
    completeOrder: ordersSection.completeOrder,
    createGame: gamesSection.createGame,
    depositRequests: depositsSection.requests,
    approveDepositRequest: depositsSection.approveRequest,
    rejectDepositRequest: depositsSection.rejectRequest,
    createPackage: packagesSection.createPackage,
    games: gamesSection.games,
    loading,
    metrics,
    orders: ordersSection.orders,
    packages: packagesSection.packages,
    pickOrder: ordersSection.pickOrder,
    refreshAll,
    removeGame: gamesSection.removeGame,
    removePackage: packagesSection.removePackage,
    removeUser: usersSection.removeUser,
    section,
    updateGame: gamesSection.updateGame,
    updatePackage: packagesSection.updatePackage,
    updateUser: usersSection.updateUser,
    user,
    users: usersSection.users,
  };
}

export {
  useAdminDepositRequestsPageState,
  useAdminGamesPageState,
  useAdminOrdersPageState,
  useAdminPackagesPageState,
  useAdminUsersPageState,
};
