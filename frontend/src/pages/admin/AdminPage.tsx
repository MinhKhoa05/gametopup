import { Boxes, Gamepad2, LayoutDashboard, ReceiptText, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Route } from '../../lib/routes';
import { isAdminUser } from '../../lib/roles';
import { EmptyState } from '../../components/ui/EmptyState';
import { User } from '../../types';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminNavButton } from '../../components/admin/AdminNavButton';
import { DashboardPanel } from '../../components/admin/DashboardPanel';
import { GamesAdminPanel } from '../../components/admin/GamesAdminPanel';
import { PackagesAdminPanel } from '../../components/admin/PackagesAdminPanel';
import { OrdersAdminPanel } from '../../components/admin/OrdersAdminPanel';
import { UsersAdminPanel } from '../../components/admin/UsersAdminPanel';
import { useAdminMetrics } from '../../hooks/admin/admin-metrics.hooks';
import {
  adminOrdersQueryKey,
  adminPackagesQueryKey,
  adminUsersQueryKey,
  useAdminGameMutations,
  useAdminOrderMutations,
  useAdminPackageMutations,
  useAdminUserMutations,
  useAdminOrdersQuery,
  useAdminPackagesQuery,
  useAdminUsersQuery,
} from '../../services/admin';
import { GAMES_QUERY_KEY, useGamesQuery } from '../../services/games';

export function AdminPage({
  navigate,
  onLogout,
  route,
  user,
}: {
  navigate: (route: Route) => void;
  onLogout: () => void;
  route: Extract<Route, { name: 'admin' }>;
  user: User | null;
}) {
  const queryClient = useQueryClient();
  const gamesQuery = useGamesQuery();
  const packagesQuery = useAdminPackagesQuery();
  const ordersQuery = useAdminOrdersQuery();
  const usersQuery = useAdminUsersQuery();
  const gameMutations = useAdminGameMutations();
  const packageMutations = useAdminPackageMutations();
  const orderMutations = useAdminOrderMutations();
  const userMutations = useAdminUserMutations();
  const metrics = useAdminMetrics();

  const games = gamesQuery.data ?? [];
  const packages = packagesQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const gamesLoading = gamesQuery.isPending && !gamesQuery.data;
  const packagesLoading = packagesQuery.isPending && !packagesQuery.data;
  const ordersLoading = ordersQuery.isPending && !ordersQuery.data;
  const usersLoading = usersQuery.isPending && !usersQuery.data;
  const loading = gamesLoading || packagesLoading || ordersLoading || usersLoading;
  const busy = [
    gameMutations.create.isPending,
    gameMutations.update.isPending,
    gameMutations.remove.isPending,
    packageMutations.create.isPending,
    packageMutations.update.isPending,
    packageMutations.remove.isPending,
    orderMutations.pick.isPending,
    orderMutations.complete.isPending,
    orderMutations.cancel.isPending,
    userMutations.update.isPending,
    userMutations.remove.isPending,
  ].some(Boolean);

  const createGame = async (payload: Parameters<typeof gameMutations.create.mutateAsync>[0]) => {
    await gameMutations.create.mutateAsync(payload);
  };
  const updateGame = async (payload: { id: number; name: string; imageUrl: string; isActive: boolean }) => {
    await gameMutations.update.mutateAsync({
      id: payload.id,
      payload: {
        name: payload.name,
        imageUrl: payload.imageUrl,
        isActive: payload.isActive,
      },
    });
  };
  const removeGame = async (id: number) => {
    await gameMutations.remove.mutateAsync(id);
  };

  const createPackage = async (payload: Parameters<typeof packageMutations.create.mutateAsync>[0]) => {
    await packageMutations.create.mutateAsync(payload);
  };
  const updatePackage = async (payload: {
    id: number;
    imageUrl: string;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }) => {
    await packageMutations.update.mutateAsync({
      id: payload.id,
      payload: {
        imageUrl: payload.imageUrl,
        importPrice: payload.importPrice,
        isActive: payload.isActive,
        name: payload.name,
        originalPrice: payload.originalPrice,
        salePrice: payload.salePrice,
        stockQuantity: payload.stockQuantity,
      },
    });
  };
  const removePackage = async (id: number) => {
    await packageMutations.remove.mutateAsync(id);
  };

  const pickOrder = async (orderId: number) => {
    await orderMutations.pick.mutateAsync(orderId);
  };
  const completeOrder = async (orderId: number) => {
    await orderMutations.complete.mutateAsync(orderId);
  };
  const cancelOrder = async (orderId: number) => {
    await orderMutations.cancel.mutateAsync(orderId);
  };

  const updateUser = async (payload: { id: number; displayName: string; email: string; role: number; isActive: boolean }) => {
    await userMutations.update.mutateAsync({
      id: payload.id,
      payload: {
        displayName: payload.displayName,
        email: payload.email,
        role: payload.role,
        isActive: payload.isActive,
      },
    });
  };
  const removeUser = async (id: number) => {
    await userMutations.remove.mutateAsync(id);
  };

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: adminPackagesQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey }),
      queryClient.invalidateQueries({ queryKey: adminUsersQueryKey }),
    ]);
  };

  const section = route.section ?? 'dashboard';

  return (
    <div className="grid gap-6">
      <AdminHeader loading={loading || busy} navigate={navigate} onLogout={onLogout} onRefresh={refreshAll} route={route} />

      <div className="mx-auto w-full max-w-[1560px] px-4 pb-8 sm:px-6 lg:px-8">
        {!isAdminUser(user) ? (
          <EmptyState
            className="max-w-[560px] py-10"
            icon={
              <span className="inline-flex h-[54px] w-[54px] items-center justify-center rounded-[16px] bg-cyanline/12 text-cyanline">
                <LayoutDashboard size={26} />
              </span>
            }
            title="Cần quyền quản trị"
            description="Bạn cần đăng nhập bằng tài khoản quản trị để truy cập khu vực này."
            actionLabel="Đăng nhập"
            onAction={() => navigate({ name: 'account' })}
          />
        ) : (
          <div className="grid grid-cols-[200px_minmax(0,1fr)] items-start gap-[22px]">
            <aside className="admin-sidebar" aria-label="Điều hướng quản trị">
              <AdminNavButton
                active={section === 'dashboard'}
                icon={<LayoutDashboard size={18} />}
                label="Tổng quan"
                onClick={() => navigate({ name: 'admin', section: 'dashboard' })}
              />
              <AdminNavButton
                active={section === 'games'}
                icon={<Gamepad2 size={18} />}
                label="Quản lý game"
                onClick={() => navigate({ name: 'admin', section: 'games' })}
              />
              <AdminNavButton
                active={section === 'packages'}
                icon={<Boxes size={18} />}
                label="Gói nạp"
                onClick={() => navigate({ name: 'admin', section: 'packages' })}
              />
              <AdminNavButton
                active={section === 'orders'}
                icon={<ReceiptText size={18} />}
                label="Đơn hàng"
                onClick={() => navigate({ name: 'admin', section: 'orders' })}
              />
              <AdminNavButton
                active={section === 'users'}
                icon={<Users size={18} />}
                label="Người dùng"
                onClick={() => navigate({ name: 'admin', section: 'users' })}
              />
            </aside>

            <section className="grid min-w-0 gap-5">
              {section === 'dashboard' && (
                <DashboardPanel games={games} loading={loading} metrics={metrics} navigate={navigate} orders={orders} users={users} />
              )}

              {section === 'games' && (
                <GamesAdminPanel
                  busy={busy}
                  games={games}
                  loading={loading}
                  onCreateGame={createGame}
                  onUpdateGame={updateGame}
                  onDeleteGame={removeGame}
                />
              )}

              {section === 'packages' && (
                <PackagesAdminPanel
                  busy={busy}
                  games={games}
                  packages={packages}
                  loading={loading}
                  onCreatePackage={createPackage}
                  onUpdatePackage={updatePackage}
                  onDeletePackage={removePackage}
                />
              )}

              {section === 'orders' && (
                <OrdersAdminPanel
                  busy={busy}
                  loading={loading}
                  orders={orders}
                  currentUser={user}
                  onPickOrder={pickOrder}
                  onCompleteOrder={completeOrder}
                  onCancelOrder={cancelOrder}
                />
              )}

              {section === 'users' && (
                <UsersAdminPanel
                  busy={busy}
                  loading={loading}
                  users={users}
                  currentUser={user}
                  onUpdateUser={updateUser}
                  onDeleteUser={removeUser}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
