import { useEffect, useState } from 'react';
import { parseRoute, Route, routePath } from '../lib/routes';

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute());

  useEffect(() => {
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(nextRoute: Route) {
    const nextPath = routePath(nextRoute);

    if (window.location.pathname === nextPath) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    window.history.pushState(null, '', nextPath);
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  return { route, navigate };
}
