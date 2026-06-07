import type { QueryClient } from '@tanstack/react-query';
import type { AdminGamePackage, GamePackage, Game } from '../../types';
import { allGamePackagesQueryKey, adminPackagesQueryKey } from './keys';

function replaceItemById<T extends { id: number }>(items: T[] | undefined, nextItem: T) {
  if (!items) return items;
  return items.map((item) => (item.id === nextItem.id ? nextItem : item));
}

function removeItemById<T extends { id: number }>(items: T[] | undefined, id: number) {
  if (!items) return items;
  return items.filter((item) => item.id !== id);
}

export function syncGamesCache(queryClient: QueryClient, updater: (current: Game[] | undefined) => Game[] | undefined) {
  queryClient.setQueryData<Game[]>(['games'], updater);
}

export function syncAdminPackagesCache(queryClient: QueryClient, updater: (current: AdminGamePackage[] | undefined) => AdminGamePackage[] | undefined) {
  queryClient.setQueryData<AdminGamePackage[]>(adminPackagesQueryKey, updater);
}

export function syncAllGamePackagesCache(
  queryClient: QueryClient,
  updater: (current: GamePackage[] | undefined, queryKey: readonly unknown[]) => GamePackage[] | undefined,
) {
  for (const query of queryClient.getQueryCache().findAll({ queryKey: allGamePackagesQueryKey })) {
    queryClient.setQueryData<GamePackage[] | undefined>(query.queryKey, (current) => updater(current, query.queryKey));
  }
}

export { replaceItemById, removeItemById };

