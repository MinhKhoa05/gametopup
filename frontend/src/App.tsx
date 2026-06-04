import type { FormEvent, ReactNode } from 'react';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { EmptyState } from './components/ui/EmptyState';
import { useAuthSession } from './hooks/auth.hooks';
import { useRoute } from './hooks/common/route.hooks';
import { useGameCatalog } from './hooks/games.hooks';
import { useCheckoutOrder, useUserOrders } from './hooks/orders.hooks';
import { isAdminUser } from './lib/roles';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/admin/AdminPage';
import { GameOrderPage } from './pages/GameOrderPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import type { AuthFormState, AuthMode, AuthStatus, User, WalletInfo } from './types';

export function App() {
  const { route, navigate } = useRoute();
  const auth = useAuthSession({ navigate });
  const user = auth.user;
  const authStatus = auth.authStatus;
  const isLoggedIn = Boolean(user);
  const userOrders = useUserOrders(isLoggedIn);
  const wallet = userOrders.wallet;
  const isAdminRoute = route.name === 'admin';

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      header={
        <AppHeader
          route={route}
          wallet={wallet}
          walletLoading={userOrders.walletLoading}
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
        <HomeRoute
          authForm={auth.authForm}
          authMode={auth.authMode}
          authStatus={authStatus}
          user={auth.user}
          onAuth={auth.handleAuth}
          onLogout={auth.handleLogout}
          onChangeAuthForm={auth.setAuthForm}
          onSwitchAuthMode={auth.setAuthMode}
          busy={auth.authBusy}
          ordersCount={userOrders.orders.length}
          wallet={wallet}
          navigate={navigate}
        />
      )}

      {!isAdminRoute && route.name !== 'home' && (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {route.name === 'games' && !route.gameId && <GamesRoute route={route} navigate={navigate} />}

          {route.name === 'games' && route.gameId && (
            <GameDetailRoute
              route={route}
              busy={false}
              wallet={wallet}
              user={user}
              navigate={navigate}
            />
          )}

          {route.name === 'wallet' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <WalletRoute wallet={wallet} user={user} navigate={navigate} />
            </AuthGuard>
          )}

          {route.name === 'orders' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <OrdersPage busy={userOrders.busy} user={user} navigate={navigate} />
            </AuthGuard>
          )}

          {route.name === 'account' && (
            <AccountPage
              authForm={auth.authForm}
              authMode={auth.authMode}
              user={user}
              authStatus={authStatus}
              wallet={wallet}
              ordersCount={userOrders.orders.length}
              busy={auth.authBusy}
              onSubmit={auth.handleAuth}
              onLogout={auth.handleLogout}
              onChangeAuthForm={auth.setAuthForm}
              onSwitchAuthMode={auth.setAuthMode}
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

function HomeRoute({
  authForm,
  authMode,
  authStatus,
  user,
  onAuth,
  onLogout,
  onChangeAuthForm,
  onSwitchAuthMode,
  busy,
  ordersCount,
  wallet,
  navigate,
}: {
  authForm: AuthFormState;
  authMode: AuthMode;
  authStatus: AuthStatus;
  user: User | null;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
  busy: boolean;
  ordersCount: number;
  wallet: WalletState;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog({ name: 'home' });

  return (
    <HomePage
      games={catalog.games}
      gamesLoading={catalog.gamesLoading}
      packagesCount={0}
      ordersCount={ordersCount}
      wallet={wallet}
      busy={busy}
      navigate={navigate}
      authForm={authForm}
      authMode={authMode}
      authStatus={authStatus}
      user={user}
      onAuth={onAuth}
      onLogout={onLogout}
      onChangeAuthForm={onChangeAuthForm}
      onSwitchAuthMode={onSwitchAuthMode}
    />
  );
}

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
  busy,
  route,
  wallet,
  user,
  navigate,
}: {
  busy: boolean;
  route: Route;
  wallet: WalletState;
  user: User | null;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route);
  const checkout = useCheckoutOrder({
    selectedPackage: catalog.selectedPackage,
  });

  return (
    <GameOrderPage
      game={catalog.selectedGame}
      gameLoading={catalog.gamesLoading}
      packages={catalog.packages}
      packagesLoading={catalog.packagesLoading}
      selectedPackageId={catalog.selectedPackageId}
      setSelectedPackageId={catalog.setSelectedPackageId}
      quantity={checkout.quantity}
      setQuantity={checkout.setQuantity}
      gameAccountInfo={checkout.gameAccountInfo}
      setGameAccountInfo={checkout.setGameAccountInfo}
      total={checkout.selectedTotal}
      checkoutStep={checkout.checkoutStep}
      checkoutPackage={checkout.checkoutPackage}
      checkoutGameAccountInfo={checkout.checkoutGameAccountInfo}
      checkoutQuantity={checkout.checkoutQuantity}
      checkoutSubtotal={checkout.checkoutSubtotal}
      checkoutTotal={checkout.checkoutTotal}
      checkoutOrderId={checkout.checkoutOrderId}
      checkoutSuccessAt={checkout.checkoutSuccessAt}
      onResetCheckout={checkout.resetCheckout}
      onPayOrder={checkout.handlePayOrder}
      wallet={wallet}
      selectedPackage={catalog.selectedPackage}
      busy={busy || checkout.busy}
      user={user}
      onSubmit={checkout.handlePlaceOrder}
      navigate={navigate}
    />
  );
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
  return <WalletPage wallet={wallet} busy={false} user={user} navigate={navigate} />;
}
