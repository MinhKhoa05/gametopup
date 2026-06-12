import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Gamepad2, ShieldCheck, Tag, WalletCards, Zap } from 'lucide-react';
import { ActionCard, Badge, Button, IconBox, ImageBox, SearchBar } from '@/shared/components';
import { useGamesQuery } from '@/features/games/server';
import { GameGrid } from '@/features/games/components/GameGrid';
import { AuthForm } from '@/features/auth/components/AuthForm';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { SITE } from '@/app/config/site';
import { routes } from '@/app/router/routes';

const HOME_FEATURES = [
  {
    title: 'Xử Lý Nhanh Chóng',
    desc: 'Hoàn thành trong 5-15 phút',
    icon: <Zap size={32} className="text-cyan" />,
  },
  {
    title: 'Giao Dịch Đảm Bảo',
    desc: 'Uy tín 100%',
    icon: <ShieldCheck size={32} className="text-cyan" />,
  },
  {
    title: 'Giá Rẻ Hơn',
    desc: 'Rẻ hơn tới 15% so với web gốc',
    icon: <WalletCards size={32} className="text-cyan" />,
  },
] as const;

const HOME_STEPS = [
  {
    title: '1. Chọn game',
    desc: 'Tìm tựa game và chọn gói nạp phù hợp.',
    icon: <Gamepad2 size={24} />,
  },
  {
    title: '2. Nhập ID',
    desc: 'Cung cấp UID hoặc thông tin tài khoản.',
    icon: <Tag size={24} />,
  },
  {
    title: '3. Thanh toán',
    desc: 'Sử dụng số dư ví và nhận gói nạp tức thì.',
    icon: <WalletCards size={24} />,
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const { isSubmitting, submitAuth } = useAuthSession();
  const gamesQuery = useGamesQuery();
  const games = gamesQuery.data ?? [];
  const featuredGames = games.slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8">
      <section className="relative overflow-hidden rounded-[28px] border border-white/5 bg-[linear-gradient(100deg,rgba(7,17,31,0.94)_0%,rgba(7,17,31,0.82)_44%,rgba(7,17,31,0.46)_100%),url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1600&q=80')] bg-cover px-4 py-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:px-6 sm:py-10 lg:px-10 lg:py-16">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="accent" className="uppercase tracking-[0.18em]">
            Đại lý nạp hộ - Trung gian uy tín
          </Badge>
          <h1 className="mb-6 text-[clamp(2.2rem,9vw,4.2rem)] font-black leading-[0.9] tracking-tight text-white sm:text-6xl">
            Nạp game
            <br />
            <span className="text-cyan">tiết kiệm hơn</span>
          </h1>
          <p className="mb-8 max-w-xl text-[0.95rem] leading-[1.55] text-slate-300 sm:text-lg">
            {SITE.name} là đại lý trung gian cung cấp các gói nạp game với mức chiết khấu cực tốt. An toàn, uy tín và giúp bạn tiết kiệm hơn so với cổng nạp gốc.
          </p>

          <SearchBar
            className="max-w-md"
            inputClassName="py-3 text-lg"
            value={keyword}
            onChange={setKeyword}
            placeholder="Tìm game bạn muốn nạp..."
            ariaLabel="Tìm game"
            onEnter={() => navigate(routes.games())}
          />
        </div>
      </section>

      <section className="my-8 grid grid-cols-1 gap-3 border-y border-white/5 py-4 md:grid-cols-3 md:gap-4 md:py-6">
        {HOME_FEATURES.map((feature) => (
          <ActionCard key={feature.title} icon={feature.icon} title={feature.title} description={feature.desc} />
        ))}
      </section>

      <section className="mb-12">
        <div className="mb-6 flex items-end justify-between gap-4 max-[640px]:flex-col max-[640px]:items-start">
          <div>
            <h2 className="mb-0 text-2xl font-extrabold text-white">Danh Mục Game</h2>
          </div>
          <Button className="border-none bg-transparent px-0 py-0 text-cyan hover:bg-transparent hover:text-cyan-50" onClick={() => navigate(routes.games())}>
            Xem tất cả <ChevronRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-3 overflow-visible pb-0 sm:grid-cols-4 md:flex md:items-start md:gap-4 md:overflow-x-auto md:pb-3 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden">
          {gamesQuery.isPending && games.length === 0
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`category-skeleton-${index}`}
                  className="flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 md:w-[96px] md:flex-none md:text-sm"
                  aria-hidden="true"
                >
                  <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10 md:h-[72px] md:w-[72px] md:rounded-3xl" />
                  <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/10" />
                </div>
              ))
            : games.map((game) => (
                <button
                  key={game.id}
                  className="group flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 transition-transform duration-200 md:w-[96px] md:flex-none md:text-sm"
                  onClick={() => navigate(routes.topup(game.id, 1))}
                >
                  <ImageBox
                    src={game.imageUrl}
                    alt={game.name}
                    className="aspect-square w-full rounded-2xl border border-transparent bg-ink-lighter object-cover transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan md:h-[72px] md:w-[72px] md:rounded-3xl"
                    width={72}
                    height={72}
                  />
                  <span className="leading-tight">{game.name}</span>
                </button>
              ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-extrabold text-white">Các Game Phổ Biến</h2>
        <GameGrid
          games={featuredGames}
          loading={gamesQuery.isPending && games.length === 0}
          skeletonCount={8}
          onPick={(game) => navigate(routes.topup(game.id, 1))}
          renderBadges={(game) => {
            const maxDiscount = 12 + (game.name.length % 10);

            return <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>;
          }}
        />
      </section>

      <section className="mb-16 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div>
          <h2 className="mb-6 text-2xl font-extrabold text-white">Cách Thức Nạp Game</h2>
          <div className="grid gap-4">
            {HOME_STEPS.map((step) => (
              <ActionCard
                key={step.title}
                icon={
                  <IconBox size="md">
                    {step.icon}
                  </IconBox>
                }
                title={step.title}
                description={step.desc}
              />
            ))}
          </div>
        </div>

        <div className="gt-surface-ink self-start rounded-2xl p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan/15 bg-cyan/10 text-cyan">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="gt-eyebrow">Đăng nhập</p>
              <h3 className="text-xl font-black text-white">Tiếp tục với tài khoản</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Sử dụng tài khoản GameTopUp của bạn để theo dõi ví và đơn hàng.</p>
            </div>
          </div>
          <AuthForm mode="login" busy={isSubmitting} onSubmitAuth={submitAuth} />
        </div>
      </section>
    </div>
  );
}
