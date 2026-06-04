import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiResponse } from '../lib/api';
import { DepositRequest, WalletInfo, WalletTransaction } from '../types';

// ==========================================
// 1. API SERVICES (pure server calls)
// ==========================================
type WalletData = number | WalletInfo;

export async function getWallet() {
  const response = await api.get<ApiResponse<WalletData>>('/api/wallet');
  const data = response.data.data;

  return typeof data === 'number' ? { balance: data } : data;
}

export async function createDepositRequest(amount: number) {
  const response = await api.post<ApiResponse<DepositRequest>>('/api/wallet/deposit-requests', {
    amount,
  });

  return response.data.data;
}

export async function getWalletTransactions() {
  const response = await api.get<ApiResponse<WalletTransaction[]>>('/api/wallet/transactions');
  return response.data.data;
}

export async function getMyDepositRequests() {
  const response = await api.get<ApiResponse<DepositRequest[]>>('/api/wallet/deposit-requests/me');
  return response.data.data;
}

export async function confirmDepositTransfer(requestId: number) {
  const response = await api.post<ApiResponse<DepositRequest>>(
    `/api/wallet/deposit-requests/${requestId}/confirm-transfer`,
  );

  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS (cache / SWR / background revalidate)
// ==========================================
// Wallet data is tied to the current session; auth changes clear these queries explicitly.
export const walletQueryKey = ['wallet'] as const;
export const transactionsQueryKey = ['transactions'] as const;
export const depositRequestsQueryKey = ['deposit-requests'] as const;
const WALLET_STALE_TIME = 1000 * 60 * 2;
const WALLET_ACTIVITY_STALE_TIME = 1000 * 60 * 2;

export function useWalletQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: walletQueryKey,
    queryFn: getWallet,
    enabled: isLoggedIn,
    placeholderData: (previousData) => previousData,
    staleTime: WALLET_STALE_TIME,
  });
}

export function useTransactionsQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getWalletTransactions,
    enabled: isLoggedIn,
    placeholderData: (previousData) => previousData,
    staleTime: WALLET_ACTIVITY_STALE_TIME,
  });
}

export function useDepositRequestsQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: depositRequestsQueryKey,
    queryFn: getMyDepositRequests,
    enabled: isLoggedIn,
    placeholderData: (previousData) => previousData,
    staleTime: WALLET_ACTIVITY_STALE_TIME,
  });
}

export function useCreateDepositMutation(onSuccess: (request: DepositRequest) => Promise<void> | void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepositRequest,
    onSuccess: async (request) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: walletQueryKey }),
        queryClient.invalidateQueries({ queryKey: transactionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: depositRequestsQueryKey }),
      ]);

      await onSuccess(request);
    },
  });
}

export function useConfirmDepositMutation(onSuccess: (request: DepositRequest) => Promise<void> | void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmDepositTransfer,
    onSuccess: async (request) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: walletQueryKey }),
        queryClient.invalidateQueries({ queryKey: transactionsQueryKey }),
        queryClient.invalidateQueries({ queryKey: depositRequestsQueryKey }),
      ]);

      await onSuccess(request);
    },
  });
}

export function useRefreshWalletQuery() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: walletQueryKey }),
      queryClient.invalidateQueries({ queryKey: transactionsQueryKey }),
      queryClient.invalidateQueries({ queryKey: depositRequestsQueryKey }),
    ]);
  };
}
