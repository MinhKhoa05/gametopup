import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type { WalletTransaction, WalletTransactionFilter } from './types';

export async function getWalletBalance() {
  const response = await api.get<ApiResponse<number>>('/api/wallet');
  return response.data.data;
}

export type WalletTransactionCursorParams = CursorParams<WalletTransactionFilter>;

export async function getWalletTransactionsCursor(
  params: WalletTransactionCursorParams = {},
) {
  return getCursorPage<WalletTransaction, WalletTransactionFilter>(
    '/api/wallet/transactions',
    params,
  );
}

export async function getWalletTransactions(limit?: number) {
  const page = await getWalletTransactionsCursor({ limit });
  return page.items;
}
