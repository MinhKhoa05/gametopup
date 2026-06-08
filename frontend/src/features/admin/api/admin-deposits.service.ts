import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { depositRequestsQueryKey, transactionsQueryKey, walletQueryKey } from '@/features/wallet/api/wallet';
import { ADMIN_DATA_STALE_TIME, useAdminMutation } from './shared';
import { adminDepositRequestsQueryKey } from './keys';
import { approveDepositRequest, getAdminDepositRequests, rejectDepositRequest } from './api';

export function useAdminDepositRequestsQuery() {
  return useQuery({
    queryKey: adminDepositRequestsQueryKey,
    queryFn: getAdminDepositRequests,
    placeholderData: keepPreviousData,
    staleTime: ADMIN_DATA_STALE_TIME,
  });
}

export function useAdminDepositRequestMutations() {
  const queryKeys = [adminDepositRequestsQueryKey, depositRequestsQueryKey, walletQueryKey, transactionsQueryKey] as const;

  const approve = useAdminMutation({
    mutationFn: approveDepositRequest,
    successMessage: 'Đã duyệt yêu cầu nạp tiền.',
    queryKeys,
  });

  const reject = useAdminMutation({
    mutationFn: rejectDepositRequest,
    successMessage: 'Đã từ chối yêu cầu nạp tiền.',
    queryKeys,
  });

  return { approve, reject };
}
