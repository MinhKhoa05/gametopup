import { Search } from 'lucide-react';
import { EmptyState } from '../../../components/common/EmptyState';
import { Route } from '../../../lib/routes';
import { Game } from '../../../types';
import { GameGrid } from '../components/GameGrid';

export function GamesPage({
  games,
  loading,
  query,
  setQuery,
  navigate,
}: {
  games: Game[];
  loading: boolean;
  query: string;
  setQuery: (query: string) => void;
  navigate: (route: Route) => void;
}) {
  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-black text-white">Kho Game</h1>
        <div className="search-box max-w-xl">
          <Search size={20} className="text-cyanline" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm game (VD: Free Fire, Liên Quân)..."
            aria-label="Tìm game"
          />
        </div>
      </div>

      <GameGrid
        games={games}
        onPick={(game) => navigate({ name: 'games', gameId: game.id })}
        renderBadges={(game) => {
          const maxDiscount = 12 + (game.name.length % 10);

          return (
            <>
              <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">
                CK {maxDiscount}%
              </div>
              {!game.isActive ? (
                <div className="rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">Tạm ẩn</div>
              ) : null}
            </>
          );
        }}
      />

      {!loading && games.length === 0 && (
        <EmptyState className="mt-8">Không tìm thấy game nào phù hợp với từ khóa "{query}".</EmptyState>
      )}
    </div>
  );
}
