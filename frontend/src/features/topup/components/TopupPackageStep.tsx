import { PackageCheck } from 'lucide-react';
import { EmptyState, ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { GamePackage } from '@/features/games/types';
import { TopupHeroBanner } from './TopupLayout';

type TopupPackageStepProps = {
  isLoading: boolean;
  packages: GamePackage[];
  selectedPackageId: number | null;
  onSelectPackage: (packageId: number) => void;
  gameName: string;
  gameImageUrl: string;
};

export function TopupPackageStep({ gameImageUrl, gameName, isLoading, onSelectPackage, packages, selectedPackageId }: TopupPackageStepProps) {
  return (
    <div className="grid gap-4">
      <TopupHeroBanner
        afterTitle={
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <PackageCheck size={16} /> Dịch vụ nạp trung gian chiết khấu
          </div>
        }
        eyebrow="Bước 1"
        imageAlt={gameName}
        imageSrc={gameImageUrl}
        title="Chọn gói nạp"
      />
      {isLoading && packages.length === 0 ? (
        <PackageGridSkeleton />
      ) : packages.length === 0 ? (
        <EmptyState variant="compact">Chưa có gói nạp.</EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} gamePackage={pkg} isSelected={selectedPackageId === pkg.id} onSelect={onSelectPackage} />
          ))}
        </div>
      )}
    </div>
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
  return (
    <button
      type="button"
      className={classNames(
        'gt-panel relative flex min-h-48 flex-col items-stretch rounded-lg p-2.5 text-center text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/20 hover:bg-[rgba(255,255,255,0.035)] md:min-h-[210px]',
        isSelected && 'border-cyan/20 bg-[rgba(255,255,255,0.035)] shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_10px_22px_rgba(0,0,0,0.22)]',
      )}
      onClick={() => onSelect(gamePackage.id)}
    >
      <div className="mb-2.5 aspect-[1/0.82] overflow-hidden rounded-md bg-slate-950/65">
        <ImageBox src={gamePackage.imageUrl} alt={gamePackage.name} className="h-full w-full object-cover" />
      </div>
      <strong className="flex min-h-10 items-center justify-center text-[0.95rem] font-black leading-[1.25] text-white">{gamePackage.name}</strong>
      <small className="mb-2 block text-[0.72rem] font-extrabold text-slate-400">Còn {gamePackage.stockQuantity} suất</small>
      <div className={classNames('mt-auto w-full rounded-md py-1.5 text-sm font-extrabold transition-colors', isSelected ? 'bg-cyan text-ink' : 'bg-cyan/15 text-cyan-50')}>
        {formatCurrency(gamePackage.salePrice)}
      </div>
      {gamePackage.originalPrice > gamePackage.salePrice ? (
        <div className="mt-1.5 text-[0.75rem] font-bold text-slate-500 line-through">{formatCurrency(gamePackage.originalPrice)}</div>
      ) : null}
    </button>
  );
}

function PackageGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3.5" aria-busy="true" aria-label="Đang tải gói nạp">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`package-skeleton-${index}`}
          className="relative flex min-h-48 flex-col items-stretch rounded-lg border border-white/[0.06] bg-ink-lighter p-2.5 text-center md:min-h-[210px]"
          aria-hidden="true"
        >
          <div className="mb-2.5 aspect-[1/0.82] overflow-hidden rounded-md bg-ink-dark">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
          </div>
          <div className="mb-2 h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/6" />
          <div className="mt-auto h-8 w-full rounded-md bg-white/8" />
        </div>
      ))}
    </div>
  );
}
