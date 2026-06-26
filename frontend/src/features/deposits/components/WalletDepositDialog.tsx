import { useEffect, useState, type FormEvent } from "react";
import { X, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button, DetailRow, Field } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

import {
  useConfirmDepositTransferMutation,
  useCreateDepositRequestMutation,
} from "@/features/deposits/server";

import type { WalletDeposit } from "@/features/deposits/types";

type WalletDepositDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000] as const;

export function WalletDepositDialog({
  isOpen,
  onClose,
}: WalletDepositDialogProps) {
  const createMutation = useCreateDepositRequestMutation();
  const confirmMutation = useConfirmDepositTransferMutation();

  const [amount, setAmount] = useState("100000");
  const [deposit, setDeposit] = useState<WalletDeposit | null>(null);

  const loading = createMutation.isPending || confirmMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;

    setAmount("100000");
    setDeposit(null);

    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = old;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

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
    } catch {}
  }

  async function handleConfirm() {
    if (!deposit) return;

    try {
      await confirmMutation.mutateAsync({
        requestId: deposit.id,
      });

      toast.success("Đã xác nhận chuyển khoản.");

      onClose();
    } catch {}
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success("Đã sao chép.");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4">
      <div className="flex h-full items-center justify-center overflow-y-auto">
        <div className="w-full max-w-3xl rounded-3xl border gt-border bg-[var(--gt-card)] shadow-2xl">
          <div className="flex items-center justify-between border-b gt-border px-6 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[var(--gt-primary)]">
                Wallet
              </p>

              <h2 className="mt-1 text-2xl font-black tracking-tight">
                Nạp tiền vào ví
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Chuyển khoản theo thông tin bên dưới.
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-xl p-2 transition hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-8 p-6">
            {!deposit ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
                  <Field
                    label="Số tiền"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Nhập số tiền muốn nạp"
                    hint="Nhập số tiền hoặc chọn nhanh ở bên phải."
                    trailing={
                      <span className="text-sm font-semibold gt-text-muted">
                        VNĐ
                      </span>
                    }
                  />

                  <div>
                    <p className="mb-2 text-sm font-semibold gt-text-soft">
                      Mức phổ biến
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_AMOUNTS.map((value) => (
                        <Button
                          className="h-11 text-sm font-semibold"
                          key={value}
                          type="button"
                          variant="secondary"
                          onClick={() => setAmount(String(value))}
                        >
                          {formatCurrency(value)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                >
                  Tạo yêu cầu nạp tiền
                </Button>
              </form>
            ) : (
              <div className="space-y-7">
                <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
                  <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <img
                      src={deposit.qrImageUrl}
                      alt="QR"
                      className="h-48 w-48 rounded-xl bg-white p-3 shadow-md object-contain"
                    />

                    <p className="mt-4 text-3xl font-black tracking-tight text-[var(--gt-primary)]">
                      {formatCurrency(deposit.amount)}
                    </p>

                    <p className="mt-2 max-w-[210px] text-center text-sm leading-6 text-slate-300">
                      Quét mã QR hoặc chuyển khoản theo thông tin bên cạnh.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <DetailRow label="Ngân hàng">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">
                          {deposit.bankId}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                          onClick={() => copy(deposit.bankId)}
                        >
                          <Copy size={15} />
                        </Button>
                      </div>
                    </DetailRow>

                    <DetailRow label="Số tài khoản">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">
                          {deposit.accountNo}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                          onClick={() => copy(deposit.accountNo)}
                        >
                          <Copy size={15} />
                        </Button>
                      </div>
                    </DetailRow>

                    <DetailRow label="Chủ tài khoản">
                      <span className="font-semibold text-slate-100">
                        {deposit.accountName}
                      </span>
                    </DetailRow>

                    <DetailRow label="Nội dung chuyển khoản">
                      <div className="flex items-center gap-2">
                        <span className="break-all font-semibold text-slate-100">
                          {deposit.transferContent}
                        </span>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                          onClick={() => copy(deposit.transferContent)}
                        >
                          <Copy size={15} />
                        </Button>
                      </div>
                    </DetailRow>

                    <DetailRow label="Số tiền">
                      <span className="font-semibold text-[var(--gt-primary)]">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </DetailRow>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-[var(--gt-primary)]/15 bg-[var(--gt-primary)]/5 px-4 py-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--gt-primary)]"
                  />

                  <div>
                    <p className="font-semibold text-[var(--gt-primary)]">
                      Lưu ý
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      Chuyển đúng số tiền và đúng nội dung chuyển khoản để Admin
                      xác nhận nhanh hơn.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="h-12 w-full"
                  loading={loading}
                  leadingIcon={<CheckCircle2 size={18} />}
                  onClick={handleConfirm}
                >
                  Tôi đã chuyển khoản
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
