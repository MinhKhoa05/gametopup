import { ChevronDown, Clock3, Search, SlidersHorizontal, WalletCards } from 'lucide-react';
import type { ReactNode } from 'react';
import { Badge, EmptyState, FilterChipGroup, FilterSelectField, IconBox, MediaListItem, PanelShell, SectionHeading } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
import type { WalletDepositRequest } from '@/features/deposits/types';
import type { WalletTransaction, WalletTransactionType } from '@/features/wallet/types';

export const WALLET_HISTORY_PAGE_SIZE = 8;

const HISTORY_SUB_TABS = [
  { label: 'Lịch sử nạp tiền', value: 'deposit' },
  { label: 'Biến động số dư', value: 'ledger' },
] as const;

export type WalletHistoryView = (typeof HISTORY_SUB_TABS)[number]['value'];
export type WalletHistorySort = 'newest' | 'oldest' | 'amount-desc' | 'amount-asc';
export type WalletHistoryTime = 'all' | '24h' | '7d' | '30d';
export type WalletDepositStatusFilter = 'active' | 'all' | 'pending' | 'success' | 'failed';
export type WalletLedgerStatusFilter = 'all' | 'credit' | 'debit' | 'refund';
export type WalletBankFilter = 'all' | string;

export type WalletHistoryFilters = {
  search: string;
  bank: WalletBankFilter;
  sort: WalletHistorySort;
  time: WalletHistoryTime;
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
  statusBadge: ReturnType<typeof getDepositRequestStatus>['tone'];
  statusFilter: WalletDepositStatusFilter;
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
  badgeTone: 'success' | 'danger' | 'primary';
  statusFilter: WalletLedgerStatusFilter;
  searchText: string;
};

export type WalletHistoryRow = DepositHistoryRow | LedgerHistoryRow;

type TransactionMeta = {
  badgeTone: 'success' | 'danger' | 'primary';
  label: string;
  statusFilter: WalletLedgerStatusFilter;
};

const TRANSACTION_META_BY_TYPE: Record<WalletTransactionType, TransactionMeta> = {
  1: {
    badgeTone: 'success',
    label: 'Nạp tiền vào ví',
    statusFilter: 'credit',
  },
  2: {
    badgeTone: 'danger',
    label: 'Rút tiền',
    statusFilter: 'debit',
  },
  3: {
    badgeTone: 'primary',
    label: 'Mua game',
    statusFilter: 'debit',
  },
  4: {
    badgeTone: 'danger',
    label: 'Hoàn tiền',
    statusFilter: 'refund',
  },
};

export type WalletHistoryPanelProps = {
  bankOptions: Array<{ label: string; value: string }>;
  currentPage: number;
  filters: WalletHistoryFilters;
  mode: WalletHistoryView;
  onChange: (patch: Partial<WalletHistoryFilters>) => void;
  onPageChange: (page: number) => void;
  onViewChange: (view: WalletHistoryView) => void;
  rows: WalletHistoryRow[];
  totalPages: number;
};

export function WalletHistoryPanel({
  bankOptions,
  currentPage,
  filters,
  mode,
  onChange,
  onPageChange,
  onViewChange,
  rows,
  totalPages,
}: WalletHistoryPanelProps) {
  return (
    <PanelShell className="grid gap-5 p-5 sm:p-6 lg:p-7">
      <SectionHeading
        title="Dòng tiền & giao dịch"
        titleClassName="text-[1.35rem]"
        description="Theo dõi lịch sử nạp và biến động số dư trong cùng một nơi."
      />

      <div className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <FilterChipGroup items={HISTORY_SUB_TABS} value={mode} onChange={onViewChange} />
        </div>

        <HistoryFiltersBar
          bankOptions={bankOptions}
          filters={filters}
          mode={mode}
          onChange={onChange}
        />

        <HistoryList
          mode={mode}
          rows={rows}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </PanelShell>
  );
}

export function buildWalletHistoryRows(depositRequests: WalletDepositRequest[], transactions: WalletTransaction[]) {
  const depositRows = depositRequests.map<DepositHistoryRow>((request) => {
    const status = getDepositRequestStatus(request.status);
    const statusFilter: WalletDepositStatusFilter =
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
      statusBadge: status.tone,
      statusFilter,
      searchText,
      bankId: request.bankId,
    };
  });

  const ledgerRows = transactions.map<LedgerHistoryRow>((transaction) => {
    const meta = TRANSACTION_META_BY_TYPE[transaction.type];
    const code = normalizeCode(`TX${transaction.id}`, 'TX');
    const delta = transaction.amount;
    const searchText = [code, transaction.referenceId ?? '', meta.label, formatCurrency(transaction.amount), formatCurrency(transaction.balanceAfter)].join(' ').toLowerCase();

    return {
      kind: 'ledger',
      id: transaction.id,
      code,
      createdAt: transaction.createdAt,
      title: meta.label,
      delta,
      balanceAfter: transaction.balanceAfter,
      badgeTone: meta.badgeTone,
      statusFilter: meta.statusFilter,
      searchText,
    };
  });

  return [...depositRows, ...ledgerRows].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function sortWalletHistoryRows(rows: WalletHistoryRow[], sort: WalletHistorySort) {
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

export function getBankOptions(depositRequests: WalletDepositRequest[]) {
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

export function matchesTimeFilter(createdAt: string, timeFilter: WalletHistoryTime) {
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

function HistoryFiltersBar({
  bankOptions,
  filters,
  mode,
  onChange,
}: {
  bankOptions: Array<{ label: string; value: string }>;
  filters: WalletHistoryFilters;
  mode: WalletHistoryView;
  onChange: (patch: Partial<WalletHistoryFilters>) => void;
}) {
  const statusOptions = getHistoryStatusOptions(mode);

  return (
    <div className="grid gap-4">
      <SearchField
        value={filters.search}
        placeholder={mode === 'deposit' ? 'Tìm kiếm mã yêu cầu, ngân hàng, nội dung...' : 'Tìm kiếm mã giao dịch, loại giao dịch...'}
        onChange={(value) => onChange({ search: value })}
      />

      <FilterChipGroup
        items={statusOptions}
        value={filters.status}
        onChange={(value) => onChange({ status: value })}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <FilterSelectField
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
        </FilterSelectField>

        <FilterSelectField
          value={filters.sort}
          icon={<SlidersHorizontal size={16} />}
          label="Sắp xếp"
          onChange={(value) => onChange({ sort: value as WalletHistorySort })}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="amount-desc">Giá trị cao nhất</option>
          <option value="amount-asc">Giá trị thấp nhất</option>
        </FilterSelectField>

        <FilterSelectField
          value={filters.time}
          icon={<Clock3 size={16} />}
          label="Thời gian"
          onChange={(value) => onChange({ time: value as WalletHistoryTime })}
        >
          <option value="all">Tất cả</option>
          <option value="24h">24 giờ</option>
          <option value="7d">7 ngày</option>
          <option value="30d">30 ngày</option>
        </FilterSelectField>
      </div>
    </div>
  );
}

function HistoryList({
  mode,
  rows,
}: {
  mode: WalletHistoryView;
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
    <div className="grid gap-3">
      {rows.map((row) => (
        <HistoryListItem key={`${row.kind}-${row.id}`} row={row} mode={mode} />
      ))}
    </div>
  );
}

function HistoryListItem({
  mode,
  row,
}: {
  mode: WalletHistoryView;
  row: WalletHistoryRow;
}) {
  if (row.kind === 'deposit') {
    return (
      <MediaListItem
        leading={
          <IconBox size="sm" tone="primary" className="rounded-[16px]">
            <WalletCards size={16} />
          </IconBox>
        }
        title={row.methodLabel}
        subtitle={`${row.code} · ${row.bankLabel}`}
        meta={formatShortDateTime(row.createdAt)}
        titleAccessory={
          <Badge tone={row.statusBadge} className="rounded-full">
            {row.statusLabel}
          </Badge>
        }
        trailing={<strong className="text-[1.05rem] font-black tracking-[-0.03em] text-[var(--gt-primary-hover)] gt-tabular">{formatCurrency(row.amount)}</strong>}
      />
    );
  }

  const sign = row.delta >= 0 ? '+' : '-';
  const deltaClassName = row.delta >= 0 ? 'text-[var(--gt-success)]' : 'text-[var(--gt-danger)]';
  const leadingTone = row.delta >= 0 ? 'soft' : 'neutral';

  return (
    <MediaListItem
      leading={
        <IconBox size="sm" tone={leadingTone} className="rounded-[16px]">
          <Clock3 size={16} />
        </IconBox>
      }
      title={row.title}
      subtitle={`${row.code} · ${mode === 'ledger' ? 'Biến động số dư' : ''}`.trim()}
      meta={formatShortDateTime(row.createdAt)}
      titleAccessory={
        <Badge tone={row.badgeTone === 'success' ? 'success' : row.badgeTone === 'danger' ? 'danger' : 'primary'} className="rounded-full">
          {row.delta >= 0 ? 'Cộng tiền' : 'Trừ tiền'}
        </Badge>
      }
      trailing={
        <div className="grid justify-items-end gap-1">
          <strong className={classNames('text-[1.05rem] font-black tracking-[-0.03em] gt-tabular', deltaClassName)}>
            {sign}
            {formatCurrency(Math.abs(row.delta))}
          </strong>
          <span className="text-xs font-semibold gt-text-disabled gt-tabular">{formatCurrency(row.balanceAfter)}</span>
        </div>
      }
    />
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
    <label className="flex min-h-16 items-center gap-3 rounded-[20px] border gt-border bg-[var(--gt-card)] px-5 gt-text-soft transition-all duration-200 hover:-translate-y-px hover:border-[color:var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] focus-within:border-[color:var(--gt-border-accent)] focus-within:bg-[var(--gt-card-hover)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]">
      <Search size={18} className="shrink-0 gt-text-muted" />
      <input
        className="w-full border-0 bg-transparent p-0 text-sm gt-text outline-none placeholder:text-[var(--gt-text-disabled)] focus:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
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
          <span key={`ellipsis-${index}`} className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm font-bold gt-text-disabled">
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border gt-border bg-[var(--gt-card)] gt-text-soft transition-all duration-200 hover:-translate-y-px hover:border-[color:var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)] disabled:cursor-not-allowed disabled:opacity-40"
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
          ? 'border-[color:var(--gt-primary-border)] bg-[var(--gt-primary)] text-[var(--gt-primary-text)] shadow-[0_10px_22px_rgba(34,211,238,0.16)]'
          : 'border gt-border bg-[var(--gt-card)] gt-text-soft hover:-translate-y-px hover:border-[color:var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)] hover:text-[var(--gt-text)]',
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function getHistoryStatusOptions(mode: WalletHistoryView) {
  if (mode === 'ledger') {
    return [
      { label: 'Tất cả', value: 'all' },
      { label: 'Cộng tiền', value: 'credit' },
      { label: 'Trừ tiền', value: 'debit' },
      { label: 'Hoàn tiền', value: 'refund' },
    ] as const;
  }

  return [
    { label: 'Cần theo dõi', value: 'active' },
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

function getSortAmount(row: WalletHistoryRow) {
  return row.kind === 'deposit' ? row.amount : Math.abs(row.delta);
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
