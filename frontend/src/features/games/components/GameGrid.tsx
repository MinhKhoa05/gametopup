import { Heart, Sparkles } from 'lucide-react';
import type { Game } from '../types';
import { getGamePlatformLabel, getGameTopupLabel } from '../lib/catalog';
import { Badge, Button, ImageBox } from '@/shared/components';
import { classNames } from '@/shared/lib/classNames';

type GameGridProps = {
  className?: string;
  games: Game[];
  loading?: boolean;
  onPick: (game: Game) => void;
  skeletonCount?: number;
};

export function GameGrid({ className, games, loading = false, onPick, skeletonCount = 10 }: GameGridProps) {
  return (
    <div className={classNames('grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5', className)}>
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => <GameCardSkeleton key={`game-skeleton-${index}`} />)
        : games.map((game) => (
            <GameCard key={game.id} game={game} onPick={onPick} />
          ))}
    </div>
  );
}

function GameCard({
  game,
  onPick,
}: {
  game: Game;
  onPick: (game: Game) => void;
}) {
  const platformLabel = getGamePlatformLabel(game);
  const topupLabel = getGameTopupLabel(game);

  return (
    <article className="group grid h-full gap-2.5 rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.86)] p-3 transition-all duration-200 hover:-translate-y-1 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.96)] hover:shadow-[0_16px_30px_rgba(2,6,23,0.18)]">
      <div className="relative overflow-hidden rounded-[14px] border border-white/5 bg-slate-950">
        <div className="relative h-[208px] overflow-hidden">
          <ImageBox
            src={game.imageUrl}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.08)_42%,rgba(2,6,23,0.8)_100%)]" />
        </div>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 px-1">
        <Badge variant="accent" className="w-fit rounded-full px-2.5 py-1 text-[0.72rem] font-bold">
          {platformLabel}
        </Badge>
        <button
          type="button"
          aria-label="Yêu thích"
          className="inline-flex size-8 justify-self-end items-center justify-center rounded-full border border-white/10 bg-transparent text-slate-300 transition-colors hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50"
        >
          <Heart size={16} />
        </button>
        <div className="col-span-2 grid gap-0.5">
          <h3 className="m-0 text-base font-black text-white">{game.name}</h3>
          <p className="m-0 text-sm leading-6 text-slate-400">Nạp {topupLabel}</p>
        </div>
      </div>

      <Button variant="outline" className="mt-auto w-full rounded-[12px] px-4 text-sm font-bold text-cyan-200 hover:text-cyan-50" onClick={() => onPick(game)}>
        Nạp ngay
        <Sparkles size={16} />
      </Button>
    </article>
  );
}

function GameCardSkeleton() {
  return (
    <article className="grid gap-2.5 rounded-[16px] border border-white/10 bg-[rgba(7,16,31,0.86)] p-3" aria-hidden="true">
      <div className="relative overflow-hidden rounded-[14px] border border-white/5 bg-slate-950">
        <div className="h-[208px] animate-pulse bg-white/6" />
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 px-1">
        <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
        <div className="size-8 animate-pulse rounded-full bg-white/10 justify-self-end" />
        <div className="col-span-2 grid gap-2">
          <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-3.5 w-20 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>

      <div className="h-11 w-full animate-pulse rounded-[12px] bg-white/10" />
    </article>
  );
}
