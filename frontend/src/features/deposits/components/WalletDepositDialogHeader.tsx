import { WalletCards, X } from "lucide-react";

import { Button } from "@/shared/components";

type WalletDepositDialogHeaderProps = {
  title: string;
  description: string;
  onClose: () => void;
  loading: boolean;
};

export function WalletDepositDialogHeader({
  title,
  description,
  onClose,
  loading,
}: WalletDepositDialogHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b gt-border px-6 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[14px] border gt-border bg-[var(--gt-card)] text-[var(--gt-primary)]">
          <WalletCards size={18} />
        </div>

        <div>
          <h2 className="text-[1.5rem] font-black tracking-tight">{title}</h2>

          <p className="mt-0.5 text-sm gt-text-muted">{description}</p>
        </div>
      </div>

      <Button
        aria-label="Đóng"
        disabled={loading}
        onClick={onClose}
        size="icon"
        variant="ghost"
      >
        <X size={18} />
      </Button>
    </div>
  );
}
