import { useEffect, useMemo, useState } from 'react';
import { Route } from '../lib/routes';
import { getApiMessage } from '../lib/api';
import { getGames, getPackagesByGame } from '../services/games.api';
import { GamePackage } from '../types';
import { useGamesStore } from '../store/games.store';
import { executeBackgroundFetch } from './common/useBackgroundFetch';

export function useGameCatalog(route: Route, setError: (message: string | null) => void) {
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  
  const emptyPackages = useMemo<GamePackage[]>(() => [], []);

  const games = useGamesStore((state) => state.games);
  const gamesLoading = useGamesStore((state) => state.gamesLoading);
  const routeGameId = route.name === 'games' ? route.gameId : undefined;
  
  const selectedGame = games.find((game) => game.id === routeGameId) ?? games[0] ?? null;
  const selectedGamePackages = useGamesStore((state) => {
    if (selectedGame?.id) return state.packagesByGame[selectedGame.id] ?? emptyPackages;
    return emptyPackages;
  });
  const packagesLoading = useGamesStore((state) => {
    if (!selectedGame?.id) return false;
    return state.packagesLoadingByGame[selectedGame.id] ?? false;
  });
  const selectedPackage = selectedGamePackages.find((item) => item.id === selectedPackageId) ?? null;

  useEffect(() => {
    let cancelled = false;

    async function refreshGames() {
      const current = useGamesStore.getState();
      await executeBackgroundFetch({
        hasData: current.games.length > 0,
        setLoading: current.setGamesLoading,
        setError,
        fetcher: getGames,
        onSuccess: (data) => {
          if (!cancelled) useGamesStore.getState().setGames(data);
        },
      });
    }

    refreshGames().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [setError]);

  const filteredGames = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return games;
    return games.filter((game) => game.name.toLowerCase().includes(normalized));
  }, [games, query]);

  useEffect(() => {
    if (route.name !== 'games' || !selectedGame?.id) {
      return;
    }

    let cancelled = false;

    async function refreshPackages() {
      const current = useGamesStore.getState();
      const existingPackages = current.packagesByGame[selectedGame.id] ?? [];
      
      await executeBackgroundFetch({
        hasData: existingPackages.length > 0,
        setLoading: (loading) => current.setPackagesLoadingForGame(selectedGame.id, loading),
        setError,
        fetcher: () => getPackagesByGame(selectedGame.id),
        onSuccess: (data) => {
          if (cancelled) return;
          useGamesStore.getState().setPackagesForGame(selectedGame.id, data);
          setSelectedPackageId(data.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? data[0]?.id ?? null);
        },
      });
    }

    refreshPackages().catch(() => undefined);

    const currentPackages = useGamesStore.getState().packagesByGame[selectedGame.id] ?? [];
    const selected = currentPackages.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? currentPackages[0]?.id ?? null;
    setSelectedPackageId(selected);

    return () => {
      cancelled = true;
    };
  }, [route.name, selectedGame?.id, setError]);

  return {
    filteredGames,
    games,
    gamesLoading,
    packages: selectedGamePackages,
    packagesLoading,
    query,
    selectedGame,
    selectedPackage,
    selectedPackageId,
    setQuery,
    setSelectedPackageId,
  };
}
