import { Badge, Button, ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import type { GamePackage } from '@/features/games/types';

type PackageDetailPanelProps = {
  onPurchase: () => void;
  selectedPackage: GamePackage | null;
};

export function PackageDetailPanel({ onPurchase, selectedPackage }: PackageDetailPanelProps) {
  const hasDiscount = !!selectedPackage && selectedPackage.originalPrice > selectedPackage.salePrice;
  const discountPercent =
    selectedPackage && hasDiscount ? Math.max(1, Math.round((1 - selectedPackage.salePrice / selectedPackage.originalPrice) * 100)) : 0;

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="rounded-[24px] border border-white/8 bg-slate-900/95 p-4 shadow-[0_18px_44px_rgba(2,6,23,0.22)] sm:p-5">
        <div className="space-y-2">
          <h2 className="text-[1.08rem] font-black tracking-tight text-white">Chi tiết gói nạp</h2>
          <p className="text-sm leading-6 text-slate-400">Xem gói đang chọn trước khi đặt mua.</p>
        </div>

        {selectedPackage ? (
          <div className="mt-4 grid gap-4">
            <div className="relative overflow-hidden rounded-[18px] bg-slate-950/70">
              <div className="absolute left-2.5 top-2.5 z-10">
                {hasDiscount ? (
                  <Badge variant="accent" className="uppercase tracking-[0.12em]">
                    -{discountPercent}%
                  </Badge>
                ) : null}
              </div>

              <div className="relative h-[100px] overflow-hidden rounded-[18px]">
                <ImageBox src={selectedPackage.imageUrl} alt={selectedPackage.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.12)_56%,rgba(2,6,23,0.38)_100%)]" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-[1rem] font-black leading-[1.15] text-white">{selectedPackage.name}</h3>
              <p className="text-sm text-slate-400">Còn {selectedPackage.stockQuantity} suất</p>
            </div>

            <div className="grid gap-0.5">
              <strong className="text-[1.1rem] font-black leading-none text-cyan-100">{formatCurrency(selectedPackage.salePrice)}</strong>
              {hasDiscount ? <span className="text-sm font-semibold text-slate-500 line-through">{formatCurrency(selectedPackage.originalPrice)}</span> : null}
            </div>

            <Button type="button" variant="accent" className="w-full" onClick={onPurchase}>
              Mua ngay
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-6 text-sm leading-6 text-slate-400">
            Chọn một gói để xem chi tiết và tiếp tục mua.
          </div>
        )}
      </div>
    </aside>
  );
}
