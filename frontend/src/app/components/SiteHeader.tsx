import { useState } from 'react';
import { Bell, UserRound, WalletCards } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, IconBox, SearchBar } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import {
  HEADER_ACCOUNT_MENU_ADMIN_ITEMS,
  HEADER_ACCOUNT_MENU_USER_ITEMS,
  HEADER_NAV_ITEMS,
  SITE,
} from '@/app/config/site';
import { BrandLogo } from '../site-shell/BrandLogo';
import { HeaderAccountMenu } from '../site-shell/HeaderAccountMenu';
import { buildHeaderAccountMenuItems, getVisibleHeaderNavItems } from '../site-shell/header.helpers';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { ROUTE_PATHS, routes } from '@/app/router/routes';

export function SiteHeader() {
  const auth = useAuthSession();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const hasLogin = auth.status === 'authenticated';
  const isAuthPending = auth.status === 'checking';
  const hasKnownSession = hasLogin || !isAuthPending;
  const visibleNavItems = getVisibleHeaderNavItems(HEADER_NAV_ITEMS, hasLogin);
  const baseMenuItems = hasLogin && auth.user?.role != null && String(auth.user.role).trim().toLowerCase() === 'admin' ? HEADER_ACCOUNT_MENU_ADMIN_ITEMS : HEADER_ACCOUNT_MENU_USER_ITEMS;
  const menuItems = buildHeaderAccountMenuItems(baseMenuItems, auth.handleLogout, (href) => navigate(href));

  return (
    <header className="sticky top-0 z-50 border-b border-slate-400/12 bg-[linear-gradient(180deg,rgba(8,15,28,0.98)_0%,rgba(8,15,28,0.92)_100%)] shadow-[0_10px_30px_rgba(2,6,23,0.24)] backdrop-blur-[16px]">
      <div className="site-header__inner relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-[-1px] after:h-px after:bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.2)_50%,transparent_100%)] sm:px-6 lg:px-8">
        <div className="header-brand-group flex items-center gap-8">
          <BrandLogo title={SITE.name} subtitle={SITE.tagline} onClick={() => navigate(ROUTE_PATHS.home)} />

          <nav className="hidden gap-2 md:flex" aria-label="Điều hướng chính">
            {visibleNavItems.map((item) => {
              const itemPath = item.href;
              const isActive = location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

              return (
                <Button
                  key={item.href}
                  type="button"
                  variant={isActive ? 'primary' : 'secondary'}
                  size="sm"
                  className={classNames(
                    'rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition-all duration-200 outline-none hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50 hover:shadow-[0_8px_24px_rgba(34,211,238,0.10)] focus-visible:-translate-y-0.5 focus-visible:border-cyan/25 focus-visible:bg-cyan/10 focus-visible:text-cyan-50 focus-visible:shadow-[0_8px_24px_rgba(34,211,238,0.10)]',
                    isActive && 'border-cyan/25 bg-cyan/10 text-cyan-50 shadow-[0_8px_24px_rgba(34,211,238,0.15)] brightness-110',
                  )}
                  onClick={() => navigate(itemPath)}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="header-actions flex flex-1 items-center justify-end gap-3">
          <SearchBar
            dense
            className="hidden w-full shrink-0 max-w-40 md:flex lg:max-w-52"
            value={query}
            onChange={setQuery}
            onEnter={(value) => {
              if (value.trim()) {
                navigate(routes.games());
              }
            }}
            placeholder="Tìm game..."
            ariaLabel="Tìm game"
          />

          {hasLogin ? (
            <button
              type="button"
              className="hidden h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 pl-2 pr-3.5 text-sm font-black text-slate-100 shadow-none sm:inline-flex"
              onClick={() => navigate(routes.wallet())}
            >
              <IconBox size="sm" className="h-7 w-7 rounded-lg">
                <WalletCards size={15} />
              </IconBox>
              <span className="tracking-wide text-white">{typeof walletQuery.data === 'number' ? formatCurrency(walletQuery.data) : '---'}</span>
            </button>
          ) : null}

          <div className="header-user-group hidden min-h-11 min-w-44 items-center justify-end gap-3 sm:flex">
            {isAuthPending && !hasKnownSession ? (
              <div className="flex min-h-11 min-w-44 items-center gap-3 rounded-xl border border-white/10 bg-ink-lighter px-3 py-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
                <div className="grid gap-1">
                  <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-white/10" />
                </div>
              </div>
            ) : hasLogin ? (
              <>
                <button type="button" className="relative hidden h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-ink-lighter text-slate-200 sm:inline-flex" title="Thông báo">
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                </button>

                <HeaderAccountMenu triggerLabel={auth.userDisplayName} items={menuItems} />
              </>
            ) : (
              <Button type="button" variant="primary" size="md" className="min-h-11 min-w-44 rounded-xl px-4 text-sm font-bold text-slate-950 shadow-[0_4px_14px_rgba(34,211,238,0.18)]" onClick={() => navigate(routes.auth())}>
                <UserRound size={17} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
