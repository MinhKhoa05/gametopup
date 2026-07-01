import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type { ConfirmDepositTransferInput, CreateDepositRequestInput, WalletDeposit, WalletDepositFilter } from './types';

export async function createDepositRequest(payload: CreateDepositRequestInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>('/api/deposits', payload);
  return response.data.data;
}

export async function confirmDepositTransfer({ requestId }: ConfirmDepositTransferInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>(`/api/deposits/${requestId}/confirm`);
  return response.data.data;
}

export type DepositCursorParams = CursorParams<WalletDepositFilter>;

export async function getMyDepositRequestCursor(params: DepositCursorParams = {}) {
  return getCursorPage<WalletDeposit, WalletDepositFilter>(
    '/api/deposits',
    params,
  );
}

export async function getMyDepositRequest(limit?: number) {
  const page = await getMyDepositRequestCursor({ limit });
  return page.items;
}
