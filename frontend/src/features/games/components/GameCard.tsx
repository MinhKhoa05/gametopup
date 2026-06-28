import type { ReactNode } from "react";

import { ImageBox } from "@/shared/components";
import { classNames } from "@/shared/lib/classNames";
import type { Game } from "@/features/games/types";

type GameCardProps = {
  game: Game;
  onClick?: () => void;
  overlay?: ReactNode;
};

export function GameCard({ game, onClick, overlay }: GameCardProps) {
  const className = classNames(
    "group relative w-full rounded-2xl text-center",
    onClick &&
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gt-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gt-bg)]",
  );

  const content = (
    <>
      <div
        className={classNames(
          "rounded-2xl bg-[var(--gt-card)] p-2 transition-all duration-200",
          "border border-white/[0.06]",
          onClick &&
            "group-hover:-translate-y-1 group-hover:ring-1 group-hover:ring-cyan-400/20 group-hover:shadow-[0_10px_24px_rgba(0,0,0,.25)]",
        )}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-[var(--gt-bg-soft)]">
          <ImageBox
            src={game.imageUrl}
            alt={game.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {overlay ? (
            <div className="absolute left-3 top-3 z-20">{overlay}</div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid justify-items-center px-1">
        <p
          className={classNames(
            "line-clamp-2 min-h-[3rem] text-center text-[15px] font-semibold leading-6 gt-text",
            onClick &&
              "transition-colors duration-200 group-hover:text-cyan-200",
          )}
        >
          {game.name}
        </p>
      </div>
    </>
  );

  return onClick ? (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}
