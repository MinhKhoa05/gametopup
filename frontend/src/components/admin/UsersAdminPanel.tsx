import { FormEvent, useMemo, useState } from 'react';
import { Edit3, Save, Trash2, UserCheck2, UserRound } from 'lucide-react';
import { formatDate } from '../../lib/format';
import { userRoleLabel } from '../../lib/labels';
import { classNames } from '../../lib/ui';
import type { User } from '../../types';
import { AdminSkeleton, EmptyLine, PanelTitle, SearchBox, StatusPill } from './AdminShared';
import { Field } from '../ui/Field';
import { Badge } from '../ui/Badge';

const emptyForm = {
  displayName: '',
  email: '',
  isActive: true,
  role: '0',
};

export function UsersAdminPanel({
  busy,
  loading,
  users,
  currentUser,
  onUpdateUser,
  onDeleteUser,
}: {
  busy: boolean;
  loading: boolean;
  users: User[];
  currentUser: User | null;
  onUpdateUser: (payload: { id: number; displayName: string; email: string; role: number; isActive: boolean }) => Promise<void>;
  onDeleteUser: (id: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState<User | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(emptyForm);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) =>
      [String(user.id), user.displayName ?? '', user.email, userRoleLabel(user.role)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, users]);

  function startEdit(user: User) {
    setEditing(user);
    setForm({
      displayName: user.displayName ?? '',
      email: user.email,
      isActive: user.isActive !== false,
      role: normalizeRoleValue(user.role),
    });
  }

  function resetForm() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;

    const payload = {
      displayName: form.displayName.trim(),
      email: form.email.trim(),
      isActive: form.isActive,
      role: Number(form.role),
    };
    await onUpdateUser({ id: editing.id, ...payload });
    resetForm();
  }

  async function remove(user: User) {
    if (user.id === currentUser?.id) {
      window.alert('Không thể vô hiệu hóa tài khoản hiện tại.');
      return;
    }

    if (!window.confirm(`Vô hiệu hóa user "${user.displayName ?? user.email}"?`)) return;
    await onDeleteUser(user.id);
  }

  return (
    <div className="admin-editor-layout">
      <div className="gametopup-surface grid gap-[18px]">
        <PanelTitle title="Danh sách users" />
        <SearchBox value={query} onChange={setQuery} placeholder="Tìm user theo tên, email, role..." />

        {loading && filteredUsers.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredUsers.length === 0 ? (
          <EmptyLine text="Không tìm thấy user phù hợp." />
        ) : (
          <div className="admin-table">
            {filteredUsers.map((user) => {
              const isSelf = user.id === currentUser?.id;

              return (
                <div className={classNames('gametopup-record-row admin-table-row user', isSelf && 'active')} key={user.id}>
                  <div className="admin-row-icon">
                    <UserRound size={16} />
                  </div>
                  <div>
                    <strong>
                      {user.displayName ?? user.email}
                      {isSelf ? ' (bạn)' : ''}
                    </strong>
                    <small>
                      {user.email} · {userRoleLabel(user.role)} · {user.createdAt ? formatDate(user.createdAt) : 'Chưa có ngày tạo'}
                    </small>
                  </div>
                  <div className="admin-user-badges">
                    <StatusPill active={user.isActive !== false} />
                    <Badge tone={user.role === 1 || user.role === '1' ? 'info' : 'default'} icon={<UserCheck2 size={14} />}>
                      {userRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <div className="admin-user-actions">
                    <button type="button" className="icon-button" title="Sửa user" onClick={() => startEdit(user)}>
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      title="Vô hiệu hóa user"
                      disabled={isSelf}
                      onClick={() => remove(user)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form className="gametopup-surface sticky top-[88px]" onSubmit={submit}>
        <PanelTitle title={editing ? 'Cập nhật user' : 'Chọn user để sửa'} />

        {editing ? (
          <>
            <Field label="Tên hiển thị" onChange={(value) => setForm({ ...form, displayName: value })} placeholder="Nhập tên hiển thị" required value={form.displayName} />
            <Field label="Email" onChange={(value) => setForm({ ...form, email: value })} placeholder="Nhập email" required value={form.email} />

            <label className="gametopup-field">
              <span className="gametopup-field__label">Vai trò</span>
              <select className="gametopup-input" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="0">Member</option>
                <option value="1">Admin</option>
                <option value="2">Staff</option>
              </select>
            </label>

            <label className="mb-4 flex items-center gap-2 font-semibold text-slate-200">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              <span>Kích hoạt tài khoản</span>
            </label>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <UserRound size={16} />
                <span>Thông tin hiện tại</span>
              </div>
              <div className="grid gap-1 leading-6">
                <span>ID: #{editing.id}</span>
                <span>Ngày tạo: {editing.createdAt ? formatDate(editing.createdAt) : 'Chưa có'}</span>
                <span>Cập nhật: {editing.updatedAt ? formatDate(editing.updatedAt) : 'Chưa có'}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={resetForm}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={busy}>
                <Save size={17} />
                Lưu user
              </button>
            </div>
          </>
        ) : (
          <EmptyLine text="Chọn một user ở danh sách bên trái để chỉnh sửa." />
        )}
      </form>
    </div>
  );
}

function normalizeRoleValue(role?: number | string) {
  if (role == null) return '0';
  const value = String(role).trim().toLowerCase();
  if (value === 'admin') return '1';
  if (value === 'staff') return '2';
  if (value === 'member') return '0';
  return value;
}
