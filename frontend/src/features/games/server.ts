import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { packagesKeys } from "@/features/packages/server";
import {
  createGame,
  deleteGame,
  getAdminGames,
  getGames,
  updateGame,
} from "./api";
import type { AdminGame, Game, GameInput } from "./types";

const GAMES_STALE_TIME = 1000 * 60 * 60;
const GAMES_GC_TIME = 1000 * 60 * 60;

export const gamesKeys = {
  all: ["games"] as const,
};

export const adminGamesKeys = {
  all: ["admin", "games"] as const,
};

type UpdateGameInput = {
  id: number;
} & GameInput;

function invalidateGameQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: gamesKeys.all });
  queryClient.invalidateQueries({ queryKey: adminGamesKeys.all });
  queryClient.invalidateQueries({ queryKey: packagesKeys.all });
}

export function useGamesQuery<TData = Game[]>(options?: {
  select?: (games: Game[]) => TData;
}) {
  return useQuery<Game[], Error, TData>({
    queryKey: gamesKeys.all,
    queryFn: getGames,
    placeholderData: keepPreviousData,
    staleTime: GAMES_STALE_TIME,
    gcTime: GAMES_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
    select: options?.select,
  });
}

export function useAdminGamesQuery() {
  return useQuery<AdminGame[], Error>({
    queryKey: adminGamesKeys.all,
    queryFn: getAdminGames,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    meta: { persist: true },
  });
}

export function useCreateGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGame,
    onSuccess() {
      invalidateGameQueries(queryClient);
      toast.success("Đã tạo game mới.");
    },
  });
}

export function useUpdateGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateGameInput) =>
      updateGame(id, payload),

    onSuccess() {
      invalidateGameQueries(queryClient);
      toast.success("Đã cập nhật game.");
    },
  });
}

export function useDeleteGameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGame,

    onSuccess() {
      invalidateGameQueries(queryClient);
      toast.success("Đã xóa game.");
    },
  });
}

export function useAdminGamesSection() {
  const gamesQuery = useAdminGamesQuery();

  const createMutation = useCreateGameMutation();
  const updateMutation = useUpdateGameMutation();
  const deleteMutation = useDeleteGameMutation();

  const games = gamesQuery.data ?? [];

  return {
    games,
    loading: gamesQuery.isPending && !gamesQuery.data,
    busy:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    createGame: createMutation.mutateAsync,

    updateGame: (payload: UpdateGameInput) =>
      updateMutation.mutateAsync(payload),

    removeGame: (id: number) => deleteMutation.mutateAsync(id),
  };
}