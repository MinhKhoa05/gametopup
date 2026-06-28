import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { gameKeys, useAdminGamesQuery, useCreateGameMutation, useDeleteGameMutation, useUpdateGameMutation } from '@/features/games/server';
import { adminDepositsKeys } from '@/features/deposits/admin/api';
import { useAdminDepositRequestsSection } from '@/features/deposits/admin/hooks';
import { adminOrdersKeys } from '@/features/orders/admin/api';
import { useAdminOrdersSection } from '@/features/orders/admin/hooks';
import {
  packageKeys,
  useAdminPackagesQuery,
  useCreatePackageMutation,
  useDeletePackageMutation,
  useUpdatePackageMutation,
} from '@/features/packages/server';
import { adminUsersKeys } from '@/features/users/admin/api';
import { useAdminUsersSection } from '@/features/users/admin/hooks';
import { walletKeys } from '@/features/wallet/server';
import type { User } from '@/features/auth/types';
import type { AdminGamePackage } from '@/features/packages/types';
import type { AdminGame } from '@/features/games/types';
import type { AdminOrder } from '@/features/orders/types';
import { useAdminOrdersPageState } from '@/features/orders/admin/hooks';
import { useAdminDepositRequestsPageState } from '@/features/deposits/admin/hooks';
import { useAdminUsersPageState } from '@/features/users/admin/hooks';

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
  games: AdminGame[];
  packages: AdminGamePackage[];
  orders: AdminOrder[];
  users: User[];
}) {
  const metrics = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== 4)
      .reduce((sum, order) => sum + order.packagePrice, 0);

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
  const gamesQuery = useAdminGamesQuery();
  const createGameMutation = useCreateGameMutation();
  const updateGameMutation = useUpdateGameMutation();
  const deleteGameMutation = useDeleteGameMutation();
  const depositsSection = useAdminDepositRequestsSection();
  const firstGameId = gamesQuery.data?.[0]?.id ?? 0;
  const packagesQuery = useAdminPackagesQuery(firstGameId);
  const createPackageMutation = useCreatePackageMutation();
  const updatePackageMutation = useUpdatePackageMutation();
  const deletePackageMutation = useDeletePackageMutation();
  const ordersSection = useAdminOrdersSection();
  const usersSection = useAdminUsersSection();
  const packages = packagesQuery.data ?? [];
  const games = gamesQuery.data ?? [];
  const metrics = useAdminMetrics({
    games,
    orders: ordersSection.orders,
    packages,
    users: usersSection.users,
  });
  const loading =
    (gamesQuery.isPending && gamesQuery.data === undefined) ||
    depositsSection.loading ||
    (packagesQuery.isPending && packagesQuery.data === undefined) ||
    ordersSection.loading ||
    usersSection.loading;
  const busy =
    createGameMutation.isPending ||
    updateGameMutation.isPending ||
    deleteGameMutation.isPending ||
    depositsSection.busy ||
    createPackageMutation.isPending ||
    updatePackageMutation.isPending ||
    deletePackageMutation.isPending ||
    ordersSection.busy ||
    usersSection.busy;
  const section = 'dashboard' as const;

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: gameKeys.all }),
      queryClient.invalidateQueries({ queryKey: gameKeys.admin }),
      queryClient.invalidateQueries({ queryKey: ['packages'] }),
      queryClient.invalidateQueries({ queryKey: adminDepositsKeys.all }),
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all }),
      queryClient.invalidateQueries({ queryKey: packageKeys.adminByGame(firstGameId) }),
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all }),
      queryClient.invalidateQueries({ queryKey: walletKeys.all }),
    ]);
  };

  return {
    busy,
    cancelOrder: ordersSection.cancelOrder,
    completeOrder: ordersSection.completeOrder,
    createGame: createGameMutation.mutateAsync,
    depositRequests: depositsSection.requests,
    approveDepositRequest: depositsSection.approveRequest,
    rejectDepositRequest: depositsSection.rejectRequest,
    createPackage: createPackageMutation.mutateAsync,
    games,
    loading,
    metrics,
    orders: ordersSection.orders,
    packages,
    pickOrder: ordersSection.pickOrder,
    refreshAll,
    removeGame: deleteGameMutation.mutateAsync,
    removePackage: deletePackageMutation.mutateAsync,
    removeUser: usersSection.removeUser,
    section,
    updateGame: updateGameMutation.mutateAsync,
    updatePackage: updatePackageMutation.mutateAsync,
    updateUser: usersSection.updateUser,
    user,
    users: usersSection.users,
  };
}

export {
  useAdminDepositRequestsPageState,
  useAdminOrdersPageState,
  useAdminUsersPageState,
};
