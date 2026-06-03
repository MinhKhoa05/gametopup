import { useEffect, useMemo, useState } from 'react';
import { Route } from '../lib/routes';
import { isCacheFresh, readCachedJson, writeCachedJson } from '../lib/cache';
import { getApiMessage } from '../lib/api';
import { getGames, getPackagesByGame } from '../services/games.api';
import { GamePackage } from '../types';
import { gamesActions, useGamesStore } from '../store/games.store';

const GAMES_CACHE_KEY = 'gametopup.games.cache';
const GAMES_TTL_MS = 5 * 60 * 1000;

type CachedGames = {
  data: Array<{ id: number; name: string; imageUrl: string; isActive: boolean }>;
  fetchedAt: number;
};

type CachedPackages = Record<number, { data: GamePackage[]; fetchedAt: number }>;

function readInitialGames() {
  const snapshot = readCachedJson<CachedGames>(GAMES_CACHE_KEY);
  if (!snapshot) return null;
  if (!isCacheFresh(snapshot.fetchedAt, GAMES_TTL_MS)) return null;
  return snapshot;
}

function readInitialPackages() {
  return readCachedJson<CachedPackages>(`${GAMES_CACHE_KEY}.packages`) ?? {};
}

function persistGamesCache(data: CachedGames['data']) {
  const snapshot = { data, fetchedAt: Date.now() };
  writeCachedJson(GAMES_CACHE_KEY, snapshot);
  return snapshot;
}

function persistPackagesCache(gameId: number, data: GamePackage[]) {
  const nextPackages = readCachedJson<CachedPackages>(`${GAMES_CACHE_KEY}.packages`) ?? {};
  nextPackages[gameId] = { data, fetchedAt: Date.now() };
  writeCachedJson(`${GAMES_CACHE_KEY}.packages`, nextPackages);
}

export function useGameCatalog(route: Route, setError: (message: string | null) => void) {
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const cachedGamesSnapshot = useMemo(() => readInitialGames(), []);
  const cachedPackagesSnapshot = useMemo(() => readInitialPackages(), []);
  const emptyPackages = useMemo<GamePackage[]>(() => [], []);

  const storeGames = useGamesStore((state) => state.games);
  const storeGamesLoading = useGamesStore((state) => state.gamesLoading);
  const routeGameId = route.name === 'games' ? route.gameId : undefined;
  const games = storeGames.length > 0 ? storeGames : cachedGamesSnapshot?.data ?? [];
  const gamesLoading = storeGamesLoading || (!storeGames.length && !cachedGamesSnapshot);
  const selectedGame = games.find((game) => game.id === routeGameId) ?? games[0] ?? null;
  const selectedGamePackages = useGamesStore((state) => {
    if (selectedGame?.id) return state.packagesByGame[selectedGame.id] ?? cachedPackagesSnapshot[selectedGame.id]?.data ?? emptyPackages;
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
      const cached = readInitialGames();
      const shouldFetch = !cached || !isCacheFresh(cached.fetchedAt, GAMES_TTL_MS);

      if (!shouldFetch) return;

      if (current.games.length === 0 && !cachedGamesSnapshot) {
        gamesActions.setGamesLoading(true);
      }

      try {
        const data = await getGames();
        if (cancelled) return;

        persistGamesCache(data);
        gamesActions.setGames(data);
      } catch (error) {
        if (cancelled) return;
        if (current.games.length === 0 && !cachedGamesSnapshot) {
          setError(getApiMessage(error));
          gamesActions.setGamesLoading(false);
        }
      }
    }

    if (cachedGamesSnapshot && useGamesStore.getState().games.length === 0) {
      gamesActions.setGames(cachedGamesSnapshot.data);
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

    const cachedPackages = selectedGamePackages;
    const selected = cachedPackages.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? cachedPackages[0]?.id ?? null;
    setSelectedPackageId(selected);

    let cancelled = false;

    async function refreshPackages() {
      const current = useGamesStore.getState();
      const existingPackages = current.packagesByGame[selectedGame.id] ?? [];
      const fetchedAt = cachedPackagesSnapshot[selectedGame.id]?.fetchedAt ?? null;
      const shouldFetch = !existingPackages.length || !fetchedAt || !isCacheFresh(fetchedAt, GAMES_TTL_MS);

      if (!shouldFetch) return;

      if (existingPackages.length === 0 && !cachedPackagesSnapshot[selectedGame.id]) {
        gamesActions.setPackagesLoadingForGame(selectedGame.id, true);
      }

      try {
        const data = await getPackagesByGame(selectedGame.id);
        if (cancelled) return;

        persistPackagesCache(selectedGame.id, data);
        gamesActions.setPackagesForGame(selectedGame.id, data);
        setSelectedPackageId(data.find((item: GamePackage) => item.isActive && item.stockQuantity > 0)?.id ?? data[0]?.id ?? null);
      } catch (error) {
        if (cancelled) return;
        if (existingPackages.length === 0 && !cachedPackagesSnapshot[selectedGame.id]) {
          setError(getApiMessage(error));
          gamesActions.setPackagesLoadingForGame(selectedGame.id, false);
        }
      }
    }

    if (selectedGame?.id && cachedPackagesSnapshot[selectedGame.id] && useGamesStore.getState().packagesByGame[selectedGame.id]?.length === 0) {
      gamesActions.setPackagesForGame(selectedGame.id, cachedPackagesSnapshot[selectedGame.id].data);
    }

    refreshPackages().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [route.name, selectedGame?.id, selectedGamePackages, setError]);

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
