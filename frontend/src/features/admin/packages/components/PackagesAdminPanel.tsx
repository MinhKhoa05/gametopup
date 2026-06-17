import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { Game, GamePackage } from '@/features/games/types';
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
import { classNames } from '@/shared/lib/classNames';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';

type PackagesAdminPanelState = {
  editing: GamePackage | null;
  form: {
    gameId: number;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  };
  imageFile: File | null;
  query: string;
  remove: (item: GamePackage) => Promise<void>;
  resetForm: () => void;
  scopedPackages: GamePackage[];
  selectedGameId: number | null;
  setForm: Dispatch<SetStateAction<{
    gameId: number;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }>>;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setSelectedGameId: Dispatch<SetStateAction<number | null>>;
  startEdit: (item: GamePackage) => void;
  submit: (event: FormEvent) => Promise<void>;
};

type PanelMode = 'empty' | 'view' | 'form';

export function PackagesAdminPanel({
  busy,
  games,
  loading,
  state,
}: {
  busy: boolean;
  games: Game[];
  loading: boolean;
  state: PackagesAdminPanelState;
}) {
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>('empty');

  const selectedGame = state.selectedGameId ? games.find((game) => game.id === state.selectedGameId) ?? null : null;
  const selectedPackage = useMemo(
    () => state.scopedPackages.find((item) => item.id === selectedPackageId) ?? null,
    [selectedPackageId, state.scopedPackages],
  );

  const openCreateForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setSelectedPackageId(null);
    setPanelMode('form');
  };

  const openEditForm = (item: GamePackage) => {
    setSelectedPackageId(item.id);
    state.startEdit(item);
    setPanelMode('form');
  };

  const closeForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setPanelMode(selectedPackage ? 'view' : 'empty');
  };

  const handleSelectPackage = (item: GamePackage) => {
    setSelectedPackageId(item.id);
    setPanelMode('view');
  };

  const showPreview = panelMode === 'view';

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.76fr)_minmax(0,1.24fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Chọn game"
            titleClassName="text-[1.2rem]"
            description="Chọn game trước khi xem hoặc tạo gói nạp."
          />

          <div className="grid gap-2.5">
            {games.map((game) => (
              <MediaListItem
                key={game.id}
                className={classNames(
                  'p-2.5',
                  state.selectedGameId === game.id && 'border-cyan/25 bg-cyan/10 text-cyan-50',
                )}
                selected={state.selectedGameId === game.id}
                onClick={state.editing ? undefined : () => {
                  state.setSelectedGameId(game.id);
                  state.setForm((current) => ({ ...current, gameId: game.id }));
                  setSelectedPackageId(null);
                  setPanelMode('empty');
                }}
                leading={<ImageBox src={game.imageUrl} alt={game.name} className="object-cover" />}
                title={game.name}
              />
            ))}
          </div>

          <SectionHeading title="Danh sách gói nạp" titleClassName="text-[1.2rem]" />
          <SearchBar className="mb-4" value={state.query} onChange={state.setQuery} placeholder="Tìm gói nạp..." dense />

          {loading && games.length === 0 && state.scopedPackages.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải gói nạp" rows={5} />
          ) : !state.selectedGameId ? (
            <EmptyState>Hãy chọn hoặc tạo game trước.</EmptyState>
          ) : state.scopedPackages.length === 0 ? (
            <EmptyState>Game này chưa có gói nạp nào.</EmptyState>
          ) : (
            <div className="grid gap-2.5">
              {state.scopedPackages.map((item) => {
                const isSelected = selectedPackageId === item.id;

                return (
                  <MediaListItem
                    key={item.id}
                    selected={isSelected}
                    onClick={() => handleSelectPackage(item)}
                    leading={<ImageBox src={item.imageUrl} alt={item.name} className="object-cover" />}
                    title={item.name}
                    subtitle={selectedGame?.name ?? `Game #${item.gameId}`}
                    meta={`Tồn kho ${item.stockQuantity}`}
                    titleAccessory={<Badge tone={item.isActive ? 'success' : 'neutral'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>{item.isActive ? 'Bật' : 'Tắt'}</Badge>}
                  />
                );
              })}
            </div>
          )}
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <div className="grid gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title={
              panelMode === 'form'
                ? state.editing
                  ? 'Sửa gói nạp'
                  : 'Thêm gói nạp'
                : 'Thông tin gói nạp'
            }
            titleClassName="text-[1.2rem]"
            description={
              panelMode === 'form'
                ? state.editing
                  ? 'Cập nhật tên, giá, tồn kho và trạng thái hiển thị của gói.'
                  : 'Tạo gói nạp mới cho game đang chọn.'
                : 'Chọn một gói trong danh sách bên trái để xem chi tiết và thao tác.'
            }
          />

          {panelMode === 'form' ? (
            <PackageFormPanel
              busy={busy}
              editing={state.editing}
              form={state.form}
              imageFile={state.imageFile}
              onCancel={closeForm}
              onImageFileChange={state.setImageFile}
              onSubmit={state.submit}
              selectedGame={selectedGame}
              setForm={state.setForm}
            />
          ) : showPreview && selectedPackage ? (
            <PackagePreviewPanel
              item={selectedPackage}
              game={selectedGame}
              onAdd={openCreateForm}
              onDelete={() => void state.remove(selectedPackage)}
              onEdit={() => openEditForm(selectedPackage)}
            />
          ) : (
            <EmptyState
              actionLabel="Thêm gói nạp"
              description="Chọn một gói trong danh sách bên trái để xem thông tin, hoặc bấm Thêm gói nạp để tạo mới."
              onAction={openCreateForm}
              title="Chưa chọn gói nạp"
            />
          )}
        </div>
      </PanelShell>
    </div>
  );
}

function PackagePreviewPanel({
  item,
  game,
  onAdd,
  onDelete,
  onEdit,
}: {
  item: GamePackage;
  game: Game | null;
  onAdd: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const profit = item.salePrice - item.importPrice;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4">
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950">
          <ImageBox src={item.imageUrl} alt={item.name} className="aspect-[16/10] w-full object-cover" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <strong className="text-[1.15rem] font-black tracking-[-0.03em] text-white">{item.name}</strong>
            <span className="text-sm text-slate-400">{game?.name ?? `Game #${item.gameId}`}</span>
          </div>

          <Badge tone={item.isActive ? 'success' : 'neutral'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />} className="rounded-full">
            {item.isActive ? 'Đang bật' : 'Đang tắt'}
          </Badge>
        </div>
      </div>

      <div className="grid rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-4">
        <DetailRow label="ID gói">#{item.id}</DetailRow>
        <DetailRow label="Tên gói">{item.name}</DetailRow>
        <DetailRow label="Game">{game?.name ?? `#${item.gameId}`}</DetailRow>
        <DetailRow label="Giá bán">{formatCurrency(item.salePrice)}</DetailRow>
        <DetailRow label="Giá gốc">{formatCurrency(item.originalPrice)}</DetailRow>
        <DetailRow label="Giá nhập">{formatCurrency(item.importPrice)}</DetailRow>
        <DetailRow label="Lãi">{formatCurrency(profit)}</DetailRow>
        <DetailRow label="Tồn kho">{item.stockQuantity}</DetailRow>
        <DetailRow label="Đường dẫn ảnh">{item.imageRelativePath ?? 'Không có'}</DetailRow>
        <DetailRow label="Tạo lúc">{formatDate(item.createdAt)}</DetailRow>
        <DetailRow label="Cập nhật">{formatDate(item.updatedAt)}</DetailRow>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={onAdd}>
          <Plus size={16} />
          Thêm gói
        </Button>
        <Button variant="outline" className="justify-center rounded-[16px] px-4" onClick={onEdit}>
          <Edit3 size={16} />
          Sửa gói
        </Button>
        <Button
          className="justify-center rounded-[16px] px-4 !border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100"
          onClick={onDelete}
        >
          <Trash2 size={16} />
          Xóa gói
        </Button>
      </div>
    </div>
  );
}

function PackageFormPanel({
  busy,
  editing,
  form,
  imageFile,
  onCancel,
  onImageFileChange,
  onSubmit,
  selectedGame,
  setForm,
}: {
  busy: boolean;
  editing: GamePackage | null;
  form: PackagesAdminPanelState['form'];
  imageFile: File | null;
  onCancel: () => void;
  onImageFileChange: Dispatch<SetStateAction<File | null>>;
  onSubmit: (event: FormEvent) => Promise<void>;
  selectedGame: Game | null;
  setForm: Dispatch<SetStateAction<{
    gameId: number;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }>>;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-3">
        <SectionHeading title="Hình ảnh gói nạp" titleClassName="text-[1rem]" description="Chọn ảnh đại diện cho gói trước khi lưu." />
        <ImagePicker
          className="min-h-44 w-full overflow-hidden"
          onChange={onImageFileChange}
          src={editing?.imageUrl}
          alt={editing?.name || selectedGame?.name || form.name || 'Xem trước ảnh gói'}
        />
      </div>

      <div className="grid gap-3">
        <Field label="Tên gói" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên gói" required value={form.name} />
        <ToggleField checked={form.isActive} label="Cho phép bán gói này" onChange={(isActive) => setForm({ ...form, isActive })} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Giá bán"
          min={0}
          onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })}
          placeholder="0"
          required
          type="number"
          value={String(form.salePrice)}
        />
        <Field
          label="Giá gốc"
          min={0}
          onChange={(event) => setForm({ ...form, originalPrice: Number(event.target.value) })}
          placeholder="0"
          required
          type="number"
          value={String(form.originalPrice)}
        />
        <Field
          label="Giá nhập"
          min={0}
          onChange={(event) => setForm({ ...form, importPrice: Number(event.target.value) })}
          placeholder="0"
          required
          type="number"
          value={String(form.importPrice)}
        />
        <Field
          label="Tồn kho"
          min={0}
          onChange={(event) => setForm({ ...form, stockQuantity: Number(event.target.value) })}
          placeholder="0"
          required
          type="number"
          value={String(form.stockQuantity)}
        />
      </div>

      <FormActions
        disabled={busy || !selectedGame || (!editing && !imageFile)}
        onCancel={onCancel}
        submitIcon={editing ? <Save size={17} /> : <Plus size={17} />}
        submitLabel={editing ? 'Lưu gói' : 'Tạo gói'}
      />
    </form>
  );
}
