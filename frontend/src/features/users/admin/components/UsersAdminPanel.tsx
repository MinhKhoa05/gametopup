import { CheckCircle2, Save, UserCheck2, UserRound, X } from 'lucide-react';
import type { Dispatch, FormEvent, SetStateAction } from 'react';
import { User, UserRole } from '@/features/auth/types';
import { Badge, EmptyState, Field, FormActions, MediaListItem, PanelShell, SearchBar, SectionHeading, ToggleField } from '@/shared/components';
import { formatDate } from '@/shared/lib/format';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';

type UsersAdminPanelState = {
  editing: User | null;
  filteredUsers: User[];
  form: {
    displayName: string;
    email: string;
    isActive: boolean;
    role: UserRole;
  };
  query: string;
  remove: (user: User, currentUserId?: number) => Promise<void>;
  resetForm: () => void;
  setForm: Dispatch<
    SetStateAction<{
      displayName: string;
      email: string;
      isActive: boolean;
      role: UserRole;
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
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(380px,0.82fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Danh sách người dùng"
            titleClassName="text-[1.2rem]"
            description="Quản lý tài khoản, vai trò và trạng thái hoạt động."
          />

          <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm theo tên, email, vai trò..." dense />

          {loading && state.filteredUsers.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải người dùng" rows={5} />
          ) : state.filteredUsers.length === 0 ? (
            <EmptyState title="Không tìm thấy người dùng phù hợp." />
          ) : (
            <div className="grid gap-2.5">
              {state.filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const userRoleLabel = user.role?.toString();
                const isAdminRole = user.role === UserRole.Admin;

                return (
                  <MediaListItem
                    key={user.id}
                    onClick={() => state.startEdit(user)}
                    selected={isSelf}
                    leading={
                      <span className="inline-flex size-12 items-center justify-center rounded-[16px] border border-white/[0.06] bg-white/[0.03] text-cyan-50 max-[700px]:size-[54px]">
                        <UserRound size={16} />
                      </span>
                    }
                    title={<>{user.displayName ?? user.email}{isSelf ? ' (bạn)' : ''}</>}
                    subtitle={user.email}
                    meta={user.createdAt ? formatDate(user.createdAt) : 'Chưa có ngày tạo'}
                    titleAccessory={<Badge tone={user.isActive !== false ? 'success' : 'neutral'} icon={user.isActive !== false ? <CheckCircle2 size={14} /> : <X size={14} />}>{user.isActive !== false ? 'Bật' : 'Tắt'}</Badge>}
                    trailing={<Badge tone={isAdminRole ? 'primary' : 'neutral'} icon={<UserCheck2 size={14} />}>{userRoleLabel}</Badge>}
                  />
                );
              })}
            </div>
          )}
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <form className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6" onSubmit={state.submit}>
          <SectionHeading
            title={state.editing ? 'Cập nhật người dùng' : 'Chọn người dùng để sửa'}
            titleClassName="text-[1.2rem]"
            description={state.editing ? 'Đổi thông tin, vai trò hoặc trạng thái.' : 'Chọn một người dùng ở danh sách bên trái để chỉnh sửa.'}
          />

          {state.editing ? (
            <>
              <Field label="Tên hiển thị" onChange={(event) => state.setForm({ ...state.form, displayName: event.target.value })} placeholder="Nhập tên hiển thị" required value={state.form.displayName} />
              <Field label="Email" onChange={(event) => state.setForm({ ...state.form, email: event.target.value })} placeholder="Nhập email" required value={state.form.email} />

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-200">Vai trò</span>
                <select
                  className="min-h-12 w-full rounded-[16px] border border-white/[0.08] bg-[rgba(7,16,31,0.72)] px-4 text-white outline-none transition-all duration-200 hover:border-cyan/25 focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
                  value={state.form.role}
                  onChange={(event) => state.setForm({ ...state.form, role: Number(event.target.value) as UserRole })}
                >
                  <option value="0">Member</option>
                  <option value="1">Admin</option>
                  <option value="2">Staff</option>
                </select>
              </label>

              <ToggleField checked={state.form.isActive} label="Kích hoạt tài khoản" onChange={(isActive) => state.setForm({ ...state.form, isActive })} />

              <div className="rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-4 text-sm text-slate-300">
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
            <div className="rounded-[18px] border border-dashed border-white/[0.08] px-6 py-8 text-slate-400">
              <span>Chọn một người dùng ở danh sách bên trái để chỉnh sửa.</span>
            </div>
          )}
        </form>
      </PanelShell>
    </div>
  );
}
