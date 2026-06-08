import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { classNames, pickImage } from '@/lib/ui';
import { Game } from '@/features/games/games.types';
import { IconBox, ImageField } from '@/components/ui';

export function GameGrid({
  games,
  onPick,
  loading = false,
  skeletonCount = 8,
  renderBadges,
  className,
}: {
  className?: string;
  games: Game[];
  loading?: boolean;
  onPick: (game: Game) => void;
  skeletonCount?: number;
  renderBadges?: (game: Game) => ReactNode;
}) {
  return (
    <div
      className={classNames(
        'grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-5',
        className,
      )}
    >
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <div
              key={`game-skeleton-${index}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-light p-0 text-left"
              aria-hidden="true"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03)_8%,rgba(255,255,255,0.12)_18%,rgba(255,255,255,0.03)_33%)] bg-[length:200%_100%]" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/6" />
                <div className="mt-4 flex w-full items-center justify-between">
                  <div className="h-4 w-20 animate-pulse rounded-full bg-white/8" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-white/8" />
                </div>
              </div>
            </div>
          ))
        : games.map((game) => (
            <button
              type="button"
              key={game.id}
              onClick={() => onPick(game)}
              className="gt-interactive group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-light p-0 text-left"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                <ImageField src={pickImage(game)} alt={game.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                {renderBadges ? <div className="absolute right-2 top-2 flex flex-col items-end gap-2">{renderBadges(game)}</div> : null}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 text-[1.1rem] font-bold text-white">{game.name}</h3>
                <span className="text-sm text-slate-400">Nạp nhanh bằng ID</span>
                <div className="mt-4 flex w-full items-center justify-between">
                  <span className="text-sm font-bold text-cyan">Nạp game</span>
                  <IconBox size="sm" circle className="h-8 w-8">
                    <ChevronRight size={16} />
                  </IconBox>
                </div>
              </div>
            </button>
          ))}
    </div>
  );
}
