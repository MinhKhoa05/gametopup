import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import type { AdminGamePackage, GamePackage } from '@/features/games/games.types';
import { allGamePackagesQueryKey, adminPackagesQueryKey } from './keys';
import { createGamePackage, deleteGamePackage, getAllPackages, updateGamePackage } from './api';
import { removeItemById, replaceItemById, syncAllGamePackagesCache, syncAdminPackagesCache } from './cache';
import { ADMIN_DATA_STALE_TIME, useAdminMutation } from './shared';

export function useAdminPackagesQuery() {
  return useQuery({
    queryKey: adminPackagesQueryKey,
    queryFn: getAllPackages,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

function syncPackageLists(queryClient: ReturnType<typeof useQueryClient>, gamePackage: GamePackage) {
  syncAdminPackagesCache(queryClient, (current) => {
    const nextItem = gamePackage as AdminGamePackage;
    return current ? [...current, nextItem] : [nextItem];
  });

  syncAllGamePackagesCache(queryClient, (current, queryKey) => {
    const targetGameId = typeof queryKey[1] === 'number' ? (queryKey[1] as number) : null;
    if (targetGameId !== null && targetGameId !== gamePackage.gameId) {
      return current;
    }
    return current ? [...current, gamePackage] : [gamePackage];
  });
}

function updatePackageLists(queryClient: ReturnType<typeof useQueryClient>, gamePackage: GamePackage) {
  syncAdminPackagesCache(queryClient, (current) => {
    const nextItem = gamePackage as AdminGamePackage;
    return current ? replaceItemById(current, nextItem) ?? [nextItem] : [nextItem];
  });

  syncAllGamePackagesCache(queryClient, (current, queryKey) => {
    const targetGameId = typeof queryKey[1] === 'number' ? (queryKey[1] as number) : null;
    if (targetGameId !== null && targetGameId !== gamePackage.gameId) {
      return current;
    }
    return current ? replaceItemById(current, gamePackage) ?? [gamePackage] : [gamePackage];
  });
}

export function useAdminPackageMutations() {
  const queryClient = useQueryClient();

  const create = useAdminMutation({
    mutationFn: createGamePackage,
    successMessage: 'Đã tạo gói nạp mới.',
    queryKeys: [adminPackagesQueryKey, allGamePackagesQueryKey],
    onSuccess(gamePackage) {
      syncPackageLists(queryClient, gamePackage);
    },
  });

  const update = useAdminMutation({
    mutationFn: updateGamePackage,
    successMessage: 'Đã cập nhật gói nạp.',
    queryKeys: [adminPackagesQueryKey, allGamePackagesQueryKey],
    onSuccess(gamePackage) {
      updatePackageLists(queryClient, gamePackage);
    },
  });

  const remove = useAdminMutation({
    mutationFn: deleteGamePackage,
    successMessage: 'Đã xóa gói nạp.',
    queryKeys: [adminPackagesQueryKey, allGamePackagesQueryKey],
    onSuccess(_data, variables) {
      syncAdminPackagesCache(queryClient, (current) => removeItemById(current, variables.id));
      syncAllGamePackagesCache(queryClient, (current) => removeItemById(current, variables.id));
    },
  });

  return { create, update, remove };
}
