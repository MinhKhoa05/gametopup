import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type { WalletStats, WalletTransaction, WalletTransactionFilter } from './types';

export async function getWalletBalance() {
  const response = await api.get<ApiResponse<number>>('/api/wallet');
  return response.data.data;
}

export async function getWalletStats() {
  const response = await api.get<ApiResponse<WalletStats>>('/api/wallet/stats');
  return response.data.data;
}

type WalletTransactionParams = CursorParams<WalletTransactionFilter>;

export async function getWalletTransactions(
  params: WalletTransactionParams = {},
) {
  return getCursorPage<WalletTransaction, WalletTransactionFilter>(
    '/api/wallet/transactions',
    params,
  );
}
