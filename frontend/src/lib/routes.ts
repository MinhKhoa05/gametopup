import type { GameOrderStep } from '../types';

export type Route =
  | { name: 'home' }
  | { name: 'games'; gameId?: number; step?: GameOrderStep }
  | { name: 'auth' }
  | { name: 'wallet' }
  | { name: 'orders' }
  | { name: 'account' }
  | { name: 'admin'; section?: 'dashboard' | 'games' | 'packages' | 'orders' | 'deposits' | 'users' };

function parseGameOrderStep(value: string | undefined): GameOrderStep | undefined {
  if (value === '1' || value === '2' || value === '3') {
    return Number(value) as GameOrderStep;
  }

  return undefined;
}

export function parseRoute(pathname = window.location.pathname): Route {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'games') {
    if (segments[2] === 'step') {
      return {
        name: 'games',
        gameId: segments[1] ? Number(segments[1]) : undefined,
        step: parseGameOrderStep(segments[3]),
      };
    }

    return { name: 'games', gameId: segments[1] ? Number(segments[1]) : undefined };
  }

  if (segments[0] === 'auth') return { name: 'auth' };
  if (segments[0] === 'wallet') return { name: 'wallet' };
  if (segments[0] === 'orders') return { name: 'orders' };
  if (segments[0] === 'account') return { name: 'account' };
  if (segments[0] === 'admin') {
    const section = segments[1];
    if (section === 'games' || section === 'packages' || section === 'orders' || section === 'deposits' || section === 'users') {
      return { name: 'admin', section };
    }
    return { name: 'admin', section: 'dashboard' };
  }

  return { name: 'home' };
}

export function routePath(route: Route) {
  if (route.name === 'games') {
    if (route.gameId) {
      return `/games/${route.gameId}/step/${route.step ?? 1}`;
    }

    return '/games';
  }
  if (route.name === 'auth') return '/auth';
  if (route.name === 'wallet') return '/wallet';
  if (route.name === 'orders') return '/orders';
  if (route.name === 'account') return '/account';
  if (route.name === 'admin') return route.section && route.section !== 'dashboard' ? `/admin/${route.section}` : '/admin';

  return '/';
}
