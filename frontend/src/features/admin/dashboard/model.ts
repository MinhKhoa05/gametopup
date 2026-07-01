import { routes } from '@/app/router/routes';
import type { User } from '@/features/users/types';
import type { AdminGame } from '@/features/games/types';
import type { AdminGamePackage } from '@/features/packages/types';
import type { AdminOrder } from '@/features/orders/types';

type WatchItem = {
  actionHref: string;
  description: string;
  id: string;
  imageUrl: string;
  subtitle: string;
  title: string;
  stockLabel: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

export function buildWatchItems(packages: AdminGamePackage[], games: AdminGame[]) {
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

export function countOrdersToday(orders: AdminOrder[]) {
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
