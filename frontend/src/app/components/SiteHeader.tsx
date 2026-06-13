import { useState } from 'react';
import { Bell, Search, UserRound, WalletCards } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, IconBox } from '@/shared/components';
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[linear-gradient(180deg,rgba(3,10,22,0.94)_0%,rgba(3,10,22,0.84)_100%)] shadow-[0_12px_32px_rgba(2,6,23,0.22)] backdrop-blur-[18px]">
      <div className="mx-auto grid max-w-[1480px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <BrandLogo title={SITE.name} onClick={() => navigate(ROUTE_PATHS.home)} />

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Điều hướng chính">
            {visibleNavItems.map((item) => {
              const itemPath = item.href;
              const isActive = location.pathname === itemPath || location.pathname.startsWith(`${itemPath}/`);

              return (
                <button
                  key={item.href}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  className={classNames(
                    'relative rounded-full px-3.5 py-2 text-sm font-semibold tracking-[-0.01em] text-slate-300 transition-all duration-200 hover:text-white',
                    isActive && 'text-cyan-50',
                  )}
                  onClick={() => navigate(itemPath)}
                >
                  <span>{item.label}</span>
                  <span
                    className={classNames(
                      'absolute inset-x-3 bottom-0 h-px rounded-full bg-transparent transition-all duration-200',
                      isActive && 'bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.95),transparent)] shadow-[0_0_18px_rgba(34,211,238,0.45)]',
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden justify-center lg:flex">
          <label className="flex min-h-11 w-full max-w-[360px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-slate-300 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10 focus-within:border-cyan/60 focus-within:bg-cyan/10 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
            <Search size={16} className="shrink-0 text-cyan-200" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && query.trim()) {
                  navigate(routes.games());
                }
              }}
              placeholder="Tìm game, gói nạp..."
              aria-label="Tìm game"
            />
            <kbd className="inline-flex h-7 items-center rounded-lg border border-white/10 bg-white/5 px-2 text-[0.7rem] font-semibold text-slate-400">Ctrl K</kbd>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          {hasLogin ? (
            <button
              type="button"
              className="hidden h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 sm:inline-flex"
              onClick={() => navigate(routes.wallet())}
            >
              <IconBox size="sm" className="h-8 w-8 rounded-xl">
                <WalletCards size={15} />
              </IconBox>
              <span className="tabular-nums">{typeof walletQuery.data === 'number' ? formatCurrency(walletQuery.data) : '---'}</span>
            </button>
          ) : null}

          <div className="hidden items-center gap-3 sm:flex">
            {isAuthPending && !hasKnownSession ? (
              <div className="flex h-11 min-w-44 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3">
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
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-white"
                  title="Thông báo"
                >
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(34,211,238,0.12)]" />
                </button>

                <HeaderAccountMenu triggerLabel={auth.userDisplayName} items={menuItems} />
              </>
            ) : (
              <Button type="button" variant="primary" size="md" className="min-h-11 rounded-2xl px-4 text-sm font-bold text-slate-950 shadow-[0_8px_22px_rgba(34,211,238,0.2)]" onClick={() => navigate(routes.auth())}>
                <UserRound size={17} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Button>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-white sm:hidden"
            onClick={() => navigate(routes.auth())}
          >
            <UserRound size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
