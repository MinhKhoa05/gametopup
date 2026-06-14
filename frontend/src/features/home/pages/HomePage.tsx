import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock3, Gamepad2, History, Package2, ReceiptText, Search, WalletCards, Zap } from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { SITE_IMAGES } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useGamesQuery } from '@/features/games/server';
import { useMyOrdersQuery } from '@/features/orders/server';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Badge, Button, IconBox, ImageBox, TrustSection, EmptyState } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { Game } from '@/features/games/types';
import type { Order } from '@/features/orders/types';

type PackageCard = {
  game: Game;
  name: string;
  salePrice: number;
  imageUrl: string;
  ctaLabel: string;
};

const PANEL_CLASS =
  'rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(22,27,34,0.94),rgba(18,24,34,0.98))] shadow-[0_18px_42px_rgba(2,6,23,0.18)]';

export function HomePage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const gamesQuery = useGamesQuery();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const ordersQuery = useMyOrdersQuery(auth.status === 'authenticated');

  const activeGames = useMemo(() => (gamesQuery.data ?? []).filter((game) => game.isActive), [gamesQuery.data]);
  const featuredGames = useMemo(() => activeGames.slice(0, 8), [activeGames]);
  const featuredPackages = useMemo(() => buildFeaturedPackages(activeGames.slice(0, 6)), [activeGames]);
  const recentOrders = (ordersQuery.data ?? []).slice(0, 4);
  const walletBalance = walletQuery.data ?? 0;

  const isGamesLoading = gamesQuery.isPending && !featuredGames.length;
  const isOrdersLoading = ordersQuery.isPending && auth.status === 'authenticated';
  const isWalletLoading = walletQuery.isPending && auth.status === 'authenticated' && walletQuery.data == null;

  return (
    <div className="relative isolate overflow-hidden">
      <BackgroundDecor />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-8">
          <HeroSection onBrowse={() => navigate(routes.games())} onDeposit={() => navigate(routes.wallet())} />

          <FeaturedRail games={featuredGames} onPick={(game) => navigate(routes.topup(game.id, 1))} loading={isGamesLoading} />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.82fr)]">
            <section className={PANEL_CLASS}>
              <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                <div className="grid gap-1">
                  <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">BEST SELLERS</p>
                  <h2 className="m-0 text-[1.45rem] font-black tracking-[-0.04em] text-white sm:text-[1.7rem]">Gói nạp bán chạy</h2>
                </div>
                <Button variant="secondary" className="rounded-[14px] px-4 text-sm font-semibold" onClick={() => navigate(routes.games())}>
                  Xem game
                  <Search size={16} />
                </Button>
              </div>

              <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {featuredPackages.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredPackages.map((pkg) => (
                      <PackageCardView key={`${pkg.game.id}-${pkg.name}`} packageItem={pkg} onPick={() => navigate(routes.topup(pkg.game.id, 1))} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Chưa có gói nạp"
                    description="Danh mục game sẽ xuất hiện ở đây sau khi hệ thống tải xong dữ liệu."
                    variant="compact"
                  />
                )}
              </div>
            </section>

            <aside className="grid gap-6">
              <section className={classNames(PANEL_CLASS, 'overflow-hidden')}>
                <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6">
                  <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">VÍ CỦA BẠN</p>
                  <div className="text-[clamp(2.1rem,3.2vw,3rem)] font-black tracking-[-0.06em] text-cyan-300 gt-tabular">
                    {isWalletLoading ? '--' : auth.status === 'authenticated' ? formatCurrency(walletBalance) : 'Đăng nhập'}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button variant="primary" className="rounded-[14px] px-5 text-sm font-bold" onClick={() => navigate(routes.wallet())}>
                      Nạp thêm
                    </Button>
                    <Button variant="outline" className="rounded-[14px] px-5 text-sm font-bold" onClick={() => navigate(routes.wallet())}>
                      Lịch sử
                    </Button>
                  </div>
                </div>
              </section>

              <section className={PANEL_CLASS}>
                <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
                  <div className="grid gap-1">
                    <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">ĐƠN GẦN ĐÂY</p>
                    <h2 className="m-0 text-[1.3rem] font-black tracking-[-0.04em] text-white">Đơn hàng gần đây</h2>
                  </div>
                  <Button variant="secondary" className="rounded-[14px] px-4 text-sm font-semibold" onClick={() => navigate(routes.orders())}>
                    Xem tất cả
                    <ArrowRight size={16} />
                  </Button>
                </div>

                <div className="grid gap-3 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                  {auth.status === 'authenticated' ? (
                    isOrdersLoading ? (
                      <RecentOrdersSkeleton />
                    ) : recentOrders.length ? (
                      recentOrders.map((order) => <RecentOrderItem key={order.id} order={order} />)
                    ) : (
                      <EmptyState
                        title="Chưa có đơn hàng"
                        description="Khi bạn nạp game, các đơn gần đây sẽ hiện ở đây."
                        actionLabel="Khám phá kho game"
                        onAction={() => navigate(routes.games())}
                        variant="compact"
                      />
                    )
                  ) : (
                    <EmptyState
                      title="Đăng nhập để xem lịch sử"
                      description="Sau khi đăng nhập, các đơn hàng gần đây sẽ hiển thị tại đây."
                      actionLabel="Đăng nhập"
                      onAction={() => navigate(routes.auth())}
                      variant="compact"
                    />
                  )}
                </div>
              </section>
            </aside>
          </div>

          <TrustSection />
        </div>
      </AppPageContainer>
    </div>
  );
}

function HeroSection({
  onBrowse,
  onDeposit,
}: {
  onBrowse: () => void;
  onDeposit: () => void;
}) {
  return (
    <section className={classNames(PANEL_CLASS, 'overflow-hidden')}>
      <div className="grid gap-8 px-5 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-center lg:px-7 lg:py-7">
        <div className="grid content-start gap-4">
          <Badge variant="accent" className="w-fit rounded-full border-cyan/20 bg-cyan/10 px-3 py-1 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">
            NẠP GAME UY TÍN
          </Badge>

          <h1 className="m-0 max-w-[12ch] text-[clamp(2.7rem,4.7vw,5.1rem)] font-black leading-[0.96] tracking-[-0.07em] text-white text-balance">
            Nạp game tiết kiệm hơn
          </h1>

          <p className="max-w-[34ch] text-[1rem] leading-7 text-slate-400">
            Giá tốt, xử lý nhanh và theo dõi được từng trạng thái đơn hàng. Đi thẳng tới game hoặc nạp ví trong một chạm.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" className="rounded-[14px] px-5 text-sm font-bold" onClick={onDeposit}>
              Nạp ngay
              <Zap size={16} />
            </Button>
            <Button variant="secondary" className="rounded-[14px] px-5 text-sm font-bold" onClick={onBrowse}>
              Xem danh sách game
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
              Hỗ trợ 24/7
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              Xử lý đơn 5-15 phút
            </span>
          </div>
        </div>

        <div className="relative min-h-[260px] lg:min-h-[360px]">
          <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_72%_18%,rgba(34,211,238,0.1),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-x-[16%] bottom-[12%] h-12 rounded-full bg-cyan/12 blur-[42px]" />
          <div className="pointer-events-none absolute left-[16%] top-[16%] h-28 w-28 rounded-full bg-cyan/12 blur-[72px]" />
          <div className="relative flex h-full items-center justify-center">
            <img
              src={SITE_IMAGES.home.heroIllustration}
              alt="Khối máy chơi game phát sáng"
              className="relative z-10 w-full max-w-[560px] object-contain drop-shadow-[0_0_56px_rgba(34,211,238,0.18)]"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedRail({
  games,
  loading,
  onPick,
}: {
  games: Game[];
  loading: boolean;
  onPick: (game: Game) => void;
}) {
  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">GAME NỔI BẬT</p>
          <h2 className="m-0 text-[1.3rem] font-black tracking-[-0.04em] text-white">Chọn game nhanh</h2>
        </div>
      </div>

      <div className="overflow-x-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid min-w-[92px] gap-2">
                <div className="aspect-square animate-pulse rounded-[22px] bg-white/6" />
                <div className="h-3 w-16 animate-pulse rounded-full bg-white/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4">
            {games.map((game) => (
              <button
                key={game.id}
                type="button"
                className="group grid min-w-[92px] gap-2 text-left"
                onClick={() => onPick(game)}
              >
                <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/[0.08] bg-slate-950 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan/30 group-hover:shadow-[0_16px_28px_rgba(2,6,23,0.16)]">
                  <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
                </div>
                <span className="truncate text-xs font-semibold text-slate-300 group-hover:text-cyan-100">{game.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PackageCardView({
  packageItem,
  onPick,
}: {
  packageItem: PackageCard;
  onPick: () => void;
}) {
  return (
    <article className="group grid gap-3 rounded-[20px] border border-white/[0.06] bg-[rgba(255,255,255,0.025)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.045)] hover:shadow-[0_16px_30px_rgba(2,6,23,0.14)]">
      <div className="relative aspect-[0.95/1] overflow-hidden rounded-[18px] bg-slate-950">
        <ImageBox src={packageItem.imageUrl} alt={packageItem.game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.84))]" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/[0.03] transition-colors group-hover:ring-cyan/20" />
      </div>

      <div className="grid gap-2">
        <strong className="truncate text-sm font-bold text-white">{packageItem.game.name}</strong>
        <span className="text-sm font-semibold text-slate-300">{packageItem.name}</span>
        <span className="pt-0.5 text-sm font-black text-cyan-100 gt-tabular">{formatCurrency(packageItem.salePrice)}</span>
      </div>

      <Button
        variant="primary"
        className="translate-y-3 justify-center rounded-[14px] px-4 text-sm font-bold opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        onClick={onPick}
      >
        Nạp ngay
      </Button>
    </article>
  );
}

function RecentOrderItem({ order }: { order: Order }) {
  const statusMeta = getOrderStatusMeta(order.status);
  const timeLabel = formatRelativeTime(order.createdAt);

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors hover:border-cyan/20 hover:bg-cyan/10">
      <IconBox size="sm" className="h-11 w-11 rounded-[16px] border-cyan/20 bg-cyan/10 text-cyan-50">
        <ReceiptText size={18} />
      </IconBox>
      <div className="min-w-0">
        <strong className="block truncate text-sm font-bold text-white">Đơn #{order.id} - Gói #{order.gamePackageId}</strong>
        <span className="block truncate text-xs text-slate-400">{order.gameAccountInfo}</span>
      </div>
      <div className="grid justify-items-end gap-1">
        <Badge variant={statusMeta.variant} className="rounded-full text-[0.72rem]">
          {statusMeta.label}
        </Badge>
        <span className="text-xs text-slate-400">{timeLabel}</span>
      </div>
    </article>
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải đơn hàng gần đây">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <div className="h-11 w-11 animate-pulse rounded-[16px] bg-white/6" />
          <div className="grid gap-2">
            <div className="h-3.5 w-48 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-white/6" />
          </div>
          <div className="grid justify-items-end gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-14 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildFeaturedPackages(games: Game[]): PackageCard[] {
  return games.map((game, index) => {
    const preset = PACKAGE_PRESETS[index % PACKAGE_PRESETS.length];
    return {
      game,
      name: preset.nameFor(game.name),
      salePrice: preset.price,
      imageUrl: game.imageUrl,
      ctaLabel: 'Nạp ngay',
    };
  });
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ngày trước`;
}

function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 gt-page-grid opacity-[0.05]" />
    </>
  );
}

const PACKAGE_PRESETS = [
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('valorant')) return '475 VP';
      return 'Gói nạp tiêu biểu';
    },
    price: 299000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('pubg')) return '180 UC';
      return 'Gói nạp nhanh';
    },
    price: 69000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('liên quân') || lower.includes('lien quan')) return '195 Quân Huy';
      return 'Gói ưu đãi';
    },
    price: 49000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('genshin')) return '6480 Genesis Crystal';
      return 'Gói cao cấp';
    },
    price: 1599000,
  },
] as const;
