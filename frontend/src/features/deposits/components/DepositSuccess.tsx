import { CheckCircle2 } from "lucide-react";

import { Button } from "@/shared/components";

type DepositSuccessProps = {
  onClose: () => void;
};

export function DepositSuccess({ onClose }: DepositSuccessProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-2">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border gt-border bg-[var(--gt-card)] text-[var(--gt-success)]">
          <CheckCircle2 size={26} />
        </div>

        <h3 className="mt-4 text-xl font-black tracking-tight">
          Đã ghi nhận yêu cầu
        </h3>

        <p className="mt-2 text-sm leading-6 gt-text-soft">
          Admin sẽ xác nhận trong
          <br />
          5–15 phút.
        </p>

        <Button
          type="button"
          variant="primary"
          className="mt-6 h-12 w-full"
          onClick={onClose}
        >
          Hoàn tất
        </Button>
      </div>
    </div>
  );
}
