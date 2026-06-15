import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Game } from '@/features/games/types';
import { Badge, Button, EmptyState, Field, FormActions, ImageBox, ImagePicker, RecordRow, SearchBar, SectionHeading, ToggleField } from '@/shared/components';

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

export function GamesAdminPanel({
  busy,
  loading,
  state,
}: {
  busy: boolean;
  loading: boolean;
  state: GamesAdminPanelState;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Danh sách game" />
        <SearchBar className="mb-4" value={state.query} onChange={state.setQuery} placeholder="Tìm game..." />
        {loading && state.filteredGames.length === 0 ? (
          <div className="grid gap-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : state.filteredGames.length === 0 ? (
          <EmptyState>Không tìm thấy game phù hợp.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {state.filteredGames.map((game) => (
              <RecordRow className="grid-cols-[auto_minmax(0,1fr)_auto_auto]" key={game.id}>
                <ImageBox className="h-12 w-12 overflow-hidden rounded-xl bg-cyan/10 max-[700px]:h-[54px] max-[700px]:w-[54px]" src={game.imageUrl} alt="" />
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</small>
                </div>
                <Badge tone={game.isActive ? 'success' : 'neutral'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>
                  {game.isActive ? 'Bật' : 'Tắt'}
                </Badge>
                <div className="flex gap-2">
                  <Button size="icon" title="Sửa game" onClick={() => state.startEdit(game)}>
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    size="icon"
                    title="Xóa game"
                    onClick={() => void state.remove(game)}
                    className="!border-rose-400/15 !bg-rose-500/10 !text-rose-200 hover:!border-rose-300/25 hover:!bg-rose-500/15 hover:!text-rose-100 hover:!shadow-[0_8px_24px_rgba(244,63,94,0.10)]"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </RecordRow>
            ))}
          </div>
        )}
      </div>

      <form className="gt-surface sticky top-24" onSubmit={state.submit}>
        <SectionHeading title={state.editing ? 'Cập nhật game' : 'Tạo game'} />
        <Field label="Tên game" onChange={(event) => state.setForm({ ...state.form, name: event.target.value })} placeholder="Nhập tên game" required value={state.form.name} />
        <ImagePicker
          className="min-h-44 w-full overflow-hidden"
          onChange={state.setImageFile}
          src={state.editing?.imageUrl}
          alt={state.editing?.name || state.form.name || 'Xem trước ảnh game'}
        />
        <ToggleField checked={state.form.isActive} label="Hiển thị game trong danh mục" onChange={(isActive) => state.setForm({ ...state.form, isActive })} />
        <FormActions
          disabled={busy || (!state.editing && !state.imageFile)}
          onCancel={state.editing ? state.resetForm : undefined}
          submitIcon={state.editing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={state.editing ? 'Lưu game' : 'Tạo game'}
        />
      </form>
    </div>
  );
}
