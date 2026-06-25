// Mirrors OrderStatus enum in backend
export type OrderStatus = 1 | 2 | 3 | 4;

// UI-only type for timeline rendering
export type OrderTimelineState = 'complete' | 'current' | 'danger' | 'upcoming';

// Mirrors OrderResponse.cs
export type OrderResponse = {
  id: number;
  gameAccountInfo: string;
  gamePackageId: number;
  gameName: string;
  packageName: string;
  packagePrice: number;
  packageImageUrl: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

// Mirrors OrderHistoryResponse.cs
export type OrderHistoryResponse = {
  id: number;
  orderId: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  note?: string | null;
  actionBy: number;
  isAdmin: boolean;
  createdAt: string;
};

// Mirrors AdminOrderResponse.cs
export type AdminOrderResponse = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  gameName: string;
  packageName: string;
  packagePrice: number;
  packageCost: number;
  packageImageUrl: string;
  assignedTo: number | null;
  assignedAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

// UI-only type for timeline steps
export type OrderTimelineStep = {
  description: string;
  label: string;
  state: OrderTimelineState;
  time?: string | null;
};

export type CreateOrderInput = {
  gamePackageId: number;
  gameAccountInfo: string;
};

export type CancelOrderInput = {
  orderId: number;
};
