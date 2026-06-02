import { Home, LogOut, RotateCcw, UserRound } from 'lucide-react';
import { BrandLogo } from '../../../components/layout/BrandLogo';
import { HeaderAccountMenu } from '../../../components/layout/HeaderAccountMenu';
import { userDisplayName } from '../../../lib/labels';
import { Route } from '../../../lib/routes';
import { ADMIN_HEADER_SUBTITLES, SITE } from '../../../config/site';
import { useAuthStore } from '../../../store/auth.store';

export function AdminHeader({
  loading,
  navigate,
  onLogout,
  onRefresh,
  route,
}: {
  loading: boolean;
  navigate: (route: Route) => void;
  onLogout: () => void;
  onRefresh: () => Promise<void>;
  route: Extract<Route, { name: 'admin' }>;
}) {
  const user = useAuthStore((state) => state.user);
  const subtitleLabel = ADMIN_HEADER_SUBTITLES[route.section ?? 'dashboard'];
  const displayName = userDisplayName(user);

  return (
    <header className="sticky top-0 z-[45] border-b border-slate-400/12 bg-[linear-gradient(180deg,rgba(10,17,31,0.98)_0%,rgba(10,17,31,0.92)_100%)] shadow-[0_10px_30px_rgba(2,6,23,0.18)] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo onClick={() => navigate({ name: 'home' })} title={SITE.adminName} subtitle={subtitleLabel} />

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-slate-400/15 bg-slate-900/80 px-3.5 text-[0.9rem] font-semibold text-slate-200 hover:border-cyanline/20 hover:bg-slate-900/95 disabled:cursor-not-allowed"
            onClick={onRefresh}
            disabled={loading}
          >
            <RotateCcw size={16} className={loading ? 'animate-spin' : undefined} />
            Làm mới
          </button>

          <HeaderAccountMenu
            triggerLabel={displayName}
            infoLabel={displayName}
            infoBadge="Quản trị viên"
            items={[
              {
                label: 'Hồ sơ',
                icon: <UserRound size={16} />,
                onClick: () => navigate({ name: 'account' }),
              },
              {
                label: 'Về trang chủ',
                icon: <Home size={16} />,
                onClick: () => navigate({ name: 'home' }),
                dividerAfter: true,
              },
              {
                label: 'Đăng xuất',
                icon: <LogOut size={16} />,
                className: 'logout',
                onClick: onLogout,
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
