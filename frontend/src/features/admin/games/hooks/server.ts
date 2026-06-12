import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gamesKeys, useGamesQuery } from '@/features/games/server';
import { packagesKeys } from '@/features/packages/server';
import { createAdminGame, deleteAdminGame, updateAdminGame } from '../api';
import type { AdminGameInput } from '../api';

export function useCreateAdminGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<AdminGameInput, 'id'>) => createAdminGame(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
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
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      toast.success('Đã cập nhật game.');
    },
  });
}

export function useDeleteAdminGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Required<Pick<AdminGameInput, 'id'>>) => deleteAdminGame(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      toast.success('Đã xóa game.');
    },
  });
}

export function useAdminGamesQuery() {
  return useGamesQuery();
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
