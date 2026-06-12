import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type {
  ConfirmDepositTransferInput,
  CreateDepositRequestInput,
  DepositRequest,
  WalletTransaction,
} from './types';

export async function getWalletBalance() {
  const response = await api.get<ApiResponse<number>>('/api/wallet');
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

export async function createDepositRequest(payload: CreateDepositRequestInput) {
  const response = await api.post<ApiResponse<DepositRequest>>('/api/wallet/deposit-requests', payload);
  return response.data.data;
}

export async function confirmDepositTransfer({ requestId }: ConfirmDepositTransferInput) {
  const response = await api.post<ApiResponse<DepositRequest>>(
    `/api/wallet/deposit-requests/${requestId}/confirm-transfer`,
  );
  return response.data.data;
}
