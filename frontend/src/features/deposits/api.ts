import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { ConfirmDepositTransferInput, CreateDepositRequestInput, WalletDepositRequest } from './types';

export async function createDepositRequest(payload: CreateDepositRequestInput) {
  const response = await api.post<ApiResponse<WalletDepositRequest>>('/api/deposits', payload);
  return response.data.data;
}

export async function confirmDepositTransfer({ requestId }: ConfirmDepositTransferInput) {
  const response = await api.post<ApiResponse<WalletDepositRequest>>(`/api/deposits/${requestId}/confirm`);
  return response.data.data;
}
