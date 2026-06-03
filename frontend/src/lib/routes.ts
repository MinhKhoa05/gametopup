export type Route =
  | { name: 'home' }
  | { name: 'games'; gameId?: number }
  | { name: 'wallet' }
  | { name: 'orders' }
  | { name: 'account' }
  | { name: 'admin'; section?: 'dashboard' | 'games' | 'packages' | 'orders' | 'users' };

export function parseRoute(pathname = window.location.pathname): Route {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'games') {
    return { name: 'games', gameId: segments[1] ? Number(segments[1]) : undefined };
  }

  if (segments[0] === 'wallet') return { name: 'wallet' };
  if (segments[0] === 'orders') return { name: 'orders' };
  if (segments[0] === 'account') return { name: 'account' };
  if (segments[0] === 'admin') {
    const section = segments[1];
    if (section === 'games' || section === 'packages' || section === 'orders' || section === 'users') {
      return { name: 'admin', section };
    }
    return { name: 'admin', section: 'dashboard' };
  }

  return { name: 'home' };
}

export function routePath(route: Route) {
  if (route.name === 'games') return route.gameId ? `/games/${route.gameId}` : '/games';
  if (route.name === 'wallet') return '/wallet';
  if (route.name === 'orders') return '/orders';
  if (route.name === 'account') return '/account';
  if (route.name === 'admin') return route.section && route.section !== 'dashboard' ? `/admin/${route.section}` : '/admin';

  return '/';
}
