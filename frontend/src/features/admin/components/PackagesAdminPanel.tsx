import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { AdminGamePackage, Game } from '@/features/games/games.types';
import { useAdminPackagesPanel } from '@/features/admin/hooks/admin-packages.hook';
import {
  Badge,
  Button,
  EmptyState,
  Field,
  FormActions,
  ImageField,
  RecordRow,
  SearchBar,
  SectionHeading,
  ToggleField,
} from '@/components/ui';
import { classNames, pickImage, resolveImageUrl } from '@/lib/ui';
import { AdminSkeleton } from './AdminShared';
import { gameName } from './admin.utils';

export function PackagesAdminPanel({
  busy,
  games,
  packages,
  loading,
  onCreatePackage,
  onUpdatePackage,
  onDeletePackage,
}: {
  busy: boolean;
  games: Game[];
  packages: AdminGamePackage[];
  loading: boolean;
  onCreatePackage: (payload: {
    gameId: number;
    imageFile: File | null;
    importPrice: number;
    isActive: boolean;
    name: string;
    originalPrice: number;
    salePrice: number;
    stockQuantity: number;
  }) => Promise<void>;
  onUpdatePackage: (
    payload: {
      id: number;
      imageFile: File | null;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    },
  ) => Promise<void>;
  onDeletePackage: (id: number) => Promise<void>;
}) {
  const {
    editing,
    imageFile,
    query,
    remove,
    resetForm,
    scopedPackages,
    selectedGameId,
    setForm,
    setImageFile,
    setQuery,
    setSelectedGameId,
    startEdit,
    submit,
    form,
  } = useAdminPackagesPanel({
    games,
    packages,
    onCreatePackage,
    onDeletePackage,
    onUpdatePackage,
  });

  const profit = (item: AdminGamePackage) => item.salePrice - item.importPrice;
  const selectedGame = selectedGameId ? games.find((game) => game.id === selectedGameId) ?? null : null;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Chọn game" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(186px,1fr))] gap-2.5 max-[700px]:grid-cols-[repeat(auto-fit,minmax(152px,1fr))]" role="tablist" aria-label="Chọn game để quản lý gói nạp">
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={classNames(
                'grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-white/12 bg-[rgba(255,255,255,0.05)] p-2.5 text-left text-slate-300 transition-colors hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50',
                selectedGameId === game.id && 'border-cyan/25 bg-cyan/10 text-cyan-50',
              )}
              disabled={Boolean(editing)}
              onClick={() => {
                setSelectedGameId(game.id);
                if (!editing) setForm((current) => ({ ...current, gameId: game.id }));
              }}
            >
              <ImageField className="h-10 w-10 overflow-hidden rounded-xl bg-cyan/10" src={pickImage(game)} alt="" />
              <span className="max-h-10 overflow-hidden whitespace-normal text-[0.98rem] font-bold leading-[1.2]">{game.name}</span>
            </button>
          ))}
        </div>

        <SectionHeading title="Danh sách gói nạp" />
        <SearchBar className="mb-4" inputClassName="text-sm" value={query} onChange={setQuery} placeholder="Tìm gói nạp..." />

        {loading && games.length === 0 && packages.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : !selectedGameId ? (
          <EmptyState>Hãy chọn hoặc tạo game trước.</EmptyState>
        ) : scopedPackages.length === 0 ? (
          <EmptyState>Game này chưa có gói nạp nào.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {scopedPackages.map((item) => {
              const isEditing = editing?.id === item.id;

              return (
                <RecordRow
                  className="grid-cols-[auto_minmax(0,1fr)_minmax(140px,auto)_auto_auto]"
                  highlighted={isEditing}
                  key={item.id}
                >
                  <ImageField className="h-12 w-12 overflow-hidden rounded-xl bg-cyan/10 max-[700px]:h-[54px] max-[700px]:w-[54px]" src={pickImage(item)} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {gameName(games, item.gameId)} · Tồn kho {item.stockQuantity}
                    </small>
                  </div>
                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <b>{formatCurrency(item.salePrice)}</b>
                    <span
                      className={classNames(
                        'rounded-full px-2.5 py-1 text-[0.75rem] font-bold',
                        profit(item) >= 0 ? 'bg-emerald-400/14 text-emerald-200' : 'bg-rose-400/14 text-rose-200',
                      )}
                    >
                      Lãi {profit(item) >= 0 ? '+' : ''}
                      {formatCurrency(profit(item))}
                    </span>
                  </div>
                  <Badge variant={item.isActive ? 'success' : 'default'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                    {item.isActive ? 'Bật' : 'Tắt'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="icon" title="Sửa gói" onClick={() => startEdit(item)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      title="Xóa gói"
                      onClick={() => remove(item)}
                      className="!border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100 hover:!shadow-[0_8px_24px_rgba(244,63,94,0.10)]"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </RecordRow>
              );
            })}
          </div>
        )}
      </div>

      <form className="gt-surface sticky top-24" onSubmit={submit}>
        <SectionHeading title={editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />

        <div className="mb-4 grid gap-3">
          <Field label="Tên gói" onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nhập tên gói" required value={form.name} />
          <ImageField
            className="min-h-44 w-full overflow-hidden"
            onChange={setImageFile}
            src={resolveImageUrl(editing?.imageUrl) || ''}
            alt={editing?.name || selectedGame?.name || form.name || 'Xem trước ảnh gói'}
          />
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
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

        <ToggleField checked={form.isActive} label="Cho phép bán gói này" onChange={(isActive) => setForm({ ...form, isActive })} />

        <FormActions
          disabled={busy || games.length === 0 || (!editing && !imageFile)}
          onCancel={editing ? resetForm : undefined}
          submitIcon={editing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={editing ? 'Lưu gói' : 'Tạo gói'}
        />
      </form>
    </div>
  );
}
