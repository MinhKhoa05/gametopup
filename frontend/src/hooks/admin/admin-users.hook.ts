import { FormEvent, useMemo, useState } from 'react';
import { userRoleLabel } from '../../lib/labels';
import { normalizeRoleValue } from '../../lib/roles';
import type { User } from '../../types';
import { useAdminUserMutations, useAdminUsersQuery } from '../../services/admin/admin-users.service';

export function useAdminUsersSection() {
  const usersQuery = useAdminUsersQuery();
  const userMutations = useAdminUserMutations();

  const users = usersQuery.data ?? [];
  const loading = usersQuery.isPending && !usersQuery.data;
  const busy = [userMutations.update.isPending, userMutations.remove.isPending].some(Boolean);

  return {
    busy,
    loading,
    removeUser: async (id: number) => {
      await userMutations.remove.mutateAsync({ id });
    },
    updateUser: async (payload: { id: number; displayName: string; email: string; role: number; isActive: boolean }) => {
      await userMutations.update.mutateAsync({
        id: payload.id,
        payload: {
          displayName: payload.displayName,
          email: payload.email,
          role: payload.role,
          isActive: payload.isActive,
        },
      });
    },
    users,
  };
}

const emptyForm = {
  displayName: '',
  email: '',
  isActive: true,
  role: '0',
};

export function useAdminUsersPanel({
  onDeleteUser,
  onUpdateUser,
  users,
}: {
  onDeleteUser: (id: number) => Promise<void>;
  onUpdateUser: (payload: { id: number; displayName: string; email: string; role: number; isActive: boolean }) => Promise<void>;
  users: User[];
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

  async function remove(user: User, currentUserId?: number) {
    if (user.id === currentUserId) {
      window.alert('Không thể vô hiệu hóa tài khoản hiện tại.');
      return;
    }

    if (!window.confirm(`Vô hiệu hóa user "${user.displayName ?? user.email}"?`)) return;
    await onDeleteUser(user.id);
  }

  return {
    editing,
    filteredUsers,
    form,
    query,
    remove,
    resetForm,
    setForm,
    setQuery,
    startEdit,
    submit,
  };
}
