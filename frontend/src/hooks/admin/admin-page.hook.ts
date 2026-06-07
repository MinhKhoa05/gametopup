import { useQueryClient } from '@tanstack/react-query';
import { useRoute } from '../common/route.hooks';
import { useAdminMetrics } from './admin-metrics.hook';
import { useAdminDepositRequestsSection } from './admin-deposits.hook';
import { useAdminGamesSection } from './admin-games.hook';
import { useAdminOrdersSection } from './admin-orders.hook';
import { useAdminPackagesSection } from './admin-packages.hook';
import { useAdminUsersSection } from './admin-users.hook';
import { adminDepositRequestsQueryKey, adminOrdersQueryKey, adminPackagesQueryKey, adminUsersQueryKey } from '../../services/admin/keys';
import { depositRequestsQueryKey, transactionsQueryKey, walletQueryKey } from '../../services/wallet';
import { GAMES_QUERY_KEY } from '../../services/games';
import type { User } from '../../types';

export function useAdminPage({ user }: { user: User | null }) {
  const { route, navigate } = useRoute();
  const adminRoute = route.name === 'admin' ? route : { name: 'admin' as const, section: 'dashboard' as const };
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
  const loading = gamesSection.loading || depositsSection.loading || packagesSection.loading || ordersSection.loading || usersSection.loading;
  const busy = gamesSection.busy || depositsSection.busy || packagesSection.busy || ordersSection.busy || usersSection.busy;

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: adminDepositRequestsQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey }),
      queryClient.invalidateQueries({ queryKey: depositRequestsQueryKey }),
      queryClient.invalidateQueries({ queryKey: walletQueryKey }),
      queryClient.invalidateQueries({ queryKey: transactionsQueryKey }),
    ]);
  };

  const section = adminRoute.section ?? 'dashboard';

  return {
    adminRoute,
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
    navigate,
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
