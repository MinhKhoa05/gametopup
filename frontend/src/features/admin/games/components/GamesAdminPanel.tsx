import { ArrowRight, CheckCircle2, EyeOff, PencilLine, Plus, Save, X } from 'lucide-react';
import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AdminGameSummary } from '../api';
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
import { inputClassName } from '@/shared/components/Field';
import { formatDate } from '@/shared/lib/format';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';
import { classNames } from '@/shared/lib/classNames';

type GamesAdminPanelState = {
  editing: AdminGameSummary | null;
  filteredGames: AdminGameSummary[];
  form: {
    isActive: boolean;
    name: string;
  };
  imageFile: File | null;
  query: string;
  remove: (game: AdminGameSummary) => Promise<void>;
  resetForm: () => void;
  setForm: Dispatch<SetStateAction<{ isActive: boolean; name: string }>>;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  startEdit: (game: AdminGameSummary) => void;
  submit: (event: FormEvent) => Promise<void>;
  updateGame: (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => Promise<void>;
};

type PanelMode = 'empty' | 'view' | 'edit' | 'create';
type StatusFilter = 'all' | 'active' | 'inactive';

const detailInputClassName = classNames(inputClassName, 'h-11 rounded-[14px] text-sm');

export function GamesAdminPanel({
  busy,
  loading,
  state,
}: {
  busy: boolean;
  loading: boolean;
  state: GamesAdminPanelState;
}) {
  const navigate = useNavigate();
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
    setPanelMode('create');
  };

  const openEditForm = (game: AdminGameSummary) => {
    setSelectedGameId(game.id);
    state.startEdit(game);
    setPanelMode('edit');
  };

  const handleQuickToggle = async (game: AdminGameSummary) => {
    await state.updateGame({
      id: game.id,
      imageFile: null,
      isActive: !game.isActive,
      name: game.name,
    });
  };

  const closeForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setPanelMode(selectedGame ? 'view' : 'empty');
  };

  const togglePreview = (game: AdminGameSummary) => {
    setSelectedGameId(game.id);
    setPanelMode('view');
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] px-5 py-5 shadow-[0_24px_70px_rgba(2,6,23,0.22)] sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">Quản lý game</p>
          <h1 className="m-0 text-[clamp(2rem,3.4vw,3rem)] font-black leading-none tracking-[-0.06em] text-white">Quản lý game</h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-400">Quản lý danh mục game đang bán trên hệ thống.</p>
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
                    subtitle={`${game.packageCount} gói · ${game.isActive ? 'Đang bán' : 'Đang ẩn'}`}
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
            {panelMode === 'create' ? (
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
            ) : panelMode === 'edit' && selectedGame ? (
              <>
                <SectionHeading
                  title="Chỉnh sửa game"
                  titleClassName="text-[1.2rem]"
                  description={`Game #${selectedGame.id} · ${selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                />

                <form className="grid gap-4" onSubmit={state.submit}>
                  <GameSummaryCard item={selectedGame} packageCount={selectedGame.packageCount} />

                  <div className="grid gap-0 rounded-[20px] border gt-border bg-[var(--gt-card)] px-4">
                    <DetailRow label="Tên game">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[320px]')}
                          value={state.form.name}
                          onChange={(event) => state.setForm((current) => ({ ...current, name: event.target.value }))}
                          placeholder="Nhập tên game"
                        />
                        {!state.form.name.trim() ? (
                          <span className="max-w-[320px] text-xs font-medium text-rose-200">Tên game không được để trống.</span>
                        ) : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Trạng thái">
                      <div className="justify-self-end">
                        <ToggleField
                          checked={state.form.isActive}
                          label={state.form.isActive ? 'Đang bán' : 'Đang ẩn'}
                          onChange={(isActive) => state.setForm((current) => ({ ...current, isActive }))}
                        />
                      </div>
                    </DetailRow>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={closeForm} type="button">
                      <X size={16} />
                      Hủy
                    </Button>
                    <Button variant="primary" className="justify-center rounded-[16px] px-4" disabled={busy || !state.form.name.trim()} type="submit">
                      <Save size={16} />
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </>
            ) : selectedGame ? (
              <>
                <SectionHeading
                  title="Chi tiết game"
                  titleClassName="text-[1.2rem]"
                  description={`Game #${selectedGame.id} · ${selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                />

                <div className="grid gap-4">
                  <GameSummaryCard item={selectedGame} packageCount={selectedGame.packageCount} />

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={() => openEditForm(selectedGame)}>
                      <PencilLine size={16} />
                      Sửa game
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                      disabled={busy}
                      onClick={() => void handleQuickToggle(selectedGame)}
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

                  <div className="grid gap-0 rounded-[20px] border gt-border bg-[var(--gt-card)] px-4">
                    <DetailRow label="Mã game">#{selectedGame.id}</DetailRow>
                    <DetailRow label="Số gói nạp">{selectedGame.packageCount} gói</DetailRow>
                    <DetailRow label="Ngày tạo">{formatDate(selectedGame.createdAt)}</DetailRow>
                    <DetailRow label="Cập nhật">{formatDate(selectedGame.updatedAt)}</DetailRow>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid gap-4">
                <EmptyState title="Chọn một game để xem chi tiết" description="Xem thông tin, số gói nạp, trạng thái và thao tác nhanh." />
              </div>
            )}
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function GameSummaryCard({ item, packageCount }: { item: AdminGameSummary; packageCount: number }) {
  return (
    <div className="grid gap-4 rounded-[24px] border border-cyan/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,24,39,0.86))] p-5 shadow-[0_18px_48px_rgba(2,6,23,0.2)]">
      <div className="flex items-center gap-4">
        <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[18px] border gt-border bg-[var(--gt-card)]">
          <ImageBox src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="overflow-hidden text-[1.04rem] font-black leading-[1.18] gt-text" title={item.name}>
            {item.name}
          </h3>
          <p className="mt-1.5 text-[0.92rem] leading-6 gt-text-muted">Thông tin hiển thị trên kho game.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
            <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-slate-950/24 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-200">
              {packageCount} gói nạp
            </span>
          </div>
        </div>
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
  editing: AdminGameSummary | null;
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
