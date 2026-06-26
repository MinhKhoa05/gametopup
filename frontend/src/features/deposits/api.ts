import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { ConfirmDepositTransferInput, CreateDepositRequestInput, WalletDeposit, WalletDepositStatus } from './types';

export async function createDepositRequest(payload: CreateDepositRequestInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>('/api/deposits', payload);
  return response.data.data;
}

export async function confirmDepositTransfer({ requestId }: ConfirmDepositTransferInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>(`/api/deposits/${requestId}/confirm`);
  return response.data.data;
}

export async function getMyDepositRequest() {
  const response = await api.get<ApiResponse<WalletDeposit[]>>(`/api/deposits`);
  return response.data.data;
}