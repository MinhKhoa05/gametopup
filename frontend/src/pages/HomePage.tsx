import { FormEvent, useState } from 'react';
import { ChevronRight, Zap, ShieldCheck, WalletCards, Gamepad2, Search } from 'lucide-react';
import { Route } from '../lib/routes';
import { Game, User, WalletInfo } from '../types';
import { pickImage, classNames } from '../lib/ui';
import { AuthPanel } from '../components/auth/AuthPanel';

export function HomePage({
  games,
  user,
  wallet,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  busy,
  navigate,
  onAuth,
  onLogout,
}: {
  games: Game[];
  packagesCount: number;
  ordersCount: number;
  user: User | null;
  wallet: WalletInfo | null;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authForm: { name: string; email: string; password: string };
  setAuthForm: (form: { name: string; email: string; password: string }) => void;
  busy: boolean;
  navigate: (route: Route) => void;
  onAuth: (event: FormEvent) => void;
  onLogout: () => void;
}) {
  const [keyword, setKeyword] = useState('');
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
            GameTopUp là đại lý trung gian cung cấp các gói nạp game với mức chiết khấu cực tốt. An toàn, uy tín và giúp bạn tiết kiệm hơn so với cổng nạp gốc.
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
          <Zap size={32} />
          <div>
            <strong className="block text-white">Xử Lý Nhanh Chóng</strong>
            <span className="text-slate-400">Hoàn thành trong 5-15 phút</span>
          </div>
        </div>
        <div className="trust-badge">
          <ShieldCheck size={32} />
          <div>
            <strong className="block text-white">Giao Dịch Đảm Bảo</strong>
            <span className="text-slate-400">Uy tín 100%</span>
          </div>
        </div>
        <div className="trust-badge">
          <WalletCards size={32} />
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
            <h2 className="section-title mb-0">Danh Mục Game</h2>
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
        <h2 className="section-title">Các Game Phổ Biến</h2>
        <div className="product-grid">
          {featured.map(game => {
            const maxDiscount = 12 + (game.name.length % 10);
            return (
              <button key={game.id} className="product-card" onClick={() => navigate({name: 'games', gameId: game.id})}>
                <div className="product-image">
                  <img src={pickImage(game)} alt={game.name} />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>
                </div>
                <div className="product-info">
                  <h3 className="product-title">{game.name}</h3>
                  <span className="product-meta">Nạp nhanh bằng ID</span>
                  <div className="mt-4 flex justify-between items-center w-full">
                    <span className="text-cyanline font-bold text-sm">Nạp game</span>
                    <div className="w-8 h-8 rounded-full bg-cyanline/10 text-cyanline flex items-center justify-center">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Steps and Auth */}
      <section className={user ? "mb-16" : "grid lg:grid-cols-[1fr_400px] gap-8 mb-16"}>
        <div>
          <h2 className="section-title">Cách Thức Nạp Game</h2>
          <div className={user ? "steps-grid" : "grid gap-4"}>
            <div className={classNames("step-card", user ? "text-center items-center" : "flex-row items-center")}>
              <div className="step-icon"><Gamepad2 size={24} /></div>
              <div>
                <strong className="block text-white text-lg">1. Chọn game</strong>
                <span className="text-slate-400">Tìm tựa game và chọn gói nạp phù hợp.</span>
              </div>
            </div>
            <div className={classNames("step-card", user ? "text-center items-center" : "flex-row items-center")}>
              <div className="step-icon"><Zap size={24} /></div>
              <div>
                <strong className="block text-white text-lg">2. Nhập ID</strong>
                <span className="text-slate-400">Cung cấp UID hoặc thông tin tài khoản.</span>
              </div>
            </div>
            <div className={classNames("step-card", user ? "text-center items-center" : "flex-row items-center")}>
              <div className="step-icon"><WalletCards size={24} /></div>
              <div>
                <strong className="block text-white text-lg">3. Thanh toán</strong>
                <span className="text-slate-400">Sử dụng số dư ví và nhận gói nạp tức thì.</span>
              </div>
            </div>
          </div>
        </div>
        
        {!user && (
          <div>
            <h2 className="section-title hidden lg:block invisible">Đăng nhập</h2>
            <AuthPanel 
              authMode={authMode} setAuthMode={setAuthMode} 
              form={authForm} setForm={setAuthForm} 
              user={user} wallet={wallet} busy={busy} 
              onSubmit={onAuth} onLogout={onLogout} 
            />
          </div>
        )}
      </section>
    </div>
  );
}
