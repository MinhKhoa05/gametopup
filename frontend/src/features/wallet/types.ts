export type WalletTransactionType = 1 | 2 | 3 | 4;

export type WalletTransaction = {
  id: number;
  userId: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: WalletTransactionType;
  description: string | null;
  orderId: number | null;
  createdAt: string;
};

export type WalletDepositRequestStatus = 1 | 2 | 3 | 4;

export type DepositRequest = {
  id: number;
  userId: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  status: WalletDepositRequestStatus;
  userConfirmedAt: string | null;
  reviewedBy: number | null;
  reviewedAt: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateDepositRequestInput = {
  amount: number;
};

export type ConfirmDepositTransferInput = {
  requestId: number;
};
