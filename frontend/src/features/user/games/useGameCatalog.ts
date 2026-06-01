import { useEffect, useMemo, useState } from 'react';
import { getApiMessage } from '../../../lib/api';
import { Route } from '../../../lib/routes';
import { Game, GamePackage } from '../../../types';
import { getGames, getPackagesByGame } from './gameService';

export function useGameCatalog(route: Route, setError: (message: string | null) => void) {
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [gamesLoading, setGamesLoading] = useState(true);
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
    let mounted = true;

    async function loadGames() {
      setGamesLoading(true);
      setError(null);

      try {
        const gameData = await getGames();
        if (mounted) setGames(gameData);
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
  }, [setError]);

  useEffect(() => {
    if (route.name !== 'games' || !selectedGame?.id) {
      setPackages([]);
      setSelectedPackageId(null);
      return;
    }

    let mounted = true;

    async function loadPackages() {
      setPackagesLoading(true);
      setError(null);

      try {
        const data = await getPackagesByGame(selectedGame.id);
        if (!mounted) return;

        setPackages(data);
        setSelectedPackageId(data.find((item) => item.isActive && item.stockQuantity > 0)?.id ?? data[0]?.id ?? null);
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
  }, [route.name, selectedGame?.id, setError]);

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
