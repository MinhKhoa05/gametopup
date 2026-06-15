import type { ReactNode } from 'react';
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ClipboardList,
  Copy,
  Gamepad2,
  Headphones,
  History,
  ReceiptText,
  Search,
  SlidersHorizontal,
  TimerReset,
  XCircle,
} from 'lucide-react';
import { SITE_IMAGES } from '@/app/config/site';
import type { Game } from '@/features/games/types';
import type { Order } from '@/features/orders/types';
import { Badge, Button, IconBox, ImageBox, PageHero } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency, formatDate } from '@/shared/lib/format';

type StatusGroup = 'pending' | 'processing' | 'completed' | 'canceled';
type TimelineState = 'complete' | 'current' | 'danger' | 'upcoming';

export type OrderHistoryFilterState = {
  game: string;
  search: string;
  sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
  status: 'all' | StatusGroup;
  time: 'all' | '24h' | '7d' | '30d';
};

export type OrderHistoryItem = {
  amount: number;
  amountLabel: string;
  createdAtLabel: string;
  createdRelativeLabel: string;
  createdAt: string;
  gameKey: string;
  gameName: string;
  gameImageUrl: string | null;
  gameThumbnailSrc: string;
  gameAccountInfo: string;
  note: string;
  order: Order;
  orderCode: string;
  packageName: string;
  statusDescription: string;
  statusGroup: StatusGroup;
  statusIcon: ReactNode;
  statusLabel: string;
  statusVariant: 'accent' | 'danger' | 'default' | 'success' | 'warning';
  timeline: Array<{
    description: string;
    icon: ReactNode;
    label: string;
    state: TimelineState;
    time?: string;
  }>;
  history: Array<{
    action: string;
    description: string;
    time: string;
  }>;
  updatedAtLabel: string;
};

const ORDER_VISUAL_FALLBACKS = [
  {
    accent: '#22d3ee',
    gameKey: 'pubg-mobile',
    gameName: 'PUBG Mobile',
    packageName: '180 UC',
  },
  {
    accent: '#38bdf8',
    gameKey: 'lien-quan-mobile',
    gameName: 'Liên Quân Mobile',
    packageName: '195 Quân Huy',
  },
  {
    accent: '#67e8f9',
    gameKey: 'valorant',
    gameName: 'Valorant',
    packageName: '475 VP',
  },
  {
    accent: '#22c55e',
    gameKey: 'genshin-impact',
    gameName: 'Genshin Impact',
    packageName: '6480 Genesis Crystal',
  },
  {
    accent: '#f59e0b',
    gameKey: 'free-fire',
    gameName: 'Free Fire',
    packageName: '1150 Kim Cương',
  },
  {
    accent: '#a78bfa',
    gameKey: 'honkai-star-rail',
    gameName: 'Honkai Star Rail',
    packageName: '3000 Oneiric Shard',
  },
] as const;

const STATUS_META: Record<
  number,
  {
    icon: ReactNode;
    label: string;
    statusGroup: StatusGroup;
    variant: 'accent' | 'danger' | 'default' | 'success' | 'warning';
  }
> = {
  1: {
    icon: <Clock3 size={14} />,
    label: 'Chờ xử lý',
    statusGroup: 'pending',
    variant: 'accent',
  },
  2: {
    icon: <TimerReset size={14} />,
    label: 'Đang xử lý',
    statusGroup: 'processing',
    variant: 'warning',
  },
  3: {
    icon: <CheckCircle2 size={14} />,
    label: 'Hoàn thành',
    statusGroup: 'completed',
    variant: 'success',
  },
  4: {
    icon: <XCircle size={14} />,
    label: 'Đã hủy',
    statusGroup: 'canceled',
    variant: 'danger',
  },
};

export function buildOrderHistoryItems(orders: Order[], games: Game[]): OrderHistoryItem[] {
  return orders.map((order, index) => {
    const visual = resolveVisual(order, index, games);
    const amount = order.total ?? order.unitPrice;
    const status = STATUS_META[order.status] ?? STATUS_META[1];
    const createdAtLabel = formatDate(order.createdAt);
    const updatedAtLabel = formatDate(order.updatedAt);
    const createdRelativeLabel = formatRelativeTime(order.createdAt);

    return {
      amount,
      amountLabel: formatCurrency(amount),
      createdAtLabel,
      createdRelativeLabel,
      createdAt: order.createdAt,
      gameAccountInfo: order.gameAccountInfo,
      gameKey: visual.gameKey,
      gameName: visual.gameName,
      gameImageUrl: visual.imageUrl,
      gameThumbnailSrc: visual.imageUrl ?? createOrderThumbnail({
        accent: visual.accent,
        gameName: visual.gameName,
        orderCode: `#GTOP${order.id}`,
        packageName: visual.packageName,
      }),
      note: '-',
      order,
      orderCode: `#GTOP${order.id}`,
      packageName: visual.packageName,
      statusDescription: statusDescriptionFor(status.statusGroup),
      statusGroup: status.statusGroup,
      statusIcon: status.icon,
      statusLabel: status.label,
      statusVariant: status.variant,
      timeline: buildTimeline(order.status, createdAtLabel, updatedAtLabel),
      history: buildHistoryEntries(order.status, order.createdAt, order.updatedAt),
      updatedAtLabel,
    };
  });
}

export function OrderHistoryHero() {
  return (
    <PageHero
      children={
        <div className="absolute bottom-6 left-5 z-20 flex flex-wrap gap-2 sm:bottom-6 sm:left-6 lg:bottom-6 lg:left-7">
          <Badge
            variant="default"
            icon={<TimerReset size={12} className="text-amber-200/80" />}
            className="rounded-[14px] border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.77rem] font-semibold text-slate-200/90 shadow-none backdrop-blur-sm"
          >
            2 đang xử lý
          </Badge>
          <Badge
            variant="default"
            icon={<Clock3 size={12} className="text-cyan-200/80" />}
            className="rounded-[14px] border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.77rem] font-semibold text-slate-200/90 shadow-none backdrop-blur-sm"
          >
            2 chờ xử lý
          </Badge>
        </div>
      }
      icon={
        <IconBox size="lg" className="h-[68px] w-[68px] rounded-[20px] border-cyan/18 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
          <ReceiptText size={36} strokeWidth={1.8} />
        </IconBox>
      }
      title="Lịch sử đơn hàng"
      description="Theo dõi trạng thái và lịch sử đơn hàng nạp game của bạn."
      illustration={
        <ImageBox
          src={SITE_IMAGES.orders.heroIllustration}
          alt="Minh họa lịch sử đơn hàng GameTopUp"
          className="relative z-10 w-full max-w-[320px] -translate-y-1 object-contain object-center drop-shadow-[0_0_30px_rgba(34,211,238,0.14)] lg:max-w-[300px]"
          decoding="async"
          loading="eager"
        />
      }
    />
  );
}
export function OrderHistoryStats({
  stats,
}: {
  stats: {
    canceled: number;
    completed: number;
    pending: number;
    processing: number;
    total: number;
  };
}) {
  const cards = [
    {
      icon: <ReceiptText size={18} />,
      label: 'Tổng đơn hàng',
      iconClassName: 'border-cyan-200/75 bg-cyan-400/30 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_28px_rgba(34,211,238,0.28)]',
      tone: 'text-cyan-100',
      value: stats.total,
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: 'Hoàn thành',
      iconClassName: 'border-emerald-200/80 bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,197,94,0.16),0_0_28px_rgba(34,197,94,0.28)]',
      tone: 'text-emerald-200',
      value: stats.completed,
    },
    {
      icon: <Clock3 size={18} />,
      label: 'Chờ xử lý',
      iconClassName: 'border-cyan-200/80 bg-cyan-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_28px_rgba(34,211,238,0.3)]',
      tone: 'text-cyan-100',
      value: stats.pending,
    },
    {
      icon: <TimerReset size={18} />,
      label: 'Đang xử lý',
      iconClassName: 'border-amber-200/80 bg-amber-400 text-slate-950 shadow-[0_0_0_1px_rgba(245,158,11,0.16),0_0_28px_rgba(245,158,11,0.3)]',
      tone: 'text-amber-100',
      value: stats.processing,
    },
  ] as const;

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[22px] border border-cyan/15 bg-[rgba(8,20,40,0.58)] p-5 backdrop-blur-[14px] transition-all duration-200 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-[0_18px_38px_rgba(2,6,23,0.18)]"
        >
          <div className={classNames('flex h-14 w-14 items-center justify-center rounded-[18px]', card.iconClassName)}>
            {card.icon}
          </div>
          <div className="grid gap-1">
            <span className="text-sm font-semibold text-slate-200">{card.label}</span>
            <strong className={classNames('text-[1.75rem] font-black tracking-[-0.05em] tabular-nums leading-none', card.tone)}>{card.value}</strong>
            <span className="text-sm text-slate-500">Đơn hàng</span>
          </div>
        </article>
      ))}
    </section>
  );
}

export function OrderHistoryControls({
  filters,
  gameOptions,
  onChange,
}: {
  filters: OrderHistoryFilterState;
  gameOptions: Array<{ label: string; value: string }>;
  onChange: (next: OrderHistoryFilterState) => void;
}) {
  const statusOptions: Array<{ label: string; value: OrderHistoryFilterState['status'] }> = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đang xử lý', value: 'processing' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'canceled' },
  ];

  return (
    <section className="gt-surface grid gap-4 rounded-[26px] border border-white/10 p-4 shadow-[0_12px_26px_rgba(2,6,23,0.12)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <SearchField
          value={filters.search}
          onChange={(value) => onChange({ ...filters, search: value })}
          placeholder="Tìm kiếm đơn hàng..."
        />

        <SelectField
          icon={<Gamepad2 size={16} />}
          label="Chọn game"
          value={filters.game}
          onChange={(value) => onChange({ ...filters, game: value })}
        >
          <option value="all">Tất cả game</option>
          {gameOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          icon={<SlidersHorizontal size={16} />}
          label="Sắp xếp"
          value={filters.sort}
          onChange={(value) => onChange({ ...filters, sort: value as OrderHistoryFilterState['sort'] })}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="amount-desc">Giá cao nhất</option>
          <option value="amount-asc">Giá thấp nhất</option>
        </SelectField>

        <SelectField
          icon={<CalendarRange size={16} />}
          label="Thời gian"
          value={filters.time}
          onChange={(value) => onChange({ ...filters, time: value as OrderHistoryFilterState['time'] })}
        >
          <option value="all">Tất cả</option>
          <option value="24h">24 giờ</option>
          <option value="7d">7 ngày</option>
          <option value="30d">30 ngày</option>
        </SelectField>
      </div>

      <div className="flex flex-wrap gap-3">
        {statusOptions.map((option) => {
          const active = filters.status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              className={classNames(
                'inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-bold transition-all duration-200',
                active
                  ? 'border-cyan-300/45 bg-cyan-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_12px_24px_rgba(34,211,238,0.22)]'
                  : 'border-white/10 bg-[rgba(7,16,31,0.72)] text-slate-300 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.88)] hover:text-cyan-50',
              )}
              onClick={() => onChange({ ...filters, status: option.value })}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function OrderHistoryList({
  currentPage,
  items,
  onPageChange,
  onSelect,
  selectedOrderId,
  totalPages,
}: {
  currentPage: number;
  items: OrderHistoryItem[];
  onPageChange: (page: number) => void;
  onSelect: (orderId: number) => void;
  selectedOrderId: number | null;
  totalPages: number;
}) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <div className="grid gap-4">
      <div className="grid gap-3">
        {items.map((item) => (
          <OrderHistoryListItem
            key={item.order.id}
            item={item}
            selected={item.order.id === selectedOrderId}
            onSelect={() => onSelect(item.order.id)}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="flex flex-wrap items-center justify-center gap-2 pt-1" aria-label="Phân trang đơn hàng">
          <PagerButton
            ariaLabel="Trang trước"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <ChevronDown size={16} className="rotate-90" />
          </PagerButton>

          {pages.map((page, index) =>
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm font-bold text-slate-500">
                ...
              </span>
            ) : (
              <PagerNumberButton key={page} active={page === currentPage} onClick={() => onPageChange(page as number)}>
                {page}
              </PagerNumberButton>
            ),
          )}

          <PagerButton
            ariaLabel="Trang sau"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            <ChevronDown size={16} className="-rotate-90" />
          </PagerButton>
        </nav>
      ) : null}
    </div>
  );
}

export function OrderDetailPanel({
  busy,
  onCancel,
  orderItem,
}: {
  busy: boolean;
  onCancel: (orderId: number) => Promise<void>;
  orderItem: OrderHistoryItem | null;
}) {
  if (!orderItem) {
    return (
      <aside className="gt-surface grid gap-4 rounded-[26px] border border-white/10 p-4 sm:p-5 lg:sticky lg:top-24">
        <DetailHeader />
        <div className="grid gap-2 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6">
          <h2 className="m-0 text-[1.15rem] font-black tracking-[-0.03em] text-white">Chọn một đơn hàng</h2>
          <p className="m-0 text-sm leading-7 text-slate-400">
            Chi tiết đơn hàng, trạng thái xử lý và lịch sử thao tác sẽ xuất hiện ở đây.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="gt-surface grid gap-4 rounded-[26px] border border-white/10 p-4 sm:p-5 lg:sticky lg:top-24">
      <DetailHeader />

      <div className="grid gap-4">
        <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 rounded-[24px] border border-cyan/15 bg-[rgba(8,20,40,0.56)] p-4">
          <div className="relative aspect-square overflow-hidden rounded-[20px] border border-white/10 bg-slate-950">
            <ImageBox src={orderItem.gameThumbnailSrc} alt={orderItem.gameName} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.16))]" />
          </div>

          <div className="grid content-start gap-2">
            <h2 className="m-0 text-[1.15rem] font-black tracking-[-0.04em] text-white">{orderItem.gameName}</h2>
            <p className="m-0 text-sm font-semibold text-cyan-200">{orderItem.packageName}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant={orderItem.statusVariant} icon={orderItem.statusIcon} className="rounded-full">
                {orderItem.statusLabel}
              </Badge>
            </div>
            <p className="m-0 text-sm leading-6 text-slate-400">{orderItem.statusDescription}</p>
          </div>
        </div>

        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-[rgba(8,20,40,0.5)] p-4">
          <DetailRow label="Mã đơn hàng" value={<ValueWithCopy value={orderItem.orderCode} />} />
          <DetailRow label="Trạng thái hiện tại" value={<Badge variant={orderItem.statusVariant}>{orderItem.statusLabel}</Badge>} />
          <DetailRow label="Thời gian tạo đơn" value={orderItem.createdAtLabel} />
          <DetailRow label="Cập nhật gần nhất" value={orderItem.updatedAtLabel} />
          <DetailRow label="Số tiền" value={orderItem.amountLabel} />
          <DetailRow label="Thông tin nhân vật" value={formatCharacterInfo(orderItem.gameAccountInfo)} />
          <DetailRow label="Ghi chú" value={orderItem.note} last />
        </div>

        <div className="grid gap-3 rounded-[24px] border border-white/10 bg-[rgba(8,20,40,0.5)] p-4">
          <div className="grid gap-1">
            <h3 className="m-0 text-[1.08rem] font-black tracking-[-0.03em] text-white">Lịch sử giao dịch</h3>
            <p className="m-0 text-sm leading-7 text-slate-400">Theo dõi trạng thái và các mốc xử lý thực tế của đơn hàng.</p>
          </div>

          <OrderTimeline steps={orderItem.timeline} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {canCancelOrder(orderItem.order.status) ? (
            <Button
              variant="secondary"
              className="justify-center rounded-[16px] px-5 text-sm font-bold"
              disabled={busy}
              onClick={() => void onCancel(orderItem.order.id)}
            >
              {busy ? 'Đang xử lý...' : 'Hủy đơn hàng'}
            </Button>
          ) : (
            <Button variant="secondary" className="justify-center rounded-[16px] px-5 text-sm font-bold" disabled>
              Không thể hủy
            </Button>
          )}

          <Button variant="outline" className="justify-center rounded-[16px] px-5 text-sm font-bold">
            <Headphones size={16} />
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>
    </aside>
  );
}

function OrderHistoryListItem({
  item,
  onSelect,
  selected,
}: {
  item: OrderHistoryItem;
  onSelect: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      className={classNames(
        'group grid gap-4 rounded-[24px] border p-4 text-left transition-all duration-200 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center',
        selected
          ? 'border-cyan/30 bg-[rgba(7,16,31,0.95)] shadow-[0_0_0_1px_rgba(34,211,238,0.06),0_16px_32px_rgba(2,6,23,0.18)]'
          : 'border-white/10 bg-[rgba(8,20,40,0.56)] hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(10,24,44,0.84)] hover:shadow-[0_16px_32px_rgba(2,6,23,0.16)]',
      )}
      onClick={onSelect}
    >
      <div className="relative aspect-square overflow-hidden rounded-[20px] border border-white/10 bg-slate-950">
        <ImageBox src={item.gameThumbnailSrc} alt={item.gameName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.18))]" />
      </div>

      <div className="grid gap-2 self-center">
        <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[1.05rem] font-black tracking-[-0.03em] text-white">{item.gameName}</strong>
          <span className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/18 px-2.5 py-1 text-[0.78rem] font-bold text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
            {item.packageName}
          </span>
        </div>

        <div className="grid gap-1 text-sm text-slate-400">
          <span>{item.orderCode}</span>
          <span>{item.createdAtLabel}</span>
        </div>
      </div>

      <div className="grid gap-3 self-center justify-self-start sm:justify-self-end">
        <div className="grid gap-2 sm:justify-items-end">
          <strong className="text-[1.05rem] font-black tracking-[-0.03em] text-cyan-50">{item.amountLabel}</strong>
          <Badge variant={item.statusVariant} icon={item.statusIcon} className="rounded-full">
            {item.statusLabel}
          </Badge>
          <span className="text-sm text-slate-400">{item.createdRelativeLabel}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-[14px] border border-cyan/15 bg-[rgba(7,16,31,0.72)] px-4 py-2 text-sm font-bold text-slate-200 transition-colors group-hover:border-cyan-300/35 group-hover:bg-[rgba(15,29,51,0.9)] group-hover:text-white">
          Xem chi tiết
          <ArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}

function OrderTimeline({ steps }: { steps: OrderHistoryItem['timeline'] }) {
  return (
    <div className="grid gap-4">
      {steps.map((step, index) => (
        <div key={step.label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
          <div className="relative flex flex-col items-center pt-0.5">
            <div
              className={classNames(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border',
                step.state === 'complete'
                  ? 'border-emerald-300/70 bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,197,94,0.14),0_0_22px_rgba(34,197,94,0.28)]'
                  : step.state === 'current'
                    ? 'border-amber-300/75 bg-amber-400 text-slate-950 shadow-[0_0_0_1px_rgba(245,158,11,0.18),0_0_26px_rgba(245,158,11,0.34)]'
                    : step.state === 'danger'
                      ? 'border-rose-300/70 bg-rose-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.16),0_0_24px_rgba(239,68,68,0.28)]'
                      : 'border-slate-600 bg-slate-800 text-slate-400',
              )}
            >
              {step.icon}
            </div>

            {index < steps.length - 1 ? (
              <div
                className={classNames(
                  'h-full w-px flex-1',
                  step.state === 'complete'
                    ? 'bg-gradient-to-b from-emerald-300 via-emerald-300/70 to-emerald-300/15'
                    : step.state === 'current'
                      ? 'bg-gradient-to-b from-amber-300 via-amber-300/70 to-amber-300/18'
                      : step.state === 'danger'
                        ? 'bg-gradient-to-b from-rose-400 via-rose-400/70 to-rose-400/20'
                        : 'bg-slate-600/80',
                )}
              />
            ) : null}
          </div>

          <div className="pb-1 pt-0.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <strong className="text-sm font-bold text-white">{step.label}</strong>
              <span
                className={classNames(
                  'text-xs font-semibold',
                  step.state === 'complete'
                    ? 'text-emerald-200'
                    : step.state === 'current'
                      ? 'text-amber-200'
                      : step.state === 'danger'
                        ? 'text-rose-200'
                        : 'text-slate-500',
                )}
              >
                {step.time ?? (step.state === 'current' ? 'Hiện tại' : step.state === 'complete' ? 'Đã xong' : step.state === 'danger' ? 'Đã hủy' : 'Sắp tới')}
              </span>
            </div>
            <p
              className={classNames(
                'm-0 mt-1 text-sm leading-6',
                step.state === 'complete'
                  ? 'text-slate-300'
                  : step.state === 'current'
                    ? 'text-slate-200'
                    : step.state === 'danger'
                      ? 'text-rose-200/90'
                      : 'text-slate-500',
              )}
            >
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <IconBox size="sm" className="h-11 w-11 rounded-[14px] border-cyan/20 bg-cyan/10 text-cyan-50">
          <ClipboardList size={18} />
        </IconBox>
        <h2 className="m-0 text-[1.15rem] font-black tracking-[-0.03em] text-white">Chi tiết đơn hàng</h2>
      </div>
    </div>
  );
}

function DetailRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div className={classNames('grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4', !last && 'border-b border-white/5 pb-3')}>
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}

function ValueWithCopy({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{value}</span>
      <Copy size={14} className="text-slate-500" />
    </span>
  );
}

function SelectField({
  children,
  icon,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <span className="inline-flex size-8 items-center justify-center rounded-[12px] border border-cyan/15 bg-cyan/10 text-cyan-50">{icon}</span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
        <select
          className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-semibold text-white outline-none focus:ring-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {children}
        </select>
      </div>
      <ChevronDown size={16} className="pointer-events-none text-slate-500" />
    </label>
  );
}

function SearchField({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <Search size={18} className="shrink-0 text-slate-400" />
      <input
        className="w-full border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PagerButton({
  ariaLabel,
  children,
  disabled,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(7,16,31,0.72)] text-slate-300 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function PagerNumberButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={classNames(
        'inline-flex h-10 min-w-10 items-center justify-center rounded-[12px] border px-3 text-sm font-bold transition-all duration-200',
        active
          ? 'border-cyan/30 bg-cyan-400 text-slate-950 shadow-[0_10px_22px_rgba(34,211,238,0.16)]'
          : 'border-white/10 bg-[rgba(7,16,31,0.72)] text-slate-300 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] hover:text-cyan-50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function buildTimeline(status: number, createdAtLabel: string, updatedAtLabel: string) {
  const createdStep = {
    description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
    icon: <ClipboardList size={14} />,
    label: 'Đơn hàng đã được tạo',
    state: 'complete' as const,
    time: createdAtLabel,
  };
  const processingStep = {
    description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
    icon: <History size={14} />,
    label: 'Đang xử lý đơn hàng',
    state: status === 2 ? ('current' as const) : status === 3 ? ('complete' as const) : ('upcoming' as const),
    time: status >= 2 ? updatedAtLabel : undefined,
  };
  const completedStep = {
    description: 'Đơn hàng đã được xử lý thành công.',
    icon: <CheckCircle2 size={14} />,
    label: 'Hoàn thành',
    state: status === 3 ? ('complete' as const) : ('upcoming' as const),
    time: status === 3 ? updatedAtLabel : undefined,
  };
  const cancelledStep = {
    description: 'Đơn hàng đã bị hủy và không tiếp tục xử lý.',
    icon: <XCircle size={14} />,
    label: 'Đơn hàng đã bị hủy',
    state: 'danger' as const,
    time: updatedAtLabel,
  };

  if (status === 4) {
    return [createdStep, cancelledStep];
  }

  return [createdStep, processingStep, completedStep];
}

function buildHistoryEntries(status: number, createdAt: string, updatedAt: string) {
  const createdTime = formatClock(createdAt);
  const updatedTime = formatClock(updatedAt);
  const processingTime = formatClock(shiftMinutes(createdAt, 13));
  const completedTime = formatClock(shiftMinutes(createdAt, 26));

  if (status === 4) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng đã bị hủy',
        description: 'Đơn hàng đã được hủy và không tiếp tục xử lý.',
        time: updatedTime,
      },
    ];
  }

  if (status === 3) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng chuyển sang trạng thái Đang xử lý',
        description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
        time: processingTime,
      },
      {
        action: 'Đơn hàng hoàn thành',
        description: 'Đơn hàng đã được xử lý thành công.',
        time: updatedAt ? updatedTime : completedTime,
      },
    ];
  }

  if (status === 2) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng chuyển sang trạng thái Đang xử lý',
        description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
        time: updatedTime,
      },
    ];
  }

  return [
    {
      action: 'Đơn hàng đã được tạo',
      description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
      time: createdTime,
    },
  ];
}

function statusDescriptionFor(statusGroup: StatusGroup) {
  switch (statusGroup) {
    case 'pending':
      return 'Đơn hàng đã được ghi nhận và đang chờ xử lý.';
    case 'processing':
      return 'Nhân viên đang thực hiện xử lý đơn hàng.';
    case 'completed':
      return 'Đơn hàng đã được xử lý thành công.';
    case 'canceled':
      return 'Đơn hàng đã bị hủy.';
    default:
      return '';
  }
}

function formatClock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function shiftMinutes(value: string, minutes: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

function resolveVisual(order: Order, index: number, games: Game[]) {
  if (games.length) {
    const game = games[(order.gamePackageId + index) % games.length];
    if (game) {
      return {
        accent: ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length].accent,
        gameKey: `game-${game.id}`,
        gameName: game.name,
        imageUrl: game.imageUrl,
        packageName: getPackageLabel(game.name, index),
      };
    }
  }

  const fallback = ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length];
  return {
    accent: fallback.accent,
    gameKey: fallback.gameKey,
    gameName: fallback.gameName,
    imageUrl: null,
    packageName: fallback.packageName,
  };
}

function getPackageLabel(gameName: string, index: number) {
  const lower = gameName.toLowerCase();

  if (lower.includes('pubg')) return '180 UC';
  if (lower.includes('liên quân') || lower.includes('lien quan')) return '195 Quân Huy';
  if (lower.includes('valorant')) return '475 VP';
  if (lower.includes('genshin')) return '6480 Genesis Crystal';
  if (lower.includes('free fire')) return '1150 Kim Cương';
  if (lower.includes('honkai')) return '3000 Oneiric Shard';

  return ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length].packageName;
}

function formatCharacterInfo(value: string) {
  if (!value.trim()) {
    return '—';
  }

  return value;
}

function canCancelOrder(status: number) {
  return status === 1 || status === 2;
}

function createOrderThumbnail({
  accent,
  gameName,
  orderCode,
  packageName,
}: {
  accent: string;
  gameName: string;
  orderCode: string;
  packageName: string;
}) {
  const safeGameName = escapeXml(gameName);
  const safeOrderCode = escapeXml(orderCode);
  const safePackageName = escapeXml(packageName);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" fill="none">
      <defs>
        <linearGradient id="bg" x1="48" y1="30" x2="420" y2="444" gradientUnits="userSpaceOnUse">
          <stop stop-color="#020817" />
          <stop offset="1" stop-color="#08182d" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(258 116) rotate(90) scale(260 220)">
          <stop stop-color="${accent}" stop-opacity="0.6" />
          <stop offset="1" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" rx="56" fill="url(#bg)" />
      <rect x="28" y="28" width="424" height="424" rx="46" fill="url(#glow)" opacity="0.72" />
      <path d="M88 138C88 126.954 96.9543 118 108 118H372C383.046 118 392 126.954 392 138V344C392 355.046 383.046 364 372 364H108C96.9543 364 88 355.046 88 344V138Z" fill="rgba(8,20,40,0.82)" stroke="rgba(56,189,248,0.22)" />
      <path d="M114 168H366" stroke="rgba(34,211,238,0.35)" stroke-width="8" stroke-linecap="round" />
      <path d="M128 222H314" stroke="rgba(34,211,238,0.24)" stroke-width="8" stroke-linecap="round" />
      <path d="M128 268H286" stroke="rgba(34,211,238,0.18)" stroke-width="8" stroke-linecap="round" />
      <circle cx="120" cy="222" r="14" fill="${accent}" fill-opacity="0.92" />
      <circle cx="120" cy="268" r="14" fill="${accent}" fill-opacity="0.92" />
      <path d="M114 168H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <path d="M114 222H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <path d="M114 268H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <rect x="136" y="78" width="208" height="48" rx="20" fill="rgba(8,20,40,0.96)" stroke="rgba(34,211,238,0.28)" />
      <path d="M174 88H306" stroke="rgba(34,211,238,0.5)" stroke-width="8" stroke-linecap="round" />
      <path d="M182 386C182 348.425 209.386 318 243 318C276.614 318 304 348.425 304 386" stroke="${accent}" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" />
      <circle cx="243" cy="306" r="22" fill="rgba(8,20,40,0.98)" stroke="rgba(34,211,238,0.35)" stroke-width="8" />
      <path d="M243 294V306L252 312" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      <text x="50%" y="405" fill="#FFFFFF" text-anchor="middle" font-size="26" font-family="Inter, Arial, sans-serif" font-weight="800">${safeGameName}</text>
      <text x="50%" y="438" fill="rgba(165,243,252,0.92)" text-anchor="middle" font-size="18" font-family="Inter, Arial, sans-serif" font-weight="700">${safePackageName} · ${safeOrderCode}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&apos;');
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

function getPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
}
