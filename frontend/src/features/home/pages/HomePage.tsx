import { useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gamepad2,
  Headset,
  History,
  Package2,
  ReceiptText,
  Search,
  ShieldCheck,
  Tag,
  WalletCards,
  Zap,
} from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useGamesQuery } from '@/features/games/server';
import { useMyOrdersQuery } from '@/features/orders/server';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Badge, Button, IconBox, ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import type { Game } from '@/features/games/types';
import type { Order } from '@/features/orders/types';

type PackageCard = {
  game: Game;
  name: string;
  salePrice: number;
  imageUrl: string;
  ctaLabel: string;
};

const QUICK_ACTIONS = [
  {
    label: 'Nạp game',
    description: 'Đi tới kho game và chọn gói phù hợp.',
    icon: <Gamepad2 size={22} />,
    href: routes.games(),
  },
  {
    label: 'Theo dõi đơn',
    description: 'Xem trạng thái xử lý và lịch sử đơn.',
    icon: <ReceiptText size={22} />,
    href: routes.orders(),
  },
  {
    label: 'Nạp ví',
    description: 'Bổ sung số dư để thanh toán nhanh hơn.',
    icon: <WalletCards size={22} />,
    href: routes.wallet(),
  },
  {
    label: 'Lịch sử giao dịch',
    description: 'Tra cứu biến động ví và giao dịch gần đây.',
    icon: <History size={22} />,
    href: routes.wallet(),
  },
] as const;

const BENEFITS = [
  {
    title: 'Giá tốt hơn',
    description: 'Tối ưu chi phí nạp game, phù hợp cho giao dịch thường xuyên.',
    icon: <Tag size={24} />,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Số dư, đơn hàng và giao dịch đều được theo dõi rõ ràng.',
    icon: <ShieldCheck size={24} />,
  },
  {
    title: 'Xử lý nhanh chóng',
    description: 'Ưu tiên quy trình gọn, rút ngắn thời gian chờ.',
    icon: <Zap size={24} />,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng khi bạn cần.',
    icon: <Headset size={24} />,
  },
] as const;

const HERO_STATS = [
  {
    value: '12.000+',
    label: 'Đơn hàng hoàn thành',
    description: 'Được tin tưởng bởi hàng nghìn game thủ',
    icon: <Package2 size={18} />,
  },
  {
    value: '99%',
    label: 'Tỷ lệ xử lý thành công',
    description: 'An toàn, nhanh chóng, chính xác',
    icon: <CheckCircle2 size={18} />,
  },
  {
    value: '5 - 15 phút',
    label: 'Thời gian xử lý trung bình',
    description: 'Cảm kết xử lý đơn nhanh nhất có thể',
    icon: <Clock3 size={18} />,
  },
] as const;

export function HomePage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const gamesQuery = useGamesQuery();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const ordersQuery = useMyOrdersQuery(auth.status === 'authenticated');

  const activeGames = useMemo(() => (gamesQuery.data ?? []).filter((game) => game.isActive), [gamesQuery.data]);
  const popularGames = useMemo(() => activeGames.slice(0, 8), [activeGames]);
  const featuredGames = useMemo(() => activeGames.slice(0, 4), [activeGames]);
  const featuredPackages = useMemo(() => buildFeaturedPackages(featuredGames), [featuredGames]);
  const recentOrders = (ordersQuery.data ?? []).slice(0, 4);
  const walletBalance = walletQuery.data ?? 0;

  const isGamesLoading = gamesQuery.isPending && !popularGames.length;
  const isGamesError = gamesQuery.isError && !popularGames.length;
  const isOrdersLoading = ordersQuery.isPending && auth.status === 'authenticated';
  const isOrdersError = ordersQuery.isError && auth.status === 'authenticated';
  const isWalletLoading = walletQuery.isPending && auth.status === 'authenticated' && walletQuery.data == null;
  const isWalletError = walletQuery.isError && auth.status === 'authenticated';

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.14),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:64px_64px]" />

      <AppPageContainer className="relative z-10 py-6 sm:py-8 lg:py-10">
        <div className="grid gap-8 lg:gap-10">
          <HeroSection
            navigate={navigate}
          />

          <SectionHeader
            title="🔥 Game nổi bật"
            action={<SectionAction onClick={() => navigate(routes.games())}>Xem tất cả</SectionAction>}
          />

          {isGamesError ? (
            <EmptyInlineState
              title="Không tải được game"
              description={gamesQuery.error instanceof Error ? gamesQuery.error.message : 'Đã có lỗi xảy ra khi tải danh mục game.'}
              actionLabel="Thử lại"
              onAction={() => void gamesQuery.refetch()}
            />
          ) : isGamesLoading ? (
            <GamesSkeleton />
          ) : popularGames.length ? (
            <PopularGamesGrid games={popularGames} onPick={(game) => navigate(routes.topup(game.id, 1))} />
          ) : (
            <EmptyInlineState
              title="Chưa có game khả dụng"
              description="Danh mục game sẽ hiển thị ở đây khi hệ thống có dữ liệu hoạt động."
              actionLabel="Khám phá kho game"
              onAction={() => navigate(routes.games())}
            />
          )}

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section className="gt-surface grid gap-6 rounded-[28px] border border-white/10 p-5 sm:p-6">
              <SectionHeader title="Thao tác nhanh" />
              <div className="grid gap-4 sm:grid-cols-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="group grid min-h-28 gap-3 rounded-[20px] border border-white/10 bg-white/5 p-5 text-left text-slate-200 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_18px_40px_rgba(2,6,23,0.24)]"
                    onClick={() => navigate(action.href)}
                  >
                    <IconBox size="sm" className="h-12 w-12 rounded-2xl border-cyan/20 bg-cyan/10 text-cyan-50">
                      {action.icon}
                    </IconBox>
                    <div className="grid gap-1">
                      <strong className="text-base font-black text-white">{action.label}</strong>
                      <span className="max-w-[22ch] text-sm leading-6 text-slate-400">{action.description}</span>
                    </div>
                    <ArrowRight size={18} className="ml-auto self-end text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-200" />
                  </button>
                ))}
              </div>
            </section>

            <WalletSummaryCard
              hasLogin={auth.status === 'authenticated'}
              balance={walletBalance}
              error={isWalletError ? (walletQuery.error instanceof Error ? walletQuery.error.message : 'Đã có lỗi xảy ra khi tải số dư.') : null}
              loading={isWalletLoading}
              onDeposit={() => navigate(routes.wallet())}
              onHistory={() => navigate(routes.wallet())}
              onRetry={() => void walletQuery.refetch()}
            />
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <section className="gt-surface grid gap-6 rounded-[28px] border border-white/10 p-5 sm:p-6">
              <SectionHeader
                title="Gói nạp bán chạy"
                action={<SectionAction onClick={() => navigate(routes.games())}>Xem tất cả</SectionAction>}
              />

              {featuredPackages.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {featuredPackages.map((pkg) => (
                    <PackageCardView key={`${pkg.game.id}-${pkg.name}`} packageItem={pkg} onPick={() => navigate(routes.topup(pkg.game.id, 1))} />
                  ))}
                </div>
              ) : (
                <EmptyInlineState title="Chưa có gói bán chạy" description="Vui lòng chờ danh mục game tải xong để hiển thị gói nạp." />
              )}
            </section>

            <section className="gt-surface grid gap-5 rounded-[28px] border border-white/10 p-5 sm:p-6">
              <SectionHeader
                title="Đơn hàng gần đây"
                action={<SectionAction onClick={() => navigate(routes.orders())}>Xem tất cả</SectionAction>}
              />

              {auth.status === 'authenticated' ? (
                isOrdersLoading ? (
                  <RecentOrdersSkeleton />
                ) : isOrdersError ? (
                  <EmptyInlineState
                    title="Không tải được đơn hàng"
                    description={ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Đã có lỗi xảy ra khi tải lịch sử đơn.'}
                    actionLabel="Thử lại"
                    onAction={() => void ordersQuery.refetch()}
                  />
                ) : recentOrders.length ? (
                  <div className="grid gap-3">
                    {recentOrders.map((order) => (
                      <RecentOrderItem key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <EmptyInlineState
                    title="Chưa có đơn hàng"
                    description="Đơn hàng mới sẽ hiển thị ở đây sau khi bạn thực hiện nạp game."
                    actionLabel="Khám phá kho game"
                    onAction={() => navigate(routes.games())}
                  />
                )
              ) : (
                <EmptyInlineState
                  title="Đăng nhập để xem lịch sử"
                  description="Sau khi đăng nhập, đơn hàng gần đây của bạn sẽ xuất hiện tại đây."
                  actionLabel="Đăng nhập"
                  onAction={() => navigate(routes.auth())}
                />
              )}

              <Button variant="secondary" className="mt-1 justify-center rounded-2xl" onClick={() => navigate(routes.orders())}>
                Xem tất cả đơn hàng
              </Button>
            </section>
          </div>

          <section className="grid gap-6">
            <SectionHeader title="Vì sao chọn GameTopUp?" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {BENEFITS.map((benefit) => (
                <article
                  key={benefit.title}
                  className="grid gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.82)] p-5 shadow-[0_12px_32px_rgba(2,6,23,0.16)]"
                >
                  <IconBox size="sm" className="h-12 w-12 rounded-2xl border-cyan/20 bg-cyan/10 text-cyan-50">
                    {benefit.icon}
                  </IconBox>
                  <div className="grid gap-1">
                    <h3 className="text-base font-black text-white">{benefit.title}</h3>
                    <p className="m-0 text-sm leading-6 text-slate-400">{benefit.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AppPageContainer>
    </div>
  );
}

function HeroSection({
  navigate,
}: {
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <section className="gt-surface overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(9,18,35,0.94),rgba(4,10,22,0.98))] p-5 shadow-[0_22px_60px_rgba(2,6,23,0.24)] sm:p-6 lg:p-7">
      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(270px,0.72fr)]">
        <div className="grid content-start gap-5">
          <Badge variant="accent" className="w-fit rounded-full border-cyan/20 bg-cyan/10 px-3 py-1 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">
            ĐẠI LÝ NẠP GAME UY TÍN
          </Badge>

          <div className="grid gap-4">
            <h1 className="max-w-[11ch] text-[clamp(2.7rem,5vw,5.1rem)] font-black leading-[0.88] tracking-[-0.04em] text-white text-balance">
              Nạp game
              <span className="block bg-[linear-gradient(180deg,#67e8f9_0%,#22d3ee_100%)] bg-clip-text text-transparent">
                tiết kiệm hơn
              </span>
            </h1>
            <p className="max-w-xl text-[0.98rem] leading-7 text-slate-300 sm:text-[1.04rem]">
              Giá tốt hơn cửa hàng chính thức. Thanh toán an toàn, xử lý đơn nhanh chóng.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" className="rounded-2xl px-5 text-sm font-bold" onClick={() => navigate(routes.games())}>
              Nạp ngay
              <ArrowRight size={16} />
            </Button>
            <Button variant="secondary" className="rounded-2xl px-5 text-sm font-bold" onClick={() => navigate(routes.games())}>
              <Search size={16} />
              Xem game
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
              Hỗ trợ 24/7
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-cyan shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              Xử lý đơn từ 5 - 15 phút
            </span>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_28%),linear-gradient(180deg,rgba(7,16,31,0.92),rgba(4,10,22,0.98))] p-4">
          <div className="absolute inset-x-10 bottom-10 h-20 rounded-full bg-cyan/20 blur-3xl" />
          <div className="absolute left-8 top-8 size-20 rounded-full bg-cyan/10 blur-2xl" />
          <div className="absolute right-8 top-10 size-28 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative mx-auto flex h-full max-w-[360px] items-center justify-center">
            <div className="absolute bottom-2 h-24 w-[82%] rounded-full border border-cyan/20 bg-cyan/10 blur-[1px] shadow-[0_0_42px_rgba(34,211,238,0.24)]" />
            <div className="absolute bottom-4 h-28 w-[72%] rounded-full border border-cyan/20 bg-[rgba(34,211,238,0.12)] shadow-[0_0_36px_rgba(34,211,238,0.18)]" />

            <div className="relative -rotate-6 rounded-[28px] border border-cyan/30 bg-[linear-gradient(180deg,rgba(12,28,52,0.98),rgba(6,14,28,0.96))] p-4 shadow-[0_30px_70px_rgba(2,6,23,0.45)]">
              <div className="flex h-44 w-44 items-center justify-center rounded-[22px] border border-cyan/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_35%),linear-gradient(180deg,rgba(14,29,53,1),rgba(8,18,34,1))]">
                <div className="grid place-items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-cyan-50 shadow-[0_0_36px_rgba(34,211,238,0.12)]">
                    <Gamepad2 size={44} strokeWidth={1.8} />
                  </div>
                  <div className="h-14 w-14 rounded-full border border-cyan/30 bg-cyan/15 text-cyan shadow-[0_0_24px_rgba(34,211,238,0.18)]" style={{ clipPath: 'polygon(50% 0%, 72% 36%, 53% 36%, 68% 100%, 30% 54%, 46% 54%)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {HERO_STATS.map((stat) => (
            <article
              key={stat.label}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.82)] p-4 shadow-[0_12px_28px_rgba(2,6,23,0.16)]"
            >
              <IconBox size="sm" className="h-11 w-11 rounded-2xl border-cyan/20 bg-cyan/10 text-cyan-50">
                {stat.icon}
              </IconBox>
              <div className="grid gap-1">
                <strong className="text-[1.35rem] font-black tracking-[-0.03em] text-white">{stat.value}</strong>
                <span className="text-sm font-semibold text-slate-200">{stat.label}</span>
                <span className="text-sm leading-6 text-slate-400">{stat.description}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularGamesGrid({
  games,
  onPick,
}: {
  games: Game[];
  onPick: (game: Game) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8">
      {games.map((game) => (
        <button
          key={game.id}
          type="button"
          className="group grid gap-3 rounded-[20px] border border-white/10 bg-[rgba(7,16,31,0.84)] p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.96)] hover:shadow-[0_20px_40px_rgba(2,6,23,0.22)]"
          onClick={() => onPick(game)}
        >
          <div className="relative aspect-square overflow-hidden rounded-[18px] border border-white/5 bg-slate-950">
            <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.78))]" />
          </div>
          <div className="grid gap-0.5">
            <strong className="truncate text-sm font-bold text-white">{game.name}</strong>
            <span className="text-xs text-slate-400">{getGamePlatform(game.name)}</span>
          </div>
        </button>
      ))}
    </div>
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
    <article className="grid gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.86)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.96)]">
      <div className="relative aspect-[0.95/1] overflow-hidden rounded-[18px] border border-white/5 bg-slate-950">
        <ImageBox src={packageItem.imageUrl} alt={packageItem.game.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))]" />
      </div>

      <div className="grid gap-1">
        <strong className="truncate text-sm font-bold text-white">{packageItem.game.name}</strong>
        <span className="text-sm font-semibold text-slate-300">{packageItem.name}</span>
        <span className="text-sm font-black text-white">{formatCurrency(packageItem.salePrice)}</span>
      </div>

      <Button variant="primary" size="sm" className="mt-auto justify-center rounded-2xl" onClick={onPick}>
        {packageItem.ctaLabel}
      </Button>
    </article>
  );
}

function WalletSummaryCard({
  hasLogin,
  balance,
  error,
  loading,
  onDeposit,
  onHistory,
  onRetry,
}: {
  hasLogin: boolean;
  balance: number;
  error: string | null;
  loading: boolean;
  onDeposit: () => void;
  onHistory: () => void;
  onRetry: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_32%),linear-gradient(180deg,rgba(8,18,34,0.96),rgba(7,16,31,0.98))] p-6 shadow-[0_18px_44px_rgba(2,6,23,0.18)]">
      <div className="pointer-events-none absolute right-[-24px] top-[-16px] h-44 w-44 rounded-full border border-cyan/20 bg-cyan/10 blur-3xl" />
      <div className="relative grid gap-5">
        <div className="grid gap-2">
          <p className="m-0 text-sm font-bold uppercase tracking-[0.16em] text-cyan-100">Ví của bạn</p>
          <div className="text-[clamp(2.1rem,4vw,3.4rem)] font-black tracking-[-0.04em] text-cyan-300">{loading ? '--' : hasLogin ? formatCurrency(balance) : 'Đăng nhập'}</div>
          <p className="max-w-xs text-sm leading-7 text-slate-400">
            {error ?? (hasLogin ? 'Tài khoản ví được liên kết với đơn hàng và lịch sử giao dịch.' : 'Đăng nhập để xem số dư, nạp thêm và theo dõi giao dịch.')}
          </p>
        </div>

        <div className="relative grid place-items-center">
          <div className="absolute inset-x-10 bottom-0 h-20 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative h-28 w-36 rounded-[28px] border border-cyan/20 bg-[linear-gradient(180deg,rgba(11,19,36,1),rgba(8,16,31,1))] shadow-[0_18px_38px_rgba(2,6,23,0.22)]">
            <div className="absolute left-3 right-3 top-3 h-3 rounded-full bg-cyan/15" />
            <div className="absolute bottom-3 left-3 right-3 h-14 rounded-[20px] border border-cyan/15 bg-cyan/10" />
            <WalletCards size={44} className="absolute right-4 top-10 text-cyan-200" />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" className="rounded-2xl px-5 text-sm font-bold" onClick={onDeposit}>
            Nạp thêm
          </Button>
          <Button variant="secondary" className="rounded-2xl px-5 text-sm font-bold" onClick={onHistory}>
            Lịch sử giao dịch
          </Button>
          {error ? (
            <Button variant="outline" className="rounded-2xl px-5 text-sm font-bold" onClick={onRetry}>
              Thử lại
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function RecentOrderItem({ order }: { order: Order }) {
  const statusMeta = getOrderStatusMeta(order.status);
  const timeLabel = formatRelativeTime(order.createdAt);

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-cyan/20 hover:bg-cyan/10">
      <IconBox size="sm" className="h-11 w-11 rounded-2xl border-cyan/20 bg-cyan/10 text-cyan-50">
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

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="m-0 text-[1.45rem] font-black tracking-[-0.03em] text-white sm:text-[1.65rem]">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function SectionAction({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-sm font-bold text-cyan-200 transition-colors hover:text-cyan-50"
      onClick={onClick}
    >
      {children}
      <ChevronRight size={16} />
    </button>
  );
}

function EmptyInlineState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-[22px] border border-dashed border-white/10 bg-white/5 p-5 text-left">
      <div className="grid gap-1">
        <strong className="text-base font-black text-white">{title}</strong>
        <p className="m-0 text-sm leading-7 text-slate-400">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button variant="secondary" className="w-fit rounded-2xl" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function GamesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8" aria-busy="true" aria-label="Đang tải game nổi bật">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="grid gap-3 rounded-[20px] border border-white/10 bg-[rgba(7,16,31,0.84)] p-3">
          <div className="aspect-square animate-pulse rounded-[18px] bg-white/6" />
          <div className="grid gap-2">
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-12 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải đơn hàng gần đây">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/6" />
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

function getGamePlatform(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('pubg') || lower.includes('free fire') || lower.includes('liên quân') || lower.includes('lien quan')) {
    return 'Mobile';
  }

  return 'PC';
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ngày trước`;
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
      if (lower.includes('liên quân') || lower.includes('lien quan')) return '19S Quân Huy';
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
