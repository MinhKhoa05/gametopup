import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routes";
import { UserRole } from "@/features/auth/types";
import { useAuthUserQuery } from "@/features/auth/server";
import { LoadingState } from "@/shared/components";

type RequireAuthProps = {
  children: ReactNode;
  role?: UserRole;
};

export function RequireAuth({ children, role }: RequireAuthProps) {
  const { data: user, isPending } = useAuthUserQuery();

  if (isPending && user === undefined) {
    return <LoadingState className="min-h-[50vh]" title="Đang kiểm tra phiên đăng nhập..."/>;
  }

  if (!user) {
    return <Navigate to={ROUTE_PATHS.login} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  return children;
}