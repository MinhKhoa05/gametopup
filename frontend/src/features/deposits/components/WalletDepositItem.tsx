import { WalletCards } from "lucide-react";

import { IconBox, MediaListItem } from "@/shared/components";
import { formatCurrency, formatDateTimeCompact } from "@/shared/lib/format";

import { WalletDeposit } from "../types";
import { DepositStatusBadge } from "./DepositStatusBadge";

type Props = {
  deposit: WalletDeposit;
};

function formatDepositAmount(value: number) {
  const sign = value >= 0 ? "+" : "-";

  return `${sign}${formatCurrency(Math.abs(value))}`;
}

export function WalletDepositItem({ deposit }: Props) {
  return (
    <MediaListItem
      leading={
        <IconBox size="sm" tone="primary" className="size-10 rounded-[14px]">
          <WalletCards size={16} />
        </IconBox>
      }
      title={`Nạp ${formatCurrency(deposit.amount)}`}
      titleAccessory={<DepositStatusBadge status={deposit.status} className="h-6 min-h-6 px-2 text-[0.72rem] leading-none" />}
      subtitle={`${deposit.code} • ${formatDateTimeCompact(deposit.createdAt)}`}
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
