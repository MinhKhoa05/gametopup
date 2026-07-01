import { useMemo, useState } from "react";
import { ArrowDownToLine, ArrowLeftRight, Coins, Wallet } from "lucide-react";

import {
  Container,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  LoadMoreButton,
  PageHero,
  PanelShell,
  SectionHeading,
  StatCard,
} from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import { groupItemsByDate } from "@/shared/lib/groupByDate";

import { WalletBalanceCard } from "@/features/wallet/components/WalletBalanceCard";
import { WalletTransactionItem } from "@/features/wallet/components/WalletTransactionItem";
import { WalletDepositDialog } from "@/features/deposits/components/WalletDepositDialog";
import { WalletDepositItem } from "@/features/deposits/components/WalletDepositItem";
import type { WalletDepositFilter } from "@/features/deposits/types";
import { useAuthUserQuery } from "@/features/auth/server";
import { useDepositRequestsCursorQuery } from "../../deposits/server";
import { useWalletBalanceQuery, useWalletTransactionsCursorQuery } from "../server";
import type { WalletTransactionFilter } from "../types";

const HISTORY_TABS = [
  { label: "Biến động số dư", value: "ledger" },
  { label: "Yêu cầu nạp", value: "deposit" },
] as const;

type HistoryTab = (typeof HISTORY_TABS)[number]["value"];

const TRANSACTION_FILTERS = [
  { label: "Tất cả", value: null },
  { label: "Nạp tiền", value: "deposit" },
  { label: "Hoàn tiền", value: "refund" },
  { label: "Thanh toán đơn", value: "purchaseOrder" },
] as const;

type TransactionFilter = WalletTransactionFilter | null;

const DEPOSIT_FILTERS = [
  { label: "Tất cả", value: null },
  { label: "Đang chờ", value: "pending" },
  { label: "Đã chuyển", value: "userConfirmed" },
  { label: "Đã duyệt", value: "approved" },
] as const;

type DepositFilter = WalletDepositFilter | null;

export function WalletPage() {
  const userQuery = useAuthUserQuery();
  const isAuthenticated = userQuery.data !== null && userQuery.data !== undefined;

  const [tab, setTab] = useState<HistoryTab>("ledger");
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>(null);
  const [depositFilter, setDepositFilter] = useState<DepositFilter>(null);
  const [isDepositOpen, setDepositOpen] = useState(false);

  const balanceQuery = useWalletBalanceQuery(isAuthenticated);
  const transactionsQuery = useWalletTransactionsCursorQuery(
    transactionFilter,
    isAuthenticated,
  );
  const depositsQuery = useDepositRequestsCursorQuery(
    depositFilter,
    isAuthenticated,
  );

  const balance = balanceQuery.data ?? 0;
  const transactions = transactionsQuery.items;
  const deposits = depositsQuery.items;

  const balanceLoading =
    balanceQuery.isPending && balanceQuery.data === undefined;
  const transactionsLoading =
    transactionsQuery.isPending && transactionsQuery.data === undefined;
  const depositsLoading =
    depositsQuery.isPending && depositsQuery.data === undefined;

  const transactionGroups = useMemo(
    () => groupItemsByDate(transactions, (count) => `${count} giao dịch`),
    [transactions],
  );

  const depositGroups = useMemo(
    () => groupItemsByDate(deposits, (count) => `${count} giao dịch`),
    [deposits],
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
                      tone="muted"
                      onChange={(value) => setTransactionFilter(value as TransactionFilter)}
                    />

                    {transactionGroups.length === 0 ? (
                      <EmptyState
                        title="Không có giao dịch phù hợp"
                        description={
                          transactionFilter === null
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

                        <LoadMoreButton
                          hasMore={transactionsQuery.hasMore}
                          isLoading={transactionsQuery.isLoadingMore}
                          onLoadMore={transactionsQuery.loadMore}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <FilterChipGroup
                      items={DEPOSIT_FILTERS}
                      value={depositFilter}
                      tone="muted"
                      onChange={(value) => setDepositFilter(value as DepositFilter)}
                    />

                    {depositGroups.length === 0 ? (
                      <EmptyState
                        title={depositFilter === null ? "Chưa có yêu cầu nạp" : "Không có yêu cầu phù hợp"}
                        description={
                          depositFilter === null
                            ? "Các yêu cầu nạp tiền sẽ xuất hiện tại đây."
                            : "Thử đổi bộ lọc để xem các yêu cầu khác."
                        }
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

                        <LoadMoreButton
                          hasMore={depositsQuery.hasMore}
                          isLoading={depositsQuery.isLoadingMore}
                          onLoadMore={depositsQuery.loadMore}
                        />
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
