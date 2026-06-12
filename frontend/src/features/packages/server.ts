import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGamePackagesByGame } from './api';
import type { GamePackage } from '@/features/games/types';

const GAME_PACKAGES_STALE_TIME = 1000 * 60 * 10;

export const packagesKeys = {
  all: ['packages'] as const,
  byGame: (gameId: number | null | undefined) => ['packages', 'by-game', gameId ?? null] as const,
};

export function useGamePackagesQuery<TData = GamePackage[]>(
  gameId: number | null | undefined,
  options?: {
    select?: (packages: GamePackage[]) => TData;
  },
) {
  return useQuery<GamePackage[], Error, TData>({
    queryKey: packagesKeys.byGame(gameId),
    queryFn: () => getGamePackagesByGame(gameId as number),
    enabled: typeof gameId === 'number',
    placeholderData: keepPreviousData,
    staleTime: GAME_PACKAGES_STALE_TIME,
    meta: { persist: true },
    select: options?.select,
  });
}
