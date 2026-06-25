import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, TimerReset, XCircle } from 'lucide-react';
import type { OrderResponse } from '@/features/orders/types';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';

type StatusGroup = 'pending' | 'processing' | 'completed' | 'canceled';

export type OrderHistoryItem = {
  amount: number;
  amountLabel: string;
  createdAtLabel: string;
  createdAt: string;
  gameKey: string;
  gameName: string;
  gameThumbnailSrc: string;
  gameAccountInfo: string;
  note: string;
  order: OrderResponse;
  orderCode: string;
  packageName: string;
  statusGroup: StatusGroup;
  statusIcon: ReactNode;
  statusLabel: string;
  statusTone: 'danger' | 'neutral' | 'primary' | 'success' | 'warning';
  updatedAtLabel: string;
};

export function buildOrderHistoryItems(orders: OrderResponse[]): OrderHistoryItem[] {
  return orders.map((order) => {
    const amount = order.packagePrice;
    const status = getOrderStatusMeta(order.status, getOrderStatusIcon(order.status));
    const createdAtLabel = formatDate(order.createdAt);
    const updatedAtLabel = formatDate(order.updatedAt);

    return {
      amount,
      amountLabel: formatCurrency(amount),
      createdAtLabel,
      createdAt: order.createdAt,
      gameAccountInfo: order.gameAccountInfo,
      gameKey: `package-${order.gamePackageId}`,
      gameName: order.gameName.trim() || 'Game đã ẩn',
      gameThumbnailSrc: order.packageImageUrl || DEFAULT_IMAGE_SRC,
      note: '-',
      order,
      orderCode: `#GTOP${order.id}`,
      packageName: order.packageName.trim() || 'Gói nạp',
      statusGroup: getStatusGroup(order.status),
      statusIcon: status.icon,
      statusLabel: status.label,
      statusTone: status.tone,
      updatedAtLabel,
    };
  });
}

function getStatusGroup(status: number): StatusGroup {
  switch (status) {
    case 1:
      return 'pending';
    case 2:
      return 'processing';
    case 3:
      return 'completed';
    case 4:
      return 'canceled';
    default:
      return 'pending';
  }
}

function getOrderStatusIcon(status: number) {
  switch (status) {
    case 1:
      return <Clock3 size={14} />;
    case 2:
      return <TimerReset size={14} />;
    case 3:
      return <CheckCircle2 size={14} />;
    case 4:
      return <XCircle size={14} />;
    default:
      return <Clock3 size={14} />;
  }
}
