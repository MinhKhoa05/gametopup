import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/shared/api/queryClient';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/server';
import { registerSessionExpiredHandler } from '@/app/session';
import { AppLayout } from '@/app/components/AppLayout';
import { ScrollToTop } from '@/app/components/ScrollToTop';
import { AppRouter } from '@/app/router/AppRouter';
import { ROUTE_PATHS } from '@/app/router/routes';

export function App() {
  const navigate = useNavigate();
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
    navigate(ROUTE_PATHS.login, { replace: true });
  }, [navigate, sessionExpiredAt]);

  return (
    <AppLayout>
      <ScrollToTop />
      <AppRouter />
    </AppLayout>
  );
}
