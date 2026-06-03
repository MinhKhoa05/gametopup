import { Boxes, Gamepad2, LayoutDashboard, ReceiptText, Users } from 'lucide-react';
import { AsyncActionExecutor } from '../../hooks/common/useAsyncAction';
import { Route } from '../../lib/routes';
import { isAdminUser } from '../../lib/roles';
import { EmptyState } from '../../components/common/EmptyState';
import { User } from '../../types';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminNavButton } from '../../components/admin/AdminNavButton';
import { DashboardPanel } from '../../components/admin/DashboardPanel';
import { GamesAdminPanel } from '../../components/admin/GamesAdminPanel';
import { PackagesAdminPanel } from '../../components/admin/PackagesAdminPanel';
import { OrdersAdminPanel } from '../../components/admin/OrdersAdminPanel';
import { UsersAdminPanel } from '../../components/admin/UsersAdminPanel';
import { useAdminGames } from '../../hooks/admin/admin-games.hooks';
import { useAdminPackages } from '../../hooks/admin/admin-packages.hooks';
import { useAdminOrders } from '../../hooks/admin/admin-orders.hooks';
import { useAdminUsers } from '../../hooks/admin/admin-users.hooks';
import { useAdminMetrics } from '../../hooks/admin/admin-metrics.hooks';

export function AdminPage({
  busy,
  execute,
  navigate,
  onLogout,
  route,
  setError,
  user,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  navigate: (route: Route) => void;
  onLogout: () => void;
  route: Extract<Route, { name: 'admin' }>;
  setError: (message: string | null) => void;
  user: User | null;
}) {
  const { games, createGame, updateGame, removeGame, loading: gamesLoading, refresh: refreshGames } = useAdminGames(setError, execute);
  const { packages, createPackage, updatePackage, removePackage, loading: packagesLoading, refresh: refreshPackages } = useAdminPackages(setError, execute);
  const { orders, pickOrder, completeOrder, cancelOrder, loading: ordersLoading, refresh: refreshOrders } = useAdminOrders(setError, execute);
  const { users, updateUser, removeUser, loading: usersLoading, refresh: refreshUsers } = useAdminUsers(setError, execute);
  const metrics = useAdminMetrics();
  
  const loading = gamesLoading || packagesLoading || ordersLoading || usersLoading;
  const refreshAll = async () => {
    await Promise.all([refreshGames(), refreshPackages(), refreshOrders(), refreshUsers()]);
  };
  const section = route.section ?? 'dashboard';

  return (
    <div className="grid gap-6">
      <AdminHeader loading={loading} navigate={navigate} onLogout={onLogout} onRefresh={refreshAll} route={route} />

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
              <AdminNavButton active={section === 'dashboard'} icon={<LayoutDashboard size={18} />} label="Tổng quan" onClick={() => navigate({ name: 'admin', section: 'dashboard' })} />
              <AdminNavButton active={section === 'games'} icon={<Gamepad2 size={18} />} label="Quản lý game" onClick={() => navigate({ name: 'admin', section: 'games' })} />
              <AdminNavButton active={section === 'packages'} icon={<Boxes size={18} />} label="Gói nạp" onClick={() => navigate({ name: 'admin', section: 'packages' })} />
              <AdminNavButton active={section === 'orders'} icon={<ReceiptText size={18} />} label="Đơn hàng" onClick={() => navigate({ name: 'admin', section: 'orders' })} />
              <AdminNavButton active={section === 'users'} icon={<Users size={18} />} label="Người dùng" onClick={() => navigate({ name: 'admin', section: 'users' })} />
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
                  onUpdateGame={(payload) => updateGame(payload.id, payload)}
                  onDeleteGame={removeGame}
                />
              )}

              {
                section === 'packages' && (
                  <PackagesAdminPanel
                  busy={busy}
                  games={games}
                  packages={packages}
                  loading={loading}
                  onCreatePackage={createPackage}
                  onUpdatePackage={(payload) => updatePackage(payload.id, payload)}
                  onDeletePackage={removePackage}
                />
              )
              }

              {section === 'orders' && (
                <OrdersAdminPanel
                  busy={busy}
                  loading={loading}
                  orders={orders}
                  refresh={refreshOrders}
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
                  refresh={refreshUsers}
                  currentUser={user}
                  onUpdateUser={(payload) => updateUser(payload.id, payload)}
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
