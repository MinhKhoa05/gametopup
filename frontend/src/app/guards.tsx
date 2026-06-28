import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routes";
import { UserRole } from "@/features/auth/types";
import { useAuthUserQuery } from "@/features/auth/server";
import { LoadingState } from "@/shared/components";

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
  return <LoadingState className="min-h-[50vh]" title="Dang kiem tra phien dang nhap..." />;
}
