import { useAuthUserQuery } from '@/features/auth/server';
import { useAdminUsersPageState, useAdminUsersSection } from './hooks';
import { UsersAdminPanel } from './components/UsersAdminPanel';

export function AdminUsersPage() {
  const authQuery = useAuthUserQuery();
  const section = useAdminUsersSection();
  const state = useAdminUsersPageState({
    onDeleteUser: section.removeUser,
    onUpdateUser: section.updateUser,
    users: section.users,
  });

  return <UsersAdminPanel busy={section.busy} currentUser={authQuery.data ?? null} loading={section.loading} state={state} />;
}
