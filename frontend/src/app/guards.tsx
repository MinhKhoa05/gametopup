import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { ROUTE_PATHS } from '@/app/router/routes';

type GuardProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: GuardProps) {
  const auth = useAuthSession();
  const location = useLocation();

  if (auth.status === 'checking') {
    return <GuardLoadingState />;
  }

  if (auth.status !== 'authenticated') {
    return <Navigate to={ROUTE_PATHS.login} replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  }

  return children;
}

export function RequireAdmin({ children }: GuardProps) {
  const auth = useAuthSession();

  if (auth.status === 'checking') {
    return <GuardLoadingState />;
  }

  const role = auth.user?.role == null ? '' : String(auth.user.role).trim().toLowerCase();

  if (!auth.user || !(role === '1' || role === 'admin')) {
    return <Navigate to={ROUTE_PATHS.homeGuest} replace />;
  }

  return children;
}

function GuardLoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10 gt-text">
      <div className="rounded-3xl border border-white/10 bg-[var(--gt-panel)] px-6 py-4 text-sm shadow-xl shadow-black/20">
        Đang kiểm tra phiên đăng nhập...
      </div>
    </div>
  );
}
