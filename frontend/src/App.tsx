import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryClient } from '@/shared/api/queryClient';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/server';
import { registerSessionExpiredHandler } from '@/app/session';
import { AppLayout } from '@/app/components/AppLayout';
import { AuthHeader } from '@/app/components/AuthHeader';
import { BottomNav } from '@/app/components/BottomNav';
import { AppHeader } from '@/app/components/AppHeader';
import { AppFooter } from '@/app/components/AppFooter';
import { AppRouter } from '@/app/router/AppRouter';
import { ROUTE_PATHS, isAdminRoutePath, isAuthRoutePath, isGameDetailRoutePath } from '@/app/router/routes';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = isAdminRoutePath(location.pathname);
  const isAuthRoute = isAuthRoutePath(location.pathname);
  const isTopupRoute = isGameDetailRoutePath(location.pathname);
  const [sessionExpiredAt, setSessionExpiredAt] = useState<number | null>(null);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setSessionExpiredAt(Date.now());
    });

    return () => {
      registerSessionExpiredHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!sessionExpiredAt) {
      return;
    }

    queryClient.clear();
    queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    setSessionExpiredAt(null);
    navigate(ROUTE_PATHS.login, {
      replace: true,
      state: { from: `${location.pathname}${location.search}${location.hash}` },
    });
  }, [location.pathname, navigate, sessionExpiredAt]);

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      isAuthRoute={isAuthRoute}
      header={<AppHeader />}
      authHeader={<AuthHeader />}
      footer={isTopupRoute || isAuthRoute ? undefined : <AppFooter />}
      bottomNav={isTopupRoute || isAuthRoute ? undefined : <BottomNav />}
    >
      <AppRouter />
    </AppLayout>
  );
}
