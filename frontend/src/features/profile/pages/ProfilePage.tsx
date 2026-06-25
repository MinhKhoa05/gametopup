import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LockKeyhole, PencilLine, ShieldCheck } from 'lucide-react';
import { Container } from '@/shared/components';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { User } from '@/features/auth/types';
import { formatUserRoleLabel } from '@/features/auth/userRole';
import { buildOrderHistoryItems } from '@/features/orders/components/OrderHistorySections';
import type { OrderResponse } from '@/features/orders/types';
import { useMyOrdersQuery } from '@/features/orders/server';
import { useUpdateMyProfileMutation } from '@/features/profile/server';
import { useWalletOverviewQuery } from '@/features/wallet/server';
import { Button, EmptyState, ImageBox, PanelShell, PageHero, SectionHeading } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';

type FavoriteGameCard = {
  count: number;
  gameKey: string;
  imageUrl: string;
  name: string;
  packageName: string;
};

export function ProfilePage() {
  const auth = useAuthSession();
  const user = auth.user;

  if (auth.status === 'checking' && !user) {
    return <ProfilePageLoading />;
  }

  if (!user) {
    return <ProfileGuestState />;
  }

  return <ProfileContent user={user} />;
}

function ProfileContent({ user }: { user: User }) {
  const navigate = useNavigate();
  const walletOverviewQuery = useWalletOverviewQuery(true);
  const ordersQuery = useMyOrdersQuery();
  const updateProfileMutation = useUpdateMyProfileMutation();
  const [draftName, setDraftName] = useState('');
  const vipRef = useRef<HTMLDivElement | null>(null);
  const [vipTilt, setVipTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setDraftName(user.displayName ?? '');
  }, [user.displayName, user.id]);

  const displayName = user.displayName?.trim() || user.email;
  const joinedAtLabel = formatJoinedDate(user.createdAt);

  const stats = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const transactions = walletOverviewQuery.data?.transactions ?? [];

    const completedOrders = orders.filter((order) => order.status === 3).length;
    const totalDeposited = transactions.reduce((sum, transaction) => (transaction.type === 1 ? sum + transaction.amount : sum), 0);

    return {
      completedOrders,
      ordersCount: orders.length,
      totalDeposited,
      walletBalance: walletOverviewQuery.data?.balance ?? 0,
    };
  }, [ordersQuery.data, walletOverviewQuery.data]);

  const tier = resolveVipTier(stats.totalDeposited);
  const favoriteGames = useMemo(() => buildFavoriteGames(ordersQuery.data ?? []), [ordersQuery.data]);
  const loading = (walletOverviewQuery.isPending && walletOverviewQuery.data == null) || (ordersQuery.isPending && ordersQuery.data == null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateProfileMutation.mutateAsync({
      displayName: draftName.trim(),
    });
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-10 lg:gap-12">
          <PageHero
            eyebrow="TÀI KHOẢN CỦA TÔI"
            visual={
              <div className="grid size-[78px] place-items-center overflow-hidden rounded-full border border-cyan/20 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),rgba(34,211,238,0.08)_50%,rgba(7,16,31,0.92)_72%)] text-[1.65rem] font-black tracking-[-0.06em] gt-text">
                {user.avatarUrl ? <ImageBox src={user.avatarUrl} alt={displayName} className="size-full rounded-full object-cover" /> : getInitials(user.displayName ?? user.email, user.email)}
              </div>
            }
            title={displayName}
            description={`Thành viên từ ${joinedAtLabel}`}
          />

          <section className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.9fr)] xl:items-start">
            <div className="grid gap-8">
              <PanelShell>
                <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                  <SectionHeading title="Thông tin hồ sơ" titleClassName="text-[1.35rem]" />
                </div>
                <form className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6" onSubmit={handleSubmit}>
                  <TextField
                    label="Tên hiển thị"
                    value={draftName}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftName(event.target.value)}
                    placeholder="Nhập tên hiển thị"
                  />

                  <TextField
                    label="Email"
                    value={user.email}
                    readOnly
                    trailing={<ShieldCheck size={16} className="text-slate-500" />}
                  />

                  {updateProfileMutation.error instanceof Error ? (
                    <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                      {updateProfileMutation.error.message}
                    </div>
                  ) : null}

                  <Button type="submit" variant="primary" disabled={draftName.trim().length === 0 || draftName.trim() === (user.displayName ?? '').trim() || updateProfileMutation.isPending} className="justify-center rounded-[18px] px-5">
                    <PencilLine size={16} />
                    {updateProfileMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                  </Button>
                </form>
              </PanelShell>

              <PanelShell>
                <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                  <SectionHeading title="Bảo mật tài khoản" titleClassName="text-[1.35rem]" />
                </div>

                <div className="grid gap-4 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                  <div className="grid gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-[16px] border border-cyan/15 bg-cyan/10 text-cyan-50">
                        <LockKeyhole size={18} />
                      </span>
                      <div className="grid gap-1">
                        <strong className="text-sm font-black gt-text">Mật khẩu</strong>
                        <span className="font-mono text-base tracking-[0.24em] gt-text-soft">••••••••••••••</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm leading-6 gt-text-muted">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-slate-500" />
                      <span>Bạn nên dùng mật khẩu mạnh và không chia sẻ với người khác để bảo vệ tài khoản của bạn.</span>
                    </div>

                    <details className="group rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.65)] px-4 py-3">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold gt-text-soft">
                        <span>Thiết lập bảo mật</span>
                        <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="mt-3 text-sm leading-6 gt-text-muted">
                        Chức năng đổi mật khẩu sẽ hiển thị tại đây khi hệ thống hỗ trợ thao tác này.
                      </p>
                    </details>
                  </div>
                </div>
              </PanelShell>
            </div>

            <div className="grid gap-8">
              <VipCard cardRef={vipRef} tier={tier} totalDeposited={stats.totalDeposited} onMove={setVipTilt} tilt={vipTilt} />
              <FavoriteGamesSection favorites={favoriteGames} loading={loading} onBrowse={() => navigate(routes.games())} />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}

const VipCard = ({
  cardRef,
  tier,
  totalDeposited,
  onMove,
  tilt,
}: {
  cardRef: RefObject<HTMLDivElement | null>;
  tier: { key: 'bronze' | 'silver' | 'gold' | 'diamond'; label: string; gradient: string; glow: string };
  totalDeposited: number;
  onMove: (next: { x: number; y: number }) => void;
  tilt: { x: number; y: number };
}) => {
  return (
    <PanelShell>
      <div className="px-5 pt-5 sm:px-6 sm:pt-6">
        <SectionHeading title="Thẻ VIP" titleClassName="text-[1.35rem]" />
      </div>

      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div
          ref={cardRef}
          onMouseMove={(event) => {
            const element = cardRef.current;
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
            onMove({ x, y });
          }}
          onMouseLeave={() => onMove({ x: 0, y: 0 })}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) translateY(0px)`,
            transition: 'transform 160ms ease',
          }}
          className={classNames(
            'relative overflow-hidden rounded-[28px] border border-white/[0.1] p-5 shadow-[0_22px_42px_rgba(2,6,23,0.24)]',
            tier.gradient,
          )}
        >
          <div className={classNames('pointer-events-none absolute inset-0 opacity-70', tier.glow)} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.2),transparent_20%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.18),transparent_18%)]" />

          <div className="relative grid gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-1">
                <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-50/80">GTOP VIP CARD</p>
                <h3 className="m-0 text-[1.55rem] font-black tracking-[-0.05em] gt-text">Cấp độ: {tier.label}</h3>
              </div>
              <div className="grid size-14 place-items-center rounded-[18px] border border-white/15 bg-white/10 text-[0.85rem] font-black gt-text">
                VIP
              </div>
            </div>

            <div className="grid gap-3 gt-text">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-white/80">Tổng nạp</span>
                <strong className="text-[1.15rem] font-black gt-tabular">{formatCurrency(totalDeposited)}</strong>
              </div>
              <div className="h-px bg-white/15" />
              <div className="flex items-center justify-between gap-3 text-sm text-white/85">
                <span>Quyền lợi</span>
                <span>Nâng cấp theo lịch sử nạp</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              <span>GameTopUp VIP</span>
              <span>Level {tier.key.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </PanelShell>
  );
};

function FavoriteGamesSection({
  favorites,
  loading,
  onBrowse,
}: {
  favorites: FavoriteGameCard[];
  loading: boolean;
  onBrowse: () => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  return (
    <PanelShell>
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <SectionHeading
          title="Game yêu thích"
          titleClassName="text-[1.35rem]"
          description="Các game bạn nạp nhiều nhất sẽ nằm ở đây."
        />

        <div className="flex items-center gap-2">
          <RailButton ariaLabel="Xem game trước" onClick={() => scrollRail(railRef.current, -1)}>
            <ChevronLeft size={18} />
          </RailButton>
          <RailButton ariaLabel="Xem game sau" onClick={() => scrollRail(railRef.current, 1)}>
            <ChevronRight size={18} />
          </RailButton>
        </div>
      </div>

      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {loading ? (
          <FavoriteGamesSkeleton />
        ) : favorites.length ? (
          <div
            ref={railRef}
            className="grid auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {favorites.map((game) => (
              <article key={game.gameKey} className="group grid gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.045)]">
                <div className="relative aspect-[1.35/1] overflow-hidden rounded-[18px] bg-[var(--gt-bg-soft)]">
                  <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                </div>

                <div className="grid gap-1">
                  <strong className="truncate text-sm font-bold text-white">{game.name}</strong>
                  <span className="text-xs gt-text-muted">{game.packageName}</span>
                  <span className="text-xs font-medium text-cyan-200">Đã nạp {game.count} lần</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="compact"
            title="Chưa có game yêu thích"
            description="Khi bạn có đơn hàng, các game được nạp nhiều sẽ xuất hiện tại đây."
            actionLabel="Khám phá kho game"
            onAction={onBrowse}
          />
        )}
      </div>
    </PanelShell>
  );
}

function FavoriteGamesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Đang tải game yêu thích">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-3">
          <div className="aspect-[1.35/1] animate-pulse rounded-[18px] bg-white/6" />
          <div className="grid gap-2">
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-20 animate-pulse rounded-full bg-white/6" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  readOnly,
  trailing,
  value,
}: {
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  trailing?: ReactNode;
  value: string;
}) {
  return (
    <label className="grid gap-2">
                <span className="text-sm font-semibold gt-text-soft">{label}</span>
      <div className="relative">
        <input
          className="h-14 w-full rounded-[18px] border border-white/10 bg-[rgba(7,14,27,0.9)] px-4 pr-11 text-[1rem] font-semibold gt-text outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-cyan-300/30 hover:bg-[rgba(9,17,32,0.94)] focus:border-cyan-300/55 focus:bg-[rgba(9,17,32,0.98)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
          value={value}
          readOnly={readOnly}
          placeholder={placeholder}
          onChange={onChange}
        />
        {trailing ? <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">{trailing}</span> : null}
      </div>
    </label>
  );
}

function RailButton({
  ariaLabel,
  children,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(7,16,31,0.82)] text-slate-200 shadow-[0_10px_22px_rgba(2,6,23,0.18)] transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.96)] hover:text-cyan-50"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function scrollRail(element: HTMLDivElement | null, direction: -1 | 1) {
  if (!element) return;
  const width = Math.max(280, Math.round(element.clientWidth * 0.8));
  element.scrollBy({ behavior: 'smooth', left: direction * width });
}

function getInitials(displayName: string, fallbackEmail: string) {
  const base = displayName.trim() || fallbackEmail.trim();
  if (!base) return 'GT';

  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();

  const prefix = base.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 2);
  if (prefix.length >= 2) return prefix.toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

function buildFavoriteGames(orders: OrderResponse[]) {
  const grouped = new Map<string, FavoriteGameCard>();
  const historyItems = buildOrderHistoryItems(orders);

  for (const item of historyItems) {
    const existing = grouped.get(item.gameKey);
    if (!existing) {
      grouped.set(item.gameKey, {
        count: 1,
        gameKey: item.gameKey,
        imageUrl: item.gameThumbnailSrc,
        name: item.gameName,
        packageName: item.packageName,
      });
      continue;
    }

    existing.count += 1;
    existing.packageName = item.packageName;
    existing.imageUrl = item.gameThumbnailSrc;
  }

  return Array.from(grouped.values())
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, 2);
}

function resolveVipTier(totalDeposited: number) {
  if (totalDeposited >= 10000000) {
    return { key: 'diamond' as const, label: 'Kim cương', gradient: 'bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_38%,#22d3ee_100%)]', glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.42),transparent_48%)]' };
  }

  if (totalDeposited >= 4000000) {
    return { key: 'gold' as const, label: 'Vàng', gradient: 'bg-[linear-gradient(135deg,#1f2937_0%,#b45309_38%,#f59e0b_100%)]', glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.36),transparent_48%)]' };
  }

  if (totalDeposited >= 1500000) {
    return { key: 'silver' as const, label: 'Bạc', gradient: 'bg-[linear-gradient(135deg,#111827_0%,#475569_40%,#94a3b8_100%)]', glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.32),transparent_48%)]' };
  }

  return { key: 'bronze' as const, label: 'Đồng', gradient: 'bg-[linear-gradient(135deg,#1f130b_0%,#92400e_45%,#f97316_100%)]', glow: 'bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.3),transparent_48%)]' };
}

function ProfilePageLoading() {
  return (
    <Container className="py-5 sm:py-7 lg:py-8" aria-busy="true" aria-label="Đang xác thực tài khoản">
        <div className="grid gap-10 lg:gap-12">
        <div className="h-[220px] animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]" />
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.9fr)]">
          <div className="grid gap-8">
            <div className="h-[340px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
            <div className="h-[260px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          </div>
          <div className="grid gap-8">
            <div className="h-[360px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
            <div className="h-[320px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          </div>
        </div>
        <div className="h-[220px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
      </div>
    </Container>
  );
}

function ProfileGuestState() {
  const navigate = useNavigate();

  return (
    <EmptyState
      className="mx-auto mt-12 max-w-lg"
      title="Không có phiên đăng nhập"
      description="Vui lòng đăng nhập lại để xem tài khoản của bạn."
      actionLabel="Đăng nhập"
      onAction={() => navigate(routes.login())}
    />
  );
}

function formatJoinedDate(value?: string) {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
