import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api, type ApiResponse } from '../lib/api';
import type { Game, GamePackage } from '../types';

export const GAMES_QUERY_KEY = ['games'] as const;
const GAMES_STALE_TIME = 1000 * 60 * 10;
const GAME_PACKAGES_STALE_TIME = 1000 * 60 * 10;

export function gamePackagesQueryKey(gameId: number | null | undefined) {
  return ['game-packages', gameId] as const;
}

export async function getGames() {
  const response = await api.get<ApiResponse<Game[]>>('/api/games');
  return response.data.data;
}

export async function getPackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/game-packages/game/${gameId}`);
  return response.data.data;
}

export function useGamesQuery() {
  return useQuery({
    queryKey: GAMES_QUERY_KEY,
    queryFn: getGames,
    placeholderData: keepPreviousData,
    staleTime: GAMES_STALE_TIME,
    meta: { persist: true },
  });
}

export function useGamePackagesQuery(gameId: number | null | undefined) {
  function getGamePackages() {
    return getPackagesByGame(gameId as number);
  }

  return useQuery({
    queryKey: gamePackagesQueryKey(gameId),
    queryFn: getGamePackages,
    enabled: Boolean(gameId),
    placeholderData: keepPreviousData,
    staleTime: GAME_PACKAGES_STALE_TIME,
    meta: { persist: true },
  });
}
