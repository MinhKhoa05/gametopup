import type { WalletDepositRequest } from '@/features/deposits/types';

export type WalletTransactionType = 1 | 2 | 3 | 4;

export type WalletTransaction = {
  id: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: WalletTransactionType;
  description: string | null;
  orderId: number | null;
  createdAt: string;
};

export type WalletOverview = {
  balance: number;
  transactions: WalletTransaction[];
  depositRequests: WalletDepositRequest[];
};
