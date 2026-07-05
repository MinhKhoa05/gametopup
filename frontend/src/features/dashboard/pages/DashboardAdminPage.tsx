import { LayoutDashboard } from 'lucide-react';

import { useDepositReviewSection } from '@/features/deposits/server';
import { WalletDepositStatus } from '@/features/deposits/types';
import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { PendingDepositsPanel } from '@/features/dashboard/components/PendingDepositsPanel';
import { PendingOrdersPanel } from '@/features/dashboard/components/PendingOrdersPanel';
import { useDashboardStatsQuery } from '@/features/dashboard/server';
import { useAdminOrdersQuery } from '@/features/orders/server';
import { OrderStatus } from '@/features/orders/types';
import { IconBox, PageHero } from '@/shared/components';

export function DashboardAdminPage() {
  const statsQuery = useDashboardStatsQuery();
  const ordersQuery = useAdminOrdersQuery('pending');
  const depositsSection = useDepositReviewSection('active');

  const pendingOrders = ordersQuery.items.filter(
    (order) => order.status === OrderStatus.Pending,
  );
  
  const pendingDeposits = depositsSection.requests.filter(
    (request) =>
      request.status === WalletDepositStatus.Pending ||
      request.status === WalletDepositStatus.UserConfirmed,
  );

  return (
    <div className="grid gap-5">
      <PageHero
        visual={
          <IconBox size="lg" tone="primary" className="h-[56px] w-[56px] rounded-[18px]">
            <LayoutDashboard size={28} strokeWidth={1.8} />
          </IconBox>
        }
        title="Bảng điều khiển"
        description="Tổng quan hoạt động của hệ thống."
      />

      <DashboardStats
        stats={{
          activeGames: statsQuery.data?.activeGames ?? 0,
          totalGames: statsQuery.data?.totalGames ?? 0,
          activePackages: statsQuery.data?.activePackages ?? 0,
          totalPackages: statsQuery.data?.totalPackages ?? 0,
          pendingDeposits: statsQuery.data?.pendingDeposits ?? pendingDeposits.length,
          pendingOrders: statsQuery.data?.pendingOrders ?? pendingOrders.length,
        }}
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <PendingOrdersPanel
          loading={ordersQuery.isPending && ordersQuery.data === undefined}
          orders={pendingOrders}
        />
        <PendingDepositsPanel
          loading={depositsSection.loading}
          requests={pendingDeposits}
        />
      </section>
    </div>
  );
}
