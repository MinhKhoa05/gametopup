import { Clock3, Gamepad2, Landmark, Package } from 'lucide-react';

import type { DashboardStats as DashboardStatsValue } from '@/features/dashboard/types';
import { StatCard } from '@/shared/components';

export function DashboardStats({ stats }: { stats: DashboardStatsValue }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={<Gamepad2 size={18} />}
        label="Game"
        tone="primary"
        value={`${stats.activeGames}/${stats.totalGames}`}
      />
      <StatCard
        icon={<Package size={18} />}
        label="Gói nạp"
        tone="primary"
        value={`${stats.activePackages}/${stats.totalPackages}`}
      />
      <StatCard
        icon={<Clock3 size={18} />}
        label="Đơn chờ xử lý"
        tone="warning"
        value={stats.pendingOrders}
      />
      <StatCard
        icon={<Landmark size={18} />}
        label="Yêu cầu nạp chờ duyệt"
        tone="warning"
        value={stats.pendingDeposits}
      />
    </section>
  );
}
