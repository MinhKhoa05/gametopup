import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGames } from './api';
import type { PublicGame } from './contracts';

const GAMES_STALE_TIME = 1000 * 60 * 10;

export const gamesKeys = {
  all: ['games'] as const,
};

export function useGamesQuery<TData = PublicGame[]>(options?: {
  select?: (games: PublicGame[]) => TData;
}) {
  return useQuery<PublicGame[], Error, TData>({
    queryKey: gamesKeys.all,
    queryFn: getGames,
    placeholderData: keepPreviousData,
    staleTime: GAMES_STALE_TIME,
    meta: { persist: true },
    select: options?.select,
  });
}
