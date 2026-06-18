import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getGamePackagesByGame } from './api';
import type { PublicGamePackage } from '@/features/games/contracts';

const GAME_PACKAGES_STALE_TIME = 1000 * 60 * 10;

export const packagesKeys = {
  all: ['packages'] as const,
  byGame: (gameId: number | null | undefined) => ['packages', 'by-game', gameId ?? null] as const,
};

export function useGamePackagesQuery<TData = PublicGamePackage[]>(
  gameId: number | null | undefined,
  options?: {
    select?: (packages: PublicGamePackage[]) => TData;
  },
) {
  return useQuery<PublicGamePackage[], Error, TData>({
    queryKey: packagesKeys.byGame(gameId),
    queryFn: () => getGamePackagesByGame(gameId as number),
    enabled: typeof gameId === 'number',
    placeholderData: keepPreviousData,
    staleTime: GAME_PACKAGES_STALE_TIME,
    meta: { persist: true },
    select: options?.select,
  });
}
