import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { ToastNotification } from './components/common/ToastNotification';
import { useAuthSession } from './features/auth/useAuthSession';
import { useGameCatalog } from './features/games/useGameCatalog';
import { useCheckoutOrder } from './features/orders/useCheckoutOrder';
import { useUserOrders } from './features/orders/useUserOrders';
import { useDepositRequests } from './features/wallet/useDepositRequests';
import { useWalletDeposit } from './features/wallet/useWalletDeposit';
import { useWalletTransactions } from './features/wallet/useWalletTransactions';
import { useAsyncAction } from './hooks/useAsyncAction';
import { useRoute } from './hooks/useRoute';
import { Route } from './lib/routes';
import { AccountPage } from './pages/AccountPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { GamesPage } from './pages/GamesPage';
import { HomePage } from './pages/HomePage';
import { OrdersPage } from './pages/OrdersPage';
import { WalletPage } from './pages/WalletPage';
import { BottomNav } from './components/layout/BottomNav';

export function App() {
  const { route, navigate } = useRoute();
  const action = useAsyncAction();
  const auth = useAuthSession({
    navigate,
    execute: action.execute,
  });
  const userOrders = useUserOrders(auth.user, action.execute);

  return (
    <div className="main-layout bg-ink text-slate-100">
      <AppHeader route={route} user={auth.user} wallet={userOrders.wallet} navigate={navigate} onLogout={auth.handleLogout} />

      <main className="main-content">
        {route.name === 'home' && (
          <HomeRoute
            auth={auth}
            busy={action.isLoading}
            ordersCount={userOrders.orders.length}
            setError={action.setErrorMessage}
            wallet={userOrders.wallet}
            navigate={navigate}
          />
        )}

        {route.name !== 'home' && (
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {route.name === 'games' && !route.gameId && (
              <GamesRoute
                authLoading={auth.authLoading}
                route={route}
                setError={action.setErrorMessage}
                navigate={navigate}
              />
            )}

            {route.name === 'games' && route.gameId && (
              <GameDetailRoute
                busy={action.isLoading}
                route={route}
                execute={action.execute}
                setError={action.setErrorMessage}
                user={auth.user}
                refreshUserArea={userOrders.refreshUserArea}
                navigate={navigate}
              />
            )}

            {route.name === 'wallet' && (
              <WalletRoute
                busy={action.isLoading}
                execute={action.execute}
                setError={action.setErrorMessage}
                user={auth.user}
                wallet={userOrders.wallet}
                refreshUserArea={userOrders.refreshUserArea}
                navigate={navigate}
              />
            )}

            {route.name === 'orders' && (
              <OrdersPage orders={userOrders.orders} busy={action.isLoading} onPay={userOrders.handlePay} navigate={navigate} />
            )}

            {route.name === 'account' && (
              <AccountPage
                authMode={auth.authMode}
                setAuthMode={auth.setAuthMode}
                form={auth.authForm}
                setForm={auth.setAuthForm}
                user={auth.user}
                wallet={userOrders.wallet}
                busy={action.isLoading}
                onSubmit={auth.handleAuth}
                onLogout={auth.handleLogout}
              />
            )}
          </div>
        )}
      </main>

      <AppFooter navigate={navigate} />
      <BottomNav route={route} navigate={navigate} />
      <ToastNotification loading={action.isLoading} message={action.successMessage} error={action.errorMessage} />
    </div>
  );
}

type AuthSession = ReturnType<typeof useAuthSession>;
type ExecuteAction = ReturnType<typeof useAsyncAction>['execute'];
type SetError = ReturnType<typeof useAsyncAction>['setErrorMessage'];
type UserArea = ReturnType<typeof useUserOrders>;

function HomeRoute({
  auth,
  busy,
  ordersCount,
  setError,
  wallet,
  navigate,
}: {
  auth: AuthSession;
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
      packagesCount={0}
      ordersCount={ordersCount}
      user={auth.user}
      wallet={wallet}
      authMode={auth.authMode}
      setAuthMode={auth.setAuthMode}
      authForm={auth.authForm}
      setAuthForm={auth.setAuthForm}
      busy={busy}
      navigate={navigate}
      onAuth={auth.handleAuth}
      onLogout={auth.handleLogout}
    />
  );
}

function GamesRoute({
  authLoading,
  route,
  setError,
  navigate,
}: {
  authLoading: boolean;
  route: Route;
  setError: SetError;
  navigate: (route: Route) => void;
}) {
  const catalog = useGameCatalog(route, setError);

  return (
    <GamesPage
      games={catalog.filteredGames}
      loading={authLoading || catalog.gamesLoading}
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
  user,
  refreshUserArea,
  navigate,
}: {
  busy: boolean;
  route: Route;
  execute: ExecuteAction;
  setError: SetError;
  user: AuthSession['user'];
  refreshUserArea: UserArea['refreshUserArea'];
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
      packages={catalog.packages}
      packagesLoading={catalog.packagesLoading}
      selectedPackageId={catalog.selectedPackageId}
      setSelectedPackageId={catalog.setSelectedPackageId}
      user={user}
      quantity={checkout.quantity}
      setQuantity={checkout.setQuantity}
      gameAccountInfo={checkout.gameAccountInfo}
      setGameAccountInfo={checkout.setGameAccountInfo}
      total={checkout.total}
      selectedPackage={catalog.selectedPackage}
      busy={busy}
      onSubmit={checkout.handlePlaceOrder}
      navigate={navigate}
    />
  );
}

function WalletRoute({
  busy,
  execute,
  setError,
  user,
  wallet,
  refreshUserArea,
  navigate,
}: {
  busy: boolean;
  execute: ExecuteAction;
  setError: SetError;
  user: AuthSession['user'];
  wallet: UserArea['wallet'];
  refreshUserArea: UserArea['refreshUserArea'];
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
      user={user}
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
      onSubmit={deposit.handleCreateDeposit}
      onConfirm={deposit.handleConfirmTransfer}
      navigate={navigate}
    />
  );
}
