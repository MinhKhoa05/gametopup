import { useState } from "react";
import { ArrowDownToLine, ArrowLeftRight, Coins, Wallet } from "lucide-react";

import {
  Container,
  EmptyState,
  FilterChipGroup,
  IconBox,
  PageHero,
  PanelShell,
  SectionHeading,
  StatCard,
} from "@/shared/components";

import { formatCurrency } from "@/shared/lib/format";

import { WalletBalanceCard } from "@/features/wallet/components/WalletBalanceCard";
import { WalletDepositDialog } from "@/features/deposits/components/WalletDepositDialog";
import { WalletDepositItem } from "@/features/deposits/components/WalletDepositItem";
import { WalletTransactionItem } from "@/features/wallet/components/WalletTransactionItem";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { useDepositRequestsQuery } from "../../deposits/server";
import { useWalletBalanceQuery, useWalletTransactionsQuery } from "../server";

const HISTORY_TABS = [
  {
    label: "Biến động số dư",
    value: "ledger",
  },
  {
    label: "Yêu cầu nạp tiền",
    value: "deposit",
  },
] as const;

type HistoryTab = (typeof HISTORY_TABS)[number]["value"];

export function WalletPage() {
  const { isAuthenticated } = useAuthSession();

  const balanceQuery = useWalletBalanceQuery(isAuthenticated);
  const transactionsQuery = useWalletTransactionsQuery(isAuthenticated);
  const depositsQuery = useDepositRequestsQuery(isAuthenticated);

  const balance = balanceQuery.data ?? 0;
  const transactions = transactionsQuery.data ?? [];
  const deposits = depositsQuery.data ?? [];

  const loading =
    balanceQuery.isLoading ||
    transactionsQuery.isLoading ||
    depositsQuery.isLoading;

  const error =
    balanceQuery.isError || transactionsQuery.isError || depositsQuery.isError;

  const [tab, setTab] = useState<HistoryTab>("ledger");
  const [isDepositOpen, setDepositOpen] = useState(false);

  return (
    <div className="relative isolate overflow-hidden">
      <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
        <div className="grid gap-6 lg:gap-7">
          <PageHero
            eyebrow="VÍ ĐIỆN TỬ"
            visual={
              <IconBox
                size="lg"
                tone="primary"
                className="h-[62px] w-[62px] rounded-[18px]"
              >
                <Wallet size={30} strokeWidth={1.8} />
              </IconBox>
            }
            title="Ví của bạn"
            description="Quản lý số dư, nạp tiền và theo dõi lịch sử giao dịch."
          />

          <WalletBalanceCard
            balance={balance}
            onDeposit={() => setDepositOpen(true)}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              compact
              tone="success"
              icon={<Coins size={20} />}
              label="Số dư"
              value={formatCurrency(balance)}
            />

            <StatCard
              compact
              tone="primary"
              icon={<ArrowLeftRight size={20} />}
              label="Giao dịch"
              value={transactions.length}
            />

            <StatCard
              compact
              tone="warning"
              icon={<ArrowDownToLine size={20} />}
              label="Yêu cầu nạp"
              value={deposits.length}
            />
          </div>

          <PanelShell>
            <div className="space-y-6 p-6 lg:p-7">
              <SectionHeading title="Lịch sử ví" />

              <FilterChipGroup
                items={HISTORY_TABS}
                value={tab}
                onChange={(value) => setTab(value as HistoryTab)}
              />

              {loading ? (
                <p className="py-10 text-center gt-text-muted">
                  Đang tải dữ liệu...
                </p>
              ) : error ? (
                <EmptyState
                  title="Không tải được dữ liệu"
                  description="Đã xảy ra lỗi khi tải lịch sử ví."
                />
              ) : tab === "ledger" ? (
                transactions.length === 0 ? (
                  <EmptyState
                    title="Chưa có giao dịch"
                    description="Các biến động số dư sẽ xuất hiện tại đây."
                  />
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <WalletTransactionItem
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                )
              ) : deposits.length === 0 ? (
                <EmptyState
                  title="Chưa có yêu cầu nạp"
                  description="Các yêu cầu nạp tiền sẽ xuất hiện tại đây."
                />
              ) : (
                <div className="space-y-3">
                  {deposits.map((request) => (
                    <WalletDepositItem key={request.id} deposit={request} />
                  ))}
                </div>
              )}
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
