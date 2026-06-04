import { useGamesQuery, useGamePackagesQuery } from '../services/games';
import type { Game, GamePackage } from '../types';

export type GameOrderPackage = GamePackage & {
  discount: number;
};

function isSelectablePackage(pkg: GamePackage) {
  return pkg.isActive && pkg.stockQuantity > 0;
}

function getPackageDiscount(pkg: GamePackage) {
  if (pkg.originalPrice <= 0) return 0;

  return Math.max(0, Math.round(100 - (pkg.salePrice / pkg.originalPrice) * 100));
}

export function useGameOrderGame(gameId: number | undefined) {
  return useGamesQuery({
    select: (games: Game[]) => games.find((game) => game.id === gameId) ?? null,
  });
}

export function useGameOrderPackages(gameId: number | undefined) {
  return useGamePackagesQuery(gameId, {
    select: (packages: GamePackage[]) =>
      packages
        .filter(isSelectablePackage)
        .map<GameOrderPackage>((pkg) => ({
          ...pkg,
          discount: getPackageDiscount(pkg),
        })),
  });
}
