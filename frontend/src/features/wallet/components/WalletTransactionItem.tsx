import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Badge, IconBox, MediaListItem } from "@/shared/components";

import { classNames } from "@/shared/lib/classNames";
import { formatCurrency, formatDate } from "@/shared/lib/format";

import { WalletTransaction, WalletTransactionType } from "../types";

type Props = {
  transaction: WalletTransaction;
};

const TRANSACTION_META: Record<
  WalletTransactionType,
  {
    label: string;
    badgeTone: "success" | "danger" | "primary";
  }
> = {
  [WalletTransactionType.Deposit]: {
    label: "Nạp tiền",
    badgeTone: "success",
  },
  [WalletTransactionType.Withdraw]: {
    label: "Rút tiền",
    badgeTone: "danger",
  },
  [WalletTransactionType.PurchaseOrder]: {
    label: "Thanh toán đơn hàng",
    badgeTone: "primary",
  },
  [WalletTransactionType.Refund]: {
    label: "Hoàn tiền",
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
      title={meta.label}
      subtitle={transaction.referenceId ?? "Không có mã tham chiếu"}
      meta={formatDate(transaction.createdAt)}
      titleAccessory={
        <Badge tone={meta.badgeTone}>{income ? "Cộng tiền" : "Trừ tiền"}</Badge>
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

          <div className="text-xs gt-text-disabled">
            {formatCurrency(transaction.balanceAfter)}
          </div>
        </div>
      }
    />
  );
}
