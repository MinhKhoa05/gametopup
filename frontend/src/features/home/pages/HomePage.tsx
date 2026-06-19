import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, ChevronDown, Headset, ReceiptText, Search, ShieldCheck, Tag, Zap } from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { SITE_IMAGES } from '@/app/config/site';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { GamePackageCard } from '@/features/games/components/GamePackageCard';
import { useGamesQuery } from '@/features/games/server';
import type { PublicGame, PublicGamePackage } from '@/features/games/contracts';
import { useMyOrdersQuery } from '@/features/orders/server';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
import { useWalletBalanceQuery } from '@/features/wallet/server';
import { Badge, Button, EmptyState, IconBox, ImageBox, MediaListItem, PanelShell, SectionHeading } from '@/shared/components';
import { formatCurrency, formatRelativeTime } from '@/shared/lib/format';
import type { Order } from '@/features/orders/types';
import type { ReactNode } from 'react';

type PackageCard = PublicGamePackage & {
  game: PublicGame;
};

export function HomePage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const gamesQuery = useGamesQuery();
  const walletQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const ordersQuery = useMyOrdersQuery(auth.status === 'authenticated');

  const featuredGames = useMemo(() => (gamesQuery.data ?? []).slice(0, 8), [gamesQuery.data]);
  const featuredPackages = useMemo(() => buildFeaturedPackages(featuredGames.slice(0, 6)), [featuredGames]);
  const recentOrders = (ordersQuery.data ?? []).slice(0, 4);
  const walletBalance = walletQuery.data ?? 0;

  const isGamesLoading = gamesQuery.isPending && !featuredGames.length;
  const isOrdersLoading = ordersQuery.isPending && auth.status === 'authenticated';
  const isWalletLoading = walletQuery.isPending && auth.status === 'authenticated' && walletQuery.data == null;

  return (
    <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-10 lg:gap-12">
          <HeroSection onBrowse={() => navigate(routes.games())} onDeposit={() => navigate(routes.wallet())} />

          <FeaturedRail games={featuredGames} onPick={(game) => navigate(routes.gameDetail(game.id))} loading={isGamesLoading} />

          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.82fr)]">
            <section className="grid gap-4">
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

              {featuredPackages.length ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
                  {featuredPackages.map((pkg) => (
                    <GamePackageCard key={pkg.id} gamePackage={pkg} isSelected={false} onSelect={() => navigate(routes.gameDetail(pkg.game.id))} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Chưa có gói nạp"
                  description="Danh mục game sẽ xuất hiện ở đây sau khi hệ thống tải xong dữ liệu."
                  variant="compact"
                />
              )}
            </section>

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

              <section className="grid gap-4">
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

                <div className="grid gap-3">
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
              </section>
            </aside>
          </div>

          <TrustSection />

          <FaqSection />
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
      <div className="grid gap-5 sm:gap-6">
      <section className="gt-panel overflow-hidden rounded-[28px]">
        <div className="relative aspect-[16/9] w-full">
          <img
            src={SITE_IMAGES.home.heroIllustration}
            alt="Banner GameTopUp"
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary" className="rounded-[14px] px-5 text-sm font-bold" onClick={onDeposit}>
          Nạp ngay
          <Zap size={16} />
        </Button>
        <Button variant="secondary" className="rounded-[14px] px-5 text-sm font-bold" onClick={onBrowse}>
          Xem danh sách game
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 text-sm gt-text-muted">
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
  games: PublicGame[];
  loading: boolean;
  onPick: (game: PublicGame) => void;
}) {
  return (
    <section className="grid gap-4">
      <SectionHeading title="Game nổi bật" titleClassName="text-[1.3rem]" />

      <div className="overflow-x-auto">
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
                <div className="relative h-[84px] w-[84px] overflow-hidden rounded-[22px] border border-white/[0.08] bg-[var(--gt-bg-soft)] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan/30 group-hover:shadow-[0_16px_28px_rgba(2,6,23,0.16)]">
                  <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]" />
                </div>
                <span className="truncate text-xs font-semibold gt-text-soft group-hover:text-cyan-100">{game.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
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
      className="hover:bg-[var(--gt-card-hover)]"
    />
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Đang tải đơn hàng gần đây">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border border-[color:var(--gt-border)] bg-[var(--gt-card)] px-4 py-3">
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

function buildFeaturedPackages(games: PublicGame[]): PackageCard[] {
  return games.map((game, index) => {
    const preset = PACKAGE_PRESETS[index % PACKAGE_PRESETS.length];
    return {
      id: game.id * 1000 + index,
      game,
      name: preset.nameFor(game.name),
      description: null,
      salePrice: preset.price,
      originalPrice: preset.originalPrice,
      isAvailable: true,
      imageUrl: game.imageUrl,
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
    originalPrice: 349000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('pubg')) return '180 UC';
      return 'Gói nạp nhanh';
    },
    price: 69000,
    originalPrice: 79000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('liên quân') || lower.includes('lien quan')) return '195 Quân Huy';
      return 'Gói ưu đãi';
    },
    price: 49000,
    originalPrice: 59000,
  },
  {
    nameFor: (gameName: string) => {
      const lower = gameName.toLowerCase();
      if (lower.includes('genshin')) return '6480 Genesis Crystal';
      return 'Gói cao cấp';
    },
    price: 1599000,
    originalPrice: 1799000,
  },
] as const;

type TrustSectionItem = {
  title: string;
  description: string;
  icon: ReactNode;
};

const BENEFITS = [
  {
    title: 'Giá tốt hơn',
    description: 'Tiết kiệm đến 15% so với cửa hàng chính thức.',
    icon: <Tag size={24} />,
  },
  {
    title: 'Thanh toán an toàn',
    description: 'Bảo mật thông tin tuyệt đối, hỗ trợ nhiều phương thức.',
    icon: <ShieldCheck size={24} />,
  },
  {
    title: 'Xử lý nhanh chóng',
    description: 'Đơn được xử lý tự động 5 - 15 phút.',
    icon: <Zap size={24} />,
  },
  {
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn.',
    icon: <Headset size={24} />,
  },
] as const satisfies readonly TrustSectionItem[];

const FAQ_ITEMS = [
  {
    question: 'Nạp tiền vào ví như thế nào?',
    answer:
      'Bạn tạo yêu cầu nạp, chuyển khoản theo hướng dẫn rồi xác nhận đã thanh toán. Sau khi giao dịch được kiểm tra, tiền sẽ được cộng vào ví.',
  },
  {
    question: 'Mua gói nạp ra sao?',
    answer:
      'Chọn game, chọn gói cần nạp, nhập đúng thông tin nhân vật hoặc tài khoản game rồi thanh toán bằng ví. Sau đó đơn sẽ được tiếp nhận để xử lý.',
  },
  {
    question: 'Đơn hàng xử lý mất bao lâu?',
    answer:
      'Thông thường đơn được xử lý trong khoảng 5-15 phút. Nếu đang đông đơn hoặc game cần kiểm tra thêm, thời gian có thể lâu hơn một chút.',
  },
  {
    question: 'Nạp qua GameTopUp có an toàn không?',
    answer:
      'GameTopUp ưu tiên xử lý đơn rõ ràng, kiểm tra kỹ thông tin trước khi nạp và luôn cập nhật trạng thái để bạn yên tâm theo dõi.',
  },
  {
    question: 'Có ảnh hưởng đến tài khoản game không?',
    answer:
      'Bạn chỉ cần cung cấp đúng thông tin cần thiết và không chia sẻ thêm các dữ liệu không liên quan. Đơn sẽ được xử lý theo cách thông thường của từng game.',
  },
  {
    question: 'Nếu nhập sai thông tin thì sao?',
    answer:
      'Nếu thông tin sai khiến đơn chưa xử lý được, GameTopUp sẽ hỗ trợ kiểm tra lại. Trường hợp không thể nạp, tiền sẽ được hoàn về ví.',
  },
] as const;

function TrustSection() {
  return (
    <section className="grid gap-6">
      <SectionHeading
        title="Vì sao chọn GameTopUp?"
        titleClassName="text-[1.5rem] sm:text-[1.7rem]"
        description="Một vài điểm cốt lõi để bạn nhìn nhanh trước khi quyết định."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {BENEFITS.map((item) => (
          <article key={item.title} className="gt-card grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[20px] border border-white/[0.06] px-5 py-5">
            <IconBox size="sm" className="h-12 w-12 rounded-[16px] border-cyan/20 bg-cyan/10 text-cyan-50">
              {item.icon}
            </IconBox>
            <div className="grid gap-1">
              <h3 className="text-base font-black text-white">{item.title}</h3>
              <p className="m-0 text-sm leading-6 gt-text-muted">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? FAQ_ITEMS : FAQ_ITEMS.slice(0, 3);

  return (
    <section className="grid gap-6">
      <SectionHeading
        title="Quy trình & thắc mắc"
        titleClassName="text-[1.5rem] sm:text-[1.7rem]"
        description="Giải đáp nhanh những câu hỏi hay gặp trước khi bạn nạp game."
      />

      <div className="grid gap-3">
        {visibleItems.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-[20px] border border-white/[0.06] bg-[rgba(255,255,255,0.025)] px-5 py-4 transition-colors open:border-cyan/20 open:bg-[rgba(255,255,255,0.04)]"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <span className="text-base font-bold gt-text">{item.question}</span>
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-cyan-100 transition-transform duration-200 group-open:rotate-180">
                <ChevronDown size={16} />
              </span>
            </summary>

            <p className="mt-3 max-w-4xl text-sm leading-7 gt-text-muted">{item.answer}</p>
          </details>
        ))}
      </div>

      {FAQ_ITEMS.length > 3 ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="rounded-[14px] px-5 text-sm font-bold"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Thu gọn' : `Xem thêm ${FAQ_ITEMS.length - 3} câu hỏi`}
            <ChevronDown size={16} className={showAll ? 'rotate-180' : ''} />
          </Button>
        </div>
      ) : null}
    </section>
  );
}

