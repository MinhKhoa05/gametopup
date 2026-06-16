import { CheckCircle2, Plus, Save, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { Game } from '@/features/games/types';
import { Badge, EmptyState, Field, FormActions, ImageBox, ImagePicker, MediaListItem, PanelShell, SearchBar, SectionHeading, ToggleField } from '@/shared/components';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';

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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Danh sách game"
            titleClassName="text-[1.2rem]"
            description="Quản lý game có trong hệ thống và trạng thái hiển thị."
          />

          <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm game..." dense />

          {loading && state.filteredGames.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải game" rows={5} />
          ) : state.filteredGames.length === 0 ? (
            <EmptyState>Không tìm thấy game phù hợp.</EmptyState>
          ) : (
            <div className="grid gap-2.5">
              {state.filteredGames.map((game) => (
                <MediaListItem
                  key={game.id}
                  onClick={() => state.startEdit(game)}
                  leading={<ImageBox className="h-12 w-12 overflow-hidden rounded-[16px] bg-cyan/10 max-[700px]:h-[54px] max-[700px]:w-[54px]" src={game.imageUrl} alt="" />}
                  title={game.name}
                  subtitle={game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}
                  titleAccessory={<Badge tone={game.isActive ? 'success' : 'neutral'} icon={game.isActive ? <CheckCircle2 size={14} /> : <X size={14} />}>{game.isActive ? 'Bật' : 'Tắt'}</Badge>}
                />
              ))}
            </div>
          )}
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <form className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6" onSubmit={state.submit}>
          <SectionHeading
            title={state.editing ? 'Cập nhật game' : 'Tạo game'}
            titleClassName="text-[1.2rem]"
            description="Một game chỉ cần tên, ảnh và trạng thái hiển thị."
          />

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
      </PanelShell>
    </div>
  );
}
