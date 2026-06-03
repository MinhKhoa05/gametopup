import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from '../common/useAsyncAction';
import { executeBackgroundFetch } from '../common/useBackgroundFetch';
import { useAdminCrud } from '../common/useAdminCrud';
import { getAllPackages } from '../../services/games.api';
import { createGamePackage, updateGamePackage, deleteGamePackage } from '../../services/admin.api';
import { useAdminPackagesStore } from '../../store/admin/admin-packages.store';

export function useAdminPackages(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const { packages, loading } = useAdminPackagesStore(
    useShallow((state) => ({ packages: state.packages, loading: state.loading }))
  );

  async function refresh() {
    const current = useAdminPackagesStore.getState();
    await executeBackgroundFetch({
      hasData: current.packages.length > 0,
      setLoading: current.setLoading,
      setError,
      fetcher: getAllPackages,
      onSuccess: current.setPackages,
    });
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  const crud = useAdminCrud('gói nạp', execute, {
    create: createGamePackage,
    update: updateGamePackage,
    remove: deleteGamePackage
  }, refresh);

  return {
    packages,
    loading,
    refresh,
    createPackage: crud.createItem,
    updatePackage: crud.updateItem,
    removePackage: crud.removeItem,
  };
}
