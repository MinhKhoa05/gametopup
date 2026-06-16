import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ReceiptText, Search, Zap } from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { SITE_IMAGES } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useGamesQuery } from '@/features/games/server';
import { useMyOrdersQuery } from '@/features/orders/server';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Badge, Button, EmptyState, IconBox, ImageBox, MediaListItem, PanelShell, PageHero, SectionHeading, TrustSection } from '@/shared/components';
import { formatCurrency, formatRelativeTime } from '@/shared/lib/format';
import type { Game } from '@/features/games/types';
import type { Order } from '@/features/orders/types';

type PackageCard = {
  game: Game;
  name: string;
  salePrice: number;
  imageUrl: string;
  ctaLabel: string;
};

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
    <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-8">
          <HeroSection onBrowse={() => navigate(routes.games())} onDeposit={() => navigate(routes.wallet())} />

          <FeaturedRail games={featuredGames} onPick={(game) => navigate(routes.gameDetail(game.id))} loading={isGamesLoading} />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.82fr)]">
            <PanelShell>
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <SectionHeading
                  className="items-center"
                  title="Gói nạp bán chạy"
                  titleClassName="text-[1.45rem] sm:text-[1.7rem]"
                  action={
                    <Button variant="secondary" className="rounded-[14px] px-4 text-sm font-semibold" onClick={() => navigate(routes.games())}>
                      Xem game
                      <Search size={16} />
                    </Button>
                  }
                />
              </div>

              <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                {featuredPackages.length ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredPackages.map((pkg) => (
                      <PackageCardView key={`${pkg.game.id}-${pkg.name}`} packageItem={pkg} onPick={() => navigate(routes.gameDetail(pkg.game.id))} />
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
            </PanelShell>

            <aside className="grid gap-6">
              <PanelShell className="overflow-hidden">
                <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6">
                  <SectionHeading title="Ví của bạn" />
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
              </PanelShell>

              <PanelShell>
                <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                  <SectionHeading
                    className="items-center"
                    title="Đơn hàng gần đây"
                    titleClassName="text-[1.3rem]"
                    action={
                      <Button variant="secondary" className="rounded-[14px] px-4 text-sm font-semibold" onClick={() => navigate(routes.orders())}>
                        Xem tất cả
                        <ArrowRight size={16} />
                      </Button>
                    }
                  />
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
                      onAction={() => navigate(routes.login())}
                      variant="compact"
                    />
                  )}
                </div>
              </PanelShell>
            </aside>
          </div>

          <TrustSection />
        </div>
    </AppPageContainer>
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
    <div className="grid gap-4">
      <PageHero
        eyebrow="NẠP GAME UY TÍN"
        title="Nạp game tiết kiệm hơn"
        description="Giá tốt, xử lý nhanh và theo dõi được từng trạng thái đơn hàng. Đi thẳng tới game hoặc nạp ví trong một chạm."
        visual={
          <div className="relative min-h-[230px] w-full min-w-[280px] max-w-[560px] lg:min-h-[360px]">
            <div className="pointer-events-none absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.16),transparent_36%),radial-gradient(circle_at_72%_18%,rgba(34,211,238,0.1),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-x-[16%] bottom-[12%] h-12 rounded-full bg-cyan/12 blur-[42px]" />
            <div className="pointer-events-none absolute left-[16%] top-[16%] h-28 w-28 rounded-full bg-cyan/12 blur-[72px]" />
            <div className="relative flex h-full items-center justify-center">
              <img
                src={SITE_IMAGES.home.heroIllustration}
                alt="Khối máy chơi game phát sáng"
                className="relative z-10 w-full object-contain drop-shadow-[0_0_56px_rgba(34,211,238,0.18)]"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        }
      />

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
    <PanelShell>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <SectionHeading title="Game nổi bật" titleClassName="text-[1.3rem]" />
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
                className="group grid min-w-[84px] gap-2 text-left"
                onClick={() => onPick(game)}
              >
                <div className="relative h-[84px] w-[84px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-slate-950 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan/30 group-hover:shadow-[0_16px_28px_rgba(2,6,23,0.16)]">
                  <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
                </div>
                <span className="truncate text-xs font-semibold text-slate-300 group-hover:text-cyan-100">{game.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </PanelShell>
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
    <MediaListItem
      leading={
        <IconBox size="sm" tone="primary" className="h-11 w-11 rounded-[16px]">
          <ReceiptText size={18} />
        </IconBox>
      }
      title={`Đơn #${order.id} - Gói #${order.gamePackageId}`}
      subtitle={order.gameAccountInfo}
      meta={timeLabel}
      titleAccessory={
        <Badge tone={statusMeta.tone} className="rounded-full text-[0.72rem]">
          {statusMeta.label}
        </Badge>
      }
      className="bg-white/[0.03] hover:border-cyan/20 hover:bg-cyan/10"
    />
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

