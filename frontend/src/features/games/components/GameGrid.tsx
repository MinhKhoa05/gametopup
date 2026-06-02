import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { pickImage, classNames } from '../../../lib/ui';
import { Game } from '../../../types';

export function GameGrid({
  games,
  onPick,
  renderBadges,
  className,
}: {
  className?: string;
  games: Game[];
  onPick: (game: Game) => void;
  renderBadges?: (game: Game) => ReactNode;
}) {
  return (
    <div
      className={classNames(
        'grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-5',
        className,
      )}
    >
      {games.map((game) => (
        <button
          type="button"
          key={game.id}
          onClick={() => onPick(game)}
          className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-ink-light p-0 text-left transition duration-200 hover:-translate-y-1 hover:border-cyanline/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
            <img
              src={pickImage(game)}
              alt={game.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {renderBadges ? <div className="absolute right-2 top-2 flex flex-col items-end gap-2">{renderBadges(game)}</div> : null}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="mb-1 text-[1.1rem] font-bold text-white">{game.name}</h3>
            <span className="text-sm text-slate-400">Nạp nhanh bằng ID</span>
            <div className="mt-4 flex w-full items-center justify-between">
              <span className="text-sm font-bold text-cyanline">Nạp game</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyanline/10 text-cyanline">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
