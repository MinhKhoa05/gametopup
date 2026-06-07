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

export type AdminDepositRequest = {
  id: number;
  userId: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId?: string | null;
  accountNo?: string | null;
  accountName?: string | null;
  status: number;
  userConfirmedAt?: string | null;
  reviewedBy?: number | null;
  reviewedAt?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
};
