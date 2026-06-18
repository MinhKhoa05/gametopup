import { Button, ImageBox, DetailRow } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { PublicGamePackage } from '@/features/games/contracts';

type GamePackageDetailPanelProps = {
  gameName: string;
  onPurchase: () => void;
  selectedPackage: PublicGamePackage | null;
};

export function GamePackageDetailPanel({ gameName, onPurchase, selectedPackage }: GamePackageDetailPanelProps) {
  const hasDiscount = !!selectedPackage && selectedPackage.originalPrice > selectedPackage.salePrice;
  const discountPercent =
    selectedPackage && hasDiscount ? Math.max(1, Math.round((1 - selectedPackage.salePrice / selectedPackage.originalPrice) * 100)) : 0;
  const isAvailable = selectedPackage?.isAvailable ?? false;
  const statusLabel = isAvailable ? 'Còn hàng' : 'Hết hàng';
  const description =
    selectedPackage?.description?.trim() || `Nhận ${selectedPackage?.name ?? 'gói nạp'} cho ${gameName}.`;

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-[24px] border gt-border bg-[var(--gt-panel)] p-5 sm:p-6">
        <div className="space-y-2">
          <h2 className="text-[1.14rem] font-black tracking-tight gt-text">Thông tin gói</h2>
          <p className="text-[0.95rem] leading-6 gt-text-muted">Xem thông tin trước khi mua</p>
        </div>

        {selectedPackage ? (
          <div className="mt-6 grid gap-4">
            <div className="grid gap-3 pb-2">
              <div className="flex items-start gap-3.5">
                <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[16px] border gt-border bg-[var(--gt-card)]">
                  <ImageBox src={selectedPackage.imageUrl} alt={selectedPackage.name} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1 pt-1.5">
                  <h3
                    className="overflow-hidden text-[0.98rem] font-black leading-[1.18] gt-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    title={selectedPackage.name}
                  >
                    {selectedPackage.name}
                  </h3>
                  <p
                    className="mt-1.5 overflow-hidden text-[0.92rem] leading-6 gt-text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    title={description}
                  >
                    {description}
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-[var(--gt-border)]" />
            </div>

            <div className="space-y-0 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
              <DetailRow label="Giá GameTopUp">{formatCurrency(selectedPackage.salePrice)}</DetailRow>
              {hasDiscount ? <DetailRow label="Giá trong game"><span className="line-through gt-text-disabled">{formatCurrency(selectedPackage.originalPrice)}</span></DetailRow> : null}
              {hasDiscount ? (
                <DetailRow label="Tiết kiệm">{`${formatCurrency(selectedPackage.originalPrice - selectedPackage.salePrice)} (-${discountPercent}%)`}</DetailRow>
              ) : null}
            </div>

            <div className="space-y-0 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
              <DetailRow label="Tình trạng">
                <span className={classNames(isAvailable ? 'text-[var(--gt-success)]' : 'text-[var(--gt-danger)]')}>{statusLabel}</span>
              </DetailRow>
              <DetailRow label="Thời gian xử lý">5–15 phút</DetailRow>
            </div>

            <Button type="button" variant="accent" className="w-full py-3.5" onClick={onPurchase} disabled={!isAvailable}>
              {isAvailable ? 'Mua ngay' : 'Hết hàng'}
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 py-6 text-sm leading-6 gt-text-muted">
            Chọn một gói để xem chi tiết và tiếp tục mua.
          </div>
        )}
      </div>
    </aside>
  );
}
