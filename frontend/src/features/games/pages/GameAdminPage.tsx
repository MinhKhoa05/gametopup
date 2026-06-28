import { Gamepad2, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { GameGrid } from '@/features/games/components/GameGrid';
import { GameFormDialog } from '@/features/games/components/GameFormDialog';
import { useAdminGamesQuery, useCreateGameMutation } from '@/features/games/server';
import { Button, EmptyState, FilterChipGroup, IconBox, LoadingState, PageHero, SearchBar } from '@/shared/components';
import { filterByQuery } from '@/shared/lib/search';

type StatusFilter = 'all' | 'active' | 'inactive';

export function GameAdminPage() {
  const navigate = useNavigate();
  const gamesQuery = useAdminGamesQuery();
  const createMutation = useCreateGameMutation();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const games = gamesQuery.data ?? [];

  const visibleGames = useMemo(() => {
    return filterByQuery(games, query, (game) => game.name).filter((game) => {
      if (statusFilter === 'active') return game.isActive;
      if (statusFilter === 'inactive') return !game.isActive;
      return true;
    });
  }, [games, query, statusFilter]);

  const loading = gamesQuery.isPending && gamesQuery.data === undefined;

  const openCreateDialog = () => {
    setCreateOpen(true);
  };

  return (
    <div className="grid gap-5">
      <PageHero
        eyebrow="ADMIN"
        visual={
          <IconBox size="lg" tone="primary" className="h-[56px] w-[56px] rounded-[18px]">
            <Gamepad2 size={28} strokeWidth={1.8} />
          </IconBox>
        }
        title="Danh sách game"
        description="Quản lý danh mục game."
        actions={
          <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={openCreateDialog} leadingIcon={<Plus size={16} />}>
            Thêm game
          </Button>
        }
      />

      <SearchBar value={query} onChange={setQuery} placeholder="Tìm game..." dense />

      <FilterChipGroup
        ariaLabel="Lọc trạng thái game"
        items={[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đang bán', value: 'active' },
          { label: 'Đang ẩn', value: 'inactive' },
        ]}
        onChange={setStatusFilter}
        value={statusFilter}
      />

      {loading && visibleGames.length === 0 ? (
        <LoadingState title="Dang tai game..." />
      ) : visibleGames.length === 0 ? (
        <EmptyState description="Chưa có game phù hợp với bộ lọc hiện tại." title="Không tìm thấy game">
          {query.trim() && (
            <div className="mt-4 flex justify-center">
              <Button variant="primary" onClick={() => setQuery('')}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </EmptyState>
      ) : (
        <GameGrid
          games={visibleGames}
          loading={false}
          renderOverlay={(game) => (
            <span
              title={game.isActive ? 'Đang bán' : 'Đang ẩn'}
              className={`block size-4 rounded-full border border-[var(--gt-bg)] shadow-[0_0_0_4px_rgba(5,10,18,.62)] ${
                game.isActive ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
          )}
          onGameClick={(game) => navigate(routes.adminGamePackages(game.id))}
        />
      )}

      <GameFormDialog
        busy={createMutation.isPending}
        game={null}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createMutation.mutateAsync}
      />
    </div>
  );
}
