import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { EmptyState } from './components/ui/EmptyState';
import { useAuthSession } from './hooks/auth.hooks';
import { useRoute } from './hooks/common/route.hooks';
import { queryClient } from './lib/queryClient';
import { useGameCatalog } from './hooks/games.hooks';
import { useUserOrders } from './hooks/orders.hooks';
import { isAdminUser } from './lib/roles';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/admin/AdminPage';
import { GameOrderPage } from './pages/GameOrderPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import { useAuthStore } from './store/auth.store';
import { useGameOrderStore } from './store/game-order.store';
import { AUTH_USER_QUERY_KEY } from './services/auth';
import type { AuthStatus, User, WalletInfo } from './types';

export function App() {
  const { route, navigate } = useRoute();
  const auth = useAuthSession({ navigate });
  const user = auth.user;
  const authStatus = auth.authStatus;
  const isLoggedIn = Boolean(user);
  const userOrders = useUserOrders(isLoggedIn);
  const wallet = userOrders.wallet;
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
    navigate({ name: 'account' });
  }, [navigate, sessionExpiredAt]);

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      header={
        <AppHeader
          route={route}
          wallet={wallet}
          navigate={navigate}
          onLogout={auth.handleLogout}
          authStatus={authStatus}
          user={user}
        />
      }
      footer={<AppFooter navigate={navigate} />}
      bottomNav={<BottomNav route={route} navigate={navigate} hasLogin={Boolean(user)} />}
      toast={<Toaster richColors position="top-right" />}
    >
      {route.name === 'home' && (
        <HomePage navigate={navigate} />
      )}

      {!isAdminRoute && route.name !== 'home' && (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {route.name === 'games' && !route.gameId && <GamesRoute route={route} navigate={navigate} />}

          {route.name === 'games' && route.gameId && (
            <GameDetailRoute route={route} navigate={navigate} />
          )}

          {route.name === 'wallet' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <WalletRoute wallet={wallet} user={user} navigate={navigate} />
            </AuthGuard>
          )}

          {route.name === 'orders' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <OrdersPage user={user} navigate={navigate} />
            </AuthGuard>
          )}

          {route.name === 'account' && (
            <AccountPage
              navigate={navigate}
            />
          )}
        </div>
      )}

      {isAdminRoute && (
        <AuthGuard authStatus={authStatus} user={user} required="admin" fallbackRoute={{ name: 'home' }} navigate={navigate}>
          <AdminPage navigate={navigate} onLogout={auth.handleLogout} route={route} user={user} />
        </AuthGuard>
      )}
      </AppLayout>
    );
  }

const AUTH_GUARD_EMPTY_STATE_CLASS = 'mx-auto max-w-lg py-16';
type WalletState = WalletInfo | null;

function AuthGuard({
  authStatus,
  children,
  fallbackRoute,
  required,
  navigate,
  user,
}: {
  authStatus: AuthStatus;
  children: ReactNode;
  fallbackRoute: Route;
  required: 'authenticated' | 'admin';
  navigate: (route: Route) => void;
  user: User | null;
}) {
  if (authStatus === 'unknown' || authStatus === 'checking') {
    return <AuthGuardSkeleton />;
  }

  if (required === 'admin') {
    const allowed = Boolean(user && isAdminUser(user));
    if (!allowed) {
      return (
        <AccessDeniedNotice
          navigate={navigate}
          fallbackRoute={fallbackRoute}
          title="Bạn không có quyền truy cập trang này."
          description="Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục."
          actionLabel="Về trang chủ"
        />
      );
    }
  } else if (!user) {
    return (
      <AccessDeniedNotice
        navigate={navigate}
        fallbackRoute={fallbackRoute}
        title="Bạn cần đăng nhập để tiếp tục."
        description="Khu vực này chỉ dành cho tài khoản đã xác thực."
        actionLabel="Đăng nhập"
      />
    );
  }

  return children;
}

function AccessDeniedNotice({
  actionLabel,
  description,
  fallbackRoute,
  navigate,
  title,
}: {
  actionLabel: string;
  description: string;
  fallbackRoute: Route;
  navigate: (route: Route) => void;
  title: string;
}) {
  return (
    <EmptyState
      className={AUTH_GUARD_EMPTY_STATE_CLASS}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={() => navigate(fallbackRoute)}
    />
  );
}

function AuthGuardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <div className="rounded-2xl border border-white/6 bg-ink-light p-6">
        <div className="mb-6 h-6 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
        </div>
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/6" />
      </div>
    </div>
  );
}

function GamesRoute({
  route,
  navigate,
}: {
  route: Route;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route);

  return (
    <GamesPage
      games={catalog.filteredGames}
      loading={catalog.gamesLoading}
      query={catalog.query}
      setQuery={catalog.setQuery}
      navigate={navigate}
    />
  );
}

function GameDetailRoute({
  route,
  navigate,
}: {
  route: Route;
  navigate: (route: Route) => void;
}) {
  return <GameOrderPage route={route} navigate={navigate} />;
}

function WalletRoute({
  wallet,
  user,
  navigate,
}: {
  wallet: WalletState;
  user: User | null;
  navigate: (route: Route) => void;
}) {
  return <WalletPage wallet={wallet} user={user} navigate={navigate} />;
}
