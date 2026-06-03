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
import { useAdminCatalog } from '../../hooks/admin.hooks';

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
  const catalog = useAdminCatalog(setError, execute);
  const section = route.section ?? 'dashboard';

  return (
    <div className="grid gap-6">
      <AdminHeader loading={catalog.loading} navigate={navigate} onLogout={onLogout} onRefresh={catalog.refresh} route={route} />

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
                <DashboardPanel games={catalog.games} loading={catalog.loading} metrics={catalog.metrics} navigate={navigate} orders={catalog.orders} users={catalog.users} />
              )}

              {section === 'games' && (
                <GamesAdminPanel
                  busy={busy}
                  games={catalog.games}
                  loading={catalog.loading}
                  onCreateGame={catalog.createGame}
                  onUpdateGame={(payload) => catalog.updateGame(payload.id, payload)}
                  onDeleteGame={catalog.removeGame}
                />
              )}

              {
                section === 'packages' && (
                  <PackagesAdminPanel
                  busy={busy}
                  games={catalog.games}
                  packages={catalog.packages}
                  loading={catalog.loading}
                  onCreatePackage={catalog.createPackage}
                  onUpdatePackage={(payload) => catalog.updatePackage(payload.id, payload)}
                  onDeletePackage={catalog.removePackage}
                />
              )
              }

              {section === 'orders' && (
                <OrdersAdminPanel
                  busy={busy}
                  loading={catalog.loading}
                  orders={catalog.orders}
                  refresh={catalog.refresh}
                  currentUser={user}
                  onPickOrder={catalog.pickOrder}
                  onCompleteOrder={catalog.completeOrder}
                  onCancelOrder={catalog.cancelOrder}
                />
              )}

              {section === 'users' && (
                <UsersAdminPanel
                  busy={busy}
                  loading={catalog.loading}
                  users={catalog.users}
                  refresh={catalog.refresh}
                  currentUser={user}
                  onUpdateUser={(payload) => catalog.updateUser(payload.id, payload)}
                  onDeleteUser={catalog.removeUser}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
