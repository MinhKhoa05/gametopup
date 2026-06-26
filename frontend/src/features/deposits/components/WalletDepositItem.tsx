import { WalletCards } from "lucide-react";

import { Badge, IconBox, MediaListItem } from "@/shared/components";

import { formatCurrency, formatDate } from "@/shared/lib/format";

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
    label: "Chờ xác nhận",
    tone: "warning",
  },

  [WalletDepositStatus.UserConfirmed]: {
    label: "Đã chuyển khoản",
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

export function WalletDepositItem({ deposit }: Props) {
  const status = DEPOSIT_STATUS[deposit.status] ?? {
    label: "Không xác định",
    tone: "primary" as const,
  };

  return (
    <MediaListItem
      leading={
        <IconBox size="sm" tone="primary">
          <WalletCards size={16} />
        </IconBox>
      }
      title={`Nạp ${formatCurrency(deposit.amount)}`}
      subtitle={deposit.bankId}
      meta={formatDate(deposit.createdAt)}
      titleAccessory={<Badge tone={status.tone}>{status.label}</Badge>}
      trailing={
        <strong className="gt-tabular text-lg font-black">
          {formatCurrency(deposit.amount)}
        </strong>
      }
    />
  );
}
