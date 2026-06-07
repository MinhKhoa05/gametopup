import { CheckCircle2, Edit3, Save, Trash2, UserCheck2, UserRound, X } from 'lucide-react';
import { formatDate } from '../../lib/format';
import { userRoleLabel } from '../../lib/labels';
import { classNames } from '../../lib/ui';
import type { User } from '../../types';
import { useAdminUsersPanel } from '../../hooks/admin/admin-users.hook';
import { AdminSkeleton } from './AdminShared';
import { Badge, Button, EmptyState, Field, FormActions, IconBox, RecordRow, SearchBar, SectionHeading, ToggleField } from '../ui';

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
  const { editing, filteredUsers, form, query, remove, resetForm, setForm, setQuery, startEdit, submit } = useAdminUsersPanel({
    onDeleteUser,
    onUpdateUser,
    users,
  });

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Danh sách users" />
        <SearchBar className="mb-4" inputClassName="text-sm" value={query} onChange={setQuery} placeholder="Tìm user theo tên, email, role..." />

        {loading && filteredUsers.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState>Không tìm thấy user phù hợp.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {filteredUsers.map((user) => {
              const isSelf = user.id === currentUser?.id;

              return (
                <RecordRow
                  className="grid-cols-[auto_minmax(0,1fr)_minmax(180px,auto)_auto]"
                  highlighted={isSelf}
                  key={user.id}
                >
                  <IconBox size="sm" className="h-12 w-12 rounded-xl max-[700px]:h-[54px] max-[700px]:w-[54px]">
                    <UserRound size={16} />
                  </IconBox>
                  <div>
                    <strong>
                      {user.displayName ?? user.email}
                      {isSelf ? ' (bạn)' : ''}
                    </strong>
                    <small>
                      {user.email} · {userRoleLabel(user.role)} · {user.createdAt ? formatDate(user.createdAt) : 'Chưa có ngày tạo'}
                    </small>
                  </div>
                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <Badge
                      variant={user.isActive !== false ? 'success' : 'default'}
                      icon={user.isActive !== false ? <CheckCircle2 size={14} /> : <X size={14} />}
                    >
                      {user.isActive !== false ? 'Bật' : 'Tắt'}
                    </Badge>
                    <Badge variant={user.role === 1 || user.role === '1' ? 'accent' : 'default'} icon={<UserCheck2 size={14} />}>
                      {userRoleLabel(user.role)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 max-[700px]:justify-start">
                    <Button size="icon" title="Sửa user" onClick={() => startEdit(user)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      title="Vô hiệu hóa user"
                      disabled={isSelf}
                      onClick={() => remove(user, currentUser?.id)}
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
        <SectionHeading title={editing ? 'Cập nhật user' : 'Chọn user để sửa'} />

        {editing ? (
          <>
            <Field label="Tên hiển thị" onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="Nhập tên hiển thị" required value={form.displayName} />
            <Field label="Email" onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Nhập email" required value={form.email} />

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Vai trò</span>
              <select
                className="min-h-12 w-full rounded-xl border border-white/12 bg-ink-lighter px-4 text-white outline-none transition-colors hover:border-cyan/25 focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
              >
                <option value="0">Member</option>
                <option value="1">Admin</option>
                <option value="2">Staff</option>
              </select>
            </label>

            <ToggleField checked={form.isActive} label="Kích hoạt tài khoản" onChange={(isActive) => setForm({ ...form, isActive })} />

            <div className="gt-panel-soft rounded-2xl p-4 text-sm text-slate-300">
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

            <FormActions disabled={busy} onCancel={resetForm} submitIcon={<Save size={17} />} submitLabel="Lưu user" />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/12 px-6 py-8 text-slate-400">
            <span>Chọn một user ở danh sách bên trái để chỉnh sửa.</span>
          </div>
        )}
      </form>
    </div>
  );
}
