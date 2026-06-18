import { useAdminGamesQuery } from '@/features/admin/games/hooks';
import { useAdminPackagesPageState, useAdminPackagesSection } from './hooks';
import { PackagesAdminPanel } from '@/features/admin/packages/components/PackagesAdminPanel';

export function AdminPackagesPage() {
  const section = useAdminPackagesSection();
  const gamesQuery = useAdminGamesQuery();
  const games = gamesQuery.data ?? [];
  const state = useAdminPackagesPageState({
    games,
    packages: section.packages,
    onCreatePackage: section.createPackage,
    onDeletePackage: section.removePackage,
    onUpdatePackage: section.updatePackage,
  });

  return <PackagesAdminPanel busy={section.busy} games={games} loading={section.loading} state={state} />;
}
