import { Button, ImageBox, PanelShell } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import type { GamePackage } from "@/features/packages/types";

type GamePackageDetailPanelProps = {
  gameName: string;
  onPurchase: () => void;
  selectedPackage: GamePackage | null;
};

export function GamePackageDetailPanel({
  gameName,
  onPurchase,
  selectedPackage,
}: GamePackageDetailPanelProps) {
  const hasDiscount =
    !!selectedPackage &&
    selectedPackage.originalPrice > selectedPackage.salePrice;
  const discountPercent =
    selectedPackage && hasDiscount
      ? Math.max(
          1,
          Math.round(
            (1 - selectedPackage.salePrice / selectedPackage.originalPrice) *
              100,
          ),
        )
      : 0;
  const isAvailable = selectedPackage?.isAvailable ?? false;
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <PanelShell className="p-4 sm:p-5">
        {selectedPackage ? (
          <div className="grid gap-5">
            <div className="flex items-start gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[16px] bg-[var(--gt-bg-soft)] sm:h-[72px] sm:w-[72px]">
                <ImageBox
                  src={selectedPackage.imageUrl}
                  alt={selectedPackage.name}
                  className="h-full w-full object-cover transition-transform duration-300"
                />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h3
                  className="overflow-hidden text-[15px] font-semibold leading-5 gt-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                  title={selectedPackage.name}
                >
                  {selectedPackage.name}
                </h3>
                <p
                  className="mt-1 overflow-hidden text-[0.9rem] leading-5 gt-text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]"
                  title={gameName}
                >
                  {gameName}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[var(--gt-border)] opacity-80" />

            <div>
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm font-medium gt-text-muted">
                  Giá bán
                </span>
                <span className="text-[1.65rem] font-black leading-none gt-text">
                  {formatCurrency(selectedPackage.salePrice)}
                </span>
              </div>

              {hasDiscount ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="gt-text-muted">Giá gốc</span>
                  <span className="font-medium line-through gt-text-disabled">
                    {formatCurrency(selectedPackage.originalPrice)}
                  </span>
                </div>
              ) : null}

              {hasDiscount ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                  <span className="gt-text-muted">Tiết kiệm</span>
                  <span className="font-semibold text-[var(--gt-primary)]">
                    {discountPercent}%
                  </span>
                </div>
              ) : null}
            </div>

            <Button
              type="button"
              variant="primary"
              className="w-full py-3.5"
              onClick={onPurchase}
              disabled={!isAvailable}
            >
              {isAvailable ? "Mua ngay" : "Hết hàng"}
            </Button>
          </div>
        ) : (
          <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 py-6 text-sm leading-6 gt-text-muted">
            Chọn một gói để xem chi tiết và tiếp tục mua.
          </div>
        )}
      </PanelShell>
    </aside>
  );
}
