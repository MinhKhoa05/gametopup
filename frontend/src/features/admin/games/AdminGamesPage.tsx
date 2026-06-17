import { useAdminPackagesQuery } from '@/features/admin/packages/hooks';
import { useAdminGamesPageState, useAdminGamesSection } from './hooks';
import { GamesAdminPanel } from '@/features/admin/games/components/GamesAdminPanel';

export function AdminGamesPage() {
  const section = useAdminGamesSection();
  const packagesQuery = useAdminPackagesQuery();
  const state = useAdminGamesPageState({
    games: section.games,
    onCreateGame: section.createGame,
    onDeleteGame: section.removeGame,
    onUpdateGame: section.updateGame,
  });

  return <GamesAdminPanel busy={section.busy} loading={section.loading} packages={packagesQuery.data ?? []} packagesLoading={packagesQuery.isPending && !packagesQuery.data} state={state} />;
}
