import { ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { PublicGamePackage } from '@/features/games/contracts';

type GamePackageCardProps = {
  gamePackage: PublicGamePackage;
  isSelected: boolean;
  onSelect: (packageId: number) => void;
};

export function GamePackageCard({ gamePackage, isSelected, onSelect }: GamePackageCardProps) {
  const hasDiscount = gamePackage.originalPrice > gamePackage.salePrice;
  const discountPercent = hasDiscount ? Math.max(1, Math.round((1 - gamePackage.salePrice / gamePackage.originalPrice) * 100)) : 0;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={classNames(
        'gt-card-hover group relative mx-auto flex aspect-[0.82/1] w-full max-w-[214px] min-w-0 flex-col overflow-hidden rounded-[18px] border p-2 text-center text-white transition-all duration-200',
        'border gt-border bg-[var(--gt-card)] hover:border-[color:var(--gt-border-strong)] hover:bg-[var(--gt-card-hover)]',
        !isSelected && 'opacity-[0.94] hover:opacity-100 hover:-translate-y-0.5',
        isSelected &&
          'border-[color:var(--gt-primary-border)] bg-[var(--gt-primary-soft)] opacity-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18),0_10px_22px_rgba(2,6,23,0.12)]',
      )}
      onClick={() => onSelect(gamePackage.id)}
    >
      {hasDiscount ? (
        <div className="absolute left-3 top-3 z-10">
          <div className="rounded-[6px] bg-[var(--gt-primary)] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.03em] text-[var(--gt-primary-text)]">
            -{discountPercent}%
          </div>
        </div>
      ) : null}

      {isSelected ? <div className="absolute inset-0 rounded-[18px] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14)]" /> : null}

      <div className="relative flex flex-[1.18] items-center justify-center">
        <div className="relative h-[118px] w-full overflow-hidden rounded-[14px] bg-[var(--gt-bg-soft)]">
          <ImageBox src={gamePackage.imageUrl} alt={gamePackage.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.08)_58%,rgba(2,6,23,0.28)_100%)]" />
        </div>
      </div>

      <div className="grid flex-[0.72] content-start gap-0.5 pb-0.5 pt-0.5">
        <h3
          className={classNames(
            'min-h-[2.55rem] overflow-hidden px-0.5 text-[0.98rem] font-semibold leading-[1.14] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]',
            isSelected ? 'gt-text' : 'gt-text-soft',
          )}
          title={gamePackage.name}
        >
          {gamePackage.name}
        </h3>

        <div className="grid gap-1">
          <div className={classNames('text-[1.12rem] font-black leading-none', isSelected ? 'text-[var(--gt-primary-hover)]' : 'text-[var(--gt-primary)]')}>
            {formatCurrency(gamePackage.salePrice)}
          </div>
          {hasDiscount ? <div className="text-[0.75rem] font-medium leading-none gt-text-disabled line-through">{formatCurrency(gamePackage.originalPrice)}</div> : null}
        </div>
      </div>
    </button>
  );
}
