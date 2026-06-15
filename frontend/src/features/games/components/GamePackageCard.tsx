import { ImageBox } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { GamePackage } from '@/features/games/types';

type GamePackageCardProps = {
  gamePackage: GamePackage;
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
        'group relative mx-auto flex aspect-[0.82/1] w-full max-w-[214px] flex-col overflow-hidden rounded-[18px] border p-2 text-center text-white transition-all duration-200',
        'border-slate-700/70 bg-[linear-gradient(180deg,rgba(12,22,38,0.9),rgba(7,14,24,0.96))] hover:border-cyan-300/35 hover:bg-[linear-gradient(180deg,rgba(14,26,44,0.94),rgba(7,14,24,0.97))]',
        !isSelected && 'opacity-[0.94] hover:opacity-100',
        isSelected &&
          'border-cyan-300/95 bg-[linear-gradient(180deg,rgba(12,34,48,0.98),rgba(8,16,28,0.99))] shadow-[inset_0_0_0_1.5px_rgba(34,211,238,0.95)]',
      )}
      onClick={() => onSelect(gamePackage.id)}
    >
      {hasDiscount ? (
        <div className="absolute left-0 top-0 z-10">
          <div className="[clip-path:polygon(0_0,100%_0,88%_100%,0_100%)] bg-[#2b62ff] px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.03em] text-white">
            -{discountPercent}%
          </div>
        </div>
      ) : null}

      {isSelected ? <div className="absolute inset-0 rounded-[18px] shadow-[inset_0_0_0_1.5px_rgba(34,211,238,0.95)]" /> : null}

      <div className="relative flex flex-[1.02] items-center justify-center">
        <div className="relative h-[82px] w-full overflow-hidden rounded-[14px] bg-slate-950/40">
          <ImageBox src={gamePackage.imageUrl} alt={gamePackage.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(2,6,23,0.18)_58%,rgba(2,6,23,0.42)_100%)]" />
        </div>
      </div>

      <div className="grid flex-[0.86] content-start gap-0.5 pb-0.5 pt-0.5">
        <h3
          className="min-h-[2.55rem] overflow-hidden px-0.5 text-[0.98rem] font-semibold leading-[1.14] text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          title={gamePackage.name}
        >
          {gamePackage.name}
        </h3>

        <div className="grid gap-1">
          <div className={classNames('text-[1.12rem] font-black leading-none', isSelected ? 'text-sky-300' : 'text-sky-400')}>
            {formatCurrency(gamePackage.salePrice)}
          </div>
          {hasDiscount ? <div className="text-[0.75rem] font-medium leading-none text-slate-500 line-through">{formatCurrency(gamePackage.originalPrice)}</div> : null}
        </div>
      </div>
    </button>
  );
}
