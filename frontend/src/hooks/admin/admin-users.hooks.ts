import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from '../common/useAsyncAction';
import { executeBackgroundFetch } from '../common/useBackgroundFetch';
import { useAdminCrud } from '../common/useAdminCrud';
import { getAdminUsers, updateUser, deleteUser } from '../../services/admin.api';
import { useAdminUsersStore } from '../../store/admin/admin-users.store';

export function useAdminUsers(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const { users, loading } = useAdminUsersStore(
    useShallow((state) => ({ users: state.users, loading: state.loading }))
  );

  async function refresh() {
    const current = useAdminUsersStore.getState();
    await executeBackgroundFetch({
      hasData: current.users.length > 0,
      setLoading: current.setLoading,
      setError,
      fetcher: getAdminUsers,
      onSuccess: current.setUsers,
    });
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  const crud = useAdminCrud('user', execute, {
    update: updateUser,
    remove: deleteUser
  }, refresh);

  return {
    users,
    loading,
    refresh,
    updateUser: crud.updateItem,
    removeUser: crud.removeItem,
  };
}
