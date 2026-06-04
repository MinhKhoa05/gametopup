import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api, type ApiResponse } from '../lib/api';
import type { DepositRequest, WalletInfo, WalletTransaction } from '../types';

type WalletData = number | WalletInfo;

type CreateDepositRequestPayload = {
  amount: number;
};

type ConfirmDepositTransferPayload = {
  requestId: number;
};

export const walletQueryKey = ['wallet'] as const;
export const transactionsQueryKey = ['transactions'] as const;
export const depositRequestsQueryKey = ['deposit-requests'] as const;

// ==========================================
// 1. API SERVICES
// ==========================================
export async function getWallet() {
  const response = await api.get<ApiResponse<WalletData>>('/api/wallet');
  const data = response.data.data;
  return typeof data === 'number' ? { balance: data } : data;
}

export async function createDepositRequest(payload: CreateDepositRequestPayload) {
  const response = await api.post<ApiResponse<DepositRequest>>('/api/wallet/deposit-requests', payload);
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

export async function confirmDepositTransfer(payload: ConfirmDepositTransferPayload) {
  const response = await api.post<ApiResponse<DepositRequest>>(`/api/wallet/deposit-requests/${payload.requestId}/confirm-transfer`);
  return response.data.data;
}

// ==========================================
// 2. REACT QUERY HOOKS
// ==========================================
export function useWalletQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: walletQueryKey,
    queryFn: getWallet,
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
    meta: { persist: true },
    staleTime: 1000 * 30,
  });
}

export function useTransactionsQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getWalletTransactions,
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
    meta: { persist: true },
    staleTime: 1000 * 60,
  });
}

export function useDepositRequestsQuery(isLoggedIn: boolean) {
  return useQuery({
    queryKey: depositRequestsQueryKey,
    queryFn: getMyDepositRequests,
    enabled: isLoggedIn,
    placeholderData: keepPreviousData,
    meta: { persist: true },
    staleTime: 1000 * 60,
  });
}

export function useWalletMutations() {
  const queryClient = useQueryClient();

  function refreshWalletData() {
    queryClient.invalidateQueries({ queryKey: walletQueryKey });
    queryClient.invalidateQueries({ queryKey: transactionsQueryKey });
    queryClient.invalidateQueries({ queryKey: depositRequestsQueryKey });
  }

  const createDeposit = useMutation({
    mutationFn: createDepositRequest,
    onSuccess: function handleCreateDepositSuccess() {
      refreshWalletData();
      toast.success('Đã tạo yêu cầu nạp ví. Quét QR và xác nhận khi đã chuyển khoản.');
    },
  });

  const confirmDeposit = useMutation({
    mutationFn: confirmDepositTransfer,
    onSuccess: function handleConfirmDepositSuccess() {
      refreshWalletData();
      toast.success('Đã ghi nhận xác nhận chuyển khoản. Yêu cầu sẽ được duyệt sớm.');
    },
  });

  return { createDeposit, confirmDeposit };
}
