import { ImageBox } from "@/shared/components";
import type { Game } from "@/features/games/contracts";

type GameCardProps = {
  game: Game;
  onClick: () => void;
};

export function GameCard({ game, onClick }: GameCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gt-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gt-bg)]"
    >
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[var(--gt-card)] p-2 transition-all duration-200 group-hover:-translate-y-1 group-hover:border-cyan-400/20 group-hover:shadow-[0_10px_24px_rgba(0,0,0,.25)]">
        <div className="aspect-square overflow-hidden rounded-xl bg-[var(--gt-bg-soft)]">
          <ImageBox
            src={game.imageUrl}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[3rem] px-1 text-center text-[15px] font-semibold leading-6 gt-text transition-colors duration-200 group-hover:text-cyan-200">
        {game.name}
      </p>
    </button>
  );
}
