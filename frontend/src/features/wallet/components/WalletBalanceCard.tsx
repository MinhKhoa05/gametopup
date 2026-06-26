import { WalletCards } from "lucide-react";

import { Button, IconBox, PanelShell } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

type WalletBalanceCardProps = {
  balance: number;
  onDeposit: () => void;
};

export function WalletBalanceCard({
  balance,
  onDeposit,
}: WalletBalanceCardProps) {
  return (
    <PanelShell className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />

      <div className="relative flex flex-col gap-8 p-6 lg:p-7">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] gt-text-disabled">
              Ví GameTopUp
            </p>

            <h2 className="mt-2 text-4xl font-black tracking-tight gt-tabular">
              {formatCurrency(balance)}
            </h2>

            <p className="mt-2 text-sm gt-text-soft">
              Số dư hiện có trong tài khoản.
            </p>
          </div>

          <IconBox size="lg" tone="primary" className="rounded-[18px]">
            <WalletCards size={28} />
          </IconBox>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={onDeposit}>
            Nạp tiền
          </Button>
        </div>
      </div>
    </PanelShell>
  );
}
