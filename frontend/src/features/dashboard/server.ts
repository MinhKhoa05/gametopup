import { useQuery } from '@tanstack/react-query';

import { getDashboardStats } from './api';

export const dashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  stats: ['admin', 'dashboard', 'stats'] as const,
};

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: getDashboardStats,
    staleTime: 1000 * 60,
  });
}
