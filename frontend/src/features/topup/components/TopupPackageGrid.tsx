import { Badge } from '@/shared/components';
import { ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { GamePackage } from '@/features/games/types';

type TopupPackageGridProps = {
  isLoading: boolean;
  packages: GamePackage[];
  selectedPackageId: number | null;
  onSelectPackage: (packageId: number) => void;
};

export function TopupPackageGrid({ isLoading, packages, selectedPackageId, onSelectPackage }: TopupPackageGridProps) {
  return (
    <section id="packages" className="grid gap-4 scroll-mt-24">
      <div className="space-y-2">
        <h2 className="text-[clamp(1.2rem,1.8vw,1.6rem)] font-black tracking-tight text-white">Chọn gói nạp</h2>
        <p className="max-w-[52ch] text-sm leading-6 text-slate-400">Lựa chọn gói phù hợp với nhu cầu của bạn.</p>
      </div>

      {isLoading && packages.length === 0 ? (
        <PackageGridSkeleton />
      ) : packages.length === 0 ? (
        <div className="rounded-[24px] border border-white/8 bg-white/[0.025] px-5 py-8 text-sm text-slate-400">
          Chưa có gói nạp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} gamePackage={pkg} isSelected={selectedPackageId === pkg.id} onSelect={onSelectPackage} />
          ))}
        </div>
      )}
    </section>
  );
}

function PackageCard({
  gamePackage,
  isSelected,
  onSelect,
}: {
  gamePackage: GamePackage;
  isSelected: boolean;
  onSelect: (packageId: number) => void;
}) {
  const hasDiscount = gamePackage.originalPrice > gamePackage.salePrice;
  const discountPercent = hasDiscount ? Math.max(1, Math.round((1 - gamePackage.salePrice / gamePackage.originalPrice) * 100)) : 0;

  return (
    <button
      type="button"
      className={classNames(
        'group relative flex min-h-[194px] flex-col overflow-hidden rounded-[18px] border border-white/8 bg-slate-900/95 p-2 text-left text-white transition-colors duration-200 hover:border-white/12 hover:bg-slate-900',
        isSelected && 'border-cyan-400/18 bg-[linear-gradient(180deg,rgba(8,35,48,0.96),rgba(15,23,42,0.98))]',
      )}
      onClick={() => onSelect(gamePackage.id)}
    >
      <div className="absolute left-2.5 top-2.5 z-10">
        {isSelected ? (
          <Badge variant="accent" className="uppercase tracking-[0.12em]">
            ✓ Đã chọn
          </Badge>
        ) : hasDiscount ? (
          <Badge variant="accent" className="uppercase tracking-[0.12em]">
            -{discountPercent}%
          </Badge>
        ) : null}
      </div>

      <div className="relative aspect-[1.12/0.54] overflow-hidden rounded-[14px] bg-slate-950/70">
        <ImageBox src={gamePackage.imageUrl} alt={gamePackage.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.18)_56%,rgba(2,6,23,0.52)_100%)]" />
      </div>

      <div className="mt-2 grid flex-1 gap-1">
        <div className="space-y-0.5">
          <h3 className="text-[0.92rem] font-black leading-[1.15] text-white">{gamePackage.name}</h3>
          <p className="text-[0.8rem] text-slate-400">Còn {gamePackage.stockQuantity} suất</p>
        </div>

        <div className="mt-auto grid gap-0.5">
          <strong className="text-[1.02rem] font-black leading-none text-cyan-100">{formatCurrency(gamePackage.salePrice)}</strong>
          {hasDiscount ? <span className="text-xs font-semibold text-slate-500 line-through">{formatCurrency(gamePackage.originalPrice)}</span> : <span className="h-3" />}
        </div>
      </div>
    </button>
  );
}

function PackageGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`package-skeleton-${index}`}
          className="flex min-h-[194px] flex-col gap-2 rounded-[18px] border border-white/[0.06] bg-white/[0.025] p-2"
          aria-hidden="true"
        >
          <div className="aspect-[1.12/0.54] rounded-[14px] bg-white/[0.05]" />
          <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
          <div className="mt-auto h-8 rounded-[14px] bg-white/8" />
        </div>
      ))}
    </div>
  );
}
