import { filterByQuery } from '@/lib/search';

export function filterByName<T extends { name: string }>(items: T[], query: string) {
  return filterByQuery(items, query, (item) => item.name);
}

export function gameName(games: Array<{ id: number; name: string }>, gameId: number) {
  return games.find((game) => game.id === gameId)?.name ?? `Game #${gameId}`;
}
