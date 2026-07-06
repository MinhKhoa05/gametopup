// Mirrors NotificationType enum in backend
export enum NotificationType {
  OrderPlaced = 1,
  OrderProcessing = 2,
  OrderCompleted = 3,
  OrderCancelled = 4,
  DepositSubmitted = 5,
  DepositApproved = 6,
  DepositRejected = 7,
  Welcome = 8,
  System = 9,
}

export type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type UnreadNotificationCount = {
  unreadCount: number;
};
