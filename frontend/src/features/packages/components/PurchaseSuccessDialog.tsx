import { CheckCircle2 } from "lucide-react";

import { Button, DetailRow, Dialog, PanelShell } from "@/shared/components";
import { formatCurrency, formatDateTimeShort } from "@/shared/lib/format";
import type { Game } from "@/features/games/types";
import type { GamePackage } from "@/features/packages/types";

type PurchaseSuccessDialogProps = {
  game: Game;
  isOpen: boolean;
  onContinue: () => void;
  onViewOrders: () => void;
  packageItem: GamePackage;
  purchaseInfo: {
    characterName: string;
    uidServer: string;
  };
  result: {
    orderId: number;
    successAt: string;
  };
};

export function PurchaseSuccessDialog({
  game,
  isOpen,
  onContinue,
  onViewOrders,
  packageItem,
  purchaseInfo,
  result,
}: PurchaseSuccessDialogProps) {
  const successTime = formatDateTimeShort(result.successAt);
  const orderCode = formatOrderCode(result.orderId);

  return (
    <Dialog
      description="Đơn nạp đã được ghi nhận và chuyển sang hàng chờ xử lý."
      icon={<CheckCircle2 size={18} />}
      isOpen={isOpen}
      maxWidthClassName="max-w-[520px]"
      onClose={onContinue}
      title="Đã tạo đơn hàng"
    >
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.1)] text-[var(--gt-success)]">
          <CheckCircle2 size={28} />
        </div>

        <div className="mt-4 text-sm font-medium gt-text-muted">Mã đơn</div>

        <div className="mt-1 text-[1.35rem] font-black leading-tight text-[var(--gt-primary)]">
          {orderCode}
        </div>
      </div>

      <PanelShell className="mt-5 p-4">
        <div className="flex items-center justify-between gap-4 border-b gt-border pb-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-black gt-text">
              {packageItem.name}
            </div>
            <div className="mt-1 truncate text-xs font-medium gt-text-muted">
              {game.name}
            </div>
          </div>

          <div className="gt-tabular shrink-0 text-right text-[1.1rem] font-black text-[var(--gt-primary)]">
            {formatCurrency(packageItem.salePrice)}
          </div>
        </div>

        <DetailRow label="Tài khoản nạp">{purchaseInfo.uidServer}</DetailRow>
        {purchaseInfo.characterName ? (
          <DetailRow label="Nhân vật">{purchaseInfo.characterName}</DetailRow>
        ) : null}
        <DetailRow label="Thời gian">{successTime}</DetailRow>
      </PanelShell>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button className="sm:min-w-32" variant="outline" onClick={onContinue}>
          Tiếp tục nạp
        </Button>
        <Button
          className="sm:min-w-36"
          variant="primary"
          onClick={onViewOrders}
        >
          Xem đơn hàng
        </Button>
      </div>
    </Dialog>
  );
}

function formatOrderCode(orderId: number) {
  if (!Number.isFinite(orderId)) {
    return "#GTU-000000";
  }

  return `#GTU-${String(orderId).padStart(6, "0")}`;
}
