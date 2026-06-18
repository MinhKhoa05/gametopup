export type OrderStatus = 1 | 2 | 3 | 4;

export type Order = {
  id: number;
  gameAccountInfo: string;
  gamePackageId: number;
  gameId?: number | null;
  gameName?: string | null;
  gameImageUrl?: string | null;
  packageName?: string | null;
  packageImageUrl?: string | null;
  unitPrice: number;
  total?: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderSummary = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  unitPrice: number;
  total: number;
  assignedTo: number | null;
  assignedAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  gamePackageId: number;
  gameAccountInfo: string;
};

export type CancelOrderInput = {
  orderId: number;
};
