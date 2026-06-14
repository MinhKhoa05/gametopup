import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Headset,
  History,
  Info,
  QrCode,
  ReceiptText,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { toast } from "sonner";
import { AppPageContainer } from "@/app/components/AppPageContainer";
import { routes } from "@/app/router/routes";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  useConfirmDepositTransferMutation,
  useCreateDepositRequestMutation,
  useMyDepositRequestsQuery,
  useWalletBalanceQuery,
  useWalletTransactionsQuery,
} from "@/features/wallet/server";
import {
  Badge,
  EmptyState,
  IconBox,
  PageHero,
  TrustSection,
} from "@/shared/components";
import { classNames } from "@/shared/lib/classNames";
import { formatCurrency } from "@/shared/lib/format";
import { getDepositRequestStatus } from "@/features/wallet/lib/deposit-request-status";
import type {
  DepositRequest,
  WalletTransaction,
  WalletTransactionType,
} from "@/features/wallet/types";

const QUICK_AMOUNTS = [
  50000, 100000, 200000, 500000, 1000000, 2000000,
] as const;

const HERO_BADGES = [
  {
    icon: <ShieldCheck size={12} />,
    label: "Thanh toán an toàn",
  },
  {
    icon: <Clock3 size={12} />,
    label: "Xử lý nhanh",
  },
  {
    icon: <Headset size={12} />,
    label: "Hỗ trợ 24/7",
  },
] as const;

const REQUEST_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang chờ", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
] as const;

type RequestFilterValue = (typeof REQUEST_FILTERS)[number]["value"];

const PANEL_CLASS =
  "rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,16,31,0.94),rgba(4,10,22,0.98))] shadow-[0_16px_38px_rgba(2,6,23,0.18)]";

export function WalletPage() {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const balanceQuery = useWalletBalanceQuery(auth.status === "authenticated");
  const transactionsQuery = useWalletTransactionsQuery(
    auth.status === "authenticated",
  );
  const depositRequestsQuery = useMyDepositRequestsQuery(
    auth.status === "authenticated",
  );
  const createDepositRequestMutation = useCreateDepositRequestMutation();
  const confirmDepositTransferMutation = useConfirmDepositTransferMutation();

  const [amount, setAmount] = useState(String(QUICK_AMOUNTS[1]));
  const [amountError, setAmountError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<number | null>(null);
  const [requestFilter, setRequestFilter] = useState<RequestFilterValue>("all");
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const balance = balanceQuery.data ?? 0;
  const transactions = transactionsQuery.data ?? [];
  const depositRequests = depositRequestsQuery.data ?? [];

  const activeRequest =
    depositRequests.find((request) => request.id === activeRequestId) ??
    depositRequests[0] ??
    null;
  const activeRequestStatus = activeRequest
    ? getDepositRequestStatus(activeRequest.status)
    : null;
  const bankName = activeRequest
    ? resolveBankDisplayName(activeRequest.bankId)
    : "";
  const bankLogoLabel = activeRequest
    ? resolveBankLogoLabel(activeRequest.bankId)
    : "";

  const stats = useMemo(() => {
    const totalDeposited = transactions.reduce((sum, transaction) => {
      return transaction.type === 1 ? sum + transaction.amount : sum;
    }, 0);

    return {
      balance,
      totalDeposited,
      pendingRequests: depositRequests.filter(
        (request) => request.status === 1 || request.status === 2,
      ).length,
      transactionCount: transactions.length,
    };
  }, [balance, depositRequests, transactions]);

  const filteredRequests = useMemo(() => {
    if (requestFilter === "all") {
      return depositRequests;
    }

    return depositRequests.filter((request) => {
      if (requestFilter === "pending") {
        return request.status === 1 || request.status === 2;
      }

      if (requestFilter === "approved") {
        return request.status === 3;
      }

      if (requestFilter === "rejected") {
        return request.status === 4;
      }

      return true;
    });
  }, [depositRequests, requestFilter]);

  const visibleRequests = showAllRequests
    ? filteredRequests
    : filteredRequests.slice(0, 5);
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 5);

  useEffect(() => {
    if (!copiedKey) {
      return;
    }

    const timer = window.setTimeout(() => setCopiedKey(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  useEffect(() => {
    if (!depositRequests.length) {
      setActiveRequestId(null);
      return;
    }

    if (
      !activeRequestId ||
      !depositRequests.some((request) => request.id === activeRequestId)
    ) {
      setActiveRequestId(depositRequests[0].id);
    }
  }, [activeRequestId, depositRequests]);

  async function handleCreateDeposit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAmountError(null);

    const parsedAmount = Number.parseInt(amount, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAmountError("Vui lòng nhập số tiền hợp lệ.");
      return;
    }

    const request = await createDepositRequestMutation.mutateAsync({
      amount: parsedAmount,
    });
    setActiveRequestId(request.id);
    setShowAllRequests(true);
  }

  async function handleConfirmDeposit() {
    if (!activeRequest) {
      return;
    }

    const request = await confirmDepositTransferMutation.mutateAsync({
      requestId: activeRequest.id,
    });
    setActiveRequestId(request.id);
  }

  async function handleCopyPaymentValue(key: string, value: string) {
    const copied = await copyValue(value);
    if (copied) {
      setCopiedKey(key);
    }
  }

  function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value.replace(/\D/g, "");
    setAmount(next);
    setAmountError(null);
  }

  if (auth.status === "checking" && !auth.user) {
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
        description="Vui lòng đăng nhập để quản lý ví và nạp tiền."
        actionLabel="Đăng nhập ngay"
        onAction={() => navigate(routes.auth())}
      />
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <WalletBackground />

      <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <WalletHeroSection />

          <WalletStatsRow stats={stats} />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-stretch">
            <WalletDepositForm
              amount={amount}
              amountError={amountError}
              busy={createDepositRequestMutation.isPending}
              onAmountChange={handleAmountChange}
              onQuickPick={(value) => {
                setAmount(String(value));
                setAmountError(null);
              }}
              onSubmit={handleCreateDeposit}
            />

            <WalletPaymentCard
              activeRequest={activeRequest}
              busy={confirmDepositTransferMutation.isPending}
              copiedKey={copiedKey}
              onConfirm={handleConfirmDeposit}
              onCopy={handleCopyPaymentValue}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
            <WalletHistoryCard
              id="wallet-requests"
              type="request"
              title="Danh sách yêu cầu nạp"
              actionLabel={
                showAllRequests ? "Thu gọn yêu cầu" : "Xem tất cả yêu cầu"
              }
              emptyLabel="Chưa có yêu cầu nạp nào."
              isLoading={depositRequestsQuery.isPending}
              filterValue={requestFilter}
              items={visibleRequests}
              onAction={() => setShowAllRequests((value) => !value)}
              onFilterChange={setRequestFilter}
              onViewDetail={(requestId) => {
                setActiveRequestId(requestId);
                document
                  .getElementById("wallet-payment-panel")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />

            <WalletHistoryCard
              id="wallet-transactions"
              type="transaction"
              title="Lịch sử giao dịch"
              actionLabel={
                showAllTransactions
                  ? "Thu gọn giao dịch"
                  : "Xem tất cả giao dịch"
              }
              emptyLabel="Chưa có giao dịch phù hợp."
              isLoading={transactionsQuery.isPending}
              items={visibleTransactions}
              onAction={() => setShowAllTransactions((value) => !value)}
            />
          </section>

          <WalletQuickActions onAction={handleQuickAction} />

          <TrustSection />
        </div>
      </AppPageContainer>
    </div>
  );

  function handleQuickAction(action: QuickActionTarget) {
    if (action === "support") {
      navigate(routes.profile());
      return;
    }

    const targetId =
      action === "deposit"
        ? "wallet-deposit-form"
        : action === "requests"
          ? "wallet-requests"
          : "wallet-transactions";
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

type QuickActionTarget = "deposit" | "transactions" | "requests" | "support";

function WalletHeroSection() {
  return (
    <PageHero
      children={
        <div className="absolute bottom-6 left-5 z-20 flex flex-wrap gap-2 sm:bottom-6 sm:left-6 lg:bottom-6 lg:left-7">
          {HERO_BADGES.map((badge) => (
            <Badge
              key={badge.label}
              variant="default"
              icon={badge.icon}
              className="rounded-[14px] border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.77rem] font-semibold text-slate-200/90 shadow-none backdrop-blur-sm"
            >
              {badge.label}
            </Badge>
          ))}
        </div>
      }
      icon={
        <IconBox
          size="lg"
          className="h-[68px] w-[68px] rounded-[20px] border-cyan/18 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]"
        >
          <WalletCards size={36} strokeWidth={1.8} />
        </IconBox>
      }
      title="Nạp ví"
      description="Quản lý số dư hiện tại, tạo yêu cầu nạp tiền và theo dõi lịch sử giao dịch của bạn."
      illustration={
        <img
          src="/assets/wallet-illustration.png"
          alt="Minh họa ví GameTopUp"
          className="relative z-10 w-full max-w-[320px] -translate-y-1 object-contain object-center drop-shadow-[0_0_30px_rgba(34,211,238,0.14)] lg:max-w-[300px]"
        />
      }
    />
  );
}

function WalletStatsRow({
  stats,
}: {
  stats: {
    balance: number;
    totalDeposited: number;
    pendingRequests: number;
    transactionCount: number;
  };
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <WalletStatCard
        icon={<WalletCards size={20} />}
        iconClassName="border-cyan-400/15 bg-cyan-400/10 text-cyan-50"
        label="Số dư hiện tại"
        value={formatCurrency(stats.balance)}
      />
      <WalletStatCard
        icon={<ArrowRight size={20} />}
        iconClassName="border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
        label="Tổng đã nạp"
        value={formatCurrency(stats.totalDeposited)}
      />
      <WalletStatCard
        icon={<Clock3 size={20} />}
        iconClassName="border-amber-400/15 bg-amber-400/10 text-amber-300"
        label="Yêu cầu đang chờ"
        value={`${stats.pendingRequests} yêu cầu`}
      />
      <WalletStatCard
        icon={<ReceiptText size={20} />}
        iconClassName="border-sky-400/15 bg-sky-400/10 text-sky-200"
        label="Giao dịch gần đây"
        value={`${stats.transactionCount} giao dịch`}
      />
    </section>
  );
}

function WalletDepositForm({
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
  const formattedAmount = amount
    ? new Intl.NumberFormat("vi-VN").format(Number(amount))
    : "";

  return (
    <section
      className={classNames(PANEL_CLASS, "grid gap-4 p-4 sm:p-5")}
      id="wallet-deposit-form"
    >
      <div className="grid gap-1.5">
        <div className="inline-flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full border border-cyan/20 bg-cyan/10 text-[0.72rem] font-bold text-cyan-100">
            1
          </span>
          <h2 className="m-0 max-w-[18ch] text-[1.08rem] font-semibold leading-[1.2] tracking-[-0.03em] text-white sm:text-[1.1rem]">
            Tạo yêu cầu nạp tiền
          </h2>
        </div>
        <p className="m-0 max-w-2xl text-[0.88rem] leading-6 text-slate-500">
          Nhập số tiền bạn muốn nạp vào ví.
        </p>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-2.5">
          <label
            htmlFor="wallet-deposit-amount"
            className="text-sm font-semibold text-slate-200"
          >
            Số tiền nạp
          </label>
          <div className="relative">
            <input
              id="wallet-deposit-amount"
              inputMode="numeric"
              autoComplete="off"
              value={formattedAmount}
              onChange={onAmountChange}
              placeholder="50.000"
              className="h-14 w-full rounded-[18px] border border-white/10 bg-[rgba(7,14,27,0.9)] px-4 pr-12 text-[1rem] font-semibold tracking-[0.01em] text-white outline-none transition-all duration-200 placeholder:text-slate-500 hover:border-cyan-300/30 hover:bg-[rgba(9,17,32,0.94)] focus:border-cyan-300/55 focus:bg-[rgba(9,17,32,0.98)] focus:shadow-[0_0_0_4px_rgba(34,211,238,0.08)]"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[0.95rem] font-semibold text-slate-400">
              đ
            </span>
          </div>
          {amountError ? (
            <p className="m-0 text-sm text-rose-300">{amountError}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {QUICK_AMOUNTS.map((value) => {
            const isSelected = amount === String(value);

            return (
              <button
                key={value}
                type="button"
                onClick={() => onQuickPick(value)}
                className={classNames(
                  "min-h-12 rounded-[14px] border px-3 py-3 text-sm font-semibold transition-all duration-200",
                  isSelected
                    ? "border-cyan-300/75 bg-cyan-400/12 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_22px_rgba(34,211,238,0.16)]"
                    : "border-white/10 bg-white/4 text-slate-300 hover:border-cyan-300/35 hover:bg-white/7 hover:text-white hover:shadow-[0_0_0_4px_rgba(34,211,238,0.04)]",
                )}
              >
                {formatCurrency(value)}
              </button>
            );
          })}
        </div>

        <div className="rounded-[20px] border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(9,38,59,0.95),rgba(8,32,51,0.98))] px-4 py-4 text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-50">
              <Info size={16} />
            </span>
            <p className="text-sm leading-6 text-slate-100">
              Khoản tiền sẽ được cộng vào số dư sau khi giao dịch được xác nhận.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[18px] border border-cyan/30 bg-cyan-400 px-5 text-[1rem] font-semibold text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:translate-y-0 disabled:opacity-60"
        >
          <WalletCards size={18} />
          Tạo mã nạp
        </button>
      </form>
    </section>
  );
}

function WalletPaymentCard({
  activeRequest,
  busy,
  copiedKey,
  onConfirm,
  onCopy,
}: {
  activeRequest: DepositRequest | null;
  busy: boolean;
  copiedKey: string | null;
  onConfirm: () => void;
  onCopy: (key: string, value: string) => Promise<void>;
}) {
  const status = activeRequest ? getDepositRequestStatus(activeRequest.status) : null;
  const bankName = activeRequest ? resolveBankDisplayName(activeRequest.bankId) : '';
  const bankLogoLabel = activeRequest ? resolveBankLogoLabel(activeRequest.bankId) : '';
  const transferContent = activeRequest?.transferContent ?? '';
  const accountNo = activeRequest?.accountNo ?? '';
  const accountName = activeRequest?.accountName ?? '';

  return (
    <section
      className="grid gap-5 rounded-[18px] border border-cyan-300/10 bg-[linear-gradient(180deg,rgba(5,12,25,0.78),rgba(4,10,20,0.92))] p-5 shadow-[0_12px_30px_rgba(2,6,23,0.18)] sm:p-6"
      id="wallet-payment-panel"
    >
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 text-[0.72rem] font-bold text-cyan-100 sm:size-6">
              2
            </span>
            <p className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-100 sm:text-[1.18rem]">Thông tin thanh toán</p>
          </div>
          {status ? (
            <span
              className={classNames(
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[0.8rem] font-bold',
                getStatusBadgeClass(status.badgeVariant),
              )}
            >
              {status.label}
            </span>
          ) : null}
        </div>
        <p className="m-0 max-w-2xl text-[0.88rem] leading-6 text-slate-500">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới.</p>
      </div>

      {activeRequest ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:items-start">
          <article className="grid gap-3">
            <div className="flex justify-center lg:justify-start">
              <div className="grid w-full gap-3 rounded-[18px] border border-cyan-300/24 bg-transparent px-4 py-4 shadow-[0_0_0_1px_rgba(34,211,238,0.16),0_0_18px_rgba(34,211,238,0.22),0_0_34px_rgba(34,211,238,0.08),inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                <div className="mx-auto grid aspect-square w-full max-w-[214px] place-items-center rounded-[14px] border border-white/10 bg-white p-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] sm:max-w-[224px]">
                  {activeRequest.qrImageUrl ? (
                    <img src={activeRequest.qrImageUrl} alt="Mã QR chuyển khoản" className="h-auto w-full object-contain" />
                  ) : (
                    <div className="grid aspect-square w-full place-items-center text-slate-400">
                      <QrCode size={28} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[10px] border border-amber-500/15 bg-[#1b1408] px-3 py-2 text-[0.72rem] leading-5 text-amber-100">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-300">
                  <Info size={12} />
                </span>
                <span>Vui lòng chuyển đúng số tiền và nội dung để hệ thống dễ dàng đối soát và xác nhận giao dịch.</span>
              </div>
            </div>
          </article>

          <article className="grid gap-3 pt-1">
            <WalletPaymentRow
              label="Ngân hàng"
              value={
                <div className="inline-flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-cyan-400/10 text-[0.62rem] font-black tracking-[0.02em] text-cyan-100">
                    {bankLogoLabel}
                  </span>
                  <span className="text-[0.98rem] font-semibold tracking-[-0.01em] text-slate-100">{bankName || '---'}</span>
                </div>
              }
            />

            <WalletPaymentRow
              label="Số tài khoản"
              value={accountNo || '---'}
              copyKey="account"
              copiedKey={copiedKey}
              onCopy={() => void onCopy('account', accountNo)}
            />

            <WalletPaymentRow
              label="Chủ tài khoản"
              value={accountName || '---'}
              copyKey="name"
              copiedKey={copiedKey}
              onCopy={() => void onCopy('name', accountName)}
              valueClassName="whitespace-nowrap"
            />

            <WalletPaymentRow
              label="Số tiền"
              value={formatCurrency(activeRequest.amount)}
              copyKey="amount"
              copiedKey={copiedKey}
              onCopy={() => void onCopy('amount', formatCurrency(activeRequest.amount))}
              valueClassName="text-emerald-300 font-semibold"
            />

            <WalletPaymentRow
              label="Nội dung chuyển khoản"
              value={transferContent || '---'}
              copyKey="content"
              copiedKey={copiedKey}
              onCopy={() => void onCopy('content', transferContent)}
              highlighted
            />

            <button
              type="button"
              className="mt-1 inline-flex min-h-11 items-center justify-center rounded-[8px] bg-cyan-400 px-4 text-[0.98rem] font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60"
              onClick={onConfirm}
              disabled={busy}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Tôi đã chuyển khoản
            </button>

            <p className="pt-1 text-center text-[0.88rem] leading-5 text-slate-500">Hệ thống tự xác minh trong 1-5 phút.</p>
          </article>
        </div>
      ) : (
        <div className="grid place-items-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
          <span className="grid size-16 place-items-center rounded-[24px] border border-cyan/15 bg-cyan/10 text-cyan-100">
            <QrCode size={28} />
          </span>
          <div className="grid gap-1">
            <strong className="text-base font-black text-white">Chưa có yêu cầu nạp đang hoạt động</strong>
            <p className="m-0 max-w-md text-sm leading-7 text-slate-400">
              Tạo một yêu cầu nạp ở khung bên trái để hiện mã QR, thông tin ngân hàng và nội dung chuyển khoản.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function WalletPaymentRow({
  label,
  value,
  copyKey,
  copiedKey,
  highlighted,
  valueClassName,
  onCopy,
}: {
  label: string;
  value: ReactNode;
  copyKey?: string;
  copiedKey?: string | null;
  highlighted?: boolean;
  valueClassName?: string;
  onCopy?: () => void;
}) {
  return (
    <div
      className={classNames(
        'grid grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] items-center gap-3 py-1.5',
        highlighted ? 'rounded-[8px] bg-cyan-400/5 px-0.5' : '',
      )}
    >
      <span className="min-w-0 text-[0.84rem] leading-5 text-slate-400">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <div className={classNames('min-w-0 text-right', valueClassName)}>{value}</div>
        {copyKey && onCopy ? (
          <button
            type="button"
            aria-label={'Sao chép ' + label}
            title={'Sao chép ' + label}
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

function WalletHistoryCard({
  actionLabel,
  emptyLabel,
  filterValue,
  id,
  isLoading,
  items,
  onAction,
  onFilterChange,
  onViewDetail,
  title,
  type,
}: {
  actionLabel: string;
  emptyLabel: string;
  filterValue?: RequestFilterValue;
  id: string;
  isLoading: boolean;
  items: Array<DepositRequest | WalletTransaction>;
  onAction: () => void;
  onFilterChange?: (value: RequestFilterValue) => void;
  onViewDetail?: (requestId: number) => void;
  title: string;
  type: "request" | "transaction";
}) {
  return (
    <section id={id} className={classNames(PANEL_CLASS, "grid gap-4")}>
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h3 className="m-0 text-[1.25rem] font-black tracking-[-0.03em] text-white sm:text-[1.35rem]">
            {title}
          </h3>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-cyan-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50"
          onClick={onAction}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {type === "request" ? (
          <div className="mb-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {REQUEST_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={classNames(
                  "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition-all duration-200",
                  filterValue === item.value
                    ? "border-cyan/35 bg-cyan-400/15 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]"
                    : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50",
                )}
                onClick={() => onFilterChange?.(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {isLoading && !items.length ? (
          <WalletHistorySkeleton />
        ) : items.length ? (
          <div className="overflow-hidden rounded-[22px] border border-white/8 bg-[rgba(255,255,255,0.025)]">
            <div className="divide-y divide-white/[0.06]">
              {items.map((item) =>
                type === "request" ? (
                  <DepositHistoryRow
                    key={(item as DepositRequest).id}
                    request={item as DepositRequest}
                    onViewDetail={() =>
                      onViewDetail?.((item as DepositRequest).id)
                    }
                  />
                ) : (
                  <TransactionHistoryRow
                    key={(item as WalletTransaction).id}
                    transaction={item as WalletTransaction}
                  />
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8">
            <p className="m-0 text-sm leading-7 text-slate-400">{emptyLabel}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function WalletQuickActions({
  onAction,
}: {
  onAction: (action: QuickActionTarget) => void;
}) {
  const actions = [
    {
      label: "Nạp tiền",
      description: "Tạo yêu cầu nạp tiền vào ví của bạn.",
      icon: <WalletCards size={22} />,
      action: "deposit" as const,
    },
    {
      label: "Lịch sử giao dịch",
      description: "Xem lịch sử nạp tiền và chi tiêu.",
      icon: <History size={22} />,
      action: "transactions" as const,
    },
    {
      label: "Yêu cầu nạp",
      description: "Quản lý các yêu cầu nạp tiền của bạn.",
      icon: <ReceiptText size={22} />,
      action: "requests" as const,
    },
    {
      label: "Hỗ trợ",
      description: "Liên hệ hỗ trợ khi bạn cần giúp đỡ.",
      icon: <Headset size={22} />,
      action: "support" as const,
    },
  ] as const;

  return (
    <section className={PANEL_CLASS}>
      <div className="flex items-end justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="grid gap-1">
          <h2 className="m-0 text-[1.5rem] font-black tracking-[-0.03em] text-white sm:text-[1.7rem]">
            Thao tác nhanh
          </h2>
        </div>
      </div>

      <div className="grid gap-3 px-5 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <WalletQuickActionCard
            key={action.label}
            description={action.description}
            icon={action.icon}
            label={action.label}
            onClick={() => onAction(action.action)}
          />
        ))}
      </div>
    </section>
  );
}

function WalletQuickActionCard({
  description,
  icon,
  label,
  onClick,
}: {
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="group grid min-h-[150px] gap-4 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.035)] p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(34,211,238,0.08)] hover:shadow-[0_16px_30px_rgba(2,6,23,0.18)]"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-[16px] border border-cyan/15 bg-cyan/10 text-cyan-50">
          {icon}
        </span>
        <ArrowRight
          size={18}
          className="mt-1 text-slate-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-200"
        />
      </div>
      <div className="grid gap-1">
        <strong className="text-[0.98rem] font-black text-white">
          {label}
        </strong>
        <span className="max-w-[22ch] text-[0.9rem] leading-6 text-slate-400">
          {description}
        </span>
      </div>
    </button>
  );
}

function WalletStatCard({
  icon,
  iconClassName,
  label,
  value,
}: {
  icon: ReactNode;
  iconClassName: string;
  label: string;
  value: string;
}) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_12px_28px_rgba(2,6,23,0.14)]">
      <span
        className={classNames(
          "grid size-11 place-items-center rounded-[16px] border",
          iconClassName,
        )}
      >
        {icon}
      </span>
      <div className="grid gap-1">
        <span className="text-[0.9rem] font-semibold text-slate-400">
          {label}
        </span>
        <strong className="text-[clamp(1.2rem,1.65vw,1.55rem)] font-black tracking-[-0.04em] text-white tabular-nums">
          {value}
        </strong>
      </div>
    </article>
  );
}

function DepositHistoryRow({
  onViewDetail,
  request,
}: {
  onViewDetail?: () => void;
  request: DepositRequest;
}) {
  const status = getDepositRequestStatus(request.status);

  return (
    <div className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <span
          className={classNames(
            "grid size-11 place-items-center rounded-[16px] border",
            status.iconClassName,
          )}
        >
          {status.icon}
        </span>
        <div className="min-w-0">
          <strong className="block text-[0.98rem] font-black tracking-[-0.02em] text-white">
            {formatCurrency(request.amount)}
          </strong>
          <span className="mt-0.5 block break-words font-mono text-xs font-semibold text-slate-400">
            #{request.code}
          </span>
        </div>
      </div>

      <div className="hidden text-sm leading-6 text-slate-300 lg:block">
        {formatShortDateTime(request.createdAt)}
      </div>

      <div className="grid justify-items-start gap-2 lg:justify-items-end">
        <span
          className={classNames(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
            getStatusBadgeClass(status.badgeVariant),
          )}
        >
          {status.label}
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50"
          onClick={onViewDetail}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

function TransactionHistoryRow({
  transaction,
}: {
  transaction: WalletTransaction;
}) {
  const meta = getWalletTransactionMeta(transaction.type);
  const amountPrefix = meta.decrease ? "-" : "+";
  const amountClassName = meta.decrease ? "text-rose-300" : "text-emerald-300";

  return (
    <div className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <span
          className={classNames(
            "grid size-11 place-items-center rounded-[16px] border",
            meta.iconClassName,
          )}
        >
          {meta.icon}
        </span>
        <div className="min-w-0">
          <strong className="block text-[0.98rem] font-black tracking-[-0.02em] text-white">
            {meta.label}
          </strong>
          <span className="mt-0.5 block break-words text-sm leading-6 text-slate-300">
            {transaction.description || `Giao dịch ví #${transaction.id}`}
          </span>
          <span className="mt-1 block text-xs font-medium text-slate-500">
            Số dư trước: {formatCurrency(transaction.balanceBefore)} · Số dư
            sau: {formatCurrency(transaction.balanceAfter)}
          </span>
        </div>
      </div>

      <div className="grid justify-items-start gap-2 sm:justify-items-end">
        <strong
          className={classNames(
            "text-lg font-black tabular-nums tracking-[-0.02em]",
            amountClassName,
          )}
        >
          {amountPrefix}
          {formatCurrency(transaction.amount)}
        </strong>
        <span className="text-xs font-medium text-slate-500">
          {formatShortDateTime(transaction.createdAt)}
        </span>
      </div>
    </div>
  );
}

function WalletBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_18%),radial-gradient(circle_at_50%_-10%,rgba(15,118,110,0.16),transparent_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] [background-size:72px_72px]" />
    </>
  );
}

function WalletLoadingState() {
  return (
    <AppPageContainer className="py-5 sm:py-7 lg:py-8" aria-busy="true">
      <div className="grid gap-6 lg:gap-7">
        <div className="h-[420px] animate-pulse rounded-[30px] border border-white/10 bg-white/[0.03]" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[116px] animate-pulse rounded-[22px] border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[560px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
          <div className="h-[560px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
        </div>
        <div className="h-[228px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]" />
      </div>
    </AppPageContainer>
  );
}

function WalletHistorySkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <div className="size-11 animate-pulse rounded-[16px] bg-white/[0.06]" />
            <div className="grid gap-2">
              <div className="h-4 w-36 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="h-3 w-48 animate-pulse rounded-full bg-white/[0.06]" />
            </div>
          </div>
          <div className="grid gap-2 sm:justify-items-end">
            <div className="h-6 w-20 animate-pulse rounded-full bg-white/[0.06]" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function getWalletTransactionMeta(type: WalletTransactionType) {
  const meta: Record<
    WalletTransactionType,
    { decrease: boolean; icon: ReactNode; label: string; iconClassName: string }
  > = {
    1: {
      decrease: false,
      icon: <ArrowDownLeft size={16} />,
      label: "Nạp ví",
      iconClassName: "border-emerald-400/15 bg-emerald-400/10 text-emerald-300",
    },
    2: {
      decrease: true,
      icon: <ArrowUpRight size={16} />,
      label: "Rút tiền",
      iconClassName: "border-rose-400/15 bg-rose-400/10 text-rose-300",
    },
    3: {
      decrease: true,
      icon: <CreditCard size={16} />,
      label: "Thanh toán đơn hàng",
      iconClassName: "border-amber-400/15 bg-amber-400/10 text-amber-300",
    },
    4: {
      decrease: false,
      icon: <CheckCircle2 size={16} />,
      label: "Hoàn tiền",
      iconClassName: "border-sky-400/15 bg-sky-400/10 text-sky-200",
    },
  };

  return meta[type];
}

function resolveBankDisplayName(bankId?: string): string {
  const normalized = bankId?.trim().toLowerCase();
  if (!normalized) {
    return "Ngân hàng liên kết";
  }

  if (normalized === "vcb" || normalized === "vietcombank") {
    return "Vietcombank";
  }

  return bankId ?? "Ngân hàng liên kết";
}

function resolveBankLogoLabel(bankId?: string) {
  const normalized = bankId?.trim().toLowerCase();
  if (!normalized) {
    return "NH";
  }

  if (normalized === "vcb" || normalized === "vietcombank") {
    return "VCB";
  }

  return normalized.slice(0, 3).toUpperCase();
}

function getStatusBadgeClass(
  variant: ReturnType<typeof getDepositRequestStatus>["badgeVariant"],
) {
  if (variant === "success") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-200";
  }

  if (variant === "danger") {
    return "border-rose-400/25 bg-rose-400/10 text-rose-200";
  }

  if (variant === "accent") {
    return "border-cyan-400/30 bg-cyan-400/10 text-cyan-50";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-200";
}

function formatShortDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

async function copyValue(value: string) {
  if (!value.trim()) {
    toast.error("Không có nội dung để sao chép.");
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    toast.success("Đã sao chép.");
    return true;
  } catch {
    toast.error("Không thể sao chép lúc này.");
    return false;
  }
}
