import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Game, GamePackage } from '@/features/games/types';
import { Badge, Button, EmptyState, Field, FormActions, ImageBox, ImagePicker, RecordRow, SearchBar, SectionHeading, ToggleField } from '@/shared/components';
import { formatCurrency } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';

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
  const selectedGame = state.selectedGameId ? games.find((game) => game.id === state.selectedGameId) ?? null : null;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Chọn game" />
        <div
          className="grid grid-cols-[repeat(auto-fit,minmax(186px,1fr))] gap-2.5 max-[700px]:grid-cols-[repeat(auto-fit,minmax(152px,1fr))]"
          role="tablist"
          aria-label="Chọn game để quản lý gói nạp"
        >
          {games.map((game) => (
            <button
              key={game.id}
              type="button"
              className={classNames(
                'grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-2.5 rounded-xl border border-white/12 bg-[rgba(255,255,255,0.05)] p-2.5 text-left text-slate-300 transition-colors hover:-translate-y-px hover:border-cyan/25 hover:bg-cyan/10 hover:text-cyan-50',
                state.selectedGameId === game.id && 'border-cyan/25 bg-cyan/10 text-cyan-50',
              )}
              disabled={Boolean(state.editing)}
              onClick={() => {
                state.setSelectedGameId(game.id);
                if (!state.editing) {
                  state.setForm((current) => ({ ...current, gameId: game.id }));
                }
              }}
            >
              <ImageBox className="h-10 w-10 overflow-hidden rounded-xl bg-cyan/10" src={game.imageUrl} alt="" />
              <span className="max-h-10 overflow-hidden whitespace-normal text-[0.98rem] font-bold leading-[1.2]">{game.name}</span>
            </button>
          ))}
        </div>

        <SectionHeading title="Danh sách gói nạp" />
        <SearchBar className="mb-4" inputClassName="text-sm" value={state.query} onChange={state.setQuery} placeholder="Tìm gói nạp..." />

        {loading && games.length === 0 && state.scopedPackages.length === 0 ? (
          <div className="grid gap-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : !state.selectedGameId ? (
          <EmptyState>Hãy chọn hoặc tạo game trước.</EmptyState>
        ) : state.scopedPackages.length === 0 ? (
          <EmptyState>Game này chưa có gói nạp nào.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {state.scopedPackages.map((item) => {
              const isEditing = state.editing?.id === item.id;
              const profit = item.salePrice - item.importPrice;

              return (
                <RecordRow className="grid-cols-[auto_minmax(0,1fr)_minmax(140px,auto)_auto_auto]" highlighted={isEditing} key={item.id}>
                  <ImageBox className="h-12 w-12 overflow-hidden rounded-xl bg-cyan/10 max-[700px]:h-[54px] max-[700px]:w-[54px]" src={item.imageUrl} alt="" />
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {selectedGame?.name ?? `Game #${item.gameId}`} · Tồn kho {item.stockQuantity}
                    </small>
                  </div>
                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <b>{formatCurrency(item.salePrice)}</b>
                    <span className={classNames('rounded-full px-2.5 py-1 text-[0.75rem] font-bold', profit >= 0 ? 'bg-emerald-400/14 text-emerald-200' : 'bg-rose-400/14 text-rose-200')}>
                      Lãi {profit >= 0 ? '+' : ''}
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <Badge variant={item.isActive ? 'success' : 'default'} icon={item.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                    {item.isActive ? 'Bật' : 'Tắt'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="icon" title="Sửa gói" onClick={() => state.startEdit(item)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      title="Xóa gói"
                      onClick={() => void state.remove(item)}
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

      <form className="gt-surface sticky top-24" onSubmit={state.submit}>
        <SectionHeading title={state.editing ? 'Cập nhật gói nạp' : 'Tạo gói nạp'} />

        <div className="mb-4 grid gap-3">
          <Field label="Tên gói" onChange={(event) => state.setForm({ ...state.form, name: event.target.value })} placeholder="Nhập tên gói" required value={state.form.name} />
          <ImagePicker
            className="min-h-44 w-full overflow-hidden"
            onChange={state.setImageFile}
            src={state.editing?.imageUrl}
            alt={state.editing?.name || selectedGame?.name || state.form.name || 'Xem trước ảnh gói'}
          />
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <Field
            label="Giá bán"
            min={0}
            onChange={(event) => state.setForm({ ...state.form, salePrice: Number(event.target.value) })}
            placeholder="0"
            required
            type="number"
            value={String(state.form.salePrice)}
          />
          <Field
            label="Giá gốc"
            min={0}
            onChange={(event) => state.setForm({ ...state.form, originalPrice: Number(event.target.value) })}
            placeholder="0"
            required
            type="number"
            value={String(state.form.originalPrice)}
          />
          <Field
            label="Giá nhập"
            min={0}
            onChange={(event) => state.setForm({ ...state.form, importPrice: Number(event.target.value) })}
            placeholder="0"
            required
            type="number"
            value={String(state.form.importPrice)}
          />
          <Field
            label="Tồn kho"
            min={0}
            onChange={(event) => state.setForm({ ...state.form, stockQuantity: Number(event.target.value) })}
            placeholder="0"
            required
            type="number"
            value={String(state.form.stockQuantity)}
          />
        </div>

        <ToggleField checked={state.form.isActive} label="Cho phép bán gói này" onChange={(isActive) => state.setForm({ ...state.form, isActive })} />

        <FormActions
          disabled={busy || games.length === 0 || (!state.editing && !state.imageFile)}
          onCancel={state.editing ? state.resetForm : undefined}
          submitIcon={state.editing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={state.editing ? 'Lưu gói' : 'Tạo gói'}
        />
      </form>
    </div>
  );
}
