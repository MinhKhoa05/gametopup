import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Badge, IconBox, MediaListItem } from "@/shared/components";

import { classNames } from "@/shared/lib/classNames";
import { formatCurrency, formatDateTimeCompact } from "@/shared/lib/format";
import { formatOrderId } from "@/features/orders/utils";

import { WalletTransaction, WalletTransactionType } from "../types";

type Props = {
  transaction: WalletTransaction;
};

const TRANSACTION_META: Record<
  WalletTransactionType,
  {
    badgeLabel: string;
    titleBase: string;
    badgeTone: "success" | "danger" | "primary";
  }
> = {
  [WalletTransactionType.Deposit]: {
    badgeLabel: "Nạp tiền",
    titleBase: "Nạp tiền vào ví",
    badgeTone: "success",
  },
  [WalletTransactionType.Withdraw]: {
    badgeLabel: "Rút tiền",
    titleBase: "Rút tiền khỏi ví",
    badgeTone: "danger",
  },
  [WalletTransactionType.PurchaseOrder]: {
    badgeLabel: "Thanh toán đơn",
    titleBase: "Thanh toán đơn hàng",
    badgeTone: "primary",
  },
  [WalletTransactionType.Refund]: {
    badgeLabel: "Hoàn tiền",
    titleBase: "Hoàn tiền đơn hàng",
    badgeTone: "success",
  },
};

export function WalletTransactionItem({ transaction }: Props) {
  const meta = TRANSACTION_META[transaction.type] ?? {
    label: "Giao dịch",
    badgeTone: "primary" as const,
  };

  const income =
    transaction.type === WalletTransactionType.Deposit ||
    transaction.type === WalletTransactionType.Refund;

  return (
    <MediaListItem
      leading={
        <IconBox size="sm" tone={income ? "primary" : "neutral"}>
          {income ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
        </IconBox>
      }
      title={
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-bold gt-text">
            {meta.titleBase}
          </span>

          {transaction.referenceId ? (
            <span className="truncate text-sm font-medium gt-text-soft">
              {transaction.type === WalletTransactionType.PurchaseOrder ||
              transaction.type === WalletTransactionType.Refund
                ? formatOrderId(transaction.referenceId)
                : `#${transaction.referenceId}`}
            </span>
          ) : null}
        </span>
      }
      subtitle={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs gt-text-soft">Số dư sau</span>

          <span className="text-xs font-semibold gt-text">
            {formatCurrency(transaction.balanceAfter)}
          </span>

          <span className="gt-text-disabled">&bull;</span>

          <span className="text-xs gt-text-muted">
            {formatDateTimeCompact(transaction.createdAt)}
          </span>
        </span>
      }
      titleAccessory={
        <Badge tone={meta.badgeTone}>{meta.badgeLabel}</Badge>
      }
      trailing={
        <div className="text-right">
          <div
            className={classNames(
              "gt-tabular font-black",
              income ? "text-[var(--gt-success)]" : "text-[var(--gt-danger)]",
            )}
          >
            {income ? "+" : "-"}
            {formatCurrency(Math.abs(transaction.amount))}
          </div>
        </div>
      }
    />
  );
}
