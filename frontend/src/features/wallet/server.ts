import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  confirmDepositTransfer,
  createDepositRequest,
  getMyDepositRequests,
  getWalletBalance,
  getWalletTransactions,
} from './api';
import type { ConfirmDepositTransferInput, CreateDepositRequestInput } from './types';

export const walletKeys = {
  all: ['wallet'] as const,
  balance: ['wallet', 'balance'] as const,
  transactions: ['wallet', 'transactions'] as const,
  depositRequests: ['wallet', 'deposit-requests'] as const,
};

export function useWalletBalanceQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: getWalletBalance,
    enabled,
  });
}

export function useWalletTransactionsQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.transactions,
    queryFn: getWalletTransactions,
    enabled,
  });
}

export function useMyDepositRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.depositRequests,
    queryFn: getMyDepositRequests,
    enabled,
  });
}

export function useCreateDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepositRequestInput) => createDepositRequest(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã tạo yêu cầu nạp tiền.');
    },
  });
}

export function useConfirmDepositTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmDepositTransferInput) => confirmDepositTransfer(payload),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã xác nhận chuyển khoản.');
    },
  });
}
