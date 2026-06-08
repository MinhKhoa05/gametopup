import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRoutes } from './components/app/AppRoutes';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import { useRoute } from './hooks/common/route.hooks';
import { AUTH_USER_QUERY_KEY } from '@/features/auth/api/auth';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useGameOrderStore } from '@/features/topup/store/topup.store';

export function App() {
  const { route, navigate } = useRoute();
  const auth = useAuthSession();
  const isAdminRoute = route.name === 'admin';
  const sessionExpiredAt = useAuthStore((state) => state.sessionExpiredAt);

  useEffect(() => {
    if (!sessionExpiredAt) {
      return;
    }

    queryClient.clear();
    queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    useAuthStore.getState().setGuest();
    useGameOrderStore.getState().resetWizard();
    navigate({ name: 'auth' });
  }, [navigate, sessionExpiredAt]);

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      header={<AppHeader />}
      footer={<AppFooter />}
      bottomNav={<BottomNav hasLogin={auth.isLoggedIn} />}
      toast={<Toaster richColors position="top-right" />}
    >
      <div className={route.name === 'home' || route.name === 'auth' || isAdminRoute ? '' : 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>
        <AppRoutes isAdminRoute={isAdminRoute} onAdminLogout={auth.handleLogout} route={route} user={auth.user} />
      </div>
    </AppLayout>
  );
}
