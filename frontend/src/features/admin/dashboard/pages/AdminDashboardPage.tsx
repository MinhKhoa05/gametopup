import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAdminPage } from '@/features/admin/hooks';
import { DashboardPanel } from '@/features/admin/dashboard/components/DashboardPanel';

export function AdminDashboardPage() {
  const auth = useAuthSession();
  const adminPage = useAdminPage({ user: auth.user });

  return (
    <DashboardPanel
      depositRequests={adminPage.depositRequests}
      games={adminPage.games}
      loading={adminPage.loading}
      metrics={adminPage.metrics}
      orders={adminPage.orders}
      packages={adminPage.packages}
      users={adminPage.users}
    />
  );
}
