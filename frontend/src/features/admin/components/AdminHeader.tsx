import { useState } from 'react';
import { Bell, Home, LogOut, Menu, RefreshCw } from 'lucide-react';
import { useRoute } from '@/hooks/common/route.hooks';
import { SITE } from '@/config/site';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { SearchBar } from '@/components/ui';
import type { HeaderAccountMenuItem } from '@/shared/types/layout.types';
import type { User } from '@/features/user/user.types';
import { HeaderAccountMenu } from '@/components/layout/HeaderAccountMenu';

export function AdminHeader({
  loading,
  onLogout,
  onRefresh,
  onToggleSidebar,
  variant = 'desktop',
  user,
}: {
  loading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  onToggleSidebar: () => void;
  variant?: 'desktop' | 'mobile';
  user: User | null;
}) {
  const { navigate } = useRoute();
  const [searchValue, setSearchValue] = useState('');
  const displayName = user?.displayName?.trim() || 'Minh Khoa';

  const accountMenuItems: HeaderAccountMenuItem[] = [
    {
      label: 'Về site',
      icon: <Home size={16} />,
      onClick: () => navigate({ name: 'home' }),
    },
    {
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      onClick: onLogout,
      className: 'logout',
    },
  ];

  if (variant === 'mobile') {
    return (
      <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
        <button
          type="button"
          aria-label="Đóng hoặc mở sidebar"
          className="gt-interactive inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-slate-100 shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition-colors hover:border-cyan/20 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(34,211,238,0.06))] hover:text-white"
          onClick={onToggleSidebar}
        >
          <Menu size={16} strokeWidth={2.4} />
        </button>

        <div className="min-w-0">
          <BrandLogo
            adminDot
            onClick={() => navigate({ name: 'admin', section: 'dashboard' })}
            size="sm"
            subtitle="Quản lý và vận hành dịch vụ"
            title={`${SITE.name} Admin`}
          />
        </div>

        <div className="ml-auto flex flex-none items-center gap-2">
          <button
            type="button"
            className="gt-interactive relative inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
            title="Thông báo"
          >
            <Bell size={17} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(34,211,238,0.18)]" />
          </button>

          <HeaderAccountMenu items={accountMenuItems} triggerLabel={displayName} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:max-w-[720px] xl:max-w-[920px]">
        <button
          type="button"
          aria-label="Đóng hoặc mở sidebar"
          className="gt-interactive hidden size-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] text-slate-100 shadow-[0_10px_24px_rgba(2,6,23,0.18)] transition-colors hover:border-cyan/20 hover:bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(34,211,238,0.06))] hover:text-white lg:inline-flex"
          onClick={onToggleSidebar}
        >
          <Menu size={16} strokeWidth={2.4} />
        </button>

        <SearchBar
          dense
          ariaLabel="Tìm kiếm nhanh"
          className="min-w-0 flex-1"
          onChange={setSearchValue}
          placeholder="Tìm kiếm nhanh..."
          size={16}
          value={searchValue}
        />
      </div>

      <div className="ml-auto flex flex-none items-center gap-2">
        <button
          type="button"
          className="gt-interactive inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
          onClick={onRefresh}
          title="Làm mới"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>

        <button
          type="button"
          className="gt-interactive relative inline-flex size-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.04] text-slate-300 transition-colors hover:border-cyan/20 hover:bg-cyan/10 hover:text-white"
          title="Thông báo"
        >
          <Bell size={17} />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(34,211,238,0.18)]" />
        </button>

        <HeaderAccountMenu items={accountMenuItems} triggerLabel={displayName} />
      </div>
    </div>
  );
}
