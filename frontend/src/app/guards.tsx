import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routes";
import { UserRole } from "@/features/auth/types";
import { useAuthUserQuery } from "@/features/auth/server";

type GuardProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: GuardProps) {
  const userQuery = useAuthUserQuery();
  const user = userQuery.data ?? null;
  const isChecking = userQuery.isPending && userQuery.data === undefined;
  const isAuthenticated = user !== null;

  if (isChecking) {
    return <GuardLoadingState />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  return children;
}

export function RequireAdmin({ children }: GuardProps) {
  const userQuery = useAuthUserQuery();
  const user = userQuery.data ?? null;
  const isChecking = userQuery.isPending && userQuery.data === undefined;
  const userRole = user?.role;

  if (isChecking) {
    return <GuardLoadingState />;
  }

  if (userRole !== UserRole.Admin) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
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
