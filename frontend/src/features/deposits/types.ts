export type WalletDepositRequestStatus = 1 | 2 | 3 | 4;

export type WalletDepositRequest = {
  id: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  status: WalletDepositRequestStatus;
  userConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDepositRequest = {
  id: number;
  userId: number;
  amount: number;
  code: string;
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
