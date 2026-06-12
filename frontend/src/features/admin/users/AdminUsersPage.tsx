import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAdminUsersPageState, useAdminUsersSection } from './hooks';
import { UsersAdminPanel } from '@/features/admin/users/components/UsersAdminPanel';

export function AdminUsersPage() {
  const auth = useAuthSession();
  const section = useAdminUsersSection();
  const state = useAdminUsersPageState({
    onDeleteUser: section.removeUser,
    onUpdateUser: section.updateUser,
    users: section.users,
  });

  return <UsersAdminPanel busy={section.busy} currentUser={auth.user} loading={section.loading} state={state} />;
}
