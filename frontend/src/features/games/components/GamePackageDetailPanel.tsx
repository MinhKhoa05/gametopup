import { Button, ImageBox, DetailRow } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { GamePackage } from '@/features/games/types';

type GamePackageDetailPanelProps = {
  gameName: string;
  onPurchase: () => void;
  selectedPackage: GamePackage | null;
};

export function GamePackageDetailPanel({ gameName, onPurchase, selectedPackage }: GamePackageDetailPanelProps) {
  const hasDiscount = !!selectedPackage && selectedPackage.originalPrice > selectedPackage.salePrice;
  const discountPercent =
    selectedPackage && hasDiscount ? Math.max(1, Math.round((1 - selectedPackage.salePrice / selectedPackage.originalPrice) * 100)) : 0;
  const stockQuantity = selectedPackage?.stockQuantity ?? 0;
  const isSoldOut = !!selectedPackage && stockQuantity <= 0;
  const isLowStock = !!selectedPackage && stockQuantity > 0 && stockQuantity <= 5;
  const description =
    selectedPackage?.description?.trim() || `Nhận ${selectedPackage?.name ?? 'gói nạp'} cho ${gameName}.`;

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-[24px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(10,18,34,0.96),rgba(7,13,25,0.99))] p-5 sm:p-6">
        <div className="space-y-2">
          <h2 className="text-[1.14rem] font-black tracking-tight text-white">CHI TIẾT GÓI NẠP</h2>
          <p className="text-[0.95rem] leading-6 text-slate-400">Xem thông tin trước khi mua</p>
        </div>

        {selectedPackage ? (
          <div className="mt-6 grid gap-4">
            <div className="grid gap-3 pb-2">
              <div className="flex items-start gap-3.5">
                <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[14px] bg-slate-950/50">
                  <ImageBox src={selectedPackage.imageUrl} alt={selectedPackage.name} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1 pt-1.5">
                  <h3
                    className="overflow-hidden text-[0.98rem] font-black leading-[1.18] text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    title={selectedPackage.name}
                  >
                    {selectedPackage.name}
                  </h3>
                  <p
                    className="mt-1.5 overflow-hidden text-[0.92rem] leading-6 text-slate-400 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                    title={description}
                  >
                    {description}
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-white/[0.07]" />
            </div>

            <div className="space-y-0 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4">
              <DetailRow
                label="Giá GameTopUp"
                labelClassName="text-sky-300"
                value={formatCurrency(selectedPackage.salePrice)}
                valueClassName="text-cyan-100 font-black"
              />
              {hasDiscount ? <DetailRow label="Giá trong game" labelClassName="text-slate-300" value={formatCurrency(selectedPackage.originalPrice)} valueClassName="line-through text-slate-500" /> : null}
              {hasDiscount ? (
                <DetailRow
                  label="Tiết kiệm"
                  labelClassName="text-emerald-300"
                  value={`${formatCurrency(selectedPackage.originalPrice - selectedPackage.salePrice)} (-${discountPercent}%)`}
                  valueClassName="text-emerald-300"
                />
              ) : null}
            </div>

            <div className="space-y-0 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4">
              <DetailRow
                label="Tình trạng"
                value={stockQuantity > 0 ? `Còn ${stockQuantity} suất` : 'Hết hàng'}
                labelClassName="text-amber-300"
                valueClassName={classNames(isSoldOut ? 'text-rose-300' : isLowStock ? 'text-amber-300' : 'text-white')}
              />
              <DetailRow label="Xử lý dự kiến" labelClassName="text-cyan-300" value="5–15 phút" valueClassName="text-cyan-100" />
            </div>

            <Button type="button" variant="accent" className="w-full py-3.5" onClick={onPurchase} disabled={isSoldOut}>
              {isSoldOut ? 'Hết hàng' : 'Mua ngay'}
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-white/[0.06] bg-white/[0.02] px-4 py-6 text-sm leading-6 text-slate-400">
            Chọn một gói để xem chi tiết và tiếp tục mua.
          </div>
        )}
      </div>
    </aside>
  );
}
