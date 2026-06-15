import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { Badge, Button, IconBox, EmptyState } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { useCancelOrderMutation, useMyOrdersQuery } from '@/features/orders/server';
import { useGamesQuery } from '@/features/games/server';
import { buildOrderHistoryItems, type OrderHistoryItem } from '@/features/orders/components/OrderHistorySections';
import { CalendarRange, ChevronDown, ClipboardList, Gamepad2, Headphones, Search, SlidersHorizontal, TimerReset, CheckCircle2, XCircle } from 'lucide-react';
import { ImageBox } from '@/shared/components';

const PAGE_SIZE = 6;

type StatusGroup = 'all' | 'pending' | 'processing' | 'completed' | 'canceled';

type Filters = {
  game: string;
  search: string;
  status: StatusGroup;
  time: 'all' | '24h' | '7d' | '30d';
  sort: 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
};

const DEFAULT_FILTERS: Filters = {
  game: 'all',
  search: '',
  status: 'all',
  time: 'all',
  sort: 'newest',
};

const PANEL_CLASS =
  'rounded-[26px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(22,27,34,0.94),rgba(18,24,34,0.98))] shadow-[0_16px_38px_rgba(2,6,23,0.18)]';

export function OrdersPage() {
  const ordersQuery = useMyOrdersQuery();
  const gamesQuery = useGamesQuery();
  const cancelOrderMutation = useCancelOrderMutation();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const orders = ordersQuery.data ?? [];
  const games = gamesQuery.data ?? [];
  const orderItems = useMemo(() => buildOrderHistoryItems(orders, games), [games, orders]);

  const gameOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of orderItems) {
      if (!unique.has(item.gameKey)) unique.set(item.gameKey, item.gameName);
    }
    return Array.from(unique.entries()).map(([value, label]) => ({ value, label }));
  }, [orderItems]);

  const filteredItems = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return orderItems.filter((item) => {
      if (filters.game !== 'all' && item.gameKey !== filters.game) return false;
      if (filters.status !== 'all' && item.statusGroup !== filters.status) return false;
      if (filters.time !== 'all' && !matchesTimeFilter(item.order.createdAt, filters.time)) return false;
      if (!keyword) return true;

      return [item.orderCode, item.gameName, item.packageName, item.gameAccountInfo, item.amountLabel, item.statusLabel].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    });
  }, [filters, orderItems]);

  const sortedItems = useMemo(() => sortOrderHistoryItems(filteredItems, filters.sort), [filteredItems, filters.sort]);
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sortedItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!sortedItems.length) {
      setSelectedOrderId(null);
      return;
    }

    if (!selectedOrderId || !sortedItems.some((item) => item.order.id === selectedOrderId)) {
      setSelectedOrderId(sortedItems[0].order.id);
    }
  }, [selectedOrderId, sortedItems]);

  const selectedOrder = useMemo(() => {
    if (!sortedItems.length) return null;
    return sortedItems.find((item) => item.order.id === selectedOrderId) ?? sortedItems[0];
  }, [selectedOrderId, sortedItems]);

  const stats = useMemo(() => buildStats(orderItems), [orderItems]);
  const isLoading = ordersQuery.isPending && orders.length === 0;
  const isError = ordersQuery.isError && orders.length === 0;

  async function handleCancel(orderId: number) {
    await cancelOrderMutation.mutateAsync({ orderId });
  }

  return (
    <div className="relative isolate overflow-hidden">
      <BackgroundDecor />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <header className={PANEL_CLASS}>
            <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <div className="flex items-start gap-4">
                <IconBox size="lg" className="h-[62px] w-[62px] rounded-[18px] border-cyan/20 bg-cyan/10 text-cyan-50">
                  <ClipboardList size={30} strokeWidth={1.8} />
                </IconBox>
                <div className="grid gap-2">
                  <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">LỊCH SỬ ĐƠN HÀNG</p>
                  <h1 className="m-0 text-[clamp(2.3rem,3.3vw,3.6rem)] font-black leading-[0.96] tracking-[-0.06em] text-white text-balance">
                    Lịch sử đơn hàng
                  </h1>
                  <p className="max-w-3xl text-[0.98rem] leading-7 text-slate-400">
                    Danh sách đơn hàng bên trái, chi tiết và timeline bên phải. Trạng thái chỉ sáng tới bước hiện tại để bạn đọc nhanh và yên tâm hơn.
                  </p>
                </div>
              </div>
            </div>
          </header>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Tổng đơn" value={stats.total} icon={<ReceiptIcon />} />
            <StatCard label="Hoàn thành" value={stats.completed} icon={<CheckCircle2 size={18} />} tone="emerald" />
            <StatCard label="Đang xử lý" value={stats.processing} icon={<TimerReset size={18} />} tone="amber" />
            <StatCard label="Đã hủy" value={stats.canceled} icon={<XCircle size={18} />} tone="rose" />
          </section>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.92fr)] lg:items-start">
            <section className={PANEL_CLASS}>
              <div className="grid gap-4 px-5 pt-6 pb-2 sm:px-6 sm:pt-7 sm:pb-2.5 lg:px-7 lg:pt-8 lg:pb-3">
                <SearchField
                  value={filters.search}
                  placeholder="Tìm kiếm đơn hàng, mã đơn..."
                  onChange={(value) => {
                    setFilters((current) => ({ ...current, search: value }));
                    setPage(1);
                  }}
                />
              </div>

              <div className="grid gap-4 px-5 pt-2 sm:px-6 lg:px-7">
                <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
                  <SelectField
                    value={filters.game}
                    icon={<Gamepad2 size={16} />}
                    label="Lọc game"
                    onChange={(value) => {
                      setFilters((current) => ({ ...current, game: value }));
                      setPage(1);
                    }}
                  >
                    <option value="all">Tất cả</option>
                    {gameOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </SelectField>

                  <SelectField
                    value={filters.sort}
                    icon={<SlidersHorizontal size={16} />}
                    label="Sắp xếp"
                    onChange={(value) => {
                      setFilters((current) => ({ ...current, sort: value as Filters['sort'] }));
                      setPage(1);
                    }}
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="amount-desc">Giá cao nhất</option>
                    <option value="amount-asc">Giá thấp nhất</option>
                  </SelectField>

                  <SelectField
                    value={filters.time}
                    icon={<CalendarRange size={16} />}
                    label="Thời gian"
                    onChange={(value) => {
                      setFilters((current) => ({ ...current, time: value as Filters['time'] }));
                      setPage(1);
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="24h">24 giờ</option>
                    <option value="7d">7 ngày</option>
                    <option value="30d">30 ngày</option>
                  </SelectField>
                </div>
              </div>

              <div className="grid gap-3 px-5 pt-2.5 sm:px-6 lg:px-7">
                <div className="flex flex-wrap gap-2.5">
                  {STATUS_OPTIONS.map((option) => {
                    const active = filters.status === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={classNames(
                          'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-all duration-200',
                          active
                            ? 'border-cyan/35 bg-cyan/12 text-cyan-100'
                            : 'border-white/10 bg-white/[0.04] text-slate-300 hover:-translate-y-px hover:border-cyan/20 hover:bg-cyan/10 hover:text-cyan-50',
                        )}
                        onClick={() => {
                          setFilters((current) => ({ ...current, status: option.value }));
                          setPage(1);
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

      <div className="px-5 pb-7 pt-8 sm:px-6 sm:pb-8 lg:px-7">
        {isLoading ? (
          <OrderListSkeleton />
                ) : isError ? (
                  <EmptyState
                    title="Không tải được đơn hàng"
                    description={ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Đã có lỗi xảy ra khi tải lịch sử đơn hàng.'}
                    variant="compact"
                  />
                ) : pageItems.length ? (
                  <>
                    <div className="grid gap-5">
                      {pageItems.map((item) => (
                        <OrderListItem
                          key={item.order.id}
                          item={item}
                          selected={item.order.id === selectedOrderId}
                          onSelect={() => setSelectedOrderId(item.order.id)}
                        />
                      ))}
                    </div>

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
                  </>
                ) : (
                  <EmptyState
                    title="Không có đơn hàng phù hợp"
                    description={filters.search.trim() ? 'Thử đổi từ khóa hoặc bộ lọc để xem kết quả khác.' : 'Đơn hàng sẽ xuất hiện ở đây sau khi bạn đặt nạp game.'}
                    variant="compact"
                  />
                )}
              </div>
            </section>

            <OrderDetailPanel busy={cancelOrderMutation.isPending} onCancel={handleCancel} orderItem={selectedOrder} />
          </div>
        </div>
      </AppPageContainer>
    </div>
  );
}

function OrderDetailPanel({
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
      <aside className={classNames(PANEL_CLASS, 'grid gap-4 p-5 lg:sticky lg:top-24')}>
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">CHI TIẾT ĐƠN</p>
          <h2 className="m-0 text-[1.25rem] font-black tracking-[-0.03em] text-white">Chọn một đơn hàng</h2>
        </div>
        <EmptyState
          title="Chưa có đơn được chọn"
          description="Chi tiết, thông tin thanh toán và timeline sẽ hiện ở đây."
          variant="compact"
        />
      </aside>
    );
  }

  return (
    <aside className={classNames(PANEL_CLASS, 'grid gap-6 p-5 lg:sticky lg:top-24')}>
      <div className="grid gap-1">
        <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">CHI TIẾT ĐƠN</p>
        <h2 className="m-0 text-[1.35rem] font-black tracking-[-0.03em] text-white">Đơn hàng đang chọn</h2>
      </div>

      <div className="grid gap-0">
        <div className="grid gap-4 pb-5 border-b border-white/10">
          <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
            <div className="relative aspect-square overflow-hidden rounded-[22px] bg-slate-950">
              <ImageBox src={orderItem.gameThumbnailSrc} alt={orderItem.gameName} className="h-full w-full object-cover" />
            </div>
            <div className="grid content-start gap-2">
              <h3 className="m-0 text-[1.1rem] font-black tracking-[-0.04em] text-white">{orderItem.gameName}</h3>
              <p className="m-0 text-sm font-semibold text-cyan-100">{orderItem.packageName}</p>
              <Badge variant={orderItem.statusVariant} icon={orderItem.statusIcon} className="w-fit rounded-full">
                {orderItem.statusLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 py-5 border-b border-white/10">
        <DetailRow label="Mã đơn hàng" value={orderItem.orderCode} />
        <DetailRow label="Số tiền" value={orderItem.amountLabel} />
        <DetailRow label="Thông tin nhân vật" value={formatGameInfo(orderItem.gameAccountInfo)} />
        <DetailRow label="Thời gian tạo" value={orderItem.createdAtLabel} />
        <DetailRow label="Cập nhật gần nhất" value={orderItem.updatedAtLabel} last />
      </div>

      <div className="grid gap-3 py-5 border-b border-white/10">
        <div className="grid gap-1">
          <h3 className="m-0 text-[1.05rem] font-black tracking-[-0.03em] text-white">Timeline đơn hàng</h3>
        </div>
        <OrderTimeline steps={orderItem.timeline} />
      </div>

      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        {canCancelOrder(orderItem.order.status) ? (
          <Button variant="secondary" className="justify-center rounded-[16px] px-5 text-sm font-bold" disabled={busy} onClick={() => void onCancel(orderItem.order.id)}>
            {busy ? 'Đang xử lý...' : 'Hủy đơn hàng'}
          </Button>
        ) : (
          <Button variant="secondary" className="justify-center rounded-[16px] px-5 text-sm font-bold" disabled>
            Không thể hủy
          </Button>
        )}

        <Button variant="outline" className="justify-center rounded-[16px] px-5 text-sm font-bold text-slate-200">
          <Headphones size={16} />
          Liên hệ hỗ trợ
        </Button>
      </div>
    </aside>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div className={classNames('grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4', !last && 'border-b border-white/5 pb-3')}>
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}

function OrderListItem({
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
        'group grid gap-5 rounded-[22px] border border-white/[0.08] px-4 py-5 text-left transition-all duration-200 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center sm:px-5',
        selected
          ? 'bg-[rgba(7,16,31,0.62)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]'
          : 'bg-[rgba(255,255,255,0.02)] hover:border-cyan/18 hover:bg-[rgba(255,255,255,0.05)] hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14),0_0_0_1px_rgba(34,211,238,0.04)]',
      )}
      onClick={onSelect}
    >
      <div className="relative aspect-square overflow-hidden rounded-[18px] bg-slate-950">
        <ImageBox src={item.gameThumbnailSrc} alt={item.gameName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-[1.02rem] font-black tracking-[-0.03em] text-white">{item.gameName}</strong>
          <span className="inline-flex rounded-full border border-cyan/20 bg-cyan/10 px-2.5 py-1 text-[0.78rem] font-bold text-cyan-100">{item.packageName}</span>
        </div>
        <div className="grid gap-1 text-sm text-slate-400">
          <span>{item.orderCode}</span>
          <span>{item.createdAtLabel}</span>
          <span>{item.gameAccountInfo}</span>
        </div>
      </div>

      <div className="grid justify-items-start gap-2 sm:justify-items-end">
        <strong className="text-[1.05rem] font-black tracking-[-0.03em] text-cyan-100 gt-tabular">{item.amountLabel}</strong>
        <Badge variant={item.statusVariant} icon={item.statusIcon} className="rounded-full">
          {item.statusLabel}
        </Badge>
        <span className="text-sm text-slate-400">{item.createdRelativeLabel}</span>
      </div>
    </button>
  );
}

function OrderTimeline({ steps }: { steps: OrderHistoryItem['timeline'] }) {
  return (
    <div className="relative grid gap-6 pl-0.5">
      <div className="absolute left-[19px] top-1 bottom-1 w-px rounded-full bg-gradient-to-b from-cyan-300/20 via-white/12 to-white/0" />
      {steps.map((step) => (
        <div key={step.label} className="relative grid grid-cols-[auto_minmax(0,1fr)] gap-4">
          <div className="relative z-10 flex flex-col items-center pt-0.5">
            <div
              className={classNames(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border ring-4 ring-transparent',
                step.state === 'complete'
                  ? 'border-emerald-300/70 bg-emerald-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,197,94,0.14),0_0_22px_rgba(34,197,94,0.28)]'
                  : step.state === 'current'
                    ? 'border-cyan-300/75 bg-cyan-400 text-slate-950 shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_26px_rgba(34,211,238,0.34)]'
                    : step.state === 'danger'
                      ? 'border-rose-300/70 bg-rose-500 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.16),0_0_24px_rgba(239,68,68,0.28)]'
                  : 'border-slate-700 bg-slate-800 text-slate-500',
              )}
            >
              {step.icon}
            </div>
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
                  ? 'text-cyan-200'
                  : step.state === 'danger'
                    ? 'text-rose-200'
                    : 'text-slate-500',
                )}
              >
                {step.time ?? (step.state === 'current' ? 'Hiện tại' : step.state === 'complete' ? 'Đã xong' : step.state === 'danger' ? 'Đã hủy' : 'Sắp tới')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = 'cyan',
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose';
}) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'
      : tone === 'amber'
        ? 'border-amber-400/15 bg-amber-400/10 text-amber-300'
        : tone === 'rose'
          ? 'border-rose-400/15 bg-rose-400/10 text-rose-300'
          : 'border-cyan/15 bg-cyan/10 text-cyan-100';

  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-5">
      <span className={classNames('grid size-12 place-items-center rounded-[16px] border', toneClassName)}>{icon}</span>
      <div className="grid gap-1">
        <span className="text-sm font-semibold text-slate-400">{label}</span>
        <strong className="text-[1.6rem] font-black tracking-[-0.05em] text-white gt-tabular">{value}</strong>
      </div>
    </article>
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
    <label className="flex min-h-[3.75rem] items-center gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] sm:px-5">
      <span className="inline-flex size-8 items-center justify-center rounded-[13px] border border-cyan/15 bg-cyan/10 text-cyan-50">{icon}</span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-slate-500">{label}</span>
        <select className="w-full appearance-none border-0 bg-transparent p-0 pr-7 text-sm font-semibold text-white outline-none focus:ring-0" value={value} onChange={(event) => onChange(event.target.value)}>
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
    <label className="flex min-h-[3.75rem] items-center gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)] sm:px-5">
      <Search size={18} className="shrink-0 text-slate-400" />
      <input className="w-full border-0 bg-transparent p-0 text-sm text-white outline-none placeholder:text-slate-500 focus:ring-0" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Pagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  const pages = getPaginationPages(currentPage, totalPages);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-5" aria-label="Phân trang đơn hàng">
      <PagerButton ariaLabel="Trang trước" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
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

      <PagerButton ariaLabel="Trang sau" disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
        <ChevronDown size={16} className="-rotate-90" />
      </PagerButton>
    </nav>
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

function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 gt-page-grid opacity-[0.05]" />
    </>
  );
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

function sortOrderHistoryItems(items: ReturnType<typeof buildOrderHistoryItems>, sort: Filters['sort']) {
  const sorted = [...items];

  switch (sort) {
    case 'oldest':
      return sorted.sort((left, right) => left.order.createdAt.localeCompare(right.order.createdAt));
    case 'amount-desc':
      return sorted.sort((left, right) => right.amount - left.amount);
    case 'amount-asc':
      return sorted.sort((left, right) => left.amount - right.amount);
    case 'newest':
    default:
      return sorted.sort((left, right) => right.order.createdAt.localeCompare(left.order.createdAt));
  }
}

function matchesTimeFilter(createdAt: string, timeFilter: Filters['time']) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;

  const diffMs = Date.now() - created;
  const day = 1000 * 60 * 60 * 24;

  switch (timeFilter) {
    case '24h':
      return diffMs <= day;
    case '7d':
      return diffMs <= day * 7;
    case '30d':
      return diffMs <= day * 30;
    case 'all':
    default:
      return true;
  }
}

function buildStats(items: ReturnType<typeof buildOrderHistoryItems>) {
  return {
    total: items.length,
    pending: items.filter((item) => item.statusGroup === 'pending').length,
    completed: items.filter((item) => item.statusGroup === 'completed').length,
    processing: items.filter((item) => item.statusGroup === 'processing').length,
    canceled: items.filter((item) => item.statusGroup === 'canceled').length,
  };
}

function canCancelOrder(status: number) {
  return status === 1 || status === 2;
}

function formatGameInfo(value: string) {
  return value.trim() || '—';
}

function ReceiptIcon() {
  return <ClipboardList size={18} />;
}

const STATUS_OPTIONS: Array<{ label: string; value: StatusGroup }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đang xử lý', value: 'processing' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'canceled' },
];

function OrderListSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Đang tải lịch sử đơn hàng">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div key={index} className="grid gap-5 rounded-[22px] border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:p-5">
          <div className="aspect-square max-h-[104px] w-full animate-pulse rounded-[18px] bg-white/6" />
          <div className="grid gap-3">
            <div className="h-5 w-48 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-36 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-28 animate-pulse rounded-full bg-white/6" />
          </div>
          <div className="grid justify-items-end gap-3">
            <div className="h-7 w-24 animate-pulse rounded-full bg-white/6" />
            <div className="h-4 w-16 animate-pulse rounded-full bg-white/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
