import { CheckCircle2, EyeOff, PencilLine, Plus, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { Game, GamePackage } from '@/features/games/types';
import {
  Badge,
  Button,
  DetailRow,
  EmptyState,
  Field,
  FilterSelectField,
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
  setForm: Dispatch<
    SetStateAction<{
      gameId: number;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    }>
  >;
  setImageFile: Dispatch<SetStateAction<File | null>>;
  setQuery: Dispatch<SetStateAction<string>>;
  setSelectedGameId: Dispatch<SetStateAction<number | null>>;
  startEdit: (item: GamePackage) => void;
  submit: (event: FormEvent) => Promise<void>;
};

type PanelMode = 'empty' | 'view' | 'form';
type StatusFilter = 'all' | 'active' | 'inactive';

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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const selectedGame = state.selectedGameId ? games.find((game) => game.id === state.selectedGameId) ?? null : null;
  const selectedPackage = useMemo(
    () => state.scopedPackages.find((item) => item.id === selectedPackageId) ?? null,
    [selectedPackageId, state.scopedPackages],
  );

  const packageCountByGameId = useMemo(() => {
    return state.scopedPackages.reduce<Record<number, number>>((accumulator, item) => {
      accumulator[item.gameId] = (accumulator[item.gameId] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [state.scopedPackages]);

  const visiblePackages = useMemo(() => {
    return state.scopedPackages.filter((item) => {
      if (statusFilter === 'active') return item.isActive;
      if (statusFilter === 'inactive') return !item.isActive;
      return true;
    });
  }, [state.scopedPackages, statusFilter]);

  const gameOptions = useMemo(() => {
    return games.map((game) => ({
      label: game.name,
      value: String(game.id),
    }));
  }, [games]);

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

  const openQuickToggleForm = (item: GamePackage) => {
    openEditForm(item);
    state.setForm((current) => ({ ...current, isActive: !item.isActive }));
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
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] px-5 py-5 shadow-[0_24px_70px_rgba(2,6,23,0.22)] sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">Quản lý gói nạp</p>
          <h1 className="m-0 text-[clamp(2rem,3.4vw,3rem)] font-black leading-none tracking-[-0.06em] text-white">
            Quản lý gói nạp
          </h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-400">
            Thiết lập giá, tồn kho và trạng thái bán của từng gói.
          </p>
        </div>

        <Button variant="primary" className="justify-center rounded-[16px] px-4" onClick={openCreateForm}>
          <Plus size={16} />
          Thêm gói
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(290px,0.76fr)_minmax(0,1.24fr)]">
        <PanelShell>
          <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            <SectionHeading title="Danh sách gói nạp" titleClassName="text-[1.2rem]" description="Chọn game rồi tìm gói theo tên hoặc trạng thái." />

            <FilterSelectField
              label="Game"
              value={String(state.selectedGameId ?? '')}
              onChange={(value) => {
                const nextGameId = Number(value);
                state.setSelectedGameId(nextGameId);
                state.setForm((current) => ({ ...current, gameId: nextGameId }));
                setSelectedPackageId(null);
                setPanelMode('empty');
              }}
            >
              {gameOptions.length > 0 ? null : <option value="">Không có game</option>}
              {gameOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </FilterSelectField>

            <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm gói..." dense />

            <div className="grid gap-2">
              <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-slate-500">Trạng thái</span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Đang bán', value: 'active' },
                  { label: 'Đang ẩn', value: 'inactive' },
                ].map((item) => (
                  <Button
                    key={item.value}
                    size="sm"
                    variant={statusFilter === item.value ? 'primary' : 'outline'}
                    className={classNames('rounded-full px-4', statusFilter === item.value ? '' : 'text-slate-300')}
                    onClick={() => setStatusFilter(item.value as StatusFilter)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {loading && visiblePackages.length === 0 ? (
              <AdminListSkeleton ariaLabel="Đang tải gói nạp" rows={5} />
            ) : !state.selectedGameId ? (
              <EmptyState
                title="Chọn game trước"
                description="Hãy chọn game để xem danh sách gói nạp của game đó."
              />
            ) : visiblePackages.length === 0 ? (
              <EmptyState
                actionLabel={state.query.trim() ? 'Xóa bộ lọc' : undefined}
                description="Chưa có gói phù hợp với bộ lọc hiện tại."
                onAction={state.query.trim() ? () => state.setQuery('') : undefined}
                title="Không tìm thấy gói"
              />
            ) : (
              <div className="grid gap-2.5">
                {visiblePackages.map((item) => {
                  const isSelected = selectedPackageId === item.id;

                  return (
                    <MediaListItem
                      key={item.id}
                      selected={isSelected}
                      onClick={() => handleSelectPackage(item)}
                      leading={<ImageBox src={item.imageUrl} alt={item.name} className="object-cover" />}
                      title={item.name}
                      subtitle={`${selectedGame?.name ?? `Game #${item.gameId}`} · ${formatCurrency(item.salePrice)}`}
                      meta={`${item.stockQuantity > 0 ? `Tồn ${item.stockQuantity}` : 'Hết hàng'} · ${item.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                      titleAccessory={
                        <Badge tone={item.isActive ? 'success' : 'neutral'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                          {item.isActive ? 'Bật' : 'Tắt'}
                        </Badge>
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </PanelShell>

        <PanelShell className="sticky top-24">
          <div className="grid gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
            {panelMode === 'form' ? (
              <>
                <SectionHeading
                  title={state.editing ? 'Sửa gói nạp' : 'Tạo gói nạp'}
                  titleClassName="text-[1.2rem]"
                  description="Cập nhật game, ảnh, giá, tồn kho và trạng thái bán."
                />

                <PackageFormPanel
                  busy={busy}
                  editing={state.editing}
                  form={state.form}
                  games={games}
                  imageFile={state.imageFile}
                  onCancel={closeForm}
                  onImageFileChange={state.setImageFile}
                  onSubmit={state.submit}
                  setForm={state.setForm}
                />
              </>
            ) : showPreview && selectedPackage ? (
              <>
                <SectionHeading
                  title="Chi tiết gói nạp"
                  titleClassName="text-[1.2rem]"
                  description={`${selectedGame?.name ?? `Game #${selectedPackage.gameId}`} · ${selectedPackage.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                />

                <div className="grid gap-4">
                  <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-slate-950">
                    <ImageBox src={selectedPackage.imageUrl} alt={selectedPackage.name} className="aspect-[16/9] w-full object-cover" />

                    <div className="grid gap-1.5 border-t border-white/[0.06] px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="min-w-0 truncate text-[1.05rem] font-black tracking-[-0.03em] text-white">
                          {selectedPackage.name}
                        </strong>
                        <Badge tone={selectedPackage.isActive ? 'success' : 'neutral'} icon={selectedPackage.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                          {selectedPackage.isActive ? 'Đang bán' : 'Đang ẩn'}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-400">{selectedGame?.name ?? `Game #${selectedPackage.gameId}`}</span>
                    </div>
                  </div>

                  <div className="grid rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-4">
                    <DetailRow label="Game">{selectedGame?.name ?? `#${selectedPackage.gameId}`}</DetailRow>
                    <DetailRow label="Giá gốc">{formatCurrency(selectedPackage.originalPrice)}</DetailRow>
                    <DetailRow label="Giá bán">{formatCurrency(selectedPackage.salePrice)}</DetailRow>
                    <DetailRow label="Chênh lệch">
                      {selectedPackage.originalPrice > 0
                        ? `${(((selectedPackage.salePrice - selectedPackage.originalPrice) / selectedPackage.originalPrice) * 100).toFixed(0)}%`
                        : '0%'}
                    </DetailRow>
                    <DetailRow label="Tồn kho">{selectedPackage.stockQuantity}</DetailRow>
                    <DetailRow label="Trạng thái">
                      <Badge tone={selectedPackage.isActive ? 'success' : 'neutral'}>{selectedPackage.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
                    </DetailRow>
                    <DetailRow label="Ngày tạo">{formatDate(selectedPackage.createdAt)}</DetailRow>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={() => openEditForm(selectedPackage)}>
                      <PencilLine size={16} />
                      Sửa gói
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                      onClick={() => openQuickToggleForm(selectedPackage)}
                    >
                      <EyeOff size={16} />
                      {selectedPackage.isActive ? 'Ẩn gói' : 'Hiện gói'}
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-center rounded-[16px] px-4 border-rose-400/20 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
                      onClick={async () => {
                        if (!window.confirm(`Xóa gói nạp "${selectedPackage.name}"?`)) return;
                        await state.remove(selectedPackage);
                        setSelectedPackageId(null);
                        setPanelMode('empty');
                      }}
                    >
                      <Trash2 size={16} />
                      Xóa gói
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                title="Chọn một gói để xem chi tiết"
                description="Xem thông tin, giá, tồn kho, trạng thái và thao tác nhanh."
              />
            )}
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function PackageFormPanel({
  busy,
  editing,
  form,
  games,
  imageFile,
  onCancel,
  onImageFileChange,
  onSubmit,
  setForm,
}: {
  busy: boolean;
  editing: GamePackage | null;
  form: PackagesAdminPanelState['form'];
  games: Game[];
  imageFile: File | null;
  onCancel: () => void;
  onImageFileChange: Dispatch<SetStateAction<File | null>>;
  onSubmit: (event: FormEvent) => Promise<void>;
  setForm: Dispatch<
    SetStateAction<{
      gameId: number;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    }>
  >;
}) {
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-3">
        <SectionHeading title="Game" titleClassName="text-[1rem]" />
        <FilterSelectField
          label="Chọn game"
          value={String(form.gameId)}
          onChange={(value) => setForm({ ...form, gameId: Number(value) })}
        >
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {game.name}
            </option>
          ))}
        </FilterSelectField>
      </div>

      <div className="grid gap-3">
        <SectionHeading title="Ảnh gói" titleClassName="text-[1rem]" />
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <ImagePicker
            className="min-h-44 w-full overflow-hidden"
            onChange={onImageFileChange}
            src={editing?.imageUrl}
            alt={editing?.name || form.name || 'Xem trước ảnh gói'}
          />
        </div>
      </div>

      <div className="grid gap-3">
        <SectionHeading title="Tên gói" titleClassName="text-[1rem]" />
        <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <Field
            label="Tên gói"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Nhập tên gói"
            required
            value={form.name}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Giá gốc"
          min={0}
          onChange={(event) => setForm({ ...form, originalPrice: Number(event.target.value) })}
          placeholder="100000"
          required
          type="number"
          value={String(form.originalPrice)}
        />
        <Field
          label="Giá bán"
          min={0}
          onChange={(event) => setForm({ ...form, salePrice: Number(event.target.value) })}
          placeholder="90000"
          required
          type="number"
          value={String(form.salePrice)}
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
          placeholder="50"
          required
          type="number"
          value={String(form.stockQuantity)}
        />
      </div>

      <div className="grid gap-3">
        <SectionHeading title="Trạng thái" titleClassName="text-[1rem]" />
        <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
          <ToggleField checked={form.isActive} label="Đang bán" onChange={(isActive) => setForm({ ...form, isActive })} />
        </div>
      </div>

      <FormActions
        disabled={busy || !form.gameId || (!editing && !imageFile)}
        onCancel={onCancel}
        submitIcon={editing ? <Save size={17} /> : <Plus size={17} />}
        submitLabel={editing ? 'Lưu gói' : 'Tạo gói'}
      />
    </form>
  );
}
