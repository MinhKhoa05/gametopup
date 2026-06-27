import { WalletCards } from "lucide-react";

import { Badge, IconBox, MediaListItem } from "@/shared/components";
import { formatCurrency, formatDateTimeCompact } from "@/shared/lib/format";

import { WalletDeposit, WalletDepositStatus } from "../types";

type Props = {
  deposit: WalletDeposit;
};

const DEPOSIT_STATUS: Record<
  WalletDepositStatus,
  {
    label: string;
    tone: "warning" | "success" | "danger" | "primary";
  }
> = {
  [WalletDepositStatus.Pending]: {
    label: "Đang chờ",
    tone: "warning",
  },
  [WalletDepositStatus.UserConfirmed]: {
    label: "Đã chuyển",
    tone: "primary",
  },
  [WalletDepositStatus.Approved]: {
    label: "Đã duyệt",
    tone: "success",
  },
  [WalletDepositStatus.Rejected]: {
    label: "Đã từ chối",
    tone: "danger",
  },
};

function formatDepositAmount(value: number) {
  const sign = value >= 0 ? "+" : "-";

  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function WalletDepositItem({ deposit }: Props) {
  const status = DEPOSIT_STATUS[deposit.status] ?? {
    label: "Không xác định",
    tone: "primary" as const,
  };

  return (
    <MediaListItem
      leading={
        <IconBox size="sm" tone="primary" className="size-10 rounded-[14px]">
          <WalletCards size={16} />
        </IconBox>
      }
      title={`Nạp ${formatCurrency(deposit.amount)}`}
      titleAccessory={
        <Badge
          tone={status.tone}
          className="h-6 min-h-6 px-2 text-[0.72rem] leading-none"
        >
          {status.label}
        </Badge>
      }
      subtitle={`${deposit.bankId} • ${formatDateTimeCompact(deposit.createdAt)}`}
      trailing={
        <div
          className={
            deposit.amount >= 0
              ? "gt-tabular text-[0.95rem] font-black leading-5 text-[var(--gt-success)]"
              : "gt-tabular text-[0.95rem] font-black leading-5 text-[var(--gt-danger)]"
          }
        >
          {formatDepositAmount(deposit.amount)}
        </div>
      }
      className="min-h-[84px]"
    />
  );
}
