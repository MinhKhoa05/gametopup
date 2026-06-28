import type { ReactNode } from "react";
import type { Game } from "@/features/games/types";
import { LoadingState } from "@/shared/components";
import { GameCard } from "./GameCard";

type GameGridProps<TGame extends Game = Game> = {
  games?: TGame[];
  loading?: boolean;
  onGameClick?: (game: TGame) => void;
  renderOverlay?: (game: TGame) => ReactNode;
};

export function GameGrid<TGame extends Game = Game>({
  games = [],
  loading = false,
  onGameClick,
  renderOverlay,
}: GameGridProps<TGame>) {
  if (loading) {
    return <LoadingState title="Dang tai game..." />;
  }

  return (
    <div className="grid grid-cols-2 gap-6 justify-items-center sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((game) => {
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
