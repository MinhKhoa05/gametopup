import { FormEvent, useMemo, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import type { Game } from '../../types';
import { AdminSkeleton, EmptyLine, PanelTitle, SearchBox, StatusPill, filterByName } from './AdminShared';
import { Field } from '../common/Field';
import { pickImage } from '../../lib/ui';

const emptyGameForm = {
  imageUrl: '',
  isActive: true,
  name: '',
};

export function GamesAdminPanel({
  busy,
  games,
  loading,
  onCreateGame,
  onUpdateGame,
  onDeleteGame,
}: {
  busy: boolean;
  games: Game[];
  loading: boolean;
  onCreateGame: (payload: { name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
  onUpdateGame: (payload: { id: number; name: string; imageUrl: string; isActive: boolean }) => Promise<void>;
  onDeleteGame: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGameForm);
  const [query, setQuery] = useState('');
  const filteredGames = useMemo(() => filterByName(games, query), [games, query]);

  function startEdit(game: Game) {
    setEditing(game);
    setForm({ imageUrl: game.imageUrl ?? '', isActive: game.isActive, name: game.name });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyGameForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload = { ...form, name: form.name.trim(), imageUrl: form.imageUrl.trim() };
    await (editing ? onUpdateGame({ id: editing.id, ...payload }) : onCreateGame(payload));
    resetForm();
  }

  async function remove(game: Game) {
    if (!window.confirm(`Xóa game "${game.name}"?`)) return;
    await onDeleteGame(game.id);
  }

  return (
    <div className="admin-editor-layout">
      <div className="gametopup-surface">
        <PanelTitle title="Danh sách game" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm game..." />
        {loading && filteredGames.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredGames.length === 0 ? (
          <EmptyLine text="Không tìm thấy game phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredGames.map((game) => (
              <div className="gametopup-record-row admin-table-row" key={game.id}>
                <img src={pickImage(game)} alt="" />
                <div>
                  <strong>{game.name}</strong>
                  <small>{game.isActive ? 'Đang hiển thị' : 'Đang ẩn'}</small>
                </div>
                <StatusPill active={game.isActive} />
                <div className="flex gap-2">
                  <button type="button" className="icon-button" title="Sửa game" onClick={() => startEdit(game)}>
                    <Edit3 size={16} />
                  </button>
                  <button type="button" className="icon-button danger" title="Xóa game" onClick={() => remove(game)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="gametopup-surface sticky top-[88px]" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật game' : 'Tạo game'} />
        <Field label="Tên game" onChange={(value) => setForm({ ...form, name: value })} placeholder="Nhập tên game" required value={form.name} />
        <Field label="Ảnh đại diện" onChange={(value) => setForm({ ...form, imageUrl: value })} placeholder="https://..." value={form.imageUrl} />
        <label className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
          <span>Hiển thị game trong danh mục</span>
        </label>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {editing && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              <X size={17} /> Hủy
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? <Save size={17} /> : <Plus size={17} />}
            {editing ? 'Lưu game' : 'Tạo game'}
          </button>
        </div>
      </form>
    </div>
  );
}
