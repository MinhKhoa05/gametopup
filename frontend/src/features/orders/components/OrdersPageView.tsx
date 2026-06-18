import { ChevronDown, CheckCircle2, Gamepad2, Headphones, ReceiptText, SlidersHorizontal, TimerReset, XCircle, CalendarRange } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, Button, DetailRow, EmptyState, FilterChipGroup, FilterSelectField, ImageBox, MediaListItem, PanelShell, SearchBar, StatCard } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { type OrderHistoryItem } from '@/features/orders/components/OrderHistorySections';
import type { OrderStatus } from '@/features/orders/types';
import {
  STATUS_OPTIONS,
  type OrderFilters,
  type OrdersPageState,
} from '@/features/orders/hooks/useOrdersPage';

export function OrdersPageView({
  cancelBusy,
  currentPage,
  filters,
  gameOptions,
  handleCancel,
  isError,
  isLoading,
  pageItems,
  selectedOrder,
  selectedOrderId,
  setFilters,
  setPage,
  setSelectedOrderId,
  stats,
  totalPages,
}: OrdersPageState) {
  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng đơn" tone="primary" value={stats.total} icon={<ReceiptText size={18} />} />
        <StatCard label="Hoàn thành" tone="success" value={stats.completed} icon={<CheckCircle2 size={18} />} />
        <StatCard label="Đang xử lý" tone="warning" value={stats.processing} icon={<TimerReset size={18} />} />
        <StatCard label="Đã hủy" tone="danger" value={stats.canceled} icon={<XCircle size={18} />} />
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.92fr)] lg:items-start">
        <PanelShell>
          <div className="grid gap-4 px-5 pt-6 pb-2 sm:px-6 sm:pt-7 sm:pb-2.5 lg:px-7 lg:pt-8 lg:pb-3">
            <SearchBar
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
              <FilterSelectField
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
              </FilterSelectField>

              <FilterSelectField
                value={filters.sort}
                icon={<SlidersHorizontal size={16} />}
                label="Sắp xếp"
                onChange={(value) => {
                  setFilters((current) => ({ ...current, sort: value as OrderFilters['sort'] }));
                  setPage(1);
                }}
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="amount-desc">Giá cao nhất</option>
                <option value="amount-asc">Giá thấp nhất</option>
              </FilterSelectField>

              <FilterSelectField
                value={filters.time}
                icon={<CalendarRange size={16} />}
                label="Thời gian"
                onChange={(value) => {
                  setFilters((current) => ({ ...current, time: value as OrderFilters['time'] }));
                  setPage(1);
                }}
              >
                <option value="all">Tất cả</option>
                <option value="24h">24 giờ</option>
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
              </FilterSelectField>
            </div>
          </div>

          <div className="grid gap-3 px-5 pt-2.5 sm:px-6 lg:px-7">
            <FilterChipGroup
              items={STATUS_OPTIONS}
              value={filters.status}
              onChange={(value) => {
                setFilters((current) => ({ ...current, status: value as OrderFilters['status'] }));
                setPage(1);
              }}
            />
          </div>

          <div className="px-5 pb-7 pt-8 sm:px-6 sm:pb-8 lg:px-7">
            {isLoading ? (
              <OrderListSkeleton />
            ) : isError ? (
              <EmptyState
                title="Không tải được đơn hàng"
                description="Đã có lỗi xảy ra khi tải lịch sử đơn hàng."
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
        </PanelShell>

        <OrderDetailPanel busy={cancelBusy} onCancel={handleCancel} orderItem={selectedOrder} />
      </div>
    </>
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
        <PanelShell className="grid gap-6 p-5 lg:sticky lg:top-24">
        <h2 className="m-0 text-[1.25rem] font-black tracking-[-0.03em] text-white">Chọn một đơn hàng</h2>
        <EmptyState
          title="Chưa có đơn được chọn"
          description="Chi tiết, thông tin thanh toán và timeline sẽ hiện ở đây."
          variant="compact"
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell className="grid gap-8 p-5 lg:sticky lg:top-24">
      <h2 className="m-0 text-[1.35rem] font-black tracking-[-0.03em] text-white">Thông tin đơn hàng</h2>

      <div className="grid gap-0">
        <div className="grid gap-4 border-b border-white/[0.12] pb-5">
          <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
            <div className="relative aspect-square overflow-hidden rounded-[22px] bg-slate-950">
              <ImageBox src={orderItem.gameThumbnailSrc} alt={orderItem.gameName} className="h-full w-full object-cover" />
            </div>
            <div className="grid content-start gap-2">
              <h3 className="m-0 text-[1.1rem] font-black tracking-[-0.04em] text-white">{orderItem.gameName}</h3>
              <p className="m-0 text-sm font-semibold text-cyan-100">{orderItem.packageName}</p>
              <Badge tone={orderItem.statusTone} icon={orderItem.statusIcon} className="w-fit rounded-full">
                {orderItem.statusLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/[0.12] py-5">
        <DetailRow label="Mã đơn hàng">{orderItem.orderCode}</DetailRow>
        <DetailRow label="Số tiền">{orderItem.amountLabel}</DetailRow>
        <DetailRow label="Thông tin nhân vật">{formatGameInfo(orderItem.gameAccountInfo)}</DetailRow>
        <DetailRow label="Thời gian tạo">{orderItem.createdAtLabel}</DetailRow>
        <DetailRow label="Cập nhật gần nhất">{orderItem.updatedAtLabel}</DetailRow>
      </div>

      <div className="grid gap-3 border-b border-white/[0.12] py-5">
        <h3 className="m-0 text-[1.05rem] font-black tracking-[-0.03em] text-white">Tình trạng đơn hàng</h3>
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
    </PanelShell>
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
    <MediaListItem
      onClick={onSelect}
      selected={selected}
      leading={<ImageBox src={item.gameThumbnailSrc} alt={item.gameName} className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />}
      title={item.gameName}
      subtitle={item.packageName}
      meta={`${item.orderCode} · ${item.gameAccountInfo}`}
      titleAccessory={
        <Badge tone={item.statusTone} icon={item.statusIcon} className="rounded-full">
          {item.statusLabel}
        </Badge>
      }
      className="!bg-[rgba(255,255,255,0.045)] hover:!bg-[rgba(255,255,255,0.065)]"
      trailing={<strong className="text-[1.05rem] font-black tracking-[-0.03em] text-cyan-100 gt-tabular">{item.amountLabel}</strong>}
    />
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
              <div className="grid gap-1">
                <strong className="text-sm font-bold text-white">{step.label}</strong>
                {step.description ? <span className="text-[0.8rem] font-medium gt-text-muted">{step.description}</span> : null}
              </div>
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
                {step.time ?? getTimelineTimeLabel(step.state)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
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

function OrderListSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Đang tải lịch sử đơn hàng">
      {Array.from({ length: 6 }).map((_, index) => (
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

function formatGameInfo(value: string) {
  return value.trim() || '—';
}

function getTimelineTimeLabel(state: OrderHistoryItem['timeline'][number]['state']) {
  if (state === 'current') {
    return 'Hiện tại';
  }

  if (state === 'complete') {
    return 'Đã xong';
  }

  if (state === 'danger') {
    return 'Đã hủy';
  }

  return 'Sắp tới';
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

function canCancelOrder(status: OrderStatus) {
  return status === 1 || status === 2;
}
