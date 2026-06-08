export type AdminCatalogMetrics = {
  activeGames: number;
  totalPackages: number;
  disabledPackages: number;
  ordersToday: number;
  paidRevenue: number;
  pendingOrders: number;
  totalUsers: number;
  activeUsers: number;
};

import type { DepositRequest } from '@/features/wallet/wallet.types';

export type AdminDepositRequest = DepositRequest & {
  userId: number;
  userConfirmedAt?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  adminNote?: string | null;
  updatedAt: string;
};
