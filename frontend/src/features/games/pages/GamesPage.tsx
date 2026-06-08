import { EmptyState, SearchBar } from '@/components/ui';
import { GameGrid } from '@/features/games/components/GameGrid';
import { useGameCatalog } from '@/features/games/hooks/games.hooks';
import { useRoute } from '@/hooks/common/route.hooks';

export function GamesPage() {
  const { route, navigate } = useRoute();
  const catalog = useGameCatalog(route);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-black text-white">Kho Game</h1>
        <SearchBar
          className="max-w-xl"
          value={catalog.query}
          onChange={catalog.setQuery}
          placeholder="Tìm game (VD: Free Fire, Liên Quân)..."
          ariaLabel="Tìm game"
        />
      </div>

      <GameGrid
        games={catalog.filteredGames}
        loading={catalog.gamesLoading && catalog.games.length === 0}
        skeletonCount={12}
        onPick={(game) => navigate({ name: 'games', gameId: game.id, step: 1 })}
        renderBadges={(game) => {
          const maxDiscount = 12 + (game.name.length % 10);

          return (
            <>
              <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                CK {maxDiscount}%
              </div>
              {!game.isActive ? <div className="rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">Tạm ẩn</div> : null}
            </>
          );
        }}
      />

      {!catalog.gamesLoading && catalog.filteredGames.length === 0 && (
        <EmptyState variant="compact" className="mt-8">
          Không tìm thấy game nào phù hợp với từ khóa "{catalog.query}".
        </EmptyState>
      )}
    </div>
  );
}
