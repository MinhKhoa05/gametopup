import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, SearchBar } from '@/shared/components';
import { GameGrid } from '@/features/games/components/GameGrid';
import { useGamesQuery } from '@/features/games/server';
import { routes } from '@/app/router/routes';

export function GamesPage() {
  const navigate = useNavigate();
  const gamesQuery = useGamesQuery();
  const [query, setQuery] = useState('');

  const games = gamesQuery.data ?? [];
  const filteredGames = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return games;
    }

    return games.filter((game) => game.name.toLowerCase().includes(keyword));
  }, [games, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 grid gap-4">
        <div className="grid gap-1.5">
          <p className="gt-eyebrow">Catalog</p>
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Kho game</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">Chọn game để xem gói nạp khả dụng, rồi chuyển sang flow topup riêng.</p>
        </div>

        <SearchBar
          className="max-w-xl"
          value={query}
          onChange={setQuery}
          placeholder="Tìm game (VD: Free Fire, Liên Quân)..."
          ariaLabel="Tìm game"
        />
      </div>

      <GameGrid
        games={filteredGames}
        loading={gamesQuery.isPending && games.length === 0}
        skeletonCount={12}
        onPick={(game) => navigate(routes.topup(game.id, 1))}
        renderBadges={(game) => {
          const maxDiscount = 12 + (game.name.length % 10);

          return (
            <>
              <div className="rounded-md bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-lg shadow-red-500/20">CK {maxDiscount}%</div>
              {!game.isActive ? <div className="rounded bg-slate-800 px-2 py-1 text-xs font-bold text-white">Tạm ẩn</div> : null}
            </>
          );
        }}
      />

      {!gamesQuery.isPending && filteredGames.length === 0 ? (
        <EmptyState className="mt-8" variant="compact" title="Không tìm thấy game" description={`Không có game nào phù hợp với "${query}".`} />
      ) : null}
    </div>
  );
}
