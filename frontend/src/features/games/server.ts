import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGames } from './api';
import type { Game } from './types';

const GAMES_STALE_TIME = 1000 * 60 * 60;
const GAMES_GC_TIME = 1000 * 60 * 60;

export const gamesKeys = {
  all: ['games'] as const,
};

export function useGamesQuery<TData = Game[]>(options?: {
  select?: (games: Game[]) => TData;
}) {
  return useQuery<Game[], Error, TData>({
    queryKey: gamesKeys.all,
    queryFn: getGames,
    placeholderData: keepPreviousData,
    staleTime: GAMES_STALE_TIME,
    gcTime: GAMES_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
    select: options?.select,
  });
}
