import type { Game } from "@/features/games/contracts";
import { GameCard } from "./GameCard";
import { GameCardSkeleton } from "./GameCardSkeleton";

type GameGridProps = {
  games?: Game[];
  loading?: boolean;
  skeletonCount?: number;
  onGameClick?: (game: Game) => void;
};

export function GameGrid({
  games = [],
  loading = false,
  skeletonCount = 10,
  onGameClick,
}: GameGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 justify-items-center sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <GameCardSkeleton key={index} />
          ))
        : games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => onGameClick?.(game)}
            />
          ))}
    </div>
  );
}
