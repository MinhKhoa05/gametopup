import { Boxes, Gamepad2, LayoutDashboard, ReceiptText, Users, WalletCards } from 'lucide-react';
import { isAdminUser } from '../../lib/roles';
import { classNames } from '../../lib/ui';
import { EmptyState, IconBox } from '../../components/ui';
import { User } from '../../types';
import {
  AdminHeader,
  DashboardPanel,
  DepositRequestsAdminPanel,
  GamesAdminPanel,
  OrdersAdminPanel,
  PackagesAdminPanel,
  UsersAdminPanel,
} from '../../components/admin';
import { useAdminPage } from '../../hooks/admin/admin-page.hooks';

export function AdminPage({
  onLogout,
  user,
}: {
  onLogout: () => void;
  user: User | null;
}) {
  const adminPage = useAdminPage({ user });

  return (
    <div className="grid gap-6">
      <AdminHeader loading={adminPage.loading || adminPage.busy} onLogout={onLogout} onRefresh={adminPage.refreshAll} route={adminPage.adminRoute} />

      <div className="mx-auto w-full max-w-[1560px] px-4 pb-8 sm:px-6 lg:px-8">
        {!isAdminUser(adminPage.user) ? (
          <EmptyState
            className="max-w-[560px] py-10"
            icon={
              <IconBox size="lg">
                <LayoutDashboard size={26} />
              </IconBox>
            }
            title="Cần quyền quản trị"
            description="Bạn cần đăng nhập bằng tài khoản quản trị để truy cập khu vực này."
            actionLabel="Đăng nhập"
            onAction={() => adminPage.navigate({ name: 'auth' })}
          />
        ) : (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-5">
            <aside
              className="sticky top-24 grid gap-2.5 rounded-2xl border border-white/6 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(11,18,32,0.98)),var(--color-ink-light)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_45px_rgba(2,6,23,0.16)] lg:flex lg:flex-col"
              aria-label="Điều hướng quản trị"
            >
              {adminNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  aria-current={adminPage.section === item.section ? 'page' : undefined}
                  className={classNames(
                    'gt-interactive gt-panel-soft group relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border-transparent px-3 py-2.5 pr-3 text-left font-semibold text-slate-400 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full before:bg-transparent',
                    adminPage.section === item.section
                      ? 'translate-x-px border-cyan/25 bg-cyan/10 text-cyan-50 shadow-[0_12px_24px_rgba(34,211,238,0.08)] before:bg-cyan'
                      : 'hover:translate-x-px hover:text-cyan-50',
                  )}
                  onClick={() => adminPage.navigate({ name: 'admin', section: item.section })}
                >
                  <IconBox
                    size="sm"
                    className={classNames(
                      'h-8 w-8 rounded-xl transition-colors duration-200',
                      adminPage.section === item.section
                        ? 'bg-cyan/15 text-cyan-50'
                        : 'bg-cyan/10 text-cyan group-hover:bg-cyan/15 group-hover:text-cyan-50',
                    )}
                  >
                    {item.icon}
                  </IconBox>
                  <span className="min-w-0 whitespace-nowrap text-[0.92rem] leading-[1.2]">{item.label}</span>
                </button>
              ))}
            </aside>

            <section className="grid min-w-0 gap-5">
              {adminPage.section === 'dashboard' && (
                <DashboardPanel games={adminPage.games} loading={adminPage.loading} metrics={adminPage.metrics} orders={adminPage.orders} users={adminPage.users} />
              )}

              {adminPage.section === 'games' && (
                <GamesAdminPanel
                  busy={adminPage.busy}
                  games={adminPage.games}
                  loading={adminPage.loading}
                  onCreateGame={adminPage.createGame}
                  onUpdateGame={adminPage.updateGame}
                  onDeleteGame={adminPage.removeGame}
                />
              )}

              {adminPage.section === 'packages' && (
                <PackagesAdminPanel
                  busy={adminPage.busy}
                  games={adminPage.games}
                  packages={adminPage.packages}
                  loading={adminPage.loading}
                  onCreatePackage={adminPage.createPackage}
                  onUpdatePackage={adminPage.updatePackage}
                  onDeletePackage={adminPage.removePackage}
                />
              )}

              {adminPage.section === 'orders' && (
                <OrdersAdminPanel
                  busy={adminPage.busy}
                  loading={adminPage.loading}
                  orders={adminPage.orders}
                  currentUser={adminPage.user}
                  onPickOrder={adminPage.pickOrder}
                  onCompleteOrder={adminPage.completeOrder}
                  onCancelOrder={adminPage.cancelOrder}
                />
              )}

              {adminPage.section === 'deposits' && (
                <DepositRequestsAdminPanel
                  busy={adminPage.busy}
                  loading={adminPage.loading}
                  onApproveRequest={adminPage.approveDepositRequest}
                  onRejectRequest={adminPage.rejectDepositRequest}
                  requests={adminPage.depositRequests}
                />
              )}

              {adminPage.section === 'users' && (
                <UsersAdminPanel
                  busy={adminPage.busy}
                  loading={adminPage.loading}
                  users={adminPage.users}
                  currentUser={adminPage.user}
                  onUpdateUser={adminPage.updateUser}
                  onDeleteUser={adminPage.removeUser}
                />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

const adminNavItems = [
  { section: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Tổng quan' },
  { section: 'games', icon: <Gamepad2 size={18} />, label: 'Quản lý game' },
  { section: 'packages', icon: <Boxes size={18} />, label: 'Gói nạp' },
  { section: 'orders', icon: <ReceiptText size={18} />, label: 'Đơn hàng' },
  { section: 'deposits', icon: <WalletCards size={18} />, label: 'Nạp tiền' },
  { section: 'users', icon: <Users size={18} />, label: 'Người dùng' },
] as const;
