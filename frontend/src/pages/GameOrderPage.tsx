import { EmptyState } from '../components/ui/EmptyState';
import { GameOrderWizard } from '../components/game-order/GameOrderWizard';
import type { Route } from '../lib/routes';

export function GameOrderPage({
  route,
  navigate,
}: {
  route: Route;
  navigate: (route: Route) => void;
}) {
  const gameId = route.name === 'games' ? route.gameId : undefined;

  if (!gameId) {
    return <EmptyState>Không tìm thấy game.</EmptyState>;
  }

  return <GameOrderWizard gameId={gameId} navigate={navigate} />;
}
