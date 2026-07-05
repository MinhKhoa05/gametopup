import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

import { ADMIN_SECTIONS, routes, type AdminSection } from '@/app/router/routes';
import { HEADER_ADMIN_MENU_ITEMS } from '@/app/config';
import { UserRole } from '@/features/users/types';
import { useAuthUserQuery, useLogoutMutation } from '@/features/auth/server';
import { EmptyState, HeaderAccountMenu, IconBox } from '@/shared/components';
import { AdminDesktopLayout, AdminMobileLayout } from '@/app/admin/AdminLayoutShell';

export function AdminLayoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userQuery = useAuthUserQuery();
  const logoutMutation = useLogoutMutation();
  const user = userQuery.data ?? null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeSection = getActiveAdminSection(location.pathname);

  if (!user || user.role !== UserRole.Admin) {
    return <AdminAccessDenied onLogin={() => navigate(routes.login())} />;
  }

  const shell = (
    <div className="grid min-w-0 gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Outlet />
    </div>
  );

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate(routes.home(), { replace: true });
  }

  const accountMenu = (
    <HeaderAccountMenu
      displayName={user.displayName}
      items={HEADER_ADMIN_MENU_ITEMS}
      onLogout={handleLogout}
      onNavigate={navigate}
    />
  );

  return (
    <div className="gt-app-shell min-h-screen">
      <AdminMobileLayout
        activeSection={activeSection}
        accountMenu={accountMenu}
        isOpen={mobileSidebarOpen}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        onNavigate={(nextSection) => {
          setMobileSidebarOpen(false);
          navigate(routes.admin(nextSection));
        }}
        onToggleSidebar={() => setMobileSidebarOpen((value) => !value)}
      >
        {shell}
      </AdminMobileLayout>

      <AdminDesktopLayout
        activeSection={activeSection}
        accountMenu={accountMenu}
        brandCollapsed={sidebarCollapsed}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onNavigate={(nextSection) => navigate(routes.admin(nextSection))}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      >
        {shell}
      </AdminDesktopLayout>
    </div>
  );
}

function getActiveAdminSection(pathname: string): AdminSection {
  if (pathname === '/admin') {
    return 'dashboard';
  }

  const section = pathname.split('/')[2] as AdminSection | undefined;
  return section && ADMIN_SECTIONS.includes(section) ? section : 'dashboard';
}

function AdminAccessDenied({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gt-bg)] px-4 py-6 gt-text">
      <EmptyState
        className="max-w-[560px] py-10"
        title="Cần quyền quản trị"
        description="Bạn cần đăng nhập bằng tài khoản quản trị để truy cập khu vực này."
      >
        <div className="mb-4 flex justify-center">
          <IconBox size="lg">
            <LayoutDashboard size={26} />
          </IconBox>
        </div>
        <div className="mt-4">
          <button className="gt-button gt-button-primary" onClick={onLogin}>
            Đăng nhập
          </button>
        </div>
      </EmptyState>
    </div>
  );
}
