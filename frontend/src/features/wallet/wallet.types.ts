import type { ReactNode } from "react";

// --- wallet.type.ts ---
export type WalletInfo = {
  userId?: number;
  balance: number;
};

export type WalletTransaction = {
  id: number;
  userId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: number;
  description?: string | null;
  orderId?: number | null;
  createdAt: string;
};

export type DepositRequest = {
  id: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  status: number;
  createdAt: string;
};

// --- wallet-activity.type.ts ---
export type DepositRequestItem = Pick<
  DepositRequest,
  'id' | 'amount' | 'transferContent' | 'createdAt' | 'status'
>;

export type WalletTransactionItem = Pick<
  WalletTransaction,
  'id' | 'type' | 'description' | 'createdAt' | 'amount' | 'balanceAfter'
>;

// --- wallet-ui.type.ts ---

export type DepositRequestStatus = {
  description: string;
  icon: ReactNode;
  label: string;
  tone: 'pending' | 'reviewing' | 'approved' | 'rejected';
};

