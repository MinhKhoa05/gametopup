import { useEffect, useMemo, useState } from 'react';
import { getApiMessage } from '../lib/api';
import { Route } from '../lib/routes';
import { Game, GamePackage } from '../types';
import { getGames, getPackagesByGame } from '../services/games.api';
import { getCachedGames, getCachedPackages, isCacheFresh, setCachedGames, setCachedPackages } from './common/gameCatalogCache';

export function useGameCatalog(route: Route, setError: (message: string | null) => void) {
  const cachedGames = getCachedGames();
  const [games, setGames] = useState<Game[]>(cachedGames?.data ?? []);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [gamesLoading, setGamesLoading] = useState(!cachedGames);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [query, setQuery] = useState('');

  const routeGameId = route.name === 'games' ? route.gameId : undefined;
  const selectedGame = games.find((game) => game.id === routeGameId) ?? games[0] ?? null;
  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? null;

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) => game.name.toLowerCase().includes(normalized));
  }, [games, query]);

  useEffect(() => {
    const hasGames = games.length > 0;

    if (cachedGames && isCacheFresh(cachedGames.fetchedAt)) {
      setGames(cachedGames.data);
      setGamesLoading(false);
      return;
    }

    let mounted = true;

    async function loadGames() {
      if (!hasGames) setGamesLoading(true);

      try {
        const gameData = await getGames();
        if (mounted) {
          setGames(gameData);
          setCachedGames(gameData);
        }
      } catch (err) {
        if (mounted) setError(getApiMessage(err));
      } finally {
        if (mounted) setGamesLoading(false);
      }
    }

    loadGames();

    return () => {
      mounted = false;
    };
  }, [cachedGames, games.length, setError]);

  useEffect(() => {
    if (route.name !== 'games' || !selectedGame?.id) {
      return;
    }

    const cachedPackages = getCachedPackages(selectedGame.id);
    if (cachedPackages && isCacheFresh(cachedPackages.fetchedAt)) {
      setPackages(cachedPackages.data);
      setSelectedPackageId(
        cachedPackages.data.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? cachedPackages.data[0]?.id ?? null,
      );
      setPackagesLoading(false);
      return;
    }

    let mounted = true;

    async function loadPackages() {
      if (packages.length === 0) setPackagesLoading(true);

      try {
        const data = await getPackagesByGame(selectedGame.id);
        if (!mounted) return;

        setPackages(data);
        setSelectedPackageId(data.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? data[0]?.id ?? null);
        setCachedPackages(selectedGame.id, data);
      } catch (err) {
        if (mounted) setError(getApiMessage(err));
      } finally {
        if (mounted) setPackagesLoading(false);
      }
    }

    loadPackages();

    return () => {
      mounted = false;
    };
  }, [route.name, selectedGame?.id, packages.length, setError]);

  return {
    filteredGames,
    games,
    gamesLoading,
    packages,
    packagesLoading,
    query,
    selectedGame,
    selectedPackage,
    selectedPackageId,
    setQuery,
    setSelectedPackageId,
  };
}
