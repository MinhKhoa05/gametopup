import { createPortal } from "react-dom";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  useConfirmDepositTransferMutation,
  useCreateDepositRequestMutation,
} from "@/features/deposits/server";
import type { WalletDeposit } from "@/features/deposits/types";
import { copyToClipboard } from "@/shared/lib/copyToClipboard";
import { Button } from "@/shared/components";

import { DepositAmountForm } from "./DepositAmountForm";
import { DepositSuccess } from "./DepositSuccess";
import { DepositTransferInfo } from "./DepositTransferInfo";
import { WalletDepositDialogHeader } from "./WalletDepositDialogHeader";

type WalletDepositDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function WalletDepositDialog({
  isOpen,
  onClose,
}: WalletDepositDialogProps) {
  const createMutation = useCreateDepositRequestMutation();
  const confirmMutation = useConfirmDepositTransferMutation();

  const [amount, setAmount] = useState("100000");
  const [deposit, setDeposit] = useState<WalletDeposit | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setAmount("100000");
    setDeposit(null);
    setConfirmed(false);

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = old;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const title = confirmed ? "Hoàn tất" : "Nạp tiền vào ví";
  const description = confirmed
    ? "Yêu cầu đã được ghi nhận."
    : deposit
      ? "Quét QR hoặc sao chép thông tin bên dưới."
      : "Nhập số tiền để tạo yêu cầu chuyển khoản.";

  const showTransfer = deposit !== null;
  const loading = createMutation.isPending || confirmMutation.isPending;

  const formClass = showTransfer
    ? "pointer-events-none absolute inset-0 translate-y-2 opacity-0 transition-all duration-300 ease-out"
    : "relative translate-y-0 space-y-6 opacity-100 transition-all duration-300 ease-out";

  const transferClass = showTransfer
    ? "relative translate-y-0 space-y-6 opacity-100 transition-all duration-300 ease-out"
    : "pointer-events-none absolute inset-0 translate-y-2 opacity-0 transition-all duration-300 ease-out";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const value = Number(amount);

    if (!value || value <= 0) {
      toast.error("Số tiền không hợp lệ.");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        amount: value,
      });

      setDeposit(result);
      setConfirmed(false);
    } catch {}
  }

  async function handleConfirm() {
    if (!deposit) return;

    try {
      await confirmMutation.mutateAsync({
        requestId: deposit.id,
      });

      setConfirmed(true);
    } catch {}
  }

  async function copy(text: string) {
    await copyToClipboard(text);
    toast.success("Đã sao chép.");
  }

  const content = confirmed ? (
    <DepositSuccess onClose={onClose} />
  ) : deposit ? (
    <DepositTransferInfo deposit={deposit} onCopy={copy} />
  ) : (
    <DepositAmountForm
      amount={amount}
      loading={loading}
      onAmountChange={setAmount}
      onQuickAmountSelect={(value) => setAmount(String(value))}
      onSubmit={handleSubmit}
    />
  );

  return createPortal(
    <div className="fixed inset-0 z-[80] bg-[var(--gt-bg)]/82 p-4 backdrop-blur-md">
      <div className="flex h-full items-center justify-center overflow-y-auto">
        <div className="gt-panel w-full max-w-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.55)]">
          <WalletDepositDialogHeader
            description={description}
            loading={loading}
            onClose={onClose}
            title={title}
          />

          <div className="space-y-4 p-5">
            <div className="relative">
              <div className={formClass}>{!showTransfer ? content : null}</div>

              <div className={transferClass}>{showTransfer ? content : null}</div>
            </div>

            {deposit && !confirmed ? (
              <Button
                variant="primary"
                className="h-12 w-full"
                loading={loading}
                onClick={handleConfirm}
              >
                Đã hoàn tất chuyển khoản
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
