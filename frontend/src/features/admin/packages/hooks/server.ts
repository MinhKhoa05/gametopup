import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { gamesKeys } from '@/features/games/server';
import { packagesKeys } from '@/features/packages/server';
import { adminGamesKeys } from '@/features/admin/games/hooks';
import { adminPackagesKeys, createAdminPackage, deleteAdminPackage, getAdminPackages, updateAdminPackage } from '../api';

const STALE_TIME = 1000 * 60 * 5;

export function useAdminPackagesQuery() {
  return useQuery({
    queryKey: adminPackagesKeys.all,
    queryFn: getAdminPackages,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useCreateAdminPackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminPackage,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPackagesKeys.all });
      toast.success('Đã tạo gói nạp mới.');
    },
  });
}

export function useUpdateAdminPackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminPackage,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPackagesKeys.all });
      toast.success('Đã cập nhật gói nạp.');
    },
  });
}

export function useDeleteAdminPackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminPackage,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gamesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
      queryClient.invalidateQueries({ queryKey: packagesKeys.all });
      queryClient.invalidateQueries({ queryKey: adminPackagesKeys.all });
      toast.success('Đã xóa gói nạp.');
    },
  });
}

export function useAdminPackagesSection() {
  const packagesQuery = useAdminPackagesQuery();
  const packageMutations = {
    create: useCreateAdminPackageMutation(),
    update: useUpdateAdminPackageMutation(),
    remove: useDeleteAdminPackageMutation(),
  };

  const packages = packagesQuery.data ?? [];
  const loading = packagesQuery.isPending && !packagesQuery.data;
  const busy = [packageMutations.create.isPending, packageMutations.update.isPending, packageMutations.remove.isPending].some(Boolean);

  return {
    busy,
    createPackage: async (payload: Parameters<typeof packageMutations.create.mutateAsync>[0]) => {
      await packageMutations.create.mutateAsync(payload);
    },
    loading,
    packages,
    removePackage: async (id: number) => {
      await packageMutations.remove.mutateAsync({ id });
    },
    updatePackage: async (payload: {
      id: number;
      imageFile: File | null;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      availableSlots: number;
    }) => {
      await packageMutations.update.mutateAsync(payload);
    },
  };
}
