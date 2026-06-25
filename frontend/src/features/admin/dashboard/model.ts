import type { ReactNode } from 'react';
import { routes } from '@/app/router/routes';
import type { User } from '@/features/auth/types';
import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
import type { AdminDepositRequest } from '@/features/deposits/types';
import type { AdminGameSummary } from '@/features/admin/games/api';
import type { GamePackage } from '@/features/games/types';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import type { AdminOrderResponse } from '@/features/orders/types';
import { formatCurrency } from '@/shared/lib/format';

export type QueueItem =
  | {
      actionHref: string;
      amountLabel: string;
      createdAt: string;
      description: string;
      id: string;
      imageAlt: string;
      imageUrl: string | null;
      kind: 'order';
      searchText: string;
      sortValue: number;
      statusIcon: ReactNode;
      statusLabel: string;
      statusTone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
      title: string;
    }
  | {
      actionHref: string;
      amountLabel: string;
      createdAt: string;
      description: string;
      id: string;
      imageAlt: string;
      imageUrl: null;
      kind: 'deposit';
      searchText: string;
      sortValue: number;
      statusIcon: ReactNode;
      statusLabel: string;
      statusTone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
      title: string;
    };

export type WatchItem = {
  actionHref: string;
  description: string;
  id: string;
  imageUrl: string;
  subtitle: string;
  title: string;
  stockLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

export function buildQueueItems({
  depositRequests,
  games,
  orders,
  packages,
}: {
  depositRequests: AdminDepositRequest[];
  games: AdminGameSummary[];
  orders: AdminOrderResponse[];
  packages: GamePackage[];
}) {
  const gameById = new Map(games.map((game) => [game.id, game]));
  const packageById = new Map(packages.map((item) => [item.id, item]));

  const orderItems = orders.filter((order) => order.status === 1 || order.status === 2).slice(0, 6).map<QueueItem>((order) => {
    const gamePackage = packageById.get(order.gamePackageId);
    const game = gamePackage ? gameById.get(gamePackage.gameId) : undefined;
    const statusMeta = getOrderStatusMeta(order.status);
    const amount = formatCurrency(order.packagePrice);
    const title = gamePackage ? `${game?.name ?? 'Game'} · ${gamePackage.name}` : `Đơn #${order.id}`;
    const description = `${order.gameAccountInfo || 'Chưa có thông tin'} · #${order.id}`;

    return {
      actionHref: routes.admin('orders'),
      amountLabel: amount,
      createdAt: order.createdAt,
      description,
      id: `order-${order.id}`,
      imageAlt: game?.name ?? gamePackage?.name ?? `Đơn ${order.id}`,
      imageUrl: gamePackage?.imageUrl ?? game?.imageUrl ?? null,
      kind: 'order',
      searchText: [order.id, order.gameAccountInfo, game?.name, gamePackage?.name, statusMeta.label, amount].join(' ').toLowerCase(),
      sortValue: new Date(order.createdAt).getTime(),
      statusIcon: statusMeta.icon,
      statusLabel: statusMeta.label,
      statusTone: statusMeta.tone,
      title,
    };
  });

  const depositItems = depositRequests.filter((request) => request.status === 1 || request.status === 2).slice(0, 5).map<QueueItem>((request) => {
    const statusMeta = getDepositRequestStatus(request.status);
    const amount = formatCurrency(request.amount);

    return {
      actionHref: routes.admin('deposits'),
      amountLabel: amount,
      createdAt: request.createdAt,
      description: `User #${request.userId} · ${request.code}`,
      id: `deposit-${request.id}`,
      imageAlt: '',
      imageUrl: null,
      kind: 'deposit',
      searchText: [request.code, request.userId, statusMeta.label, amount].join(' ').toLowerCase(),
      sortValue: new Date(request.createdAt).getTime(),
      statusIcon: statusMeta.icon,
      statusLabel: statusMeta.label,
      statusTone: statusMeta.tone,
      title: `Nạp ${amount}`,
    };
  });

  return [...orderItems, ...depositItems].sort((left, right) => right.sortValue - left.sortValue);
}

export function buildWatchItems(packages: GamePackage[], games: AdminGameSummary[]) {
  const gameById = new Map(games.map((game) => [game.id, game]));

  return packages
    .filter((item) => !item.isActive || item.availableSlots <= 20)
    .sort((left, right) => Number(left.isActive) - Number(right.isActive) || left.availableSlots - right.availableSlots)
    .slice(0, 4)
    .map<WatchItem>((item) => {
      const game = gameById.get(item.gameId);

      return {
        actionHref: routes.admin('packages'),
        description: item.isActive ? `Còn ${item.availableSlots} slot` : 'Đang tắt hiển thị',
        id: `package-${item.id}`,
        imageUrl: item.imageUrl ?? game?.imageUrl ?? '',
        subtitle: `${game?.name ?? 'Game'} · ${item.name}`,
        stockLabel: item.isActive ? `Còn ${item.availableSlots}` : 'Đang tắt',
        title: item.name,
        tone: item.isActive ? (item.availableSlots <= 10 ? 'warning' : 'success') : 'neutral',
      };
    });
}

export function buildRecentUsers(users: User[]) {
  return users
    .slice()
    .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
    .slice(0, 4);
}

export function countOrdersToday(orders: AdminOrderResponse[]) {
  const today = new Date();

  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return (
      createdAt.getFullYear() === today.getFullYear() &&
      createdAt.getMonth() === today.getMonth() &&
      createdAt.getDate() === today.getDate()
    );
  }).length;
}
