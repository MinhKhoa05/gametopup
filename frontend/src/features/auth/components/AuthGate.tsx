import type { ReactNode } from 'react';
import type { Route } from '@/lib/routes';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import { useRoute } from '@/hooks/common/route.hooks';
import { isAdminUser } from '@/lib/roles';
import { EmptyState } from '@/components/ui';

type AuthGateProps = {
  children: ReactNode;
  fallbackRoute: Route;
  required: 'authenticated' | 'admin';
};

export function AuthGate({ children, fallbackRoute, required }: AuthGateProps) {
  const { authStatus, user } = useAuthSession();

  if (authStatus === 'checking') {
    return <AuthGateSkeleton />;
  }

  if (required === 'admin') {
    const allowed = Boolean(user && isAdminUser(user));
    if (!allowed) {
      return (
        <AccessDeniedNotice
          fallbackRoute={fallbackRoute}
          title="Bạn không có quyền truy cập trang này."
          description="Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục."
          actionLabel="Về trang chủ"
        />
      );
    }
  } else if (!user) {
    return (
      <AccessDeniedNotice
        fallbackRoute={fallbackRoute}
        title="Bạn cần đăng nhập để tiếp tục."
        description="Khu vực này chỉ dành cho tài khoản đã xác thực."
        actionLabel="Đăng nhập"
      />
    );
  }

  return children;
}

const AUTH_GUARD_EMPTY_STATE_CLASS = 'mx-auto max-w-lg py-16';

function AccessDeniedNotice({
  actionLabel,
  description,
  fallbackRoute,
  title,
}: {
  actionLabel: string;
  description: string;
  fallbackRoute: Route;
  title: string;
}) {
  const { navigate } = useRoute();

  return (
    <EmptyState
      className={AUTH_GUARD_EMPTY_STATE_CLASS}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={() => navigate(fallbackRoute)}
    />
  );
}

function AuthGateSkeleton() {
  return (
    <div className="mx-auto max-w-4xl" aria-busy="true" aria-label="Đang xác thực tài khoản">
      <div className="rounded-2xl border border-white/6 bg-ink-light p-6">
        <div className="mb-6 h-6 w-48 animate-pulse rounded-full bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/6" />
        </div>
        <div className="mt-4 h-12 animate-pulse rounded-xl bg-white/6" />
      </div>
    </div>
  );
}
