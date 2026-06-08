import { AuthGate } from '@/features/auth/components/AuthGate';
import { GameOrderWizard } from '@/features/topup/components/GameOrderWizard';
import { AccountPage } from '@/features/user/pages/AccountPage';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { AuthPage } from '@/features/auth/pages/AuthPage';
import { GamesPage } from '@/features/games/pages/GamesPage';
import { HomePage } from '@/features/games/pages/HomePage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { WalletPage } from '@/features/wallet/pages/WalletPage';
import type { Route } from '@/lib/routes';
import type { User } from '@/features/user/user.types';

type AppRoutesProps = {
  isAdminRoute: boolean;
  onAdminLogout: () => void;
  route: Route;
  user: User | null;
};

export function AppRoutes({ isAdminRoute, onAdminLogout, route, user }: AppRoutesProps) {
  if (route.name === 'home') return <HomePage />;
  if (route.name === 'auth') return <AuthPage />;

  if (isAdminRoute) {
    return (
      <AuthGate required="admin" fallbackRoute={{ name: 'home' }}>
        <AdminPage onLogout={onAdminLogout} user={user} />
      </AuthGate>
    );
  }

  if (route.name === 'games' && !route.gameId) return <GamesPage />;
  if (route.name === 'games' && route.gameId) return <GameOrderWizard gameId={route.gameId} />;

  if (route.name === 'wallet') {
    return (
      <AuthGate required="authenticated" fallbackRoute={{ name: 'auth' }}>
        <WalletPage />
      </AuthGate>
    );
  }

  if (route.name === 'orders') {
    return (
      <AuthGate required="authenticated" fallbackRoute={{ name: 'auth' }}>
        <OrdersPage />
      </AuthGate>
    );
  }

  if (route.name === 'account') {
    return (
      <AuthGate required="authenticated" fallbackRoute={{ name: 'auth' }}>
        <AccountPage />
      </AuthGate>
    );
  }

  return null;
}
