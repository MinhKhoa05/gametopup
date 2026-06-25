import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppPageContainer } from "@/app/components/AppPageContainer";
import { routes } from "@/app/router/routes";
import { useGamesQuery } from "@/features/games/server";
import { HeroSection } from "@/features/home/components/HeroSection";
import { GameSection } from "@/features/home/components/GameSection";
import { QuickSteps } from "@/features/home/components/QuickSteps";

export function HomeGuestPage() {
  const navigate = useNavigate();
  const gamesQuery = useGamesQuery();
  const games = useMemo(
    () => (gamesQuery.data ?? []).slice(0, 10),
    [gamesQuery.data],
  );

  const isGamesLoading = gamesQuery.isPending && !games.length;

  return (
    <AppPageContainer className="relative z-10 py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <HeroSection onExploreGames={() => navigate(routes.games())} />

        <QuickSteps />
        
        <GameSection
          games={games}
          loading={isGamesLoading}
          onPick={(game) => navigate(routes.gameDetail(game.id))}
          onViewAll={() => navigate(routes.games())}
        />
      </div>
    </AppPageContainer>
  );
}
