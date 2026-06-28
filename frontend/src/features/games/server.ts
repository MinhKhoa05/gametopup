import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createGame,
  deleteGame,
  getAdminGames,
  getGames,
  updateGame,
} from "./api";
import type { AdminGame, Game, GameInput } from "./types";

const HOUR = 1000 * 60 * 60;
const ADMIN_STALE_TIME = 1000 * 60 * 5;

export const gameKeys = {
  all: ["games"] as const,
  admin: ["admin", "games"] as const,
};

export function useGamesQuery<TData = Game[]>(options?: {
  select?: (games: Game[]) => TData;
}) {
  return useQuery<Game[], Error, TData>({
    queryKey: gameKeys.all,
    queryFn: getGames,
    placeholderData: keepPreviousData,
    staleTime: HOUR,
    gcTime: HOUR,
    refetchOnWindowFocus: false,
    meta: { persist: true },
    select: options?.select,
  });
}

// ---------- ADMIN ----------

export function useAdminGamesQuery() {
  return useQuery<AdminGame[]>({
    queryKey: gameKeys.admin,
    queryFn: getAdminGames,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_STALE_TIME,
    meta: { persist: true },
  });
}

export function useCreateGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGame,

    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.invalidateQueries({ queryKey: gameKeys.admin });

      toast.success("Đã tạo game mới.");
    },
  });
}

export function useUpdateGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: GameInput }) =>
      updateGame(id, input),

    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.invalidateQueries({ queryKey: gameKeys.admin });

      toast.success("Đã cập nhật game.");
    },
  });
}

export function useDeleteGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGame,

    onSuccess() {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      queryClient.invalidateQueries({ queryKey: gameKeys.admin });

      toast.success("Đã xóa game.");
    },
  });
}
