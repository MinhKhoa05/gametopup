import type { Game, GamePackage } from '../../types';
import { createMemoryCache, isCacheFresh as isCacheFreshWithTtl, readCachedJson, writeCachedJson } from '../../lib/cache';

const PUBLIC_CACHE_TTL_MS = 5 * 60 * 1000;
const GAMES_CACHE_KEY = 'gametopup.public.games';
const PACKAGES_CACHE_KEY = 'gametopup.public.packages';

type CachedEntry<T> = {
  data: T;
  fetchedAt: number;
};

type PackagesCache = Record<string, CachedEntry<GamePackage[]>>;

const gamesCache = createMemoryCache<Game[]>();
const packagesCache: { current: PackagesCache } = {
  current: {},
};

function loadInitialCache() {
  if (gamesCache.get() || Object.keys(packagesCache.current).length > 0) return;

  const games = readCachedJson<CachedEntry<Game[]>>(GAMES_CACHE_KEY);
  const packages = readCachedJson<PackagesCache>(PACKAGES_CACHE_KEY);

  if (games) {
    gamesCache.set(games.data);
    const current = gamesCache.get();
    if (current) current.fetchedAt = games.fetchedAt;
  }

  if (packages) packagesCache.current = packages;
}

loadInitialCache();

export function getCachedGames() {
  loadInitialCache();
  return gamesCache.get();
}

export function setCachedGames(data: Game[]) {
  const entry = gamesCache.set(data);
  writeCachedJson(GAMES_CACHE_KEY, entry);
}

export function getCachedPackages(gameId: number) {
  loadInitialCache();
  return packagesCache.current[String(gameId)] ?? null;
}

export function setCachedPackages(gameId: number, data: GamePackage[]) {
  const entry = { data, fetchedAt: Date.now() };
  packagesCache.current[String(gameId)] = entry;
  writeCachedJson(PACKAGES_CACHE_KEY, packagesCache.current);
}

export function isCacheFresh(fetchedAt: number) {
  return isCacheFreshWithTtl(fetchedAt, PUBLIC_CACHE_TTL_MS);
}
