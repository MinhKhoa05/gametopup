type CachedEntry<T> = {
  data: T;
  fetchedAt: number;
};

export type CacheEntry<T> = CachedEntry<T>;

export function createMemoryCache<T>() {
  let entry: CachedEntry<T> | null = null;

  return {
    get() {
      return entry;
    },
    set(data: T) {
      entry = {
        data,
        fetchedAt: Date.now(),
      };
      return entry;
    },
    clear() {
      entry = null;
    },
  };
}

export function isCacheFresh(fetchedAt: number, ttlMs: number) {
  return Date.now() - fetchedAt < ttlMs;
}

export function readCachedJson<T>(key: string) {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeCachedJson(key: string, value: unknown) {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache is best-effort only.
  }
}
