import { useState } from 'react';
import { Bell, LayoutDashboard, LogOut, Mail, Receipt, Search, UserRound, WalletCards } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { HeaderAccountMenu, type HeaderAccountMenuItem } from './HeaderAccountMenu';
import { userDisplayName } from '../../lib/labels';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import {
  HEADER_ACCOUNT_MENU_ADMIN_ITEMS,
  HEADER_ACCOUNT_MENU_USER_ITEMS,
  HEADER_NAV_ITEMS,
  SITE,
} from '../../config/site';
import { formatCurrency } from '../../lib/format';
import { isAdminUser } from '../../lib/roles';
import type { AuthStatus, User } from '../../types';

export function AppHeader({
  route,
  wallet,
  navigate,
  onLogout,
  authStatus,
  user,
}: {
  route: Route;
  wallet: { balance: number } | null;
  navigate: (route: Route) => void;
  onLogout: () => void;
  authStatus: AuthStatus;
  user: User | null;
}) {
  const [keyword, setKeyword] = useState('');
  const hasLogin = Boolean(user);
  const isAuthPending = authStatus === 'unknown' || authStatus === 'checking';
  const hasKnownSession = hasLogin || !isAuthPending;
  const displayName = userDisplayName(user) || 'Khách';
  const adminUser = isAdminUser(user);
  const baseMenuItems = adminUser ? HEADER_ACCOUNT_MENU_ADMIN_ITEMS : HEADER_ACCOUNT_MENU_USER_ITEMS;
  const menuItems: HeaderAccountMenuItem[] = baseMenuItems.map((item) => {
    const icon =
      item.route?.name === 'account' ? (
        <UserRound size={16} />
      ) : item.route?.name === 'orders' ? (
        <Receipt size={16} />
      ) : item.route?.name === 'wallet' ? (
        <WalletCards size={16} />
      ) : item.route?.name === 'admin' ? (
        <LayoutDashboard size={16} />
      ) : (
        <LogOut size={16} />
      );

    return {
      label: item.label,
      icon,
      className: item.className,
      dividerAfter: item.dividerAfter,
      onClick: () => {
        if (item.className === 'logout') {
          onLogout();
          return;
        }

        if (item.route) navigate(item.route);
      },
    };
  });

  const handleWalletClick = () => {
    navigate(hasLogin ? { name: 'wallet' } : { name: 'account' });
  };

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && keyword.trim()) {
      navigate({ name: 'games' });
    }
  };
  const shouldShowAuthSkeleton = isAuthPending && !hasKnownSession;
  const visibleNavItems = HEADER_NAV_ITEMS.filter((item) => {
    if (hasLogin) return true;
    return item.route.name !== 'orders' && item.route.name !== 'wallet';
  });

  return (
    <header className="site-header">
      <div className="header-shell mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="header-brand-group flex items-center gap-8">
          <BrandLogo onClick={() => navigate({ name: 'home' })} title={SITE.name} subtitle={SITE.tagline} />

          <nav className="desktop-nav hidden md:flex" aria-label="Điều hướng chính">
            {visibleNavItems.map((link) => (
              <button
                key={link.label}
                type="button"
                className={classNames(route.name === link.route.name && 'active')}
                onClick={() => {
                  if ((link.route.name === 'orders' || link.route.name === 'wallet') && !hasLogin) {
                    navigate({ name: 'account' });
                    return;
                  }

                  navigate(link.route);
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-actions flex flex-1 items-center justify-end gap-3">
          <label
            className="hidden min-h-11 max-w-[260px] flex-1 items-center gap-2 rounded-[14px] border border-slate-500/20 bg-slate-900/85 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:flex"
            aria-label="Tìm game"
          >
            <Search size={16} className="text-slate-400" />
            <input
              className="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Tìm game..."
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={handleSearch}
            />
          </label>

          <HeaderWalletButton hasLogin={hasLogin} wallet={wallet} onClick={handleWalletClick} />
          <HeaderAuthSlot
            hasLogin={hasLogin}
            shouldShowAuthSkeleton={shouldShowAuthSkeleton}
            displayName={displayName}
            adminUser={adminUser}
            menuItems={menuItems}
            onLogout={onLogout}
            onNavigate={navigate}
          />
        </div>
      </div>
    </header>
  );
}

function HeaderWalletButton({
  hasLogin,
  wallet,
  onClick,
}: {
  hasLogin: boolean;
  wallet: { balance: number } | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="hidden min-h-11 min-w-[176px] items-center gap-2 rounded-xl border border-cyanline/20 bg-slate-900/85 px-3 text-cyan-100 transition-colors hover:bg-slate-900/95 sm:inline-flex"
      onClick={onClick}
    >
      <Mail size={18} />
      <span className="grid text-left leading-tight">
        <span className="text-sm font-bold">{hasLogin && wallet ? `Ví: ${formatCurrency(wallet.balance)}` : 'Nạp ví'}</span>
        <span className="text-[11px] font-medium text-slate-400">{hasLogin && wallet ? 'Mở ví của bạn' : 'Đăng nhập để dùng ví'}</span>
      </span>
    </button>
  );
}

function HeaderAuthSlot({
  hasLogin,
  shouldShowAuthSkeleton,
  displayName,
  adminUser,
  menuItems,
  onLogout,
  onNavigate,
}: {
  hasLogin: boolean;
  shouldShowAuthSkeleton: boolean;
  displayName: string;
  adminUser: boolean;
  menuItems: HeaderAccountMenuItem[];
  onLogout: () => void;
  onNavigate: (route: Route) => void;
}) {
  return (
    <div className="header-user-group hidden min-h-11 min-w-[176px] items-center justify-end gap-3 sm:flex">
      {shouldShowAuthSkeleton ? (
        <div className="flex min-h-11 min-w-[176px] items-center gap-3 rounded-xl border border-white/10 bg-ink-lighter px-3 py-2">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          <div className="grid gap-1">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="h-2.5 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ) : hasLogin ? (
        <>
          <button
            type="button"
            className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-lighter text-slate-200 transition-colors hover:bg-ink-light sm:inline-flex"
            title="Thông báo"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
          </button>

          <HeaderAccountMenu
            triggerLabel={displayName}
            infoLabel={displayName}
            infoBadge={adminUser ? 'Quản trị viên' : 'Tài khoản cá nhân'}
            items={menuItems}
          />
        </>
      ) : (
        <button
          type="button"
          className="inline-flex min-h-11 min-w-[176px] items-center justify-center rounded-xl bg-gradient-to-r from-cyanline to-teal-400 px-4 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(34,211,238,0.2)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(34,211,238,0.3)]"
          onClick={() => onNavigate({ name: 'account' })}
        >
          <UserRound size={17} />
          <span className="ml-1 hidden sm:inline">Đăng nhập</span>
        </button>
      )}
    </div>
  );
}
