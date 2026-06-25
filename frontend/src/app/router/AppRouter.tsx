import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTE_PATHS } from './routes';
import { RequireAdmin, RequireAuth } from '@/app/guards';

const HomeGuestPage = lazy(() => import('@/features/home/pages/HomeGuestPage').then((module) => ({ default: module.HomeGuestPage })));
const GamesPage = lazy(() => import('@/features/games/pages/GamesPage').then((module) => ({ default: module.GamesPage })));
const GameDetailPage = lazy(() => import('@/features/games/pages/GameDetailPage').then((module) => ({ default: module.GameDetailPage })));
const AuthPage = lazy(() => import('@/features/auth/components/AuthPage').then((module) => ({ default: module.AuthPage })));
const WalletPage = lazy(() => import('@/features/wallet/pages/WalletPage').then((module) => ({ default: module.WalletPage })));
const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage').then((module) => ({ default: module.OrdersPage })));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AdminLayoutPage = lazy(() => import('@/features/admin/pages/AdminLayoutPage').then((module) => ({ default: module.AdminLayoutPage })));
const AdminDashboardPage = lazy(() => import('@/features/admin/dashboard/pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('@/features/admin/users/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })));
const AdminGamesPage = lazy(() => import('@/features/admin/games/AdminGamesPage').then((module) => ({ default: module.AdminGamesPage })));
const AdminPackagesPage = lazy(() => import('@/features/admin/packages/AdminPackagesPage').then((module) => ({ default: module.AdminPackagesPage })));
const AdminOrdersPage = lazy(() => import('@/features/admin/orders/AdminOrdersPage').then((module) => ({ default: module.AdminOrdersPage })));
const AdminDepositsPage = lazy(() => import('@/features/admin/deposits/AdminDepositsPage').then((module) => ({ default: module.AdminDepositsPage })));

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <Routes>
        <Route path={ROUTE_PATHS.homeGuest} element={<HomeGuestPage />} />
        <Route path={ROUTE_PATHS.login} element={<AuthPage mode="login" />} />
        <Route path={ROUTE_PATHS.register} element={<AuthPage mode="register" />} />
        <Route path={ROUTE_PATHS.games} element={<GamesPage />} />
        <Route path={ROUTE_PATHS.gameDetail} element={<GameDetailPage />} />
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
        <Route path="*" element={<Navigate to={ROUTE_PATHS.homeGuest} replace />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10 gt-text">
      <div className="rounded-3xl border border-white/10 bg-[var(--gt-panel)] px-6 py-4 text-sm shadow-xl shadow-black/20">
        Đang tải trang...
      </div>
    </div>
  );
}
