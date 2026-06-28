import { Gamepad2, Plus } from 'lucide-react';
import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/router/routes';
import { Button, EmptyState, FilterChipGroup, IconBox, PageHero, SearchBar } from '@/shared/components';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';
import type { AdminGame } from '@/features/games/types';
import { GameGrid } from '@/features/games/components/GameGrid';
import { GameDetailDialog } from './GameDetailDialog';
import { GameFormDialog } from './GameFormDialog';

type GamesAdminContentState = {
  filteredGames: AdminGame[];
  form: {
    isActive: boolean;
    name: string;
  };
  imageFile: File | null;
  query: string;
  resetForm: () => void;
  setForm: Dispatch<SetStateAction<{ isActive: boolean; name: string }>>;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  startEdit: (game: AdminGame) => void;
  submit: (event: FormEvent) => Promise<AdminGame | null>;
  updateGame: (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => Promise<AdminGame>;
};

type StatusFilter = 'all' | 'active' | 'inactive';
type ActiveDialog = 'detail' | 'form' | null;

export function GamesAdminContent({
  busy,
  loading,
  state,
}: {
  busy: boolean;
  loading: boolean;
  state: GamesAdminContentState;
}) {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState<AdminGame | null>(null);
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const visibleGames = useMemo(() => {
    return state.filteredGames.filter((game) => {
      if (statusFilter === 'active') return game.isActive;
      if (statusFilter === 'inactive') return !game.isActive;
      return true;
    });
  }, [state.filteredGames, statusFilter]);

  const openCreateDialog = () => {
    setActiveGame(null);
    state.resetForm();
    state.setImageFile(null);
    setDialog('form');
  };

  const openDetailDialog = (game: AdminGame) => {
    setActiveGame(game);
    setDialog('detail');
  };

  const openEditDialog = (game: AdminGame) => {
    setActiveGame(game);
    state.startEdit(game);
    setDialog('form');
  };

  const closeDialog = () => {
    setDialog(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    const savedGame = await state.submit(event);
    if (savedGame) {
      setActiveGame(savedGame);
    }
    return savedGame;
  };

  const handleToggleActive = async (game: AdminGame) => {
    const updatedGame = await state.updateGame({
      id: game.id,
      imageFile: null,
      isActive: !game.isActive,
      name: game.name,
    });
    setActiveGame(updatedGame);
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
        title="Games"
        description="Quản lý danh mục game."
        actions={
          <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={openCreateDialog} leadingIcon={<Plus size={16} />}>
            Thêm game
          </Button>
        }
      />

      <SearchBar value={state.query} onChange={state.setQuery} placeholder="Tìm game..." dense />

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
        <AdminListSkeleton ariaLabel="Đang tải game" rows={5} />
      ) : visibleGames.length === 0 ? (
        <EmptyState description="Chưa có game phù hợp với bộ lọc hiện tại." title="Không tìm thấy game">
          {state.query.trim() && (
            <div className="mt-4 flex justify-center">
              <Button variant="primary" onClick={() => state.setQuery('')}>
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
          onGameClick={openDetailDialog}
        />
      )}

      <GameDetailDialog
        busy={busy}
        game={activeGame}
        isOpen={dialog === 'detail' && Boolean(activeGame)}
        onClose={closeDialog}
        onEdit={openEditDialog}
        onToggleActive={handleToggleActive}
        onViewPackages={() => navigate(routes.admin('packages'))}
      />

      <GameFormDialog
        busy={busy}
        game={activeGame}
        form={state.form}
        imageFile={state.imageFile}
        isOpen={dialog === 'form'}
        onClose={closeDialog}
        onImageFileChange={state.setImageFile}
        onSubmit={handleSubmit}
        setForm={state.setForm}
      />
    </div>
  );
}
