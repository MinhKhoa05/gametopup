export type OrderStatus = 1 | 2 | 3 | 4;

export type Order = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  unitPrice: number;
  total?: number;
  assignedTo: number | null;
  assignedAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrderInput = {
  gamePackageId: number;
  gameAccountInfo: string;
};

export type CancelOrderInput = {
  orderId: number;
};
