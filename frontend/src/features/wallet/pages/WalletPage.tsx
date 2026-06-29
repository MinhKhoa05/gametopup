import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowLeftRight, Coins, Wallet } from "lucide-react";

import {
  Button,
  Container,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  PageHero,
  PanelShell,
  SectionHeading,
  StatCard,
} from "@/shared/components";
import { useLoadMore } from "@/shared/hooks/useLoadMore";
import { formatCurrency, formatGroupedDate } from "@/shared/lib/format";

import { WalletBalanceCard } from "@/features/wallet/components/WalletBalanceCard";
import { WalletTransactionItem } from "@/features/wallet/components/WalletTransactionItem";
import { WalletTransactionType } from "@/features/wallet/types";
import { WalletDepositDialog } from "@/features/deposits/components/WalletDepositDialog";
import { WalletDepositItem } from "@/features/deposits/components/WalletDepositItem";
import { WalletDepositStatus } from "@/features/deposits/types";
import { useAuthUserQuery } from "@/features/auth/server";
import { useDepositRequestsQuery } from "../../deposits/server";
import { useWalletBalanceQuery, useWalletTransactionsQuery } from "../server";

const HISTORY_TABS = [
  { label: "Biến động số dư", value: "ledger" },
  { label: "Yêu cầu nạp", value: "deposit" },
] as const;

type HistoryTab = (typeof HISTORY_TABS)[number]["value"];

const TRANSACTION_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Nạp tiền", value: "deposit" },
  { label: "Hoàn tiền", value: "refund" },
  { label: "Thanh toán đơn", value: "purchaseOrder" },
] as const;

type TransactionFilter = (typeof TRANSACTION_FILTERS)[number]["value"];

const TRANSACTION_TYPE_BY_FILTER: Record<
  Exclude<TransactionFilter, "all">,
  WalletTransactionType
> = {
  deposit: WalletTransactionType.Deposit,
  refund: WalletTransactionType.Refund,
  purchaseOrder: WalletTransactionType.PurchaseOrder,
};

const DEPOSIT_FILTERS = [
  { label: "Tất cả", value: "all" },
  { label: "Đang chờ", value: "pending" },
  { label: "Đã chuyển", value: "confirmed" },
  { label: "Đã duyệt", value: "approved" },
] as const;

type DepositFilter = (typeof DEPOSIT_FILTERS)[number]["value"];

const LOAD_MORE_SIZE = 10;

const DEPOSIT_STATUS_BY_FILTER: Record<
  Exclude<DepositFilter, "all">,
  WalletDepositStatus
> = {
  pending: WalletDepositStatus.Pending,
  confirmed: WalletDepositStatus.UserConfirmed,
  approved: WalletDepositStatus.Approved,
};

type DatedItem = {
  createdAt: string;
};

function groupByDay<T extends DatedItem>(items: T[]) {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const label = formatGroupedDate(item.createdAt);
    const current = groups.get(label) ?? [];
    current.push(item);
    groups.set(label, current);
  });

  return Array.from(groups, ([title, groupedItems]) => ({
    title,
    items: groupedItems,
    countLabel: `${groupedItems.length} giao dịch`,
  }));
}

export function WalletPage() {
  const userQuery = useAuthUserQuery();
  const isAuthenticated = userQuery.data !== null && userQuery.data !== undefined;

  const balanceQuery = useWalletBalanceQuery(isAuthenticated);
  const transactionsQuery = useWalletTransactionsQuery(isAuthenticated);
  const depositsQuery = useDepositRequestsQuery(isAuthenticated);

  const balance = balanceQuery.data ?? 0;
  const transactions = transactionsQuery.data ?? [];
  const deposits = depositsQuery.data ?? [];

  const balanceLoading =
    balanceQuery.isPending && balanceQuery.data === undefined;
  const transactionsLoading =
    transactionsQuery.isPending && transactionsQuery.data === undefined;
  const depositsLoading =
    depositsQuery.isPending && depositsQuery.data === undefined;

  const [tab, setTab] = useState<HistoryTab>("ledger");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");
  const [depositFilter, setDepositFilter] = useState<DepositFilter>("all");
  const [isDepositOpen, setDepositOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (transactionFilter === "all") return transactions;

    return transactions.filter(
      (transaction) =>
        transaction.type === TRANSACTION_TYPE_BY_FILTER[transactionFilter],
    );
  }, [transactionFilter, transactions]);

  const {
    visibleCount: visibleTransactionCount,
    hasMore: hasMoreTransactions,
    loadMore: loadMoreTransactions,
    reset: resetVisibleTransactions,
  } = useLoadMore({
    totalCount: filteredTransactions.length,
    pageSize: LOAD_MORE_SIZE,
  });

  const visibleTransactions = useMemo(
    () => filteredTransactions.slice(0, visibleTransactionCount),
    [filteredTransactions, visibleTransactionCount],
  );

  const transactionGroups = useMemo(
    () => groupByDay(visibleTransactions),
    [visibleTransactions],
  );

  const filteredDeposits = useMemo(() => {
    return deposits.filter((deposit) => {
      if (depositFilter === "all") return true;
      return deposit.status === DEPOSIT_STATUS_BY_FILTER[depositFilter];
    });
  }, [depositFilter, deposits]);

  const {
    visibleCount: visibleDepositCount,
    hasMore: hasMoreDeposits,
    loadMore: loadMoreDeposits,
    reset: resetVisibleDeposits,
  } = useLoadMore({
    totalCount: filteredDeposits.length,
    pageSize: LOAD_MORE_SIZE,
  });

  const visibleDeposits = useMemo(
    () => filteredDeposits.slice(0, visibleDepositCount),
    [filteredDeposits, visibleDepositCount],
  );

  const depositGroups = useMemo(
    () => groupByDay(visibleDeposits),
    [visibleDeposits],
  );

  const transactionFilterLabel =
    TRANSACTION_FILTERS.find((item) => item.value === transactionFilter)?.label ??
    "Tất cả";
  const historyLoading =
    tab === "ledger" ? transactionsLoading : depositsLoading;
  const historyError =
    tab === "ledger" ? transactionsQuery.isError : depositsQuery.isError;

  return (
    <div className="relative isolate overflow-hidden">
      <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <PageHero
            visual={
              <IconBox
                size="lg"
                tone="primary"
                className="h-[62px] w-[62px] rounded-[18px]"
              >
                <Wallet size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title="Ví điện tử"
            description="Quản lý số dư, nạp tiền và theo dõi lịch sử giao dịch."
          />

          <WalletBalanceCard
            balance={balance}
            loading={balanceLoading}
            onDeposit={() => setDepositOpen(true)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              compact
              tone="success"
              icon={<Coins size={20} />}
              label="Số dư"
              value={balanceLoading ? "..." : formatCurrency(balance)}
            />

            <StatCard
              compact
              tone="primary"
              icon={<ArrowLeftRight size={20} />}
              label="Giao dịch"
              value={transactionsLoading ? "..." : transactions.length}
            />

            <StatCard
              compact
              tone="warning"
              icon={<ArrowDownToLine size={20} />}
              label="Yêu cầu nạp"
              value={depositsLoading ? "..." : deposits.length}
            />
          </div>

          <PanelShell>
            <div className="space-y-5 p-6 lg:p-7">
              <SectionHeading title="Lịch sử ví" />

              <FilterChipGroup
                items={HISTORY_TABS}
                value={tab}
                onChange={(value) => setTab(value as HistoryTab)}
              />

              <div className="min-h-[260px]">
                {historyLoading ? (
                  <p className="py-10 text-center gt-text-muted">
                    Đang tải dữ liệu...
                  </p>
                ) : historyError ? (
                  <EmptyState
                    title="Không tải được dữ liệu"
                    description="Đã xảy ra lỗi khi tải lịch sử ví."
                  />
                ) : tab === "ledger" ? (
                  <div className="space-y-5">
                    <FilterChipGroup
                      items={TRANSACTION_FILTERS}
                      value={transactionFilter}
                      onChange={(value) => {
                        setTransactionFilter(value as TransactionFilter);
                        resetVisibleTransactions();
                      }}
                    />

                    {transactionGroups.length === 0 ? (
                      <EmptyState
                        title="Không có giao dịch phù hợp"
                        description={
                          transactionFilter === "all"
                            ? "Các biến động số dư sẽ xuất hiện tại đây."
                            : `Chưa có giao dịch ${transactionFilterLabel.toLowerCase()} trong ví.`
                        }
                      />
                    ) : (
                      <div className="space-y-5">
                        <GroupedList
                          groups={transactionGroups}
                          getItemKey={(transaction) => transaction.id}
                          itemListClassName="space-y-3"
                          renderItem={(transaction) => (
                            <WalletTransactionItem transaction={transaction} />
                          )}
                        />

                        {hasMoreTransactions ? (
                          <div className="flex justify-center pt-1">
                            <Button
                              variant="outline"
                              onClick={loadMoreTransactions}
                            >
                              Xem thêm
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : deposits.length === 0 ? (
                  <EmptyState
                    title="Chưa có yêu cầu nạp"
                    description="Các yêu cầu nạp tiền sẽ xuất hiện tại đây."
                  />
                ) : (
                  <div className="space-y-5">
                    <FilterChipGroup
                      items={DEPOSIT_FILTERS}
                      value={depositFilter}
                      onChange={(value) => {
                        setDepositFilter(value as DepositFilter);
                        resetVisibleDeposits();
                      }}
                    />

                    {depositGroups.length === 0 ? (
                      <EmptyState
                        title="Không có yêu cầu phù hợp"
                        description="Thử đổi bộ lọc để xem các yêu cầu khác."
                      />
                    ) : (
                      <div className="space-y-5">
                        <GroupedList
                          groups={depositGroups}
                          getItemKey={(request) => request.id}
                          itemListClassName="space-y-2"
                          renderItem={(request) => (
                            <WalletDepositItem deposit={request} />
                          )}
                        />

                        {hasMoreDeposits ? (
                          <div className="flex justify-center pt-1">
                            <Button variant="outline" onClick={loadMoreDeposits}>
                              Xem thêm
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </PanelShell>
        </div>
      </Container>

      <WalletDepositDialog
        isOpen={isDepositOpen}
        onClose={() => setDepositOpen(false)}
      />
    </div>
  );
}
