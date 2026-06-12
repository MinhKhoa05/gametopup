export type OrderStatus = 1 | 2 | 3 | 4 | 5;

export type Order = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  unitPrice: number;
  quantity: number;
  total?: number;
  assignedTo: number | null;
  assignedAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlaceOrderInput = {
  gamePackageId: number;
  quantity: number;
  gameAccountInfo: string;
};

export type PayOrderInput = {
  orderId: number;
};

export type CancelOrderInput = {
  orderId: number;
};
