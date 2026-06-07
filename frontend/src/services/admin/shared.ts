import { type QueryClient, type QueryKey, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const ADMIN_DATA_STALE_TIME = 1000 * 60 * 5;
export const ADMIN_ORDERS_STALE_TIME = 1000 * 30;

export function refreshAdminData(queryClient: QueryClient, queryKeys: ReadonlyArray<QueryKey>) {
  for (const queryKey of queryKeys) {
    queryClient.invalidateQueries({ queryKey });
  }
}

type UseAdminMutationOptions<TVariables, TData> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  successMessage: string;
  queryKeys: ReadonlyArray<QueryKey>;
  onSuccess?: (data: TData, variables: TVariables) => void;
};

export function useAdminMutation<TVariables, TData = unknown>({
  mutationFn,
  successMessage,
  queryKeys,
  onSuccess,
}: UseAdminMutationOptions<TVariables, TData>) {
  const queryClient = useQueryClient();

  return useMutation<TData, unknown, TVariables>({
    mutationFn,
    onSuccess(data, variables) {
      onSuccess?.(data, variables);
      refreshAdminData(queryClient, queryKeys);
      toast.success(successMessage);
    },
  });
}
