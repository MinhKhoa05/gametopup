import { ArrowRight, CheckCircle2, Plus, Save, Trash2, X } from 'lucide-react';
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
} from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
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

export function GamesAdminPanel({
  busy,
  loading,
  packages,
  packagesLoading,
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

  const selectedGame = useMemo(
    () => state.filteredGames.find((game) => game.id === selectedGameId) ?? null,
    [selectedGameId, state.filteredGames],
  );

  const selectedGamePackages = useMemo(
    () => packages.filter((item) => item.gameId === selectedGame?.id).slice(0, 4),
    [packages, selectedGame?.id],
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
    <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.76fr)_minmax(0,1.24fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Danh sách game"
            titleClassName="text-[1.2rem]"
            description="Chọn game để xem chi tiết và gói nạp liên quan."
          />

          <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm game..." dense />

          {loading && state.filteredGames.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải game" rows={5} />
          ) : state.filteredGames.length === 0 ? (
            <EmptyState
              actionLabel={state.query.trim() ? 'Xóa bộ lọc' : undefined}
              description="Chưa có game phù hợp với bộ lọc hiện tại."
              onAction={state.query.trim() ? () => state.setQuery('') : undefined}
              title="Không tìm thấy game"
            />
          ) : (
            <div className="grid gap-2.5">
              {state.filteredGames.map((game) => (
                <MediaListItem
                  key={game.id}
                  onClick={() => togglePreview(game)}
                  selected={game.id === selectedGameId}
                  leading={<ImageBox src={game.imageUrl} alt={game.name} className="object-cover" />}
                  title={game.name}
                  subtitle={game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                  titleAccessory={
                    <Badge tone={game.isActive ? 'success' : 'neutral'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                      {game.isActive ? 'Bật' : 'Tắt'}
                    </Badge>
                  }
                />
              ))}
            </div>
          )}

          <div className="pt-1">
            <Button variant="primary" className="w-full justify-center rounded-[16px] px-4" onClick={openCreateForm}>
              <Plus size={16} />
              Thêm game
            </Button>
          </div>
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <div className="grid gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          {panelMode === 'form' ? (
            <>
              <SectionHeading
                title={state.editing ? 'Sửa game' : 'Thêm game'}
                titleClassName="text-[1.2rem]"
                description={state.editing ? 'Cập nhật tên, ảnh và trạng thái hiển thị.' : 'Tạo game mới với tên, ảnh và trạng thái hiển thị.'}
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
                title={selectedGame.name}
                titleClassName="text-[1.2rem]"
                description={`Game #${selectedGame.id} · ${selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                action={
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" className="rounded-[14px] px-3.5 py-2 text-sm font-semibold" onClick={() => openEditForm(selectedGame)}>
                      <Save size={16} />
                      Sửa
                    </Button>
                    <Button
                      className="rounded-[14px] px-3.5 py-2 text-sm font-semibold !border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100"
                      onClick={async () => {
                        if (!window.confirm(`Xóa game "${selectedGame.name}"?`)) return;
                        await state.remove(selectedGame);
                        setSelectedGameId(null);
                        setPanelMode('empty');
                      }}
                    >
                      <Trash2 size={16} />
                      Xóa
                    </Button>
                  </div>
                }
              />

              <div className="grid rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-4">
                <DetailRow label="Tên game">{selectedGame.name}</DetailRow>
                <DetailRow label="Trạng thái">
                  <Badge tone={selectedGame.isActive ? 'success' : 'neutral'}>{selectedGame.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
                </DetailRow>
                <DetailRow label="Số gói nạp">
                  <Badge tone="primary">{packages.filter((item) => item.gameId === selectedGame.id).length} gói</Badge>
                </DetailRow>
                <DetailRow label="Ngày tạo">{formatDate(selectedGame.createdAt)}</DetailRow>
                <DetailRow label="Cập nhật lần cuối">{formatDate(selectedGame.updatedAt)}</DetailRow>
                <DetailRow label="Ảnh game">
                  <ImageBox src={selectedGame.imageUrl} alt={selectedGame.name} className="h-12 w-12 rounded-[14px] object-cover" />
                </DetailRow>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={() => openEditForm(selectedGame)}>
                  <Save size={16} />
                  Sửa game
                </Button>
                <Button variant="outline" className="justify-center rounded-[16px] px-4" onClick={() => navigate(routes.admin('packages'))}>
                  Quản lý gói
                  <ArrowRight size={16} />
                </Button>
              </div>

              <div className="grid gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="grid gap-1">
                    <strong className="text-[1rem] font-black text-white">Gói nạp</strong>
                    <span className="text-sm text-slate-400">4 gói nổi bật gần nhất của game này.</span>
                  </div>
                  <Button variant="ghost" className="px-0 text-cyan" onClick={() => navigate(routes.admin('packages'))}>
                    Xem tất cả gói
                  </Button>
                </div>

                {packagesLoading && selectedGamePackages.length === 0 ? (
                  <AdminListSkeleton ariaLabel="Đang tải gói nạp" rows={4} />
                ) : selectedGamePackages.length ? (
                  <div className="grid gap-2.5">
                    {selectedGamePackages.map((item) => (
                      <MediaListItem
                        key={item.id}
                        onClick={() => navigate(routes.admin('packages'))}
                        leading={<ImageBox src={item.imageUrl} alt={item.name} className="object-cover" />}
                        title={item.name}
                        subtitle={`Tồn kho ${item.stockQuantity}`}
                        meta={formatCurrency(item.salePrice)}
                        trailing={<ArrowRight size={16} className="text-slate-500" />}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    variant="compact"
                    title="Chưa có gói nạp"
                    description="Game này chưa có gói nạp nào được tạo."
                    actionLabel="Tạo gói nạp"
                    onAction={() => navigate(routes.admin('packages'))}
                  />
                )}
              </div>
            </>
          ) : (
            <EmptyState
              actionLabel="Thêm game"
              description="Chọn một game trong danh sách bên trái để xem thông tin, hoặc bấm Thêm game để tạo mới."
              onAction={openCreateForm}
              title="Chưa chọn game"
            />
          )}
        </div>
      </PanelShell>
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
      <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-cyan-100">Hình ảnh game</p>
          <span className="text-sm text-slate-400">Chọn ảnh đại diện trước khi lưu.</span>
        </div>

        <ImagePicker
          className="min-h-44 w-full overflow-hidden"
          onChange={onImageFileChange}
          src={editing?.imageUrl}
          alt={editing?.name || form.name || 'Xem trước ảnh game'}
        />
      </div>

      <div className="grid gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-cyan-100">Thông tin chỉnh sửa</p>
          <span className="text-sm text-slate-400">Tên game và trạng thái hiển thị.</span>
        </div>

        <div className="grid gap-4">
          <Field
            label="Tên game"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nhập tên game"
            required
            value={form.name}
          />
          <ToggleField checked={form.isActive} label="Hiển thị game" onChange={(isActive) => setForm({ ...form, isActive })} />
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
