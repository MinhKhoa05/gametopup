import { AppFooter } from './components/layout/AppFooter';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { ToastNotification } from './components/common/ToastNotification';
import { AdminPage } from './features/admin/pages/AdminPage';
import { useAuthSession } from './features/auth/hooks/useAuthSession';
import { useGameCatalog } from './features/games/hooks/useGameCatalog';
import { useCheckoutOrder } from './features/orders/hooks/useCheckoutOrder';
import { useUserOrders } from './features/orders/hooks/useUserOrders';
import { useDepositRequests } from './features/wallet/hooks/useDepositRequests';
import { useWalletDeposit } from './features/wallet/hooks/useWalletDeposit';
import { useWalletTransactions } from './features/wallet/hooks/useWalletTransactions';
import { useAsyncAction } from './hooks/useAsyncAction';
import { useRoute } from './hooks/useRoute';
import { Route } from './lib/routes';
import { AccountPage } from './features/user/pages/AccountPage';
import { GameDetailPage } from './features/games/pages/GameDetailPage';
import { GamesPage } from './features/games/pages/GamesPage';
import { HomePage } from './features/home/pages/HomePage';
import { OrdersPage } from './features/orders/pages/OrdersPage';
import { WalletPage } from './features/wallet/pages/WalletPage';
import { useAuthStore } from './store/auth.store';

export function App() {
  const { route, navigate } = useRoute();
  const action = useAsyncAction();
  const auth = useAuthSession({
    navigate,
    execute: action.execute,
  });
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const userOrders = useUserOrders(user, action.execute);
  const isAdminRoute = route.name === 'admin';

  return (
    <div className="main-layout bg-ink text-slate-100">
      {!isAdminRoute && <AppHeader route={route} wallet={userOrders.wallet} navigate={navigate} onLogout={auth.handleLogout} />}

      <main className="main-content">
        {route.name === 'home' && (
          <HomeRoute
            onAuth={auth.handleAuth}
            onLogout={auth.handleLogout}
            busy={action.isLoading}
            ordersCount={userOrders.orders.length}
            setError={action.setErrorMessage}
            wallet={userOrders.wallet}
            navigate={navigate}
          />
        )}

        {!isAdminRoute && route.name !== 'home' && (
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {route.name === 'games' && !route.gameId && (
              <GamesRoute authLoading={authLoading} route={route} setError={action.setErrorMessage} navigate={navigate} />
            )}

            {route.name === 'games' && route.gameId && (
              <GameDetailRoute
                busy={action.isLoading}
                route={route}
                execute={action.execute}
                setError={action.setErrorMessage}
                refreshUserArea={userOrders.refreshUserArea}
                navigate={navigate}
              />
            )}

            {route.name === 'wallet' && (
              <WalletRoute
                busy={action.isLoading}
                execute={action.execute}
                setError={action.setErrorMessage}
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
                wallet={userOrders.wallet}
                ordersCount={userOrders.orders.length}
                busy={action.isLoading}
                onSubmit={auth.handleAuth}
                onLogout={auth.handleLogout}
                onProfileUpdated={auth.handleProfileUpdated}
                execute={action.execute}
                navigate={navigate}
              />
            )}
          </div>
        )}

        {isAdminRoute && (
          <AdminPage
            busy={action.isLoading}
            execute={action.execute}
            navigate={navigate}
            onLogout={auth.handleLogout}
            route={route}
            setError={action.setErrorMessage}
          />
        )}
      </main>

      {!isAdminRoute && <AppFooter navigate={navigate} />}
      {!isAdminRoute && <BottomNav route={route} navigate={navigate} />}
      <ToastNotification loading={action.isLoading} message={action.successMessage} error={action.errorMessage} />
    </div>
  );
}

type ExecuteAction = ReturnType<typeof useAsyncAction>['execute'];
type SetError = ReturnType<typeof useAsyncAction>['setErrorMessage'];
type UserArea = ReturnType<typeof useUserOrders>;

function HomeRoute({
  onAuth,
  onLogout,
  busy,
  ordersCount,
  setError,
  wallet,
  navigate,
}: {
  onAuth: ReturnType<typeof useAuthSession>['handleAuth'];
  onLogout: ReturnType<typeof useAuthSession>['handleLogout'];
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
      wallet={wallet}
      busy={busy}
      navigate={navigate}
      onAuth={onAuth}
      onLogout={onLogout}
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

  return <GamesPage games={catalog.filteredGames} loading={authLoading || catalog.gamesLoading} query={catalog.query} setQuery={catalog.setQuery} navigate={navigate} />;
}

function GameDetailRoute({
  busy,
  route,
  execute,
  setError,
  refreshUserArea,
  navigate,
}: {
  busy: boolean;
  route: Route;
  execute: ExecuteAction;
  setError: SetError;
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
  wallet,
  refreshUserArea,
  navigate,
}: {
  busy: boolean;
  execute: ExecuteAction;
  setError: SetError;
  wallet: UserArea['wallet'];
  refreshUserArea: UserArea['refreshUserArea'];
  navigate: (route: Route) => void;
}) {
  const user = useAuthStore((state) => state.user);
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
      onSubmit={deposit.handleCreateDeposit}
      onConfirm={deposit.handleConfirmTransfer}
      navigate={navigate}
    />
  );
}
