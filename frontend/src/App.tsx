import type { FormEvent, ReactNode } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ToastNotification } from './components/common/ToastNotification';
import { useAuthSession } from './hooks/auth.hooks';
import { useAsyncAction } from './hooks/common/useAsyncAction';
import { useRoute } from './hooks/common/route.hooks';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import { AdminPage } from './pages/admin/AdminPage';
import { EmptyState } from './components/common/EmptyState';
import { useGameCatalog } from './hooks/games.hooks';
import { useCheckoutOrder, useUserOrders } from './hooks/orders.hooks';
import { useDepositRequests, useWalletDeposit, useWalletTransactions } from './hooks/wallet.hooks';
import { isAdminUser } from './lib/roles';
import type { User } from './types';
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from './types/auth.types';

export function App() {
  const { route, navigate } = useRoute();
  const action = useAsyncAction();
  const auth = useAuthSession({ navigate, execute: action.execute });
  const user = auth.user;
  const authStatus = auth.authStatus;
  const userSnapshot = auth.userSnapshot;
  const userOrders = useUserOrders(user, authStatus, userSnapshot, action.execute, action.setErrorMessage);
  const isAdminRoute = route.name === 'admin';

  return (
    <AppLayout
      isAdminRoute={isAdminRoute}
      header={
        <AppHeader
          route={route}
          wallet={userOrders.wallet}
          navigate={navigate}
          onLogout={auth.handleLogout}
          authStatus={authStatus}
          user={user}
          userSnapshot={userSnapshot}
        />
      }
      footer={<AppFooter navigate={navigate} />}
      bottomNav={<BottomNav route={route} navigate={navigate} />}
      toast={<ToastNotification loading={action.isLoading} message={action.successMessage} error={action.errorMessage} />}
    >
      {route.name === 'home' && (
          <HomeRoute
          authForm={auth.authForm}
          authMode={auth.authMode}
          user={auth.user}
          onAuth={auth.handleAuth}
          onLogout={auth.handleLogout}
          onChangeAuthForm={auth.setAuthForm}
          onSwitchAuthMode={auth.setAuthMode}
          busy={action.isLoading}
          ordersCount={userOrders.orders.length}
          setError={action.setErrorMessage}
          wallet={userOrders.wallet}
          navigate={navigate}
        />
      )}

      {!isAdminRoute && route.name !== 'home' && (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {route.name === 'games' && !route.gameId && <GamesRoute route={route} setError={action.setErrorMessage} navigate={navigate} />}

          {route.name === 'games' && route.gameId && (
            <GameDetailRoute
              busy={action.isLoading}
              route={route}
              execute={action.execute}
              setError={action.setErrorMessage}
              refreshUserArea={userOrders.refreshUserArea}
              user={user}
              navigate={navigate}
            />
          )}

          {route.name === 'wallet' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <WalletRoute
                busy={action.isLoading}
                execute={action.execute}
                setError={action.setErrorMessage}
                wallet={userOrders.wallet}
                refreshUserArea={userOrders.refreshUserArea}
                user={user}
                authStatus={authStatus}
                userSnapshot={userSnapshot}
                navigate={navigate}
              />
            </AuthGuard>
          )}

          {route.name === 'orders' && (
            <AuthGuard authStatus={authStatus} user={user} required="authenticated" fallbackRoute={{ name: 'account' }} navigate={navigate}>
              <OrdersPage orders={userOrders.orders} busy={action.isLoading} onPay={userOrders.handlePay} navigate={navigate} />
            </AuthGuard>
          )}

          {route.name === 'account' && (
            <AccountPage
              authForm={auth.authForm}
              authMode={auth.authMode}
              user={user}
              authStatus={authStatus}
              userSnapshot={userSnapshot}
              wallet={userOrders.wallet}
              ordersCount={userOrders.orders.length}
              busy={action.isLoading}
              onSubmit={auth.handleAuth}
              onLogout={auth.handleLogout}
              onProfileUpdated={auth.handleProfileUpdated}
              onChangeAuthForm={auth.setAuthForm}
              onSwitchAuthMode={auth.setAuthMode}
              execute={action.execute}
              navigate={navigate}
            />
          )}
        </div>
      )}

      {isAdminRoute && (
        <AuthGuard authStatus={authStatus} user={user} required="admin" fallbackRoute={{ name: 'home' }} navigate={navigate}>
          <AdminPage
            busy={action.isLoading}
            execute={action.execute}
            navigate={navigate}
            onLogout={auth.handleLogout}
            route={route}
            setError={action.setErrorMessage}
            user={user}
          />
        </AuthGuard>
      )}
    </AppLayout>
  );
}

type ExecuteAction = ReturnType<typeof useAsyncAction>['execute'];
type SetError = ReturnType<typeof useAsyncAction>['setErrorMessage'];
type UserArea = ReturnType<typeof useUserOrders>;

function HomeRoute({
  authForm,
  authMode,
  user,
  onAuth,
  onLogout,
  onChangeAuthForm,
  onSwitchAuthMode,
  busy,
  ordersCount,
  setError,
  wallet,
  navigate,
}: {
  authForm: AuthFormState;
  authMode: AuthMode;
  user: User | null;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
  busy: boolean;
  ordersCount: number;
  setError: SetError;
  wallet: UserArea['wallet'];
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog({ name: 'home' }, setError);

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
        <EmptyState
          className="mx-auto max-w-lg py-16"
          title="Bạn không có quyền truy cập trang này."
          description="Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục."
          actionLabel="Về trang chủ"
          onAction={() => navigate(fallbackRoute)}
        />
      );
    }
  } else if (!user) {
    return (
      <EmptyState
        className="mx-auto max-w-lg py-16"
        title="Bạn cần đăng nhập để tiếp tục."
        description="Khu vực này chỉ dành cho tài khoản đã xác thực."
        actionLabel="Đăng nhập"
        onAction={() => navigate(fallbackRoute)}
      />
    );
  }

  return children;
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
  setError,
  navigate,
}: {
  route: Route;
  setError: SetError;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route, setError);

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
  execute,
  setError,
  refreshUserArea,
  user,
  navigate,
}: {
  busy: boolean;
  route: Route;
  execute: ExecuteAction;
  setError: SetError;
  refreshUserArea: UserArea['refreshUserArea'];
  user: User | null;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route, setError);
  const checkout = useCheckoutOrder({
    navigate,
    refreshUserArea,
    execute,
    selectedPackage: catalog.selectedPackage,
  });

  return (
    <GameDetailPage
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
      total={checkout.total}
      selectedPackage={catalog.selectedPackage}
      busy={busy}
      user={user}
      onSubmit={checkout.handlePlaceOrder}
      navigate={navigate}
    />
  );
}

function WalletRoute({
  busy,
  execute,
  setError,
  wallet,
  refreshUserArea,
  user,
  authStatus,
  userSnapshot,
  navigate,
}: {
  busy: boolean;
  execute: ExecuteAction;
  setError: SetError;
  wallet: UserArea['wallet'];
  refreshUserArea: UserArea['refreshUserArea'];
  user: User | null;
  authStatus: AuthStatus;
  userSnapshot: AuthUserSnapshot | null;
  navigate: (route: Route) => void;
}) {
  const walletTransactions = useWalletTransactions(user, authStatus, userSnapshot, setError);
  const depositRequests = useDepositRequests(user, authStatus, userSnapshot, setError);
  const deposit = useWalletDeposit({
    refreshUserArea: async () => {
      await refreshUserArea();
      await walletTransactions.refreshTransactions();
      await depositRequests.refreshDepositRequests();
    },
    execute,
  });

  return (
    <WalletPage
      wallet={wallet}
      amount={deposit.depositAmount}
      setAmount={deposit.setDepositAmount}
      deposit={deposit.deposit}
      clearDeposit={() => deposit.setDeposit(null)}
      depositRequests={depositRequests.depositRequests}
      depositRequestsLoading={depositRequests.depositRequestsLoading}
      transactions={walletTransactions.transactions}
      transactionsLoading={walletTransactions.transactionsLoading}
      busy={busy}
      user={user}
      onSubmit={deposit.handleCreateDeposit}
      onConfirm={deposit.handleConfirmTransfer}
      navigate={navigate}
    />
  );
}
