import type { FormEvent, ReactNode } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { EmptyState } from './components/ui/EmptyState';
import { ToastNotification } from './components/ui/ToastNotification';
import { useAuthSession } from './hooks/auth.hooks';
import { useAsyncAction } from './hooks/common/useAsyncAction';
import { useRoute } from './hooks/common/route.hooks';
import { useGameCatalog } from './hooks/games.hooks';
import { useCheckoutOrder, useUserOrders } from './hooks/orders.hooks';
import { useDepositRequests, useWalletDeposit, useWalletTransactions } from './hooks/wallet.hooks';
import { isAdminUser } from './lib/roles';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/admin/AdminPage';
import { GameOrderPage } from './pages/GameOrderPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import { useWalletStore } from './store/wallet.store';
import type { AuthFormState, AuthMode, AuthStatus, CachedUser, User, WalletInfo } from './types';

export function App() {
  const { route, navigate } = useRoute();
  const action = useAsyncAction();
  const auth = useAuthSession({ navigate, execute: action.execute });
  const user = auth.user;
  const authStatus = auth.authStatus;
  const cachedUser = auth.cachedUser;
  const userOrders = useUserOrders(user, authStatus, cachedUser, action.execute, action.setErrorMessage);
  const wallet = useWalletStore((state) => state.wallet);
  const isAdminRoute = route.name === 'admin';

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
          cachedUser={cachedUser}
          />
      }
      footer={<AppFooter navigate={navigate} />}
      bottomNav={<BottomNav route={route} navigate={navigate} hasLogin={Boolean(user || cachedUser)} />}
      toast={<ToastNotification loading={action.isLoading} message={action.successMessage} error={action.errorMessage} />}
    >
      {route.name === 'home' && (
        <HomeRoute
          authForm={auth.authForm}
          authMode={auth.authMode}
          authStatus={authStatus}
          user={auth.user}
          cachedUser={cachedUser}
          onAuth={auth.handleAuth}
          onLogout={auth.handleLogout}
          onChangeAuthForm={auth.setAuthForm}
          onSwitchAuthMode={auth.setAuthMode}
          busy={action.isLoading}
          ordersCount={userOrders.orders.length}
          setError={action.setErrorMessage}
          wallet={wallet}
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
              wallet={wallet}
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
                wallet={wallet}
                refreshUserArea={userOrders.refreshUserArea}
                user={user}
                authStatus={authStatus}
                cachedUser={cachedUser}
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
              cachedUser={cachedUser}
              wallet={wallet}
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
type WalletState = WalletInfo | null;

const AUTH_GUARD_EMPTY_STATE_CLASS = 'mx-auto max-w-lg py-16';

function HomeRoute({
  authForm,
  authMode,
  authStatus,
  user,
  cachedUser,
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
  authStatus: AuthStatus;
  user: User | null;
  cachedUser: CachedUser | null;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
  busy: boolean;
  ordersCount: number;
  setError: SetError;
  wallet: WalletState;
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
      authStatus={authStatus}
      user={user}
      cachedUser={cachedUser}
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
  wallet,
  user,
  navigate,
}: {
  busy: boolean;
  route: Route;
  execute: ExecuteAction;
  setError: SetError;
  refreshUserArea: UserArea['refreshUserArea'];
  wallet: WalletState;
  user: User | null;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route, setError);
  const checkout = useCheckoutOrder({
    refreshUserArea,
    execute,
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
      onResetCheckout={checkout.resetCheckout}
      onPayOrder={checkout.handlePayOrder}
      wallet={wallet}
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
  cachedUser,
  navigate,
}: {
  busy: boolean;
  execute: ExecuteAction;
  setError: SetError;
  wallet: WalletState;
  refreshUserArea: UserArea['refreshUserArea'];
  user: User | null;
  authStatus: AuthStatus;
  cachedUser: CachedUser | null;
  navigate: (route: Route) => void;
}) {
  const walletTransactions = useWalletTransactions(user, setError);
  const depositRequests = useDepositRequests(user, setError);
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
