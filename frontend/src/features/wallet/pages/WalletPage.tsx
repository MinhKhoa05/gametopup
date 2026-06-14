import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  CreditCard,
  Headphones,
  History,
  Info,
  QrCode,
  ReceiptText,
  Search,
  SlidersHorizontal,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { routes } from '@/app/router/routes';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import {
  useConfirmDepositTransferMutation,
  useCreateDepositRequestMutation,
  useMyDepositRequestsQuery,
  useWalletBalanceQuery,
  useWalletTransactionsQuery,
} from '@/features/wallet/server';
import { Badge, EmptyState, IconBox } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';
import { formatCurrency } from '@/shared/lib/format';
import { getDepositRequestStatus } from '@/features/wallet/lib/deposit-request-status';
import type { DepositRequest, WalletTransaction, WalletTransactionType } from '@/features/wallet/types';

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000] as const;
const HISTORY_PAGE_SIZE = 8;

const VIEW_TABS = [
  { label: 'Nạp tiền vào ví', value: 'deposit' },
  { label: 'Lịch sử nạp tiền', value: 'history' },
] as const;

const HISTORY_SUB_TABS = [
  { label: 'Lịch sử nạp tiền', value: 'deposit' },
  { label: 'Biến động số dư', value: 'ledger' },
] as const;

type WalletView = (typeof VIEW_TABS)[number]['value'];
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
  const createDepositRequestMutation = useCreateDepositRequestMutation();
  const confirmDepositTransferMutation = useConfirmDepositTransferMutation();

  const [view, setView] = useState<WalletView>('deposit');
  const [historyView, setHistoryView] = useState<HistoryView>('deposit');
  const [amount, setAmount] = useState(String(QUICK_AMOUNTS[1]));
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
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
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  useEffect(() => {
    setHistoryPage(1);
  }, [historyFilters, historyView]);

  useEffect(() => {
    setHistoryFilters((current) => ({ ...current, bank: 'all', status: 'all' }));
  }, [historyView]);

  const activeRequest = useMemo(() => {
    if (!depositRequests.length) return null;
    if (activeRequestId && depositRequests.some((request) => request.id === activeRequestId)) {
      return depositRequests.find((request) => request.id === activeRequestId) ?? depositRequests[0];
    }
    return depositRequests[0];
  }, [activeRequestId, depositRequests]);

  const paymentExpiry = activeRequest ? new Date(new Date(activeRequest.createdAt).getTime() + 15 * 60 * 1000).getTime() : null;
  const remainingSeconds = paymentExpiry ? Math.max(0, Math.floor((paymentExpiry - now) / 1000)) : 0;
  const remainingLabel = paymentExpiry ? formatCountdown(remainingSeconds) : '--:--';

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

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <WalletStatCard label="Số dư hiện tại" value={formatCurrency(stats.balance)} icon={<WalletCards size={20} />} tone="cyan" />
            <WalletStatCard label="Tổng đã nạp" value={formatCurrency(stats.topupAmount)} icon={<ArrowUpRight size={20} />} tone="emerald" />
            <WalletStatCard label="Yêu cầu nạp" value={`${stats.requests} yêu cầu`} icon={<Clock3 size={20} />} tone="amber" />
            <WalletStatCard label="Giao dịch gần đây" value={`${stats.transactions} giao dịch`} icon={<ReceiptText size={20} />} tone="sky" />
          </section>

          <section className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-[rgba(255,255,255,0.02)] p-1.5">
            <div className="flex flex-wrap gap-2">
              {VIEW_TABS.map((tab) => {
                const active = view === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    className={classNames(
                      'inline-flex min-h-12 items-center rounded-full px-4 text-sm font-semibold transition-all duration-200 sm:px-5',
                      active
                        ? 'bg-cyan-400 text-slate-950 shadow-[0_10px_24px_rgba(34,211,238,0.16)]'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white',
                    )}
                    onClick={() => setView(tab.value)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <section className={SHEET_CLASS}>
              {view === 'deposit' ? (
                <div className="grid xl:grid-cols-[minmax(0,0.4fr)_1px_minmax(0,0.6fr)]">
                  <div className="border-b border-white/[0.08] p-5 sm:p-6 lg:p-7 xl:border-b-0 xl:border-r xl:border-white/[0.08]">
                    <DepositPanel
                      amount={amount}
                      amountError={amountError}
                      busy={createDepositRequestMutation.isPending}
                      onAmountChange={(event) => {
                        const next = event.target.value.replace(/\D/g, '');
                        setAmount(next);
                        setAmountError(null);
                      }}
                      onQuickPick={(value) => {
                        setAmount(String(value));
                        setAmountError(null);
                      }}
                      onSubmit={async (event) => {
                        event.preventDefault();
                        setAmountError(null);

                        const parsedAmount = Number.parseInt(amount, 10);
                        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                          setAmountError('Vui lòng nhập số tiền hợp lệ.');
                          return;
                        }

                        const request = await createDepositRequestMutation.mutateAsync({ amount: parsedAmount });
                        setActiveRequestId(request.id);
                      }}
                    />
                  </div>

                  <div className="hidden xl:block" />

                  <div className="p-5 sm:p-6 lg:p-7">
                    <PaymentPanel
                      activeRequest={activeRequest}
                      busy={confirmDepositTransferMutation.isPending}
                      copiedKey={copiedKey}
                      remainingLabel={remainingLabel}
                      onConfirm={async () => {
                        if (!activeRequest) return;
                        const request = await confirmDepositTransferMutation.mutateAsync({ requestId: activeRequest.id });
                        setActiveRequestId(request.id);
                      }}
                      onCopy={async (key, value) => {
                        const copied = await copyValue(value);
                        if (copied) setCopiedKey(key);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="grid gap-1">
                      <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">LỊCH SỬ & BIẾN ĐỘNG</p>
                      <h2 className="m-0 text-[1.35rem] font-black tracking-[-0.04em] text-white">Dòng tiền và giao dịch</h2>
                    </div>

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
              )}
            </section>
          </section>
        </div>
      </AppPageContainer>
    </div>
  );
}

function DepositPanel({
  amount,
  amountError,
  busy,
  onAmountChange,
  onQuickPick,
  onSubmit,
}: {
  amount: string;
  amountError: string | null;
  busy: boolean;
  onAmountChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onQuickPick: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const formattedAmount = amount ? new Intl.NumberFormat('vi-VN').format(Number(amount)) : '';

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">BƯỚC 1</p>
        <h2 className="m-0 text-[1.2rem] font-black tracking-[-0.03em] text-white">Tạo yêu cầu nạp tiền</h2>
        <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">Nhập số tiền bạn muốn nạp vào ví.</p>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-2.5">
          <label htmlFor="wallet-deposit-amount" className="text-sm font-semibold text-slate-200">
            Số tiền nạp
          </label>
          <div className="relative">
            <input
              id="wallet-deposit-amount"
              inputMode="numeric"
              autoComplete="off"
              value={formattedAmount}
              onChange={onAmountChange}
              placeholder="100.000"
              className="h-14 w-full rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 pr-12 text-[1rem] font-semibold tracking-[0.01em] text-white outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-cyan-300/30 hover:bg-[rgba(255,255,255,0.05)] focus:border-cyan-300/55 focus:bg-[rgba(255,255,255,0.05)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.95rem] font-semibold text-slate-400">đ</span>
          </div>
          {amountError ? <p className="m-0 text-sm text-rose-300">{amountError}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {QUICK_AMOUNTS.map((value) => {
            const selected = amount === String(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => onQuickPick(value)}
                className={classNames(
                  'min-h-12 rounded-[14px] border px-3 py-3 text-sm font-semibold transition-all duration-200',
                  selected
                    ? 'border-cyan-300/75 bg-cyan-400/12 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_22px_rgba(34,211,238,0.16)]'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/35 hover:bg-white/[0.05] hover:text-white',
                )}
              >
                {formatCurrency(value)}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-cyan/30 bg-cyan-400 px-5 text-[1rem] font-semibold text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:translate-y-0 disabled:opacity-60"
          >
            <WalletCards size={18} />
            Tạo mã QR nạp tiền
          </button>

          <button
            type="button"
            disabled
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-transparent px-5 text-[1rem] font-semibold text-slate-300 opacity-35 transition-all duration-200 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={18} />
            Tôi đã chuyển khoản
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentPanel({
  activeRequest,
  busy,
  copiedKey,
  remainingLabel,
  onConfirm,
  onCopy,
}: {
  activeRequest: DepositRequest | null;
  busy: boolean;
  copiedKey: string | null;
  remainingLabel: string;
  onConfirm: () => Promise<void>;
  onCopy: (key: string, value: string) => Promise<void>;
}) {
  const status = activeRequest ? getDepositRequestStatus(activeRequest.status) : null;

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <p className="m-0 text-[0.72rem] font-bold tracking-[0.18em] text-cyan-100">BƯỚC 2</p>
        <h2 className="m-0 text-[1.2rem] font-black tracking-[-0.03em] text-white">Thông tin chuyển khoản</h2>
        <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">Sao chép đúng nội dung chuyển khoản để hệ thống ghi nhận nhanh.</p>
      </div>

      {activeRequest ? (
        <div className="grid gap-5">
          <div className="grid gap-5 border-b border-white/[0.08] pb-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-[16px] border border-cyan/15 bg-cyan/10 text-cyan-50">
                  <QrCode size={22} />
                </span>
                <div className="grid gap-0.5">
                  <strong className="text-sm font-black text-white">QR thanh toán</strong>
                  <span className="text-xs text-slate-400">Mã nạp riêng cho yêu cầu này</span>
                </div>
              </div>
              <Badge variant={status?.badgeVariant ?? 'warning'} className="rounded-full">
                {status?.label ?? 'Đang chờ'}
              </Badge>
            </div>

            <div className="grid place-items-center rounded-[24px] border border-white/[0.08] bg-transparent p-3">
              <img src={activeRequest.qrImageUrl} alt="Mã QR chuyển khoản" className="w-full max-w-[300px] rounded-[16px]" />
            </div>
          </div>

          <div className="grid gap-1">
            <PaymentRow
              label="Ngân hàng"
              value={resolveBankDisplayName(activeRequest.bankId)}
            />
            <PaymentRow
              label="Số tài khoản"
              value={activeRequest.accountNo}
              copyKey="accountNo"
              copiedKey={copiedKey}
              onCopy={() => void onCopy('accountNo', activeRequest.accountNo)}
            />
            <PaymentRow
              label="Nội dung"
              value={activeRequest.transferContent}
              copyKey="transferContent"
              copiedKey={copiedKey}
              highlighted
              onCopy={() => void onCopy('transferContent', activeRequest.transferContent)}
            />
          </div>

          <div className="grid gap-3 border-t border-white/[0.08] pt-5 sm:grid-cols-2">
            <button
              type="button"
              disabled={!activeRequest || busy}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-transparent px-5 text-[1rem] font-semibold text-slate-200 transition-all duration-200 hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.04)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void onConfirm()}
            >
              <CheckCircle2 size={18} />
              Tôi đã chuyển khoản
            </button>

            <button
              type="button"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-white/10 bg-transparent px-5 text-[1rem] font-semibold text-slate-200 transition-all duration-200 hover:border-cyan/25 hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
            >
              <Headphones size={18} />
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      ) : (
        <div className="grid place-items-center gap-4 border border-dashed border-white/10 px-6 py-14 text-center">
          <span className="grid size-16 place-items-center rounded-[24px] border border-cyan/15 bg-cyan/10 text-cyan-100">
            <QrCode size={28} />
          </span>
          <div className="grid gap-1">
            <strong className="text-base font-black text-white">Chưa có yêu cầu nạp đang hoạt động</strong>
            <p className="m-0 max-w-md text-sm leading-7 text-slate-400">Tạo một yêu cầu nạp ở khung bên trái để hiện QR, ngân hàng và nội dung chuyển khoản.</p>
          </div>
        </div>
      )}
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
          icon={<CreditCard size={16} />}
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
          <HistoryRow key={`${row.kind}-${row.id}`} row={row} mode={mode} />
        ))}
      </div>
    </div>
  );
}

function HistoryRow({
  mode,
  row,
}: {
  mode: HistoryView;
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
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
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
    <article className="group grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[22px] border border-white/[0.08] bg-[rgba(255,255,255,0.03)] p-4 transition-all duration-200 hover:border-white/[0.12] hover:bg-[rgba(255,255,255,0.05)]">
      <span className={classNames('grid size-11 place-items-center rounded-[16px] border transition-colors duration-200', toneClassName)}>{icon}</span>
      <div className="grid gap-1">
        <span className="text-[0.9rem] font-semibold text-slate-400">{label}</span>
        <strong className="text-[clamp(1.2rem,1.65vw,1.55rem)] font-black tracking-[-0.04em] text-white gt-tabular">{value}</strong>
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

function PaymentRow({
  label,
  value,
  copyKey,
  copiedKey,
  highlighted,
  onCopy,
}: {
  label: string;
  value: ReactNode;
  copyKey?: string;
  copiedKey?: string | null;
  highlighted?: boolean;
  onCopy?: () => void;
}) {
  return (
    <div className={classNames('grid grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] items-center gap-3 py-1.5', highlighted ? 'rounded-[8px] bg-cyan-400/5 px-0.5' : '')}>
      <span className="min-w-0 text-[0.84rem] leading-5 text-slate-400">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <div className="min-w-0 truncate text-right text-sm font-semibold text-white">{value}</div>
        {copyKey && onCopy ? (
          <button
            type="button"
            aria-label={`Sao chép ${label}`}
            title={`Sao chép ${label}`}
            onClick={onCopy}
            className={classNames(
              'inline-flex size-7 shrink-0 items-center justify-center rounded-[6px] border transition-colors',
              copiedKey === copyKey
                ? 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100'
                : 'border-cyan-300/15 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10 hover:text-cyan-50',
            )}
          >
            <Copy size={12} />
          </button>
        ) : null}
      </div>
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

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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

async function copyValue(value: string) {
  if (!value.trim()) {
    toast.error('Không có nội dung để sao chép.');
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success('Đã sao chép.');
    return true;
  } catch {
    toast.error('Không thể sao chép lúc này.');
    return false;
  }
}
