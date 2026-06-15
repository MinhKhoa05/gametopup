import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { queryClient } from '@/shared/api/queryClient';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/server';
import { registerSessionExpiredHandler } from '@/app/session';
import { AppLayout } from '@/app/components/AppLayout';
import { AuthHeader } from '@/app/components/AuthHeader';
import { BottomNav } from '@/app/components/BottomNav';
import { SiteHeader } from '@/app/components/SiteHeader';
import { Footer } from '@/app/site-shell/Footer';
import { AppRouter } from '@/app/router/AppRouter';
import { ROUTE_PATHS } from '@/app/router/routes';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname === ROUTE_PATHS.admin || location.pathname.startsWith(`${ROUTE_PATHS.admin}/`);
  const isAuthRoute =
    location.pathname === ROUTE_PATHS.login ||
    location.pathname === ROUTE_PATHS.register ||
    location.pathname === ROUTE_PATHS.authLegacy;
  const isTopupRoute = location.pathname.startsWith('/topup/') || (location.pathname.startsWith('/games/') && location.pathname !== ROUTE_PATHS.games);
  const footerVariant = location.pathname === ROUTE_PATHS.home ? 'full' : 'minimal';
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
      state: { from: location.pathname },
    });
  }, [location.pathname, navigate, sessionExpiredAt]);

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      isAuthRoute={isAuthRoute}
      header={<SiteHeader />}
      authHeader={<AuthHeader />}
      footer={isTopupRoute || isAuthRoute ? undefined : <Footer variant={footerVariant} />}
      bottomNav={isTopupRoute || isAuthRoute ? undefined : <BottomNav />}
    >
      <AppRouter />
    </AppLayout>
  );
}
