export type Route =
  | { name: 'home' }
  | { name: 'games'; gameId?: number }
  | { name: 'wallet' }
  | { name: 'orders' }
  | { name: 'account' };

export function parseRoute(pathname = window.location.pathname): Route {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'games') {
    return { name: 'games', gameId: segments[1] ? Number(segments[1]) : undefined };
  }

  if (segments[0] === 'wallet') return { name: 'wallet' };
  if (segments[0] === 'orders') return { name: 'orders' };
  if (segments[0] === 'account') return { name: 'account' };

  return { name: 'home' };
}

export function routePath(route: Route) {
  if (route.name === 'games') return route.gameId ? `/games/${route.gameId}` : '/games';
  if (route.name === 'wallet') return '/wallet';
  if (route.name === 'orders') return '/orders';
  if (route.name === 'account') return '/account';

  return '/';
}
