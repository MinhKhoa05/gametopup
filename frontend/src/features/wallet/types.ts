export enum WalletTransactionType {
  Deposit = 1,
  Withdraw = 2,
  PurchaseOrder = 3,
  Refund = 4,
}

export type WalletTransactionFilter =
  | "deposit"
  | "withdraw"
  | "purchaseOrder"
  | "refund";

export type WalletTransaction = {
  id: number;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: WalletTransactionType;
  referenceId: string | null;
  createdAt: string;
};
