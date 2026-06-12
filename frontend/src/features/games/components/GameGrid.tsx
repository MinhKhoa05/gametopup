import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Game } from '../types';
import { ImageBox } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';

type GameGridProps = {
  className?: string;
  games: Game[];
  loading?: boolean;
  onPick: (game: Game) => void;
  skeletonCount?: number;
  renderBadges?: (game: Game) => ReactNode;
};

export function GameGrid({ className, games, loading = false, onPick, skeletonCount = 8, renderBadges }: GameGridProps) {
  return (
    <div
      className={classNames(
        'grid grid-cols-3 gap-x-2 gap-y-3 overflow-visible pb-0 sm:grid-cols-4 md:flex md:items-start md:gap-4 md:overflow-x-auto md:pb-3 md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`game-skeleton-${index}`}
              className="flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 md:w-[96px] md:flex-none md:text-sm"
              aria-hidden="true"
            >
              <div className="aspect-square w-full animate-pulse rounded-2xl bg-white/10 md:h-[72px] md:w-[72px] md:rounded-3xl" />
              <div className="h-3.5 w-16 animate-pulse rounded-full bg-white/10" />
            </div>
          ))
        : games.map((game) => (
            <button
              key={game.id}
              type="button"
              className="group flex w-full flex-col items-center justify-start gap-2 text-center text-[0.72rem] font-semibold text-slate-300 transition-transform duration-200 md:w-[96px] md:flex-none md:text-sm"
              onClick={() => onPick(game)}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-transparent bg-ink-lighter object-cover transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan md:h-[72px] md:w-[72px] md:rounded-3xl">
                <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
                {renderBadges ? <div className="absolute right-2 top-2 flex flex-col items-end gap-2">{renderBadges(game)}</div> : null}
              </div>
              <span className="leading-tight">{game.name}</span>
            </button>
          ))}
    </div>
  );
}
