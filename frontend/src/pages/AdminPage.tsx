import { useState, type CSSProperties } from 'react';
import { CalendarDays, LayoutDashboard, ShieldCheck } from 'lucide-react';
import {
  AdminHeader,
  AdminSidebar,
  DashboardPanel,
  DepositRequestsAdminPanel,
  GamesAdminPanel,
  OrdersAdminPanel,
  PackagesAdminPanel,
  UsersAdminPanel,
} from '../components/admin';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Badge, Button, EmptyState, IconBox } from '../components/ui';
import { useAdminPage } from '../hooks/admin/admin-page.hook';
import { useMediaQuery } from '../hooks/common/use-media-query.hooks';
import { isAdminUser } from '../lib/roles';
import { SITE } from '../config/site';
import type { User } from '../types';
import type { AdminSection } from '../components/admin/AdminSidebar';
import { classNames } from '../lib/ui';

const sectionMeta = {
  dashboard: {
    label: 'Tổng quan',
    description: 'Theo dõi hoạt động và số liệu hệ thống theo thời gian thực.',
  },
  games: {
    label: 'Quản lý game',
    description: 'Cập nhật danh sách game, trạng thái hoạt động và thông tin hiển thị.',
  },
  packages: {
    label: 'Gói nạp',
    description: 'Quản lý các gói nạp theo từng game và kiểm soát trạng thái hiển thị.',
  },
  orders: {
    label: 'Đơn hàng',
    description: 'Kiểm tra, xử lý và theo dõi các đơn hàng gần đây.',
  },
  deposits: {
    label: 'Nạp tiền',
    description: 'Duyệt hoặc từ chối các yêu cầu nạp tiền đã được khách hàng xác nhận.',
  },
  users: {
    label: 'Người dùng',
    description: 'Quản lý người dùng, trạng thái hoạt động và quyền truy cập.',
  },
} as const;

function AdminAccessDenied({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#061224] px-4 py-6 text-slate-100">
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
        onAction={onLogin}
      />
    </div>
  );
}

function AdminSectionContent({
  busy,
  loading,
  metaLabel,
  metaDescription,
  adminPage,
}: {
  adminPage: ReturnType<typeof useAdminPage>;
  busy: boolean;
  loading: boolean;
  metaDescription: string;
  metaLabel: string;
}) {
  return (
    <div className="grid min-w-0 gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section className="grid gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid min-w-0 gap-2">
            <div className="grid gap-1">
              <h1 className="m-0 text-[clamp(2rem,2.8vw,3rem)] font-black leading-[1.04] tracking-[-0.04em] text-white">
                {metaLabel}
              </h1>
              <p className="m-0 max-w-3xl text-sm leading-[1.55] text-slate-400 sm:text-[0.96rem]">{metaDescription}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full border-white/8 bg-white/[0.03] px-4 text-slate-200 hover:bg-white/[0.06] hover:text-white"
            >
              <CalendarDays size={14} />
              7 ngày qua
            </Button>

            <Badge
              variant={busy || loading ? 'accent' : 'success'}
              icon={<ShieldCheck size={14} />}
              className="rounded-full px-3.5 py-2"
            >
              {busy || loading ? 'Đang đồng bộ' : 'Sẵn sàng'}
            </Badge>
          </div>
        </div>
      </section>

      {adminPage.section === 'dashboard' && (
        <DashboardPanel
          depositRequests={adminPage.depositRequests}
          games={adminPage.games}
          loading={adminPage.loading}
          metrics={adminPage.metrics}
          orders={adminPage.orders}
          users={adminPage.users}
        />
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
    </div>
  );
}

export function AdminPage({
  onLogout,
  user,
}: {
  onLogout: () => void;
  user: User | null;
}) {
  const adminPage = useAdminPage({ user });
  const isMobile = useMediaQuery('(max-width: 1023.98px)');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const section = (adminPage.section ?? 'dashboard') as AdminSection;
  const meta = sectionMeta[section];
  const isBusy = adminPage.loading || adminPage.busy;

  if (!isAdminUser(adminPage.user)) {
    return <AdminAccessDenied onLogin={() => adminPage.navigate({ name: 'auth' })} />;
  }

  const brandCollapsed = !isMobile && sidebarCollapsed;
  const sidebarWidth = brandCollapsed ? '92px' : '300px';

  return (
    <div className="min-h-screen bg-[#061224] text-slate-100">
      <div className="lg:hidden">
        <header className="border-b border-white/[0.06] bg-[#071427]/95 px-4 py-3 backdrop-blur-xl">
          <AdminHeader
            loading={isBusy}
            onLogout={onLogout}
            onRefresh={adminPage.refreshAll}
            onToggleSidebar={() => setMobileSidebarOpen((value) => !value)}
            variant="mobile"
            user={adminPage.user}
          />
        </header>

        <AdminSidebar
          activeSection={section}
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          onNavigate={(nextSection) => {
            setMobileSidebarOpen(false);
            adminPage.navigate({ name: 'admin', section: nextSection });
          }}
          variant="mobile"
        />

        <main className="min-w-0">
          <AdminSectionContent
            adminPage={adminPage}
            busy={adminPage.busy}
            loading={adminPage.loading}
            metaDescription={meta.description}
            metaLabel={meta.label}
          />
        </main>
      </div>

      <div
        className="hidden min-h-screen w-full lg:grid"
        style={
          {
            '--admin-sidebar-width': sidebarWidth,
            gridTemplateColumns: 'var(--admin-sidebar-width) minmax(0,1fr)',
            gridTemplateRows: '96px minmax(0,1fr)',
          } as CSSProperties
        }
      >
        <div
          className={classNames(
            'flex items-center border-b border-r border-white/[0.06] bg-[#071427]/95 px-6 py-4 lg:px-7',
            brandCollapsed ? 'justify-center' : 'justify-start',
          )}
        >
          <BrandLogo
            adminDot
            onClick={() => adminPage.navigate({ name: 'admin', section: 'dashboard' })}
            collapsed={brandCollapsed}
            size="lg"
            subtitle="Quản lý và vận hành dịch vụ"
            title={`${SITE.name} Admin`}
          />
        </div>

        <header className="flex items-center border-b border-white/[0.06] bg-[#071427]/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <AdminHeader
            loading={isBusy}
            onLogout={onLogout}
            onRefresh={adminPage.refreshAll}
            onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
            user={adminPage.user}
          />
        </header>

        <AdminSidebar
          activeSection={section}
          collapsed={brandCollapsed}
          onNavigate={(nextSection) => adminPage.navigate({ name: 'admin', section: nextSection })}
          variant="desktop"
        />

        <main className="min-w-0 overflow-auto lg:col-start-2 lg:row-start-2">
          <AdminSectionContent
            adminPage={adminPage}
            busy={adminPage.busy}
            loading={adminPage.loading}
            metaDescription={meta.description}
            metaLabel={meta.label}
          />
        </main>
      </div>
    </div>
  );
}
