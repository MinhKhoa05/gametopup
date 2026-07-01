import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { walletKeys } from '@/features/wallet/server';
import type { AdminDepositRequest } from '@/features/deposits/types';
import { useCursorPageQuery } from '@/shared/hooks/useCursorPageQuery';
import { adminDepositsKeys, approveAdminDepositRequest, getAdminDepositRequests, getAdminDepositRequestsCursor, rejectAdminDepositRequest } from '../api';
import type { AdminDepositFilter } from '../api';

const STALE_TIME = 1000 * 60 * 5;
const ADMIN_DEPOSITS_PAGE_SIZE = 20;

export function useAdminDepositRequestsQuery(limit?: number) {
  return useQuery({
    queryKey: adminDepositsKeys.all,
    queryFn: () => getAdminDepositRequests(limit),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useAdminDepositRequestsCursorQuery(filter: AdminDepositFilter) {
  return useCursorPageQuery<AdminDepositRequest>({
    queryKey: adminDepositsKeys.cursor(filter),
    queryFn: (cursor) =>
      getAdminDepositRequestsCursor({
        cursor,
        filter,
        limit: ADMIN_DEPOSITS_PAGE_SIZE,
      }),
    keepPreviousData: true,
    staleTime: STALE_TIME,
  });
}

export function useApproveAdminDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveAdminDepositRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminDepositsKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã duyệt yêu cầu nạp tiền.');
    },
  });
}

export function useRejectAdminDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectAdminDepositRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminDepositsKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã từ chối yêu cầu nạp tiền.');
    },
  });
}

export function useAdminDepositRequestsSection(filter: AdminDepositFilter = null) {
  const requestsQuery = useAdminDepositRequestsCursorQuery(filter);
  const requestMutations = {
    approve: useApproveAdminDepositRequestMutation(),
    reject: useRejectAdminDepositRequestMutation(),
  };

  const requests = requestsQuery.items;
  const loading = requestsQuery.isPending && requestsQuery.data === undefined;
  const busy = [requestMutations.approve.isPending, requestMutations.reject.isPending].some(Boolean);

  return {
    approveRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.approve.mutateAsync(payload);
    },
    busy,
    hasMore: requestsQuery.hasMore,
    isLoadingMore: requestsQuery.isLoadingMore,
    loadMore: requestsQuery.loadMore,
    loading,
    rejectRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.reject.mutateAsync(payload);
    },
    requests,
  };
}
