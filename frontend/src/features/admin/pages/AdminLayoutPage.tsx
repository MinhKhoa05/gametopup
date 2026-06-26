import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { HEADER_ADMIN_MENU_ITEMS } from '@/app/config';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAdminPage } from '@/features/admin/hooks';
import { UserRole } from '@/features/auth/types';
import {
  AdminAccessDenied,
  AdminDesktopLayout,
  AdminMobileLayout,
  AdminSectionShell,
} from '@/features/admin/components/AdminLayoutShell';
import { ADMIN_SECTIONS, routes, type AdminSection } from '@/app/router/routes';

export function AdminLayoutPage() {
  const navigate = useNavigate();
  const { section: sectionParam } = useParams<{ section?: AdminSection }>();
  const auth = useAuthSession();
  const adminPage = useAdminPage({ user: auth.user });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeSection = ADMIN_SECTIONS.includes(sectionParam as AdminSection) ? (sectionParam as AdminSection) : 'dashboard';

  const accountMenuItems = HEADER_ADMIN_MENU_ITEMS;

  if (!auth.user || auth.user.role !== UserRole.Admin) {
    return <AdminAccessDenied onLogin={() => navigate(routes.login())} />;
  }

  const brandCollapsed = sidebarCollapsed;
  const shell = (
    <AdminSectionShell activeSection={activeSection} busy={adminPage.busy} loading={adminPage.loading}>
      <Outlet />
    </AdminSectionShell>
  );

  return (
    <div className="gt-app-shell min-h-screen">
      <AdminMobileLayout
        // accountMenuItems={accountMenuItems}
        activeSection={activeSection}
        children={shell}
        isOpen={mobileSidebarOpen}
        loading={adminPage.loading || adminPage.busy}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        onNavigate={(nextSection) => {
          setMobileSidebarOpen(false);
          navigate(routes.admin(nextSection));
        }}
        onRefresh={adminPage.refreshAll}
        onToggleSidebar={() => setMobileSidebarOpen((value) => !value)}
        userName={auth.userDisplayName}
      />

      <AdminDesktopLayout
        accountMenuItems={accountMenuItems}
        activeSection={activeSection}
        brandCollapsed={brandCollapsed}
        children={shell}
        loading={adminPage.loading || adminPage.busy}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onNavigate={(nextSection) => navigate(routes.admin(nextSection))}
        onRefresh={adminPage.refreshAll}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        userName={auth.userDisplayName}
      />
    </div>
  );
}
