import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from '../common/useAsyncAction';
import { executeBackgroundFetch } from '../common/useBackgroundFetch';
import { useAdminCrud } from '../common/useAdminCrud';
import { getGames } from '../../services/games.api';
import { createGame, updateGame, deleteGame } from '../../services/admin.api';
import { useAdminGamesStore } from '../../store/admin/admin-games.store';

export function useAdminGames(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const { games, loading } = useAdminGamesStore(
    useShallow((state) => ({ games: state.games, loading: state.loading }))
  );

  async function refresh() {
    const current = useAdminGamesStore.getState();
    await executeBackgroundFetch({
      hasData: current.games.length > 0,
      setLoading: current.setLoading,
      setError,
      fetcher: getGames,
      onSuccess: current.setGames,
    });
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  const crud = useAdminCrud('game', execute, {
    create: createGame,
    update: updateGame,
    remove: deleteGame
  }, refresh);

  return {
    games,
    loading,
    refresh,
    createGame: crud.createItem,
    updateGame: crud.updateItem,
    removeGame: crud.removeItem,
  };
}
