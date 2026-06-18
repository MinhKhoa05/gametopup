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
import { inputClassName } from '@/shared/components/Field';
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
  updatePackage: (payload: {
    id: number;
    imageFile: File | null;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }) => Promise<void>;
};

type PanelMode = 'empty' | 'view' | 'edit' | 'create';
type StatusFilter = 'all' | 'active' | 'inactive';
type EditErrors = Partial<Record<'name' | 'originalPrice' | 'salePrice' | 'importPrice' | 'stockQuantity', string>>;

const detailInputClassName = classNames(inputClassName, 'h-11 rounded-[14px] text-sm');

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
  const [editErrors, setEditErrors] = useState<EditErrors>({});

  const selectedGame = state.selectedGameId ? games.find((game) => game.id === state.selectedGameId) ?? null : null;
  const selectedPackage = useMemo(
    () => state.scopedPackages.find((item) => item.id === selectedPackageId) ?? null,
    [selectedPackageId, state.scopedPackages],
  );
  const selectedPackageGame = selectedPackage ? games.find((game) => game.id === selectedPackage.gameId) ?? null : null;

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

  const selectedPackageDiscount = selectedPackage
    ? selectedPackage.originalPrice > 0
      ? Math.max(0, Math.round(((selectedPackage.originalPrice - selectedPackage.salePrice) / selectedPackage.originalPrice) * 100))
      : 0
    : 0;

  const openCreateForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setSelectedPackageId(null);
    setEditErrors({});
    setPanelMode('create');
  };

  const openEditForm = (item: GamePackage) => {
    setSelectedPackageId(item.id);
    state.startEdit(item);
    setEditErrors({});
    setPanelMode('edit');
  };

  const closeForm = () => {
    state.resetForm();
    state.setImageFile(null);
    setEditErrors({});
    setPanelMode(selectedPackage ? 'view' : 'empty');
  };

  const handleSelectPackage = (item: GamePackage) => {
    setSelectedPackageId(item.id);
    setEditErrors({});
    state.resetForm();
    setPanelMode('view');
  };

  const validateEditForm = () => {
    const errors: EditErrors = {};

    if (!state.form.name.trim()) {
      errors.name = 'Tên gói không được để trống.';
    }
    if (state.form.originalPrice <= 0) {
      errors.originalPrice = 'Giá gốc phải lớn hơn 0.';
    }
    if (state.form.salePrice <= 0) {
      errors.salePrice = 'Giá bán phải lớn hơn 0.';
    } else if (state.form.originalPrice > 0 && state.form.salePrice > state.form.originalPrice) {
      errors.salePrice = 'Giá bán không được lớn hơn giá gốc.';
    }
    if (state.form.importPrice < 0) {
      errors.importPrice = 'Giá nhập không được âm.';
    }
    if (state.form.stockQuantity < 0) {
      errors.stockQuantity = 'Tồn kho không được âm.';
    }

    return errors;
  };

  const handleSaveEdit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateEditForm();
    setEditErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await state.submit(event);
    setEditErrors({});
    setPanelMode('view');
  };

  const handleQuickToggle = async () => {
    if (!selectedPackage) return;

    await state.updatePackage({
      id: selectedPackage.id,
      imageFile: null,
      importPrice: selectedPackage.importPrice,
      isActive: !selectedPackage.isActive,
      name: selectedPackage.name,
      originalPrice: selectedPackage.originalPrice,
      salePrice: selectedPackage.salePrice,
      stockQuantity: selectedPackage.stockQuantity,
    });
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.92))] px-5 py-5 shadow-[0_24px_70px_rgba(2,6,23,0.22)] sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="grid gap-1">
          <p className="m-0 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-100/90">Quản lý gói nạp</p>
          <h1 className="m-0 text-[clamp(2rem,3.4vw,3rem)] font-black leading-none tracking-[-0.06em] text-white">Quản lý gói nạp</h1>
          <p className="m-0 max-w-3xl text-sm leading-6 text-slate-400">Thiết lập giá, tồn kho và trạng thái bán của từng gói.</p>
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
                setEditErrors({});
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
              <EmptyState title="Chọn game trước" description="Hãy chọn game để xem danh sách gói nạp của game đó." />
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
            {panelMode === 'create' ? (
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
            ) : panelMode === 'edit' && selectedPackage ? (
              <>
                <SectionHeading
                  title="Chỉnh sửa gói"
                  titleClassName="text-[1.2rem]"
                  description={`${selectedPackageGame?.name ?? `Game #${selectedPackage.gameId}`} · Cập nhật thông tin hiển thị và bán hàng.`}
                />

                <form className="grid gap-4" onSubmit={handleSaveEdit}>
                  <PackageSummaryCard gameName={selectedPackageGame?.name ?? `Game #${selectedPackage.gameId}`} item={selectedPackage} />

                  <div className="grid gap-0 rounded-[20px] border gt-border bg-[var(--gt-card)] px-4">
                    <DetailRow label="Mã gói">#{selectedPackage.id}</DetailRow>
                    <DetailRow label="Game">
                      <Field
                        readOnly
                        value={selectedPackageGame?.name ?? `Game #${selectedPackage.gameId}`}
                        className={classNames(detailInputClassName, 'w-full max-w-[320px]')}
                      />
                    </DetailRow>
                    <DetailRow label="Tên gói">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[320px]')}
                          value={state.form.name}
                          onChange={(event) => {
                            const value = event.target.value;
                            state.setForm((current) => ({ ...current, name: value }));
                            setEditErrors((current) => ({ ...current, name: value.trim() ? undefined : current.name }));
                          }}
                          placeholder="Nhập tên gói"
                        />
                        {editErrors.name ? <span className="max-w-[320px] text-xs font-medium text-rose-200">{editErrors.name}</span> : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Giá gốc">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[220px] text-right')}
                          min={0}
                          type="number"
                          value={String(state.form.originalPrice)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            state.setForm((current) => ({ ...current, originalPrice: value }));
                            setEditErrors((current) => ({ ...current, originalPrice: value > 0 ? undefined : current.originalPrice }));
                          }}
                        />
                        {editErrors.originalPrice ? (
                          <span className="max-w-[220px] text-xs font-medium text-rose-200">{editErrors.originalPrice}</span>
                        ) : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Giá bán">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[220px] text-right')}
                          min={0}
                          type="number"
                          value={String(state.form.salePrice)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            state.setForm((current) => ({ ...current, salePrice: value }));
                            setEditErrors((current) => ({
                              ...current,
                              salePrice:
                                value > 0 && (state.form.originalPrice <= 0 || value <= state.form.originalPrice)
                                  ? undefined
                                  : current.salePrice,
                            }));
                          }}
                        />
                        {editErrors.salePrice ? <span className="max-w-[220px] text-xs font-medium text-rose-200">{editErrors.salePrice}</span> : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Giá nhập">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[220px] text-right')}
                          min={0}
                          type="number"
                          value={String(state.form.importPrice)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            state.setForm((current) => ({ ...current, importPrice: value }));
                            setEditErrors((current) => ({ ...current, importPrice: value >= 0 ? undefined : current.importPrice }));
                          }}
                        />
                        {editErrors.importPrice ? <span className="max-w-[220px] text-xs font-medium text-rose-200">{editErrors.importPrice}</span> : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Tồn kho">
                      <div className="grid justify-items-end gap-1">
                        <input
                          className={classNames(detailInputClassName, 'w-full max-w-[220px] text-right')}
                          min={0}
                          type="number"
                          value={String(state.form.stockQuantity)}
                          onChange={(event) => {
                            const value = Number(event.target.value);
                            state.setForm((current) => ({ ...current, stockQuantity: value }));
                            setEditErrors((current) => ({ ...current, stockQuantity: value >= 0 ? undefined : current.stockQuantity }));
                          }}
                        />
                        {editErrors.stockQuantity ? (
                          <span className="max-w-[220px] text-xs font-medium text-rose-200">{editErrors.stockQuantity}</span>
                        ) : null}
                      </div>
                    </DetailRow>
                    <DetailRow label="Tiết kiệm">
                      {state.form.originalPrice > 0
                        ? `${formatCurrency(Math.max(0, state.form.originalPrice - state.form.salePrice))} (${Math.max(
                            0,
                            Math.round(((state.form.originalPrice - state.form.salePrice) / state.form.originalPrice) * 100),
                          )}%)`
                        : '0đ'}
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
                    <DetailRow label="Ngày tạo">{formatDate(selectedPackage.createdAt)}</DetailRow>
                    <DetailRow label="Cập nhật">{formatDate(selectedPackage.updatedAt)}</DetailRow>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={closeForm} type="button">
                      <X size={16} />
                      Hủy
                    </Button>
                    <Button variant="primary" className="justify-center rounded-[16px] px-4" disabled={busy} type="submit">
                      <Save size={16} />
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </>
            ) : panelMode === 'view' && selectedPackage ? (
              <>
                <SectionHeading
                  title="Chi tiết gói"
                  titleClassName="text-[1.2rem]"
                  description={`${selectedPackageGame?.name ?? `Game #${selectedPackage.gameId}`} · ${selectedPackage.isActive ? 'Đang bán' : 'Đang ẩn'}`}
                />

                <div className="grid gap-4">
                  <PackageSummaryCard gameName={selectedPackageGame?.name ?? `Game #${selectedPackage.gameId}`} item={selectedPackage} />

                  <div className="grid gap-0 rounded-[20px] border gt-border bg-[var(--gt-card)] px-4">
                    <DetailRow label="Mã gói">#{selectedPackage.id}</DetailRow>
                    <DetailRow label="Game">{selectedPackageGame?.name ?? `#${selectedPackage.gameId}`}</DetailRow>
                    <DetailRow label="Giá gốc">{formatCurrency(selectedPackage.originalPrice)}</DetailRow>
                    <DetailRow label="Giá bán">{formatCurrency(selectedPackage.salePrice)}</DetailRow>
                    <DetailRow label="Tiết kiệm">
                      {selectedPackage.originalPrice > 0
                        ? `${formatCurrency(Math.max(0, selectedPackage.originalPrice - selectedPackage.salePrice))} (${selectedPackageDiscount}%)`
                        : '0đ'}
                    </DetailRow>
                    <DetailRow label="Tồn kho">{selectedPackage.stockQuantity}</DetailRow>
                    <DetailRow label="Trạng thái">
                      <Badge tone={selectedPackage.isActive ? 'success' : 'neutral'}>
                        {selectedPackage.isActive ? 'Đang bán' : 'Đang ẩn'}
                      </Badge>
                    </DetailRow>
                    <DetailRow label="Ngày tạo">{formatDate(selectedPackage.createdAt)}</DetailRow>
                    <DetailRow label="Cập nhật">{formatDate(selectedPackage.updatedAt)}</DetailRow>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <Button variant="secondary" className="justify-center rounded-[16px] px-4" onClick={() => openEditForm(selectedPackage)}>
                      <PencilLine size={16} />
                      Sửa gói
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                      onClick={handleQuickToggle}
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
              <EmptyState title="Chọn một gói để xem chi tiết" description="Xem thông tin, giá, tồn kho, trạng thái và thao tác nhanh." />
            )}
          </div>
        </PanelShell>
      </div>
    </div>
  );
}

function PackageSummaryCard({ gameName, item }: { gameName: string; item: GamePackage }) {
  return (
    <div className="grid gap-4 rounded-[24px] border gt-border bg-[var(--gt-panel)] p-5">
      <div className="flex items-center gap-4">
        <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-[18px] border gt-border bg-[var(--gt-card)]">
          <ImageBox src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="overflow-hidden text-[1.04rem] font-black leading-[1.18] gt-text" title={item.name}>
            {item.name}
          </h3>
          <p className="mt-1.5 text-[0.92rem] leading-6 gt-text-muted">{gameName}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={item.isActive ? 'success' : 'neutral'}>{item.isActive ? 'Đang bán' : 'Đang ẩn'}</Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] gt-text-disabled">#{item.id}</span>
          </div>
        </div>
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
        <FilterSelectField label="Chọn game" value={String(form.gameId)} onChange={(value) => setForm({ ...form, gameId: Number(value) })}>
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
