// Mirrors OrderStatus enum in backend
export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Completed = 3,
  Cancelled = 4,
}

export type OrderFilter =
  | "watching"
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

// Mirrors OrderResponse.cs
export type Order = {
  id: number;
  gameAccountInfo: string;
  packageId: number;
  gameName: string;
  packageName: string;
  packagePrice: number;
  packageImageUrl: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

// Mirrors OrderHistoryResponse.cs
export type OrderHistory = {
  id: number;
  orderId: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  note?: string | null;
  actionBy: number;
  isAdmin: boolean;
  createdAt: string;
};

// Mirrors OrderStatsResponse.cs
export type OrderStats = {
  totalOrders: number;
  watchingOrders: number;
  completedOrders: number;
  totalSpent: number;
};

// Mirrors AdminOrderResponse.cs
export type AdminOrder = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  packageId: number;
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

export type CreateOrderInput = {
  packageId: number;
  gameAccountInfo: string;
};

export type CreateOrderResponse = {
  orderId: number;
};
