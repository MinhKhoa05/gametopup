import { FormEvent, useState } from 'react';
import { ChevronRight, Gamepad2, Search, ShieldCheck, WalletCards, Zap } from 'lucide-react';
import { AuthPanel } from '../components/auth/AuthPanel';
import { Route } from '../lib/routes';
import { pickImage } from '../lib/ui';
import { Game, WalletInfo, User } from '../types';
import { SITE } from '../config/site';
import { GameGrid } from '../components/games/GameGrid';
import type { AuthFormState, AuthMode } from '../types/auth.types';

export function HomePage({
  games,
  gamesLoading,
  wallet,
  busy,
  navigate,
  authMode,
  authForm,
  user,
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
  user: User | null;
  onChangeAuthForm: (next: AuthFormState) => void;
  onSwitchAuthMode: (mode: AuthMode) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const featured = games.slice(0, 8);

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

      <section className={user ? 'mb-16' : 'mb-16 grid gap-8 lg:grid-cols-[1fr_400px]'}>
        <div>
          <h2 className="mb-6 text-2xl font-extrabold text-white">Cách Thức Nạp Game</h2>
          <div className={user ? 'grid gap-4 md:grid-cols-3' : 'grid gap-4'}>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-lighter p-6 text-center md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyanline/10 text-cyanline">
                <Gamepad2 size={24} />
              </div>
              <div className="space-y-1">
                <strong className="block text-lg text-white">1. Chọn game</strong>
                <span className="block text-slate-400">Tìm tựa game và chọn gói nạp phù hợp.</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-lighter p-6 text-center md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyanline/10 text-cyanline">
                <Zap size={24} />
              </div>
              <div className="space-y-1">
                <strong className="block text-lg text-white">2. Nhập ID</strong>
                <span className="block text-slate-400">Cung cấp UID hoặc thông tin tài khoản.</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-ink-lighter p-6 text-center md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyanline/10 text-cyanline">
                <WalletCards size={24} />
              </div>
              <div className="space-y-1">
                <strong className="block text-lg text-white">3. Thanh toán</strong>
                <span className="block text-slate-400">Sử dụng số dư ví và nhận gói nạp tức thì.</span>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <div>
            <h2 className="mb-6 text-2xl font-extrabold text-white lg:block">Đăng nhập</h2>
          <AuthPanel
            authMode={authMode}
            form={authForm}
            wallet={wallet}
            busy={busy}
            user={user}
            onSubmit={onAuth}
            onLogout={onLogout}
            onChangeAuthForm={onChangeAuthForm}
            onSwitchMode={onSwitchAuthMode}
          />
        </div>
      )}
    </section>
  </div>
  );
}
