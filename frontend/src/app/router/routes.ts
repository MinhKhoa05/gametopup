import { generatePath } from 'react-router-dom';

export const ADMIN_SECTIONS = ['dashboard', 'games', 'packages', 'orders', 'deposits', 'users'] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export const ROUTE_PATHS = {
  home: '/',
  auth: '/auth',
  games: '/games',
  gameDetail: '/games/:gameId',
  topupLegacy: '/topup/:gameId',
  topup: '/topup/:gameId/step/:step',
  wallet: '/wallet',
  orders: '/orders',
  profile: '/profile',
  account: '/account',
  admin: '/admin',
  adminSection: '/admin/:section',
} as const;

export const routes = {
  home: () => ROUTE_PATHS.home,
  auth: () => ROUTE_PATHS.auth,
  games: () => ROUTE_PATHS.games,
  gameDetail: (gameId: number) => generatePath(ROUTE_PATHS.gameDetail, { gameId: String(gameId) }),
  topup: (gameId: number, step = 1) => generatePath(ROUTE_PATHS.topup, { gameId: String(gameId), step: String(step) }),
  wallet: () => ROUTE_PATHS.wallet,
  orders: () => ROUTE_PATHS.orders,
  profile: () => ROUTE_PATHS.profile,
  admin: (section?: AdminSection) => (section && section !== 'dashboard' ? generatePath(ROUTE_PATHS.adminSection, { section }) : ROUTE_PATHS.admin),
} as const;
