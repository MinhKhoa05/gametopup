import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import { parseRoute, Route, routePath } from '@/lib/routes';

export function useRoute() {
  const location = useLocation();
  const routerNavigate = useRouterNavigate();
  const route = useMemo(() => parseRoute(location.pathname), [location.pathname]);

  const navigate = useCallback((nextRoute: Route, options?: { replace?: boolean }) => {
    const nextPath = routePath(nextRoute);

    routerNavigate(nextPath, options);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [routerNavigate]);

  return { route, navigate };
}
