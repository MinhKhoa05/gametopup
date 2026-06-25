import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { routes } from "@/app/router/routes";
import { GameGrid } from "@/features/games/components/GameGrid";
import { useGamesQuery } from "@/features/games/server";
import { HeroSection } from "@/features/home/components/HeroSection";
import { QuickSteps } from "@/features/home/components/QuickSteps";
import { Button, Container, SectionHeading } from "@/shared/components";

export function HomeGuestPage() {
  const navigate = useNavigate();

  const gamesQuery = useGamesQuery();

  const games = useMemo(
    () => (gamesQuery.data ?? []).slice(0, 10),
    [gamesQuery.data],
  );

  const isGamesLoading = gamesQuery.isPending && games.length === 0;

  return (
    <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <HeroSection
          eyebrow={
            <>
              <span className="gt-text">Game</span>
              <span className="text-cyan-300">TopUp</span>
            </>
          }
          title={
            <>
              Nạp game nhanh chóng,
              <br />
              đơn giản và minh bạch.
            </>
          }
          description="Khám phá các tựa game phổ biến, lựa chọn gói nạp phù hợp và theo dõi trạng thái đơn hàng trong một giao diện đơn giản, dễ sử dụng."
          actions={
            <Button
              variant="primary"
              className="w-fit rounded-[14px] px-5"
              onClick={() => navigate(routes.games())}
              trailingIcon={<ArrowRight size={16} />}
            >
              Khám phá game
            </Button>
          }
        />

        <QuickSteps />

        <section className="grid gap-6">
          <div className="flex items-center justify-between">
            <SectionHeading title="Chọn game" titleClassName="text-[1.5rem]" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate(routes.games())}
              trailingIcon={<ArrowRight size={16} />}
            >
              Xem tất cả
            </Button>
          </div>

          <GameGrid
            games={games}
            loading={isGamesLoading}
            skeletonCount={10}
            onGameClick={(game) => navigate(routes.gameDetail(game.id))}
          />
        </section>
      </div>
    </Container>
  );
}
