import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Gamepad2 as Gamepad2Icon,
  LogOut,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards as WalletCardsIcon,
  WalletCards,
  Zap,
} from 'lucide-react';
import { AuthPanel } from '../components/auth/AuthPanel';
import { GameGrid } from '../components/games/GameGrid';
import { HowToTopupSection } from '../components/home/HowToTopupSection';
import { IconBox } from '../components/common/IconBox';
import { StatCard } from '../components/common/StatCard';
import { SITE } from '../config/site';
import { formatCurrency } from '../lib/format';
import { userDisplayName } from '../lib/labels';
import { Route } from '../lib/routes';
import { classNames, pickImage } from '../lib/ui';
import { Game, User, WalletInfo } from '../types';
import type { AuthFormState, AuthMode, AuthStatus, AuthUserSnapshot } from '../types/auth.types';
import { useStableLoginView } from '../hooks/common/useStableLoginView';

export function HomePage({
  games,
  gamesLoading,
  wallet,
  busy,
  navigate,
  authMode,
  authForm,
  authStatus,
  user,
  userSnapshot,
  onAuth,
  onLogout,
  onChangeAuthForm,
  onSwitchAuthMode,
}: {
  games: Game[];
  gamesLoading: boolean;
  packagesCount: number;
  ordersCount: number;
  wallet: WalletInfo | null;
  busy: boolean;
  navigate: (route: Route) => void;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
  authMode: AuthMode;
  authForm: AuthFormState;
  authStatus: AuthStatus;
  user: User | null;
  userSnapshot: AuthUserSnapshot | null;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const featured = games.slice(0, 8);
  const { hasLogin, hasKnownSession, isAuthPending } = useStableLoginView({ authStatus, user, userSnapshot });
  const displayName = userDisplayName(user) || userSnapshot?.displayName || 'Khách';
  const showAuthSkeleton = isAuthPending && !hasKnownSession;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="hero-ecommerce">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 inline-block rounded-full border border-cyanline/30 bg-cyanline/20 px-3 py-1 text-sm font-bold text-cyanline">
            Dịch Vụ Nạp Hộ - Trung Gian Uy Tín
          </p>
          <h1 className="mb-6 text-4xl font-black leading-tight text-white sm:text-6xl">
            Nạp Game Qua Đại Lý
            <br />
            <span className="text-cyanline">Tiết Kiệm Chi Phí</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg text-slate-300">
            {SITE.name} là đại lý trung gian cung cấp các gói nạp game với mức chiết khấu cực tốt. An toàn, uy tín và giúp bạn tiết kiệm hơn so với cổng nạp gốc.
          </p>
          <div className="search-box max-w-md bg-ink/80 backdrop-blur">
            <Search size={20} className="text-cyanline" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm game bạn muốn nạp..."
              className="py-3 text-lg"
              onKeyDown={(event) => {
                if (event.key === 'Enter') navigate({ name: 'games' });
              }}
            />
          </div>
        </div>
      </section>

      <section className="trust-badges">
        <div className="trust-badge">
          <Zap size={32} className="text-cyanline" />
          <div>
            <strong className="block text-white">Xử Lý Nhanh Chóng</strong>
            <span className="text-slate-400">Hoàn thành trong 5-15 phút</span>
          </div>
        </div>
        <div className="trust-badge">
          <ShieldCheck size={32} className="text-cyanline" />
          <div>
            <strong className="block text-white">Giao Dịch Đảm Bảo</strong>
            <span className="text-slate-400">Uy tín 100%</span>
          </div>
        </div>
        <div className="trust-badge">
          <WalletCards size={32} className="text-cyanline" />
          <div>
            <strong className="block text-white">Giá Rẻ Hơn</strong>
            <span className="text-slate-400">Rẻ hơn tới 15% so với web gốc</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="mb-0 text-2xl font-extrabold text-white">Danh Mục Game</h2>
          </div>
          <button className="flex items-center font-bold text-cyanline hover:underline" onClick={() => navigate({ name: 'games' })}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className="category-strip items-start">
          {gamesLoading && games.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`category-skeleton-${index}`} className="category-item flex flex-col items-center justify-start" aria-hidden="true">
                  <div className="mb-2 h-[72px] w-[72px] animate-pulse rounded-[20px] bg-white/8" />
                  <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/8" />
                </div>
              ))
            : games.map((game) => (
                <button key={game.id} className="category-item flex flex-col items-center justify-start" onClick={() => navigate({ name: 'games', gameId: game.id })}>
                  <img src={pickImage(game)} alt={game.name} className="shrink-0" width={72} height={72} />
                  <span className="leading-tight">{game.name}</span>
                </button>
              ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-extrabold text-white">Các Game Phổ Biến</h2>
        <GameGrid
          games={featured}
          loading={gamesLoading && games.length === 0}
          skeletonCount={8}
          onPick={(game) => navigate({ name: 'games', gameId: game.id })}
          renderBadges={(game) => {
            const maxDiscount = 12 + (game.name.length % 10);
            return <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>;
          }}
        />
      </section>

      <section className={classNames('mb-16 grid items-start gap-8', hasLogin ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_400px]')}>
        <HowToTopupSection hasLogin={hasLogin} />

        {!hasLogin ? (
          <div className="self-start">
            {showAuthSkeleton ? (
              <aside className="gametopup-surface h-fit self-start bg-gradient-to-br from-ink-lighter to-ink-light">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-white/8" />
                    <div className="grid gap-2">
                      <div className="h-3.5 w-24 rounded-full bg-white/8" />
                      <div className="h-5 w-32 rounded-full bg-white/8" />
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-white/8" />
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="h-20 rounded-2xl bg-white/6" />
                  <div className="h-20 rounded-2xl bg-white/6" />
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="h-12 rounded-xl bg-white/6" />
                  <div className="h-12 rounded-xl bg-white/6" />
                  <div className="h-12 rounded-xl bg-white/6" />
                </div>
              </aside>
            ) : (
              <AuthPanel
                authMode={authMode}
                form={authForm}
                wallet={wallet}
                busy={busy}
                user={user}
                authStatus={authStatus}
                userSnapshot={userSnapshot}
                onSubmit={onAuth}
                onLogout={onLogout}
                onChangeAuthForm={onChangeAuthForm}
                onSwitchMode={onSwitchAuthMode}
              />
            )}
          </div>
        ) : null}
      </section>

      {hasLogin ? (
        <section className="mb-16">
          <div className="gametopup-surface bg-gradient-to-br from-ink-lighter to-ink-light">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <IconBox size="md">
                  <UserRound size={23} />
                </IconBox>
                <div>
                  <p className="eyebrow">Xin chào</p>
                  <h3 className="text-xl font-bold text-white">{displayName}</h3>
                </div>
              </div>
              <button className="icon-button" type="button" onClick={onLogout} disabled={busy} title="Đăng xuất">
                <LogOut size={18} />
              </button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <StatCard icon={<WalletCardsIcon size={20} />} label="Số dư ví" value={formatCurrency(wallet?.balance ?? 0)} />
              <StatCard icon={<Gamepad2Icon size={20} />} label="Tài khoản" value={user?.role ?? userSnapshot?.role ?? 'Khách hàng'} />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="gametopup-action-row min-w-[220px] flex-1" onClick={() => navigate({ name: 'wallet' })}>
                <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
                  <WalletCardsIcon size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Nạp ví</strong>
                  <small>Thêm tiền và theo dõi giao dịch</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>

              <button type="button" className="gametopup-action-row min-w-[220px] flex-1" onClick={() => navigate({ name: 'orders' })}>
                <IconBox size="sm" className="bg-cyanline/10 text-cyanline">
                  <Gamepad2Icon size={20} />
                </IconBox>
                <span className="gametopup-action-row__copy">
                  <strong>Lịch sử đơn</strong>
                  <small>Xem lại các đơn đã đặt</small>
                </span>
                <span className="gametopup-action-row__arrow">
                  <ArrowRight size={18} />
                </span>
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
