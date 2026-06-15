import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  ReceiptText,
  Search,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { WalletDepositDialog } from '@/features/wallet/components/WalletDepositDialog';
import { useMyDepositRequestsQuery, useWalletBalanceQuery, useWalletTransactionsQuery } from '@/features/wallet/server';
import { Badge, EmptyState, IconBox } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import { getDepositRequestStatus } from '@/features/wallet/lib/deposit-request-status';
import type { DepositRequest, WalletTransaction, WalletTransactionType } from '@/features/wallet/types';

const HISTORY_PAGE_SIZE = 8;

const HISTORY_SUB_TABS = [
  { label: 'Lịch sử nạp tiền', value: 'deposit' },
  { label: 'Biến động số dư', value: 'ledger' },
] as const;

type HistoryView = (typeof HISTORY_SUB_TABS)[number]['value'];
type HistorySort = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
type HistoryTime = 'all' | '24h' | '7d' | '30d';
type DepositStatusFilter = 'all' | 'pending' | 'success' | 'failed';
type LedgerStatusFilter = 'all' | 'credit' | 'debit' | 'refund';
type BankFilter = 'all' | string;

type HistoryFilters = {
  search: string;
  bank: BankFilter;
  sort: HistorySort;
  time: HistoryTime;
  status: string;
};

type DepositHistoryRow = {
  kind: 'deposit';
  id: number;
  code: string;
  createdAt: string;
  amount: number;
  bankLabel: string;
  methodLabel: string;
  statusLabel: string;
  statusBadge: ReturnType<typeof getDepositRequestStatus>['badgeVariant'];
  statusFilter: DepositStatusFilter;
  searchText: string;
  bankId: string;
};

type LedgerHistoryRow = {
  kind: 'ledger';
  id: number;
  code: string;
  createdAt: string;
  title: string;
  delta: number;
  balanceAfter: number;
  badgeVariant: 'success' | 'danger' | 'accent';
  statusFilter: LedgerStatusFilter;
  searchText: string;
};

type WalletHistoryRow = DepositHistoryRow | LedgerHistoryRow;

type TransactionMeta = {
  badgeVariant: 'success' | 'danger' | 'accent';
  label: string;
  statusFilter: LedgerStatusFilter;
  deltaSign: 1 | -1;
};

const TRANSACTION_META_BY_TYPE: Record<WalletTransactionType, TransactionMeta> = {
  1: {
    badgeVariant: 'success',
    label: 'Nạp tiền vào ví',
    statusFilter: 'credit',
    deltaSign: 1,
  },
  2: {
    badgeVariant: 'danger',
    label: 'Rút tiền',
    statusFilter: 'debit',
    deltaSign: -1,
  },
  3: {
    badgeVariant: 'accent',
    label: 'Mua game',
    statusFilter: 'debit',
    deltaSign: -1,
  },
  4: {
    badgeVariant: 'danger',
    label: 'Hoàn tiền',
    statusFilter: 'refund',
    deltaSign: 1,
  },
};

const SHEET_CLASS = 'rounded-[22px] border border-white/[0.08] bg-[rgba(255,255,255,0.02)] shadow-[0_18px_40px_rgba(2,6,23,0.12)]';

export function WalletPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const balanceQuery = useWalletBalanceQuery(auth.status === 'authenticated');
  const transactionsQuery = useWalletTransactionsQuery(auth.status === 'authenticated');
  const depositRequestsQuery = useMyDepositRequestsQuery(auth.status === 'authenticated');

  const [historyView, setHistoryView] = useState<HistoryView>('deposit');
  const [historyPage, setHistoryPage] = useState(1);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    search: '',
    bank: 'all',
    sort: 'newest',
    time: 'all',
    status: 'all',
  });

  const balance = balanceQuery.data ?? 0;
  const transactions = transactionsQuery.data ?? [];
  const depositRequests = depositRequestsQuery.data ?? [];

  useEffect(() => {
    setHistoryPage(1);
  }, [historyFilters, historyView]);

  useEffect(() => {
    setHistoryFilters((current) => ({ ...current, bank: 'all', status: 'all' }));
  }, [historyView]);

  const historyRows = useMemo(() => buildWalletHistoryRows(depositRequests, transactions), [depositRequests, transactions]);

  const filteredHistoryRows = useMemo(() => {
    const keyword = historyFilters.search.trim().toLowerCase();

    const filtered = historyRows.filter((row) => {
      if (historyView === 'deposit' && row.kind !== 'deposit') return false;
      if (historyView === 'ledger' && row.kind !== 'ledger') return false;

      if (historyFilters.bank !== 'all') {
        if (historyView === 'deposit' && row.kind === 'deposit' && row.bankId !== historyFilters.bank) return false;
        if (historyView === 'ledger' && row.kind === 'ledger' && row.statusFilter !== historyFilters.bank) return false;
      }
      if (historyFilters.status !== 'all' && row.statusFilter !== historyFilters.status) return false;
      if (historyFilters.time !== 'all' && !matchesTimeFilter(row.createdAt, historyFilters.time)) return false;
      if (!keyword) return true;
      return row.searchText.includes(keyword);
    });

    return sortWalletHistoryRows(filtered, historyFilters.sort);
  }, [historyFilters.bank, historyFilters.search, historyFilters.sort, historyFilters.status, historyFilters.time, historyRows, historyView]);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryRows.length / HISTORY_PAGE_SIZE));
  const currentHistoryPage = Math.min(historyPage, historyTotalPages);
  const historyPageRows = filteredHistoryRows.slice((currentHistoryPage - 1) * HISTORY_PAGE_SIZE, currentHistoryPage * HISTORY_PAGE_SIZE);

  const stats = useMemo(() => {
    const topupAmount = transactions.reduce((sum, transaction) => (transaction.type === 1 ? sum + transaction.amount : sum), 0);
    return {
      balance,
      topupAmount,
      requests: depositRequests.length,
      transactions: transactions.length,
    };
  }, [balance, depositRequests.length, transactions]);

  if (auth.status === 'checking' && !auth.user) {
    return <WalletLoadingState />;
  }

  if (!auth.user) {
    return (
      <EmptyState
        className="mx-auto mt-12 max-w-lg"
        icon={
          <IconBox className="mx-auto mb-4" size="lg">
            <WalletCards size={24} />
          </IconBox>
        }
        title="Bạn chưa đăng nhập"
        description="Vui lòng đăng nhập để quản lý ví và tạo yêu cầu nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate(routes.auth())}
      />
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <BackgroundDecor />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <header className={SHEET_CLASS}>
            <div className="flex items-center gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
              <IconBox size="lg" className="h-[62px] w-[62px] shrink-0 rounded-[18px] border-cyan/20 bg-cyan/10 text-cyan-50">
                  <WalletCards size={30} strokeWidth={1.8} />
                </IconBox>
              <div className="grid gap-2">
                  <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">QUẢN LÝ TÀI KHOẢN</p>
                  <h1 className="m-0 text-[clamp(2.3rem,3.3vw,3.6rem)] font-black leading-[0.96] tracking-[-0.06em] text-white text-balance">
                    Nạp tiền vào ví
                  </h1>
                  <p className="max-w-3xl text-[0.98rem] leading-7 text-slate-400">
                    Nhập số tiền cần nạp, hệ thống sẽ tự động tạo mã QR kèm nội dung chuyển khoản chính xác.
                  </p>
              </div>
            </div>
          </header>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,0.95fr)] xl:items-stretch">
            <aside className="relative overflow-hidden rounded-[30px] border border-cyan-300/14 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.2),transparent_26%),linear-gradient(165deg,rgba(8,16,31,0.99),rgba(7,12,24,0.99))] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.22)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_40%,rgba(255,255,255,0.03))] opacity-70" />

              <div className="relative flex min-h-[320px] flex-col gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="grid gap-1">
                    <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.24em] text-cyan-100/80">VÍ NỘI BỘ GAMETOPUP</p>
                  </div>

                  <div className="grid size-12 place-items-center rounded-[18px] border border-cyan-300/18 bg-cyan-400/12 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <WalletCards size={20} />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-white/[0.08] pt-4">
                  <div className="grid gap-1">
                    <span className="text-[0.74rem] font-black uppercase tracking-[0.22em] text-slate-500">Số dư</span>
                    <strong className="text-[clamp(2.2rem,3.9vw,4rem)] font-black tracking-[-0.08em] text-white gt-tabular">
                      {formatCurrency(stats.balance)}
                    </strong>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <button
                    type="button"
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-[16px] bg-cyan-400 px-4 text-sm font-black text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-cyan-300"
                    onClick={() => setIsDepositOpen(true)}
                  >
                    Nạp tiền
                  </button>
                </div>
              </div>
            </aside>

            <div className="grid gap-3 self-stretch">
              <WalletStatCard label="Tổng đã nạp" value={formatCurrency(stats.topupAmount)} icon={<ArrowUpRight size={20} />} tone="emerald" compact />
              <WalletStatCard label="Yêu cầu nạp" value={`${stats.requests} yêu cầu`} icon={<Clock3 size={20} />} tone="amber" compact />
              <WalletStatCard label="Giao dịch gần đây" value={`${stats.transactions} giao dịch`} icon={<ReceiptText size={20} />} tone="sky" compact />
            </div>
          </section>

          <section className="grid gap-5 rounded-[24px] border border-white/[0.08] bg-[rgba(255,255,255,0.02)] p-5 sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="grid gap-1.5">
                <h2 className="m-0 text-[1.35rem] font-black tracking-[-0.04em] text-white">Dòng tiền & giao dịch</h2>
                <p className="m-0 text-sm leading-6 text-slate-400">Theo dõi lịch sử nạp và biến động số dư trong cùng một nơi.</p>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-wrap gap-2 text-sm font-semibold">
                  {HISTORY_SUB_TABS.map((tab) => {
                    const active = historyView === tab.value;
                    return (
                      <button
                        key={tab.value}
                        type="button"
                        className={classNames(
                          'rounded-full border px-4 py-2 transition-all duration-200',
                          active
                            ? 'border-cyan-300/40 bg-cyan-400/12 text-cyan-100'
                            : 'border-white/10 text-slate-300 hover:border-cyan/20 hover:bg-white/[0.04] hover:text-white',
                        )}
                        onClick={() => setHistoryView(tab.value)}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <HistoryFiltersBar
                mode={historyView}
                filters={historyFilters}
                bankOptions={getBankOptions(depositRequests)}
                onChange={(patch) => setHistoryFilters((current) => ({ ...current, ...patch }))}
              />

              <HistoryTable
                mode={historyView}
                rows={historyPageRows}
              />

              <Pagination currentPage={currentHistoryPage} totalPages={historyTotalPages} onPageChange={setHistoryPage} />
            </div>
          </section>
        </div>
      </AppPageContainer>
      <WalletDepositDialog
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onViewHistory={() => {
          setHistoryView('deposit');
          setIsDepositOpen(false);
        }}
      />
    </div>
  );
}

function HistoryFiltersBar({
  bankOptions,
  filters,
  mode,
  onChange,
}: {
  bankOptions: Array<{ label: string; value: string }>;
  filters: HistoryFilters;
  mode: HistoryView;
  onChange: (patch: Partial<HistoryFilters>) => void;
}) {
  const statusOptions = getHistoryStatusOptions(mode);

  return (
    <div className="grid gap-4">
      <SearchField
        value={filters.search}
        placeholder={mode === 'deposit' ? 'Tìm kiếm mã yêu cầu, ngân hàng, nội dung...' : 'Tìm kiếm mã giao dịch, loại giao dịch...'}
        onChange={(value) => onChange({ search: value })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          value={filters.bank}
          icon={<WalletCards size={16} />}
          label={mode === 'deposit' ? 'Lọc ngân hàng' : 'Lọc loại'}
          onChange={(value) => onChange({ bank: value })}
        >
          <option value="all">Tất cả</option>
          {(mode === 'deposit' ? bankOptions : getLedgerFilterOptions()).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          value={filters.sort}
          icon={<SlidersHorizontal size={16} />}
          label="Sắp xếp"
          onChange={(value) => onChange({ sort: value as HistorySort })}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="amount-desc">Giá trị cao nhất</option>
          <option value="amount-asc">Giá trị thấp nhất</option>
        </SelectField>

        <SelectField
          value={filters.time}
          icon={<Clock3 size={16} />}
          label="Thời gian"
          onChange={(value) => onChange({ time: value as HistoryTime })}
        >
          <option value="all">Tất cả</option>
          <option value="24h">24 giờ</option>
          <option value="7d">7 ngày</option>
          <option value="30d">30 ngày</option>
        </SelectField>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {statusOptions.map((option) => {
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
              onClick={() => onChange({ status: option.value })}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HistoryTable({
  mode,
  rows,
}: {
  mode: HistoryView;
  rows: WalletHistoryRow[];
}) {
  if (!rows.length) {
    return (
      <EmptyState
        variant="compact"
        title={mode === 'deposit' ? 'Chưa có lịch sử nạp phù hợp' : 'Chưa có biến động phù hợp'}
        description="Thử đổi bộ lọc hoặc chuyển sang sub-tab khác để xem dữ liệu."
      />
    );
  }

  return (
    <div className="grid gap-0">
      <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] gap-4 border-b border-white/[0.08] px-1 pb-3 text-[0.78rem] font-bold uppercase tracking-[0.16em] text-slate-500 sm:grid">
        {mode === 'deposit' ? (
          <>
            <span>Mã yêu cầu</span>
            <span>Thời gian</span>
            <span>Cổng nạp</span>
            <span>Số tiền</span>
            <span>Trạng thái</span>
          </>
        ) : (
          <>
            <span>Mã giao dịch</span>
            <span>Thời gian</span>
            <span>Loại giao dịch</span>
            <span>Biến động</span>
            <span>Số dư cuối</span>
          </>
        )}
      </div>

      <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
        {rows.map((row) => (
          <HistoryRow key={`${row.kind}-${row.id}`} row={row} />
        ))}
      </div>
    </div>
  );
}

function HistoryRow({
  row,
}: {
  row: WalletHistoryRow;
}) {
  if (row.kind === 'deposit') {
    return (
      <div className="grid gap-3 px-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] sm:items-center">
        <div className="min-w-0">
          <strong className="block truncate text-sm font-black text-white">{row.code}</strong>
        </div>
        <span className="text-sm text-slate-400">{formatShortDateTime(row.createdAt)}</span>
        <span className="text-sm font-semibold text-slate-200">{row.methodLabel}</span>
        <strong className="text-sm font-black text-cyan-100 gt-tabular">{formatCurrency(row.amount)}</strong>
        <div className="flex justify-start sm:justify-end">
          <Badge variant={row.statusBadge} className="rounded-full">
            {row.statusLabel}
          </Badge>
        </div>
      </div>
    );
  }

  const sign = row.delta >= 0 ? '+' : '-';
  const deltaClassName = row.delta >= 0 ? 'text-emerald-300' : 'text-rose-300';

  return (
    <div className="grid gap-3 px-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.7fr)] sm:items-center">
      <div className="min-w-0">
        <strong className="block truncate text-sm font-black text-white">{row.code}</strong>
      </div>
      <span className="text-sm text-slate-400">{formatShortDateTime(row.createdAt)}</span>
      <span className="text-sm font-semibold text-slate-200">{row.title}</span>
      <strong className={classNames('text-sm font-black gt-tabular', deltaClassName)}>
        {sign}
        {formatCurrency(Math.abs(row.delta))}
      </strong>
      <strong className="text-sm font-black text-cyan-100 gt-tabular">{formatCurrency(row.balanceAfter)}</strong>
    </div>
  );
}

function WalletStatCard({
  icon,
  label,
  compact,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  compact?: boolean;
  tone: 'cyan' | 'emerald' | 'amber' | 'sky';
  value: string;
}) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300'
      : tone === 'amber'
        ? 'border-amber-400/15 bg-amber-400/10 text-amber-300'
        : tone === 'sky'
          ? 'border-sky-400/15 bg-sky-400/10 text-sky-200'
          : 'border-cyan/15 bg-cyan/10 text-cyan-100';

  return (
    <article
      className={classNames(
        'group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] transition-all duration-200 hover:border-white/[0.12] hover:bg-[rgba(255,255,255,0.05)]',
        compact ? 'p-3' : 'p-4',
      )}
    >
      <span className={classNames('grid place-items-center rounded-[16px] border transition-colors duration-200', compact ? 'size-10' : 'size-11', toneClassName)}>{icon}</span>
      <div className="grid gap-1">
        <span className={classNames('font-semibold text-slate-400', compact ? 'text-[0.82rem]' : 'text-[0.9rem]')}>{label}</span>
        <strong className={classNames('font-black tracking-[-0.04em] text-white gt-tabular', compact ? 'text-[1.08rem]' : 'text-[clamp(1.2rem,1.65vw,1.55rem)]')}>
          {value}
        </strong>
      </div>
    </article>
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
    <label className="flex min-h-16 items-center gap-3 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.05)] focus-within:border-cyan/60 focus-within:bg-[rgba(255,255,255,0.05)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
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
    <label className="flex min-h-16 items-center gap-3 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.05)] focus-within:border-cyan/60 focus-within:bg-[rgba(255,255,255,0.05)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
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
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-1" aria-label="Phân trang">
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] text-slate-300 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.05)] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
          : 'border-white/10 bg-[rgba(255,255,255,0.03)] text-slate-300 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.05)] hover:text-cyan-50',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function WalletLoadingState() {
  return (
    <AppPageContainer className="py-5 sm:py-7 lg:py-8" aria-busy="true">
      <div className="grid gap-6 lg:gap-7">
        <div className="h-[380px] animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[116px] animate-pulse rounded-[22px] border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[480px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          <div className="h-[480px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
        </div>
        <div className="h-[260px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
      </div>
    </AppPageContainer>
  );
}

function BackgroundDecor() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 gt-page-grid opacity-[0.045]" />
    </>
  );
}

function getBankOptions(depositRequests: DepositRequest[]) {
  const seen = new Map<string, string>();
  for (const request of depositRequests) {
    const value = request.bankId.trim();
    if (!value) continue;
    if (!seen.has(value)) {
      seen.set(value, resolveBankDisplayName(value));
    }
  }

  return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
}

function getHistoryStatusOptions(mode: HistoryView) {
  if (mode === 'ledger') {
    return [
      { label: 'Tất cả', value: 'all' },
      { label: 'Cộng tiền', value: 'credit' },
      { label: 'Trừ tiền', value: 'debit' },
      { label: 'Hoàn tiền', value: 'refund' },
    ] as const;
  }

  return [
    { label: 'Tất cả', value: 'all' },
    { label: 'Chờ duyệt', value: 'pending' },
    { label: 'Thành công', value: 'success' },
    { label: 'Đã hủy', value: 'failed' },
  ] as const;
}

function getLedgerFilterOptions() {
  return [
    { label: 'Tất cả', value: 'all' },
    { label: 'Cộng tiền', value: 'credit' },
    { label: 'Trừ tiền', value: 'debit' },
    { label: 'Hoàn tiền', value: 'refund' },
  ];
}

function buildWalletHistoryRows(depositRequests: DepositRequest[], transactions: WalletTransaction[]) {
  const depositRows = depositRequests.map<DepositHistoryRow>((request) => {
    const status = getDepositRequestStatus(request.status);
    const statusFilter: DepositStatusFilter =
      request.status === 3 ? 'success' : request.status === 4 ? 'failed' : 'pending';
    const code = normalizeCode(request.code, 'DEP');
    const bankLabel = resolveBankDisplayName(request.bankId);
    const methodLabel = `Chuyển khoản ${bankLabel}`;
    const searchText = [code, request.transferContent, bankLabel, methodLabel, status.label, formatCurrency(request.amount)].join(' ').toLowerCase();

    return {
      kind: 'deposit',
      id: request.id,
      code,
      createdAt: request.createdAt,
      amount: request.amount,
      bankLabel,
      methodLabel,
      statusLabel: status.label,
      statusBadge: status.badgeVariant,
      statusFilter,
      searchText,
      bankId: request.bankId,
    };
  });

  const ledgerRows = transactions.map<LedgerHistoryRow>((transaction) => {
    const meta = TRANSACTION_META_BY_TYPE[transaction.type];
    const code = normalizeCode(`TX${transaction.id}`, 'TX');
    const delta = meta.deltaSign === 1 ? transaction.amount : -transaction.amount;
    const searchText = [code, meta.label, transaction.description ?? '', formatCurrency(transaction.amount), formatCurrency(transaction.balanceAfter)].join(' ').toLowerCase();

    return {
      kind: 'ledger',
      id: transaction.id,
      code,
      createdAt: transaction.createdAt,
      title: meta.label,
      delta,
      balanceAfter: transaction.balanceAfter,
      badgeVariant: meta.badgeVariant,
      statusFilter: meta.statusFilter,
      searchText,
    };
  });

  return [...depositRows, ...ledgerRows].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function sortWalletHistoryRows(rows: WalletHistoryRow[], sort: HistorySort) {
  const sorted = [...rows];

  switch (sort) {
    case 'oldest':
      return sorted.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    case 'amount-desc':
      return sorted.sort((left, right) => getSortAmount(right) - getSortAmount(left));
    case 'amount-asc':
      return sorted.sort((left, right) => getSortAmount(left) - getSortAmount(right));
    case 'newest':
    default:
      return sorted.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
}

function getSortAmount(row: WalletHistoryRow) {
  return row.kind === 'deposit' ? row.amount : Math.abs(row.delta);
}

function matchesTimeFilter(createdAt: string, timeFilter: HistoryTime) {
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

function resolveBankDisplayName(bankId?: string): string {
  const normalized = bankId?.trim().toLowerCase();
  if (!normalized) return 'Ngân hàng liên kết';
  if (normalized === 'vcb' || normalized === 'vietcombank') return 'Vietcombank';
  if (normalized === 'mb' || normalized === 'mbbank') return 'MB Bank';
  if (normalized === 'acb') return 'ACB';
  return bankId ?? 'Ngân hàng liên kết';
}

function normalizeCode(value: string, prefix: string) {
  const trimmed = value.trim();
  if (!trimmed) return `#${prefix}`;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
}

function formatShortDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
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

