import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTE_PATHS } from './routes';
import { RequireAuth } from '@/app/router/RequireAuth';
import { LoadingState } from '@/shared/components';
import { HomePage } from '@/features/home/pages/HomePage';
import { GamesPage } from '@/features/games/pages/GamePage';
import { GamePackagePage } from '@/features/packages/pages/PackagePage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { WalletPage } from '@/features/wallet/pages/WalletPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { ProfilePage } from '@/features/users/pages/ProfilePage';
const PackageAdminPage = lazy(() => import('@/features/packages/pages/PackageAdminPage').then((module) => ({ default: module.PackageAdminPage })));

const AdminLayoutPage = lazy(() => import('@/app/admin/AdminLayoutPage').then((module) => ({ default: module.AdminLayoutPage })));
const DashboardAdminPage = lazy(() => import('@/features/dashboard/pages/DashboardAdminPage').then((module) => ({ default: module.DashboardAdminPage })));
const UserAdminPage = lazy(() => import('@/features/users/pages/UserAdminPage').then((module) => ({ default: module.UserAdminPage })));
const GameAdminPage = lazy(() => import('@/features/games/pages/GameAdminPage').then((module) => ({ default: module.GameAdminPage })));
const AdminOrdersPage = lazy(() => import('@/features/orders/pages/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })));
const DepositAdminPage = lazy(() => import('@/features/deposits/pages/DepositAdminPage').then((module) => ({ default: module.DepositAdminPage })));

import { UserRole } from '@/features/users/types';

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.home} element={<HomePage />} />
      <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
      <Route path={ROUTE_PATHS.games} element={<GamesPage />} />
      <Route path={ROUTE_PATHS.gameDetail} element={<GamePackagePage />} />
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
          <Suspense fallback={<LoadingState className="min-h-[50vh]" title="Đang tải trang..." />}>
            <RequireAuth role={UserRole.Admin}>
              <AdminLayoutPage />
            </RequireAuth>
          </Suspense>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardAdminPage />} />
        <Route path="users" element={<UserAdminPage />} />
        <Route path="games" element={<GameAdminPage />} />
        <Route path="games/:gameId/packages" element={<PackageAdminPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="deposits" element={<DepositAdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
    </Routes>
  );
}
