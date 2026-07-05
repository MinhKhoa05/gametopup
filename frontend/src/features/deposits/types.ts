export enum WalletDepositStatus {
  Pending = 1,
  UserConfirmed = 2,
  Approved = 3,
  Rejected = 4,
}

export type WalletDepositFilter =
  | "active"
  | "watching"
  | "pending"
  | "userConfirmed"
  | "approved"
  | "rejected";

export type WalletDeposit = {
  id: number;
  amount: number;
  code: string;
  transferContent: string;
  qrImageUrl: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  status: WalletDepositStatus;
  userConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DepositReviewRequest = {
  id: number;
  userId: number;
  amount: number;
  code: string;
  status: WalletDepositStatus;
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
