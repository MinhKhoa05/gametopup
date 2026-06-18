import type { PublicGame } from '../contracts';

export type CatalogPlatformFilter = 'all' | 'mobile' | 'pc' | 'console';
export type CatalogCategoryFilter = 'all' | 'featured' | 'mobile' | 'pc' | 'console' | 'international';
export type CatalogSortKey = 'featured' | 'newest' | 'name';
type GamePlatformKey = Exclude<CatalogPlatformFilter, 'all'>;

const FEATURED_LIMIT = 8;

const MOBILE_KEYWORDS = ['mobile', 'free fire', 'liên quân', 'lien quan', 'pubg', 'call of duty', 'cod mobile'];
const CONSOLE_KEYWORDS = ['console', 'playstation', 'ps5', 'ps4', 'xbox', 'nintendo', 'switch'];
const FEATURED_ORDER = [
  'liên quân mobile',
  'free fire',
  'pubg mobile',
  'valorant',
  'genshin impact',
  'league of legends',
  'fc online',
  'roblox',
  'call of duty: mobile',
  'minecraft',
] as const;

const TOPUP_LABELS: Array<[RegExp, string]> = [
  [/liên quân|lien quan/i, 'Quân Huy'],
  [/free fire/i, 'Kim Cương'],
  [/pubg/i, 'UC'],
  [/valorant/i, 'VP'],
  [/genshin/i, 'Genesis Crystal'],
  [/league of legends|lol/i, 'RP'],
  [/fc online/i, 'FC'],
  [/roblox/i, 'Robux'],
  [/call of duty/i, 'CP'],
  [/minecraft/i, 'Minecoin'],
];

export function buildFeaturedGameIds(games: PublicGame[]) {
  return new Set(games.slice(0, FEATURED_LIMIT).map((game) => game.id));
}

export function getGamePlatform(game: PublicGame): GamePlatformKey {
  const lowerName = game.name.toLowerCase();

  if (CONSOLE_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return 'console';
  }

  if (MOBILE_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return 'mobile';
  }

  return 'pc';
}

export function getGamePlatformLabel(game: PublicGame) {
  const platform = getGamePlatform(game);

  if (platform === 'mobile') return 'Mobile';
  if (platform === 'console') return 'Console';
  return 'PC';
}

export function getGameTopupLabel(game: PublicGame) {
  const lowerName = game.name.toLowerCase();
  const match = TOPUP_LABELS.find(([pattern]) => pattern.test(lowerName));

  return match?.[1] ?? 'gói nạp';
}

export function matchesPlatform(game: PublicGame, platformFilter: CatalogPlatformFilter) {
  if (platformFilter === 'all') {
    return true;
  }

  return getGamePlatform(game) === platformFilter;
}

export function matchesCategory(game: PublicGame, categoryFilter: CatalogCategoryFilter, featuredGameIds: Set<number>) {
  if (categoryFilter === 'all') {
    return true;
  }

  if (categoryFilter === 'featured') {
    return featuredGameIds.has(game.id);
  }

  if (categoryFilter === 'international') {
    return isInternationalGame(game);
  }

  return getGamePlatform(game) === categoryFilter;
}

export function sortCatalogGames(games: PublicGame[], sortKey: CatalogSortKey, featuredGameIds: Set<number>) {
  const list = [...games];

  if (sortKey === 'name') {
    return list.sort((left, right) => left.name.localeCompare(right.name, 'vi'));
  }

  if (sortKey === 'newest') {
    return list.sort((left, right) => right.id - left.id);
  }

  return list.sort((left, right) => {
    const leftOrder = getFeaturedOrderIndex(left.name);
    const rightOrder = getFeaturedOrderIndex(right.name);

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    const leftFeatured = featuredGameIds.has(left.id) ? 1 : 0;
    const rightFeatured = featuredGameIds.has(right.id) ? 1 : 0;

    if (leftFeatured !== rightFeatured) {
      return rightFeatured - leftFeatured;
    }

    return left.name.localeCompare(right.name, 'vi');
  });
}

function getFeaturedOrderIndex(name: string) {
  const normalized = name.toLowerCase();
  const index = FEATURED_ORDER.findIndex((item) => normalized.includes(item));
  return index === -1 ? FEATURED_ORDER.length : index;
}

function isInternationalGame(game: PublicGame) {
  const lowerName = game.name.toLowerCase();
  return (
    lowerName.includes('global') ||
    lowerName.includes('international') ||
    lowerName.includes('valorant') ||
    lowerName.includes('genshin') ||
    lowerName.includes('roblox') ||
    lowerName.includes('minecraft') ||
    lowerName.includes('pubg') ||
    lowerName.includes('league of legends') ||
    lowerName.includes('fc online') ||
    lowerName.includes('call of duty')
  );
}
