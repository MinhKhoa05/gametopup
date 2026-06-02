import { Boxes, Gamepad2, LayoutDashboard } from 'lucide-react';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { Route } from '../../../lib/routes';
import { isAdminUser } from '../../../lib/roles';
import { EmptyState } from '../../../components/common/EmptyState';
import { useAuthStore } from '../../../store/auth.store';
import { AdminHeader } from '../components/AdminHeader';
import { AdminNavButton } from '../components/AdminNavButton';
import { DashboardPanel } from '../panels/DashboardPanel';
import { GamesAdminPanel } from '../panels/GamesAdminPanel';
import { PackagesAdminPanel } from '../panels/PackagesAdminPanel';
import { useAdminCatalog } from '../hooks/useAdminCatalog';

export function AdminPage({
  busy,
  execute,
  navigate,
  onLogout,
  route,
  setError,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  navigate: (route: Route) => void;
  onLogout: () => void;
  route: Extract<Route, { name: 'admin' }>;
  setError: (message: string | null) => void;
}) {
  const catalog = useAdminCatalog(setError);
  const section = route.section ?? 'dashboard';
  const user = useAuthStore((state) => state.user);

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
            </aside>

            <section className="grid min-w-0 gap-5">
              {section === 'dashboard' && (
                <DashboardPanel games={catalog.games} loading={catalog.loading} metrics={catalog.metrics} navigate={navigate} orders={catalog.orders} />
              )}

              {section === 'games' && (
                <GamesAdminPanel
                  busy={busy}
                  execute={execute}
                  games={catalog.games}
                  loading={catalog.loading}
                  onChanged={catalog.refresh}
                />
              )}

              {section === 'packages' && (
                <PackagesAdminPanel busy={busy} execute={execute} games={catalog.games} loading={catalog.loading} setError={setError} />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
