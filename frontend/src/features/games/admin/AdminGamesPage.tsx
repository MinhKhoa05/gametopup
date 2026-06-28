import { useAdminGamesPageState, useAdminGamesSection } from '@/features/games/admin/hooks';
import { GamesAdminContent } from './components/GamesAdminContent';

export function AdminGamesPage() {
  const section = useAdminGamesSection();
  const state = useAdminGamesPageState({
    games: section.games,
    onCreateGame: section.createGame,
    onDeleteGame: section.removeGame,
    onUpdateGame: section.updateGame,
  });

  return <GamesAdminContent busy={section.busy} loading={section.loading} state={state} />;
}
