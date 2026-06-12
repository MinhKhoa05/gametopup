import { FormEvent, useMemo, useState } from 'react';
import type { User } from '@/features/auth/types';
import { formatUserRoleLabel, normalizeUserRoleValue, type UserRoleValue } from '@/features/auth/userRole';

export function useAdminUsersPageState({
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
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    isActive: true,
    role: '0' as UserRoleValue,
  });

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) =>
      [String(user.id), user.displayName ?? '', user.email, formatUserRoleLabel(user.role)]
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
      role: normalizeUserRoleValue(user.role) as UserRoleValue,
    });
  }

  function resetForm() {
    setEditing(null);
    setForm({
      displayName: '',
      email: '',
      isActive: true,
      role: '0',
    });
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
