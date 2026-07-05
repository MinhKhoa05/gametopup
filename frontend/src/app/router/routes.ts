import { generatePath } from 'react-router-dom';

export const ADMIN_SECTIONS = ['dashboard', 'games', 'orders', 'deposits', 'users'] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export const ROUTE_PATHS = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  games: '/games',
  gameDetail: '/games/:gameId',
  wallet: '/wallet',
  orders: '/orders',
  profile: '/profile',
  admin: '/admin',
  adminSection: '/admin/:section',
  adminGamePackages: '/admin/games/:gameId/packages',
} as const;

export function isAdminRoutePath(pathname: string) {
  return pathname === ROUTE_PATHS.admin || pathname.startsWith(`${ROUTE_PATHS.admin}/`);
}

export function isAuthRoutePath(pathname: string) {
  return pathname === ROUTE_PATHS.login || pathname === ROUTE_PATHS.register;
}

export function isGameDetailRoutePath(pathname: string) {
  return pathname.startsWith(`${ROUTE_PATHS.games}/`) && pathname !== ROUTE_PATHS.games;
}

export const routes = {
  home: () => ROUTE_PATHS.home,
  login: () => ROUTE_PATHS.login,
  register: () => ROUTE_PATHS.register,
  games: () => ROUTE_PATHS.games,
  gameDetail: (gameId: number) => generatePath(ROUTE_PATHS.gameDetail, { gameId: String(gameId) }),
  wallet: () => ROUTE_PATHS.wallet,
  orders: () => ROUTE_PATHS.orders,
  profile: () => ROUTE_PATHS.profile,
  admin: (section?: AdminSection) => (section && section !== 'dashboard' ? generatePath(ROUTE_PATHS.adminSection, { section }) : ROUTE_PATHS.admin),
  adminGamePackages: (gameId: number) => generatePath(ROUTE_PATHS.adminGamePackages, { gameId: String(gameId) }),
} as const;
