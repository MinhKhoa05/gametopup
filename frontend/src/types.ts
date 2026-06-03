export type Game = {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
};

export type GamePackage = {
  id: number;
  name: string;
  imageUrl: string;
  gameId: number;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  stockQuantity: number;
  isActive: boolean;
};

export type User = {
  id: number;
  avatarUrl?: string;
  displayName?: string;
  email: string;
  role?: number | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

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

export type Order = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  unitPrice: number;
  quantity: number;
  total?: number;
  status: number;
  assignedTo?: number | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
