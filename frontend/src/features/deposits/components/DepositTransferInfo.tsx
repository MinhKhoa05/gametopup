import { Copy } from "lucide-react";

import { Button, DetailRow } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

import type { WalletDeposit } from "@/features/deposits/types";

type DepositTransferInfoProps = {
  deposit: WalletDeposit;
  onCopy: (text: string) => Promise<void> | void;
};

export function DepositTransferInfo({
  deposit,
  onCopy,
}: DepositTransferInfoProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <section>
        <div className="text-center">
          <p className="text-sm font-semibold gt-text-soft">Mã QR</p>
        </div>

        <div className="mt-3 rounded-[20px] bg-white/[0.02] p-2.5">
          <img
            src={deposit.qrImageUrl}
            alt="QR"
            className="h-[272px] w-full rounded-[16px] bg-white object-contain p-1.5"
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-sm font-semibold gt-text-soft">
            Thông tin chuyển khoản
          </p>
        </div>

        <div className="border-t gt-border">
          <DetailRow label="Nội dung">
            <div className="flex items-center gap-2">
              <span className="break-all font-semibold gt-text">
                {deposit.transferContent}
              </span>

              <Button
                aria-label="Sao chép nội dung chuyển khoản"
                size="sm"
                variant="ghost"
                className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => onCopy(deposit.transferContent)}
              >
                <Copy size={15} />
              </Button>
            </div>
          </DetailRow>

          <DetailRow label="Số tiền">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[var(--gt-primary)]">
                {formatCurrency(deposit.amount)}
              </span>

              <Button
                aria-label="Sao chép số tiền"
                size="sm"
                variant="ghost"
                className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => onCopy(String(deposit.amount))}
              >
                <Copy size={15} />
              </Button>
            </div>
          </DetailRow>

          <DetailRow label="Ngân hàng">
            <div className="flex items-center gap-2">
              <span className="font-semibold gt-text">{deposit.bankId}</span>

              <Button
                aria-label="Sao chép ngân hàng"
                size="sm"
                variant="ghost"
                className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => onCopy(deposit.bankId)}
              >
                <Copy size={15} />
              </Button>
            </div>
          </DetailRow>

          <DetailRow label="Số tài khoản">
            <div className="flex items-center gap-2">
              <span className="font-semibold gt-text">{deposit.accountNo}</span>

              <Button
                aria-label="Sao chép số tài khoản"
                size="sm"
                variant="ghost"
                className="h-8 w-8 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                onClick={() => onCopy(deposit.accountNo)}
              >
                <Copy size={15} />
              </Button>
            </div>
          </DetailRow>

          <DetailRow label="Chủ tài khoản">
            <span className="font-semibold gt-text">{deposit.accountName}</span>
          </DetailRow>
        </div>
      </section>
    </div>
  );
}
