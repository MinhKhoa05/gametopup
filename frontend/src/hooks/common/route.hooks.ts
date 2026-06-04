import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { parseRoute, Route, routePath } from '../../lib/routes';

export function useRoute() {
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const [route, setRoute] = useState<Route>(() => parseRoute(location.pathname));
  useEffect(() => {
    setRoute(parseRoute(location.pathname));
  }, [location.pathname]);

  const navigate = useCallback((nextRoute: Route) => {
    const nextPath = routePath(nextRoute);

    routerNavigate(nextPath);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routerNavigate]);

  return { route, navigate };
}
