import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '../lib/api';
import { Game, GamePackage } from '../types';

// ==========================================
// 1. API SERVICES (pure server calls)
// ==========================================
export const GAMES_QUERY_KEY = ['games'] as const;
const GAMES_STALE_TIME = 1000 * 60 * 10;
const GAME_PACKAGES_STALE_TIME = 1000 * 60 * 10;

export const gamePackagesQueryKey = (gameId: number | null | undefined) =>
  ['game-packages', gameId] as const;

export async function getGames() {
  const response = await api.get<ApiResponse<Game[]>>('/api/games');
  return response.data.data;
}

export async function getPackagesByGame(gameId: number) {
  const response = await api.get<ApiResponse<GamePackage[]>>(`/api/game-packages/game/${gameId}`);
  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS (cache / SWR / background revalidate)
// ==========================================
export function useGamesQuery() {
  return useQuery({
    queryKey: GAMES_QUERY_KEY,
    queryFn: getGames,
    placeholderData: (previousData) => previousData,
    staleTime: GAMES_STALE_TIME,
    meta: { persist: true },
  });
}

export function useGamePackagesQuery(gameId: number | null | undefined) {
  return useQuery({
    queryKey: gamePackagesQueryKey(gameId),
    queryFn: () => getPackagesByGame(gameId as number),
    enabled: Boolean(gameId),
    placeholderData: (previousData) => previousData,
    staleTime: GAME_PACKAGES_STALE_TIME,
    meta: { persist: true },
  });
}

export function useRefreshGamesQuery() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEY });
  };
}
