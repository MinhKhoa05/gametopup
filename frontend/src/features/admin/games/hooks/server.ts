import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gamesKeys } from '@/features/games/server';
import { packagesKeys } from '@/features/packages/server';
import { createAdminGame, deleteAdminGame, getAdminGames, updateAdminGame } from '../api';
import type { AdminGameInput, AdminGameSummary } from '../api';

export const adminGamesKeys = {
  all: ['admin', 'games'] as const,
};

export function useCreateAdminGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminGame,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      toast.success('Đã tạo game mới.');
    },
  });
}

export function useUpdateAdminGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminGameInput) => updateAdminGame(payload as Required<Pick<AdminGameInput, 'id'>> & Omit<AdminGameInput, 'id'>),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      toast.success('Đã cập nhật game.');
    },
  });
}

export function useDeleteAdminGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminGame,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      toast.success('Đã xóa game.');
    },
  });
}

export function useAdminGamesQuery() {
  return useQuery<AdminGameSummary[], Error>({
    queryKey: adminGamesKeys.all,
    queryFn: getAdminGames,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    meta: { persist: true },
  });
}

export function useAdminGamesSection() {
  const gamesQuery = useAdminGamesQuery();
  const gameMutations = {
    create: useCreateAdminGameMutation(),
    update: useUpdateAdminGameMutation(),
    remove: useDeleteAdminGameMutation(),
  };

  const games = gamesQuery.data ?? [];
  const loading = gamesQuery.isPending && !gamesQuery.data;
  const busy = [gameMutations.create.isPending, gameMutations.update.isPending, gameMutations.remove.isPending].some(Boolean);

  return {
    busy,
    createGame: async (payload: Parameters<typeof gameMutations.create.mutateAsync>[0]) => {
      await gameMutations.create.mutateAsync(payload);
    },
    games,
    loading,
    removeGame: async (id: number) => {
      await gameMutations.remove.mutateAsync({ id });
    },
    updateGame: async (payload: { id: number; imageFile: File | null; isActive: boolean; name: string }) => {
      await gameMutations.update.mutateAsync(payload);
    },
  };
}
