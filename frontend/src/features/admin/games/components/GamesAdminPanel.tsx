import { ArrowRight, CheckCircle2, EyeOff, PencilLine, Plus, Save, X } from 'lucide-react';
import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game, GamePackage } from '@/features/games/types';
import { routes } from '@/app/router/routes';
import {
  Badge,
  Button,
  DetailRow,
  EmptyState,
  Field,
  FormActions,
  ImageBox,
  ImagePicker,
  MediaListItem,
  PanelShell,
  SearchBar,
  SectionHeading,
  ToggleField,
  FilterChipGroup,
} from '@/shared/components';
import { formatDate } from '@/shared/lib/format';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';
import { classNames } from '@/shared/lib/classNames';

type GamesAdminPanelState = {
  editing: Game | null;
  filteredGames: Game[];
  form: {
    isActive: boolean;
    name: string;
  };
  imageFile: File | null;
  query: string;
  remove: (game: Game) => Promise<void>;
  resetForm: () => void;
  setForm: Dispatch<SetStateAction<{ isActive: boolean; name: string }>>;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  startEdit: (game: Game) => void;
  submit: (event: FormEvent) => Promise<void>;
};

type PanelMode = 'empty' | 'view' | 'form';
type StatusFilter = 'all' | 'active' | 'inactive';

export function GamesAdminPanel({
  busy,
  loading,
  packages,
  state,
}: {
  busy: boolean;
  loading: boolean;
  packages: GamePackage[];
  packagesLoading: boolean;
  state: GamesAdminPanelState;
}) {
  const navigate = useNavigate();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const packageCountByGameId = useMemo(() => {
    return packages.reduce<Record<number, number>>((accumulator, item) => {
      accumulator[item.gameId] = (accumulator[item.gameId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [packages]);

  const visibleGames = useMemo(() => {
    return state.filteredGames.filter((game) => {
      if (statusFilter === 'active') return game.isActive;
      if (statusFilter === 'inactive') return !game.isActive;
      return true;
    });
  }, [state.filteredGames, statusFilter]);

  const selectedGame = useMemo(
    () => visibleGames.find((game) => game.id === selectedGameId) ?? null,
    [selectedGameId, visibleGames],
  );

  const openCreateForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setSelectedGameId(null);
    setPanelMode('form');
  };

  const openEditForm = (game: Game) => {
    setSelectedGameId(game.id);
    state.startEdit(game);
    setPanelMode('form');
  };

  const openQuickToggleForm = (game: Game) => {
    openEditForm(game);
    state.setForm((current) => ({ ...current, isActive: !game.isActive }));
  };

  const closeForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setPanelMode(selectedGame ? 'view' : 'empty');
  };

  const togglePreview = (game: Game) => {
    setSelectedGameId(game.id);
    setPanelMode('view');
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] px-5 py-5 shadow-[0_24px_70px_rgba(2,6,23,0.22)] sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">Quản lý game</p>
          <h1 className="m-0 text-[clamp(2rem,3.4vw,3rem)] font-black leading-none tracking-[-0.06em] text-white">
            Quản lý game
          </h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-400">
            Quản lý danh mục game đang bán trên hệ thống.
          </p>
        </div>

        <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={openCreateForm}>
          <Plus size={16} />
          Thêm game
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.76fr)_minmax(0,1.24fr)]">
        <PanelShell>
          <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <SectionHeading
              title="Danh sách game"
              titleClassName="text-[1.2rem]"
              description="Chọn game để xem chi tiết, số gói nạp và trạng thái."
            />

            <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm game..." dense />

            <div className="grid gap-2">
              <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-slate-500">Trạng thái</span>
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
            </div>

            {loading && visibleGames.length === 0 ? (
              <AdminListSkeleton ariaLabel="Đang tải game" rows={5} />
            ) : visibleGames.length === 0 ? (
              <EmptyState
                actionLabel={state.query.trim() ? 'Xóa bộ lọc' : undefined}
                description="Chưa có game phù hợp với bộ lọc hiện tại."
                onAction={state.query.trim() ? () => state.setQuery('') : undefined}
                title="Không tìm thấy game"
              />
            ) : (
              <div className="grid gap-2.5">
                {visibleGames.map((game) => (
                  <MediaListItem
                    key={game.id}
                    onClick={() => togglePreview(game)}
                    selected={game.id === selectedGameId}
                    leading={<ImageBox src={game.imageUrl} alt={game.name} className="object-cover" />}
                    title={game.name}
                    subtitle={`${packageCountByGameId[game.id] ?? 0} gói · ${game.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                    titleAccessory={
                      <Badge tone={game.isActive ? 'success' : 'neutral'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                        {game.isActive ? 'Bật' : 'Tắt'}
                      </Badge>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </PanelShell>

        <PanelShell className="sticky top-24">
          <div className="grid gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            {panelMode === 'form' ? (
              <>
                <SectionHeading
                  title={state.editing ? 'Sửa game' : 'Tạo game mới'}
                  titleClassName="text-[1.2rem]"
                  description="Cập nhật ảnh, tên game và trạng thái hiển thị."
                />

                <GameFormPanel
                  busy={busy}
                  editing={state.editing}
                  form={state.form}
                  imageFile={state.imageFile}
                  onCancel={closeForm}
                  onImageFileChange={state.setImageFile}
                  onSubmit={state.submit}
                  setForm={state.setForm}
                />
              </>
            ) : selectedGame ? (
              <>
                <SectionHeading
                  title="Chi tiết game"
                  titleClassName="text-[1.2rem]"
                  description={`Game #${selectedGame.id} · ${selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                />

                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950">
                    <ImageBox src={selectedGame.imageUrl} alt={selectedGame.name} className="aspect-[16/9] w-full object-cover" />

                    <div className="grid gap-1.5 border-t border-white/[0.06] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="min-w-0 truncate text-[1.05rem] font-black tracking-[-0.03em] text-white">
                          {selectedGame.name}
                        </strong>
                        <Badge tone={selectedGame.isActive ? 'success' : 'neutral'} icon={selectedGame.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                          {selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-400">Ảnh game lớn</span>
                    </div>
                  </div>

                  <div className="grid rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-4">
                    <DetailRow label="Tên game">{selectedGame.name}</DetailRow>
                    <DetailRow label="Trạng thái">
                      <Badge tone={selectedGame.isActive ? 'success' : 'neutral'}>{selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
                    </DetailRow>
                    <DetailRow label="Số gói nạp">{packageCountByGameId[selectedGame.id] ?? 0} gói</DetailRow>
                    <DetailRow label="Ngày tạo">{formatDate(selectedGame.createdAt)}</DetailRow>
                    <DetailRow label="Cập nhật">{formatDate(selectedGame.updatedAt)}</DetailRow>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={() => openEditForm(selectedGame)}>
                      <PencilLine size={16} />
                      Sửa game
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                      onClick={() => openQuickToggleForm(selectedGame)}
                    >
                      <EyeOff size={16} />
                      {selectedGame.isActive ? 'Ẩn game' : 'Hiện game'}
                    </Button>
                    <Button
                      variant="primary"
                      className="justify-center rounded-[16px] px-4"
                      onClick={() => navigate(routes.admin('packages'))}
                    >
                      Xem gói của game này
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4">
                <EmptyState
                  title="Chọn một game để xem chi tiết"
                  description="Xem thông tin, số gói nạp, trạng thái và thao tác nhanh."
                />
              </div>
            )}
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function GameFormPanel({
  busy,
  editing,
  form,
  imageFile,
  onCancel,
  onImageFileChange,
  onSubmit,
  setForm,
}: {
  busy: boolean;
  editing: Game | null;
  form: GamesAdminPanelState['form'];
  imageFile: File | null;
  onCancel: () => void;
  onImageFileChange: Dispatch<SetStateAction<File | null>>;
  onSubmit: (event: FormEvent) => Promise<void>;
  setForm: Dispatch<SetStateAction<{ isActive: boolean; name: string }>>;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-3">
        <SectionHeading title="Ảnh game" titleClassName="text-[1rem]" />
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <ImagePicker
            className="min-h-44 w-full overflow-hidden"
            onChange={onImageFileChange}
            src={editing?.imageUrl}
            alt={editing?.name || form.name || 'Xem trước ảnh game'}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <SectionHeading title="Tên game" titleClassName="text-[1rem]" />
        <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <Field
            label="Tên game"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nhập tên game"
            required
            value={form.name}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <SectionHeading title="Trạng thái" titleClassName="text-[1rem]" />
        <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <ToggleField checked={form.isActive} label="Đang bán" onChange={(isActive) => setForm({ ...form, isActive })} />
        </div>
      </div>

      <FormActions
        disabled={busy || (!editing && !imageFile)}
        onCancel={onCancel}
        submitIcon={editing ? <Save size={17} /> : <Plus size={17} />}
        submitLabel={editing ? 'Lưu game' : 'Tạo game'}
      />
    </form>
  );
}
