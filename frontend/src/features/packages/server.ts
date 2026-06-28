import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { gameKeys } from "@/features/games/server";
import type { GamePackage, GamePackageInput } from "@/features/packages/types";

import {
  createPackage,
  deletePackage,
  getAdminPackages,
  getGamePackagesByGame,
  updatePackage,
} from "./api";

const HOUR = 1000 * 60 * 60;
const ADMIN_STALE_TIME = 1000 * 60 * 5;

export const packageKeys = {
  byGame: (gameId: number) => ["packages", gameId] as const,

  adminByGame: (gameId: number) => ["admin", "packages", gameId] as const,
};

export function usePackagesQuery<TData = GamePackage[]>(
  gameId: number | null | undefined,
  options?: {
    select?: (packages: GamePackage[]) => TData;
  },
) {
  return useQuery<GamePackage[], Error, TData>({
    queryKey: packageKeys.byGame(gameId as number),
    queryFn: () => getGamePackagesByGame(gameId as number),
    enabled: gameId != null,
    placeholderData: keepPreviousData,
    staleTime: HOUR,
    gcTime: HOUR,
    refetchOnWindowFocus: false,
    meta: { persist: true },
    select: options?.select,
  });
}

export function useAdminPackagesQuery(gameId: number) {
  return useQuery({
    queryKey: packageKeys.adminByGame(gameId),
    queryFn: () => getAdminPackages(gameId),
    placeholderData: keepPreviousData,
    staleTime: ADMIN_STALE_TIME,
  });
}

export function useCreatePackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      gameId,
      input,
    }: {
      gameId: number;
      input: GamePackageInput;
    }) => createPackage(gameId, input),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: gameKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: gameKeys.admin,
      });

      toast.success("Đã tạo gói nạp mới.");
    },
  });
}

export function useUpdatePackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GamePackageInput }) =>
      updatePackage(id, input),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: gameKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: gameKeys.admin,
      });

      toast.success("Đã cập nhật gói nạp.");
    },
  });
}

export function useDeletePackageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePackage,

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: gameKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: gameKeys.admin,
      });

      toast.success("Đã xóa gói nạp.");
    },
  });
}
