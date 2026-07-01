import { useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { ADMIN_SECTIONS, routes, type AdminSection } from '@/app/router/routes';
import { UserRole } from '@/features/users/types';
import { useAuthUserQuery } from '@/features/auth/server';
import {
  AdminAccessDenied,
  AdminDesktopLayout,
  AdminMobileLayout,
  AdminSectionShell,
} from '@/features/admin/components/AdminLayoutShell';

export function AdminLayoutPage() {
  const navigate = useNavigate();
  const { section: sectionParam } = useParams<{ section?: AdminSection }>();
  const userQuery = useAuthUserQuery();
  const user = userQuery.data ?? null;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeSection = ADMIN_SECTIONS.includes(sectionParam as AdminSection)
    ? (sectionParam as AdminSection)
    : 'dashboard';

  if (!user || user.role !== UserRole.Admin) {
    return <AdminAccessDenied onLogin={() => navigate(routes.login())} />;
  }

  const shell = (
    <AdminSectionShell activeSection={activeSection} busy={false} loading={userQuery.isPending}>
      <Outlet />
    </AdminSectionShell>
  );

  const refresh = () => window.location.reload();

  return (
    <div className="gt-app-shell min-h-screen">
      <AdminMobileLayout
        activeSection={activeSection}
        isOpen={mobileSidebarOpen}
        loading={userQuery.isPending}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onCloseSidebar={() => setMobileSidebarOpen(false)}
        onNavigate={(nextSection) => {
          setMobileSidebarOpen(false);
          navigate(routes.admin(nextSection));
        }}
        onRefresh={refresh}
        onToggleSidebar={() => setMobileSidebarOpen((value) => !value)}
      >
        {shell}
      </AdminMobileLayout>

      <AdminDesktopLayout
        activeSection={activeSection}
        brandCollapsed={sidebarCollapsed}
        loading={userQuery.isPending}
        onBrandClick={() => navigate(routes.admin('dashboard'))}
        onNavigate={(nextSection) => navigate(routes.admin(nextSection))}
        onRefresh={refresh}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      >
        {shell}
      </AdminDesktopLayout>
    </div>
  );
}
