import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

import { routes } from "@/app/router/routes";
import { GameGrid } from "@/features/games/components/GameGrid";
import { useGamesQuery } from "@/features/games/server";
import {
  Container,
  IconBox,
  PageHero,
  PanelShell,
  SearchBar,
  SectionHeading,
  EmptyState,
  Button
} from "@/shared/components";

export function GamesPage() {
  const navigate = useNavigate();
  const { data: games = [], isPending } = useGamesQuery();

  const [query, setQuery] = useState("");

  const keyword = query.trim().toLowerCase();

  const filteredGames = keyword
    ? games.filter((game) => game.name.toLowerCase().includes(keyword))
    : games;

  return (
    <Container className="relative z-10 py-5 sm:py-7 lg:py-8">
      <div className="grid gap-10 lg:gap-12">
        <PageHero
          eyebrow="KHO GAME"
          title="Kho game"
          description="Tìm và nạp game nhanh chóng."
          visual={
            <IconBox
              size="lg"
              tone="primary"
              className="h-[62px] w-[62px] rounded-[18px]"
            >
              <Gamepad2 size={30} strokeWidth={1.8} />
            </IconBox>
          }
        />

        <PanelShell>
          <div className="p-5 sm:p-6 lg:p-7">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Tìm kiếm game..."
            />
          </div>
        </PanelShell>

        {isPending || filteredGames.length > 0 ? (
          <>
            <SectionHeading
              title="Danh sách game"
              titleClassName="text-[1.5rem]"
            />

            <GameGrid
              games={filteredGames}
              loading={isPending && games.length === 0}
              onGameClick={(game) => navigate(routes.gameDetail(game.id))}
            />
          </>
        ) : (
          <EmptyState
            title="Không tìm thấy trò chơi"
            description="Thử tìm bằng tên game khác."
          >
            <Button
              variant="primary"
              className="mx-auto w-auto min-w-40"
              onClick={() => setQuery("")}
            >
              Xóa tìm kiếm
            </Button>
          </EmptyState>
        )}
      </div>
    </Container>
  );
}
