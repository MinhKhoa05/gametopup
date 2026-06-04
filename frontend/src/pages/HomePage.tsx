import { useState } from 'react';
import { ChevronRight, Search, ShieldCheck, WalletCards, Zap } from 'lucide-react';
import { AuthPanel } from '../components/auth/AuthPanel';
import { GameGrid } from '../components/games/GameGrid';
import { HowToTopupSection } from '../components/home/HowToTopupSection';
import { SITE } from '../config/site';
import { useAuthSession } from '../hooks/auth.hooks';
import { useGameCatalog } from '../hooks/games.hooks';
import { Route } from '../lib/routes';
import { classNames, pickImage } from '../lib/ui';
export function HomePage({
  navigate,
}: {
  navigate: (route: Route) => void;
}) {
  const [keyword, setKeyword] = useState('');
  const { games, gamesLoading } = useGameCatalog({ name: 'home' });
  const { authBusy, authForm, authMode, authStatus, handleAuth, handleLogout, setAuthForm, setAuthMode, user } = useAuthSession({
    navigate,
  });
  const featured = games.slice(0, 8);
  const hasLogin = Boolean(user);

  return (
    <div className="home-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="hero-ecommerce home-hero">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 inline-block rounded-full border border-cyanline/30 bg-cyanline/20 px-3 py-1 text-sm font-bold text-cyanline">
            Dịch vụ nạp hộ - Trung gian uy tín
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

      <section className="trust-badges home-trust-badges">
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

      <section className="home-section mb-12">
        <div className="mb-6 flex items-end justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
          <div>
            <h2 className="mb-0 text-2xl font-extrabold text-white">Danh Mục Game</h2>
          </div>
          <button className="flex items-center font-bold text-cyanline hover:underline" onClick={() => navigate({ name: 'games' })}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className="category-strip home-category-strip items-start">
          {gamesLoading && games.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`category-skeleton-${index}`} className="category-item flex flex-col items-center justify-start" aria-hidden="true">
                  <div className="mb-2 h-[72px] w-[72px] animate-pulse rounded-[20px] bg-white/8" />
                  <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/8" />
                </div>
              ))
            : games.map((game) => (
                <button
                  key={game.id}
                  className="category-item flex flex-col items-center justify-start"
                  onClick={() => navigate({ name: 'games', gameId: game.id })}
                >
                  <img src={pickImage(game)} alt={game.name} className="shrink-0" width={72} height={72} />
                  <span className="leading-tight">{game.name}</span>
                </button>
              ))}
        </div>
      </section>

      <section className="home-section mb-16">
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

      <section className={classNames('home-section mb-16 grid items-start gap-8', hasLogin ? 'lg:grid-cols-1' : 'lg:grid-cols-[1fr_400px]')}>
        <HowToTopupSection hasLogin={hasLogin} />

        {!hasLogin ? (
          <div className="self-start">
            <AuthPanel
              authMode={authMode}
              form={authForm}
              wallet={null}
              busy={authBusy}
              user={user}
              authStatus={authStatus}
              onSubmit={handleAuth}
              onLogout={handleLogout}
              onChangeAuthForm={setAuthForm}
              onSwitchMode={setAuthMode}
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
