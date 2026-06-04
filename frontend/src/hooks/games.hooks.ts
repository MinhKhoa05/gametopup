import { useEffect, useState } from 'react';
import { Route } from '../lib/routes';
import { Game, GamePackage } from '../types';
import { useGamePackagesQuery, useGamesQuery } from '../services/games';

const EMPTY_GAMES: Game[] = [];
const EMPTY_PACKAGES: GamePackage[] = [];

function getDefaultPackageId(packages: GamePackage[]) {
  return packages.find(isSelectablePackage)?.id ?? packages[0]?.id ?? null;
}

function isSelectablePackage(pkg: GamePackage) {
  return pkg.isActive && pkg.stockQuantity > 0;
}

export function useGameCatalog(route: Route) {
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const gamesQuery = useGamesQuery();
  const routeGameId = route.name === 'games' ? route.gameId : undefined;
  const shouldLoadPackages = route.name === 'games' && routeGameId !== undefined;
  const games = gamesQuery.data ?? EMPTY_GAMES;
  const selectedGame = games.find((game) => game.id === routeGameId) ?? games[0] ?? null;
  const packagesQuery = useGamePackagesQuery(shouldLoadPackages ? selectedGame?.id : undefined);
  const selectedGamePackages = packagesQuery.data ?? EMPTY_PACKAGES;
  const selectedPackage = selectedGamePackages.find((item) => item.id === selectedPackageId && isSelectablePackage(item)) ?? null;
  const filteredGames = normalizedQuery
    ? games.filter((game) => game.name.toLowerCase().includes(normalizedQuery))
    : games;

  useEffect(() => {
    if (!selectedGame) {
      setSelectedPackageId(null);
      return;
    }

    const nextSelectedPackageId = getDefaultPackageId(selectedGamePackages);

    setSelectedPackageId((current) => {
      if (current !== null) {
        const currentPackage = selectedGamePackages.find((item) => item.id === current);
        if (currentPackage && isSelectablePackage(currentPackage)) {
          return current;
        }
      }

      return nextSelectedPackageId;
    });
  }, [selectedGame?.id, selectedGamePackages]);

  return {
    filteredGames,
    gamesError: gamesQuery.error,
    games,
    gamesLoading: gamesQuery.isPending && !gamesQuery.data,
    packagesError: packagesQuery.error,
    packages: selectedGamePackages,
    packagesLoading: packagesQuery.isPending && !packagesQuery.data,
    query,
    selectedGame,
    selectedPackage,
    selectedPackageId,
    setQuery,
    setSelectedPackageId,
  };
}
