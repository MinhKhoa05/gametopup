export type OrderStatus = 1 | 2 | 3 | 4;
export type OrderTimelineState = 'complete' | 'current' | 'danger' | 'upcoming';

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

export type OrderTimelineStep = {
  description: string;
  label: string;
  state: OrderTimelineState;
  time?: string | null;
};

export type OrderTimelineEvent = {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  note?: string | null;
  actionBy: number;
  isAdmin: boolean;
  createdAt: string;
};

export type OrderTimelineResponse = {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string | null;
  events: OrderTimelineEvent[];
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
