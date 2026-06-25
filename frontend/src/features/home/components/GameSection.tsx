import { Button, SectionHeading } from "@/shared/components";
import type { Game } from "@/features/games/contracts";
import { GameCard } from "@/features/games/components/GameCard";
import { ArrowRight } from "lucide-react";

type GameSectionProps = {
  games: Game[];
  loading: boolean;
  onPick: (game: Game) => void;
  onViewAll?: () => void;
};

export function GameSection({
  games,
  loading,
  onPick,
  onViewAll,
}: GameSectionProps) {
  return (
    <section className="grid gap-6">
      <div className="flex items-center justify-between">
        <SectionHeading
          title="Chọn game"
          titleClassName="text-[1.5rem]"
        />

        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl"
            onClick={onViewAll}
            trailingIcon = {<ArrowRight size={16}/>}
          >
            Xem tất cả
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center">
          {Array.from({ length: 15 }).map((_, index) => (
            <div key={index}>
              <div className="aspect-square animate-pulse rounded-2xl bg-white/6" />
              <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-white/6" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-items-center">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => onPick(game)}
            />
          ))}
        </div>
      )}
    </section>
  );
}