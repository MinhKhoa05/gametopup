import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { walletKeys } from '@/features/wallet/server';
import { adminDepositsKeys, approveAdminDepositRequest, getAdminDepositRequests, rejectAdminDepositRequest } from '../api';
import type { AdminDepositReviewInput } from '../api';

const STALE_TIME = 1000 * 60 * 5;

export function useAdminDepositRequestsQuery() {
  return useQuery({
    queryKey: adminDepositsKeys.all,
    queryFn: getAdminDepositRequests,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useApproveAdminDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminDepositReviewInput) => approveAdminDepositRequest(payload),
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
    mutationFn: (payload: AdminDepositReviewInput) => rejectAdminDepositRequest(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: adminDepositsKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã từ chối yêu cầu nạp tiền.');
    },
  });
}

export function useAdminDepositRequestsSection() {
  const requestsQuery = useAdminDepositRequestsQuery();
  const requestMutations = {
    approve: useApproveAdminDepositRequestMutation(),
    reject: useRejectAdminDepositRequestMutation(),
  };

  const requests = requestsQuery.data ?? [];
  const loading = requestsQuery.isPending && !requestsQuery.data;
  const busy = [requestMutations.approve.isPending, requestMutations.reject.isPending].some(Boolean);

  return {
    approveRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.approve.mutateAsync(payload);
    },
    busy,
    loading,
    rejectRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.reject.mutateAsync(payload);
    },
    requests,
  };
}
