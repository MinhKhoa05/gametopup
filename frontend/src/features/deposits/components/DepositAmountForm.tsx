import type { FormEvent } from "react";

import { Button, Field } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";

type DepositAmountFormProps = {
  amount: string;
  loading: boolean;
  onAmountChange: (value: string) => void;
  onQuickAmountSelect: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000] as const;

export function DepositAmountForm({
  amount,
  loading,
  onAmountChange,
  onQuickAmountSelect,
  onSubmit,
}: DepositAmountFormProps) {
  const amountValue = Number(amount);
  const hasAmount = Number.isFinite(amountValue) && amountValue > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Field
          label="Số tiền"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Ví dụ: 200000"
          trailing={
            <span className="text-sm font-semibold gt-text-muted">VNĐ</span>
          }
        />

        <p className="text-sm gt-text-muted">
          {hasAmount
            ? `Bạn sẽ cần chuyển khoản ${formatCurrency(amountValue)}`
            : null}
        </p>
      </div>

      <div className="border-t gt-border pt-4">
        <p className="text-sm font-semibold gt-text-soft">Mức phổ biến</p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              className="h-11 text-sm font-semibold"
              key={value}
              type="button"
              variant="secondary"
              active={amount === String(value)}
              onClick={() => onQuickAmountSelect(value)}
            >
              {formatCurrency(value)}
            </Button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        loading={loading}
      >
        Tiếp tục
      </Button>
    </form>
  );
}
