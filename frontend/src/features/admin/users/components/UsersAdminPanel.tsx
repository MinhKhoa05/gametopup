import { CheckCircle2, Edit3, Save, Trash2, UserCheck2, UserRound, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import type { User } from '@/features/auth/types';
import { Badge, Button, EmptyState, Field, FormActions, IconBox, RecordRow, SearchBar, SectionHeading, ToggleField } from '@/shared/components';
import { formatDate } from '@/shared/lib/format';
import { formatUserRoleLabel, isAdminUserRole, type UserRoleValue } from '@/features/auth/userRole';

type UsersAdminPanelState = {
  editing: User | null;
  filteredUsers: User[];
  form: {
    displayName: string;
    email: string;
    isActive: boolean;
    role: UserRoleValue;
  };
  query: string;
  remove: (user: User, currentUserId?: number) => Promise<void>;
  resetForm: () => void;
  setForm: Dispatch<
    SetStateAction<{
      displayName: string;
      email: string;
      isActive: boolean;
      role: UserRoleValue;
    }>
  >;
  setQuery: Dispatch<SetStateAction<string>>;
  startEdit: (user: User) => void;
  submit: (event: FormEvent) => Promise<void>;
};

export function UsersAdminPanel({
  busy,
  currentUser,
  loading,
  state,
}: {
  busy: boolean;
  currentUser: User | null;
  loading: boolean;
  state: UsersAdminPanelState;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading title="Danh sách người dùng" />
        <SearchBar className="mb-4" value={state.query} onChange={state.setQuery} placeholder="Tìm theo tên, email, vai trò..." />

        {loading && state.filteredUsers.length === 0 ? (
          <div className="grid gap-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : state.filteredUsers.length === 0 ? (
          <EmptyState>Không tìm thấy người dùng phù hợp.</EmptyState>
        ) : (
          <div className="grid gap-2.5">
            {state.filteredUsers.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const userRoleLabel = formatUserRoleLabel(user.role);
              const isAdminRole = isAdminUserRole(user.role);

              return (
                <RecordRow className="grid-cols-[auto_minmax(0,1fr)_minmax(180px,auto)_auto]" highlighted={isSelf} key={user.id}>
                  <IconBox size="sm" className="h-12 w-12 rounded-xl max-[700px]:h-[54px] max-[700px]:w-[54px]">
                    <UserRound size={16} />
                  </IconBox>
                  <div>
                    <strong>
                      {user.displayName ?? user.email}
                      {isSelf ? ' (bạn)' : ''}
                    </strong>
                    <small>
                      {user.email} · {userRoleLabel} · {user.createdAt ? formatDate(user.createdAt) : 'Chưa có ngày tạo'}
                    </small>
                  </div>
                  <div className="grid justify-items-end gap-1.5 max-[700px]:justify-items-start">
                    <Badge tone={user.isActive !== false ? 'success' : 'neutral'} icon={user.isActive !== false ? <CheckCircle2 size={14} /> : <X size={14} />}>
                      {user.isActive !== false ? 'Bật' : 'Tắt'}
                    </Badge>
                    <Badge tone={isAdminRole ? 'primary' : 'neutral'} icon={<UserCheck2 size={14} />}>
                      {userRoleLabel}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 max-[700px]:justify-start">
                    <Button size="icon" title="Sửa người dùng" onClick={() => state.startEdit(user)}>
                      <Edit3 size={16} />
                    </Button>
                    <Button
                      size="icon"
                      title="Vô hiệu hóa người dùng"
                      disabled={isSelf}
                      onClick={() => void state.remove(user, currentUser?.id)}
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
        <SectionHeading title={state.editing ? 'Cập nhật người dùng' : 'Chọn người dùng để sửa'} />

        {state.editing ? (
          <>
            <Field label="Tên hiển thị" onChange={(event) => state.setForm({ ...state.form, displayName: event.target.value })} placeholder="Nhập tên hiển thị" required value={state.form.displayName} />
            <Field label="Email" onChange={(event) => state.setForm({ ...state.form, email: event.target.value })} placeholder="Nhập email" required value={state.form.email} />

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-200">Vai trò</span>
              <select
                className="min-h-12 w-full rounded-xl border border-white/12 bg-ink-lighter px-4 text-white outline-none transition-colors hover:border-cyan/25 focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                value={state.form.role}
                onChange={(event) => state.setForm({ ...state.form, role: event.target.value as UserRoleValue })}
              >
                <option value="0">Member</option>
                <option value="1">Admin</option>
                <option value="2">Staff</option>
              </select>
            </label>

            <ToggleField checked={state.form.isActive} label="Kích hoạt tài khoản" onChange={(isActive) => state.setForm({ ...state.form, isActive })} />

            <div className="gt-panel-soft rounded-2xl p-4 text-sm text-slate-300">
              <div className="mb-2 flex items-center gap-2 font-semibold text-white">
                <UserRound size={16} />
                <span>Thông tin hiện tại</span>
              </div>
              <div className="grid gap-1 leading-6">
                <span>ID: #{state.editing.id}</span>
                <span>Ngày tạo: {state.editing.createdAt ? formatDate(state.editing.createdAt) : 'Chưa có'}</span>
                <span>Cập nhật: {state.editing.updatedAt ? formatDate(state.editing.updatedAt) : 'Chưa có'}</span>
              </div>
            </div>

            <FormActions disabled={busy} onCancel={state.resetForm} submitIcon={<Save size={17} />} submitLabel="Lưu người dùng" />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/12 px-6 py-8 text-slate-400">
            <span>Chọn một người dùng ở danh sách bên trái để chỉnh sửa.</span>
          </div>
        )}
      </form>
    </div>
  );
}
