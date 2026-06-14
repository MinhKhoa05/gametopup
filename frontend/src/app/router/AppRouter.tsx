import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTE_PATHS } from './routes';
import { HomePage } from '@/features/home/pages/HomePage';
import { GamesPage } from '@/features/games/pages/GamesPage';
import { TopupPage } from '@/features/topup/pages/TopupPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { WalletPage } from '@/features/wallet/pages/WalletPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { AdminLayoutPage } from '@/features/admin/pages/AdminLayoutPage';
import { AdminDashboardPage } from '@/features/admin/dashboard/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/features/admin/users/AdminUsersPage';
import { AdminGamesPage } from '@/features/admin/games/AdminGamesPage';
import { AdminPackagesPage } from '@/features/admin/packages/AdminPackagesPage';
import { AdminOrdersPage } from '@/features/admin/orders/AdminOrdersPage';
import { AdminDepositsPage } from '@/features/admin/deposits/AdminDepositsPage';
import { RequireAdmin, RequireAuth } from '@/app/guards';

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.home} element={<HomePage />} />
      <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
      <Route path={ROUTE_PATHS.authLegacy} element={<Navigate to={ROUTE_PATHS.login} replace />} />
      <Route path={ROUTE_PATHS.games} element={<GamesPage />} />
      <Route path={ROUTE_PATHS.gameDetail} element={<GamesPage />} />
      <Route path={ROUTE_PATHS.topupLegacy} element={<TopupPage />} />
      <Route path={ROUTE_PATHS.topup} element={<TopupPage />} />
      <Route
        path={ROUTE_PATHS.wallet}
        element={
          <RequireAuth>
            <WalletPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.orders}
        element={
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        }
      />
      <Route path={ROUTE_PATHS.account} element={<Navigate to={ROUTE_PATHS.profile} replace />} />
      <Route
        path={ROUTE_PATHS.profile}
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.admin}
        element={
          <RequireAdmin>
            <AdminLayoutPage />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="games" element={<AdminGamesPage />} />
        <Route path="packages" element={<AdminPackagesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="deposits" element={<AdminDepositsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
    </Routes>
  );
}
