import type { ReactNode } from "react";
import type { Game } from "@/features/games/types";
import { GameCard } from "./GameCard";
import { GameCardSkeleton } from "./GameCardSkeleton";

type GameGridProps<TGame extends Game = Game> = {
  games?: TGame[];
  loading?: boolean;
  skeletonCount?: number;
  onGameClick?: (game: TGame) => void;
  renderOverlay?: (game: TGame) => ReactNode;
};

export function GameGrid<TGame extends Game = Game>({
  games = [],
  loading = false,
  skeletonCount = 10,
  onGameClick,
  renderOverlay,
}: GameGridProps<TGame>) {
  return (
    <div className="grid grid-cols-2 gap-6 justify-items-center sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))
        : games.map((game) => {
            return (
            <GameCard
              key={game.id}
              game={game}
              overlay={renderOverlay?.(game)}
              onClick={() => onGameClick?.(game)}
            />
            );
          })}
    </div>
  );
}
