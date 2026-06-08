import { useQueryClient } from '@tanstack/react-query';
import { GAMES_QUERY_KEY } from '@/features/games/api/games';
import { createGame, deleteGame, updateGame } from './api';
import { allGamePackagesQueryKey, adminPackagesQueryKey } from './keys';
import { removeItemById, syncGamesCache } from './cache';
import { useAdminMutation } from './shared';

export function useAdminGameMutations() {
  const queryClient = useQueryClient();

  const create = useAdminMutation({
    mutationFn: createGame,
    successMessage: 'Đã tạo game mới.',
    queryKeys: [GAMES_QUERY_KEY, adminPackagesQueryKey],
    onSuccess(game) {
      syncGamesCache(queryClient, (current) => (current ? [...current, game] : [game]));
    },
  });

  const update = useAdminMutation({
    mutationFn: updateGame,
    successMessage: 'Đã cập nhật game.',
    queryKeys: [GAMES_QUERY_KEY, adminPackagesQueryKey],
    onSuccess(game) {
      syncGamesCache(queryClient, (current) => (current ? current.map((item) => (item.id === game.id ? game : item)) : [game]));
    },
  });

  const remove = useAdminMutation({
    mutationFn: deleteGame,
    successMessage: 'Đã xóa game.',
    queryKeys: [GAMES_QUERY_KEY, adminPackagesQueryKey, allGamePackagesQueryKey],
    onSuccess(_data, variables) {
      syncGamesCache(queryClient, (current) => removeItemById(current, variables.id));
    },
  });

  return { create, update, remove };
}
