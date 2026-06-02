import { FormEvent, useState } from 'react';
import { ChevronRight, Zap, ShieldCheck, WalletCards, Gamepad2, Search } from 'lucide-react';
import { Route } from '../../../lib/routes';
import { Game, WalletInfo } from '../../../types';
import { pickImage } from '../../../lib/ui';
import { AuthPanel } from '../../../features/auth/components/AuthPanel';
import { GameGrid } from '../../../features/games/components/GameGrid';
import { SITE } from '../../../config/site';
import { useAuthStore } from '../../../store/auth.store';

export function HomePage({
  games,
  wallet,
  busy,
  navigate,
  onAuth,
  onLogout,
}: {
  games: Game[];
  packagesCount: number;
  ordersCount: number;
  wallet: WalletInfo | null;
  busy: boolean;
  navigate: (route: Route) => void;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
}) {
  const [keyword, setKeyword] = useState('');
  const user = useAuthStore((state) => state.user);
  const featured = games.slice(0, 8);
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="hero-ecommerce">
        <div className="max-w-2xl relative z-10">
          <p className="inline-block px-3 py-1 bg-cyanline/20 text-cyanline rounded-full text-sm font-bold mb-4 border border-cyanline/30">Dịch Vụ Nạp Hộ - Trung Gian Uy Tín</p>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-6">
            Nạp Game Qua Đại Lý<br/>
            <span className="text-cyanline">Tiết Kiệm Chi Phí</span>
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-xl">
            {SITE.name} là đại lý trung gian cung cấp các gói nạp game với mức chiết khấu cực tốt. An toàn, uy tín và giúp bạn tiết kiệm hơn so với cổng nạp gốc.
          </p>
          <div className="search-box max-w-md bg-ink/80 backdrop-blur">
            <Search size={20} className="text-cyanline" />
            <input 
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Tìm game bạn muốn nạp..."
              className="text-lg py-3"
              onKeyDown={(e) => {
                if(e.key === 'Enter') navigate({name: 'games'});
              }}
            />
          </div>
        </div>
      </section>

      {/* Trust Badges */}
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

      {/* Categories */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="mb-0 text-2xl font-extrabold text-white">Danh Mục Game</h2>
          </div>
          <button className="text-cyanline font-bold flex items-center hover:underline" onClick={() => navigate({name: 'games'})}>
            Xem tất cả <ChevronRight size={16} />
          </button>
        </div>
        <div className="category-strip items-start">
          {games.map(game => (
            <button key={game.id} className="category-item flex flex-col items-center justify-start" onClick={() => navigate({name: 'games', gameId: game.id})}>
              <img src={pickImage(game)} alt={game.name} className="shrink-0" />
              <span className="leading-tight">{game.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-extrabold text-white">Các Game Phổ Biến</h2>
        <GameGrid
          games={featured}
          onPick={(game) => navigate({ name: 'games', gameId: game.id })}
          renderBadges={(game) => {
            const maxDiscount = 12 + (game.name.length % 10);

            return (
              <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                CK {maxDiscount}%
              </div>
            );
          }}
        />
      </section>

      {/* Steps and Auth */}
      <section className={user ? "mb-16" : "grid lg:grid-cols-[1fr_400px] gap-8 mb-16"}>
        <div>
          <h2 className="mb-6 text-2xl font-extrabold text-white">Cách Thức Nạp Game</h2>
          <div className={user ? "grid gap-4 md:grid-cols-3" : "grid gap-4"}>
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
            <h2 className="invisible mb-6 text-2xl font-extrabold text-white lg:block">Đăng nhập</h2>
            <AuthPanel wallet={wallet} busy={busy} onSubmit={onAuth} onLogout={onLogout} />
          </div>
        )}
      </section>
    </div>
  );
}
