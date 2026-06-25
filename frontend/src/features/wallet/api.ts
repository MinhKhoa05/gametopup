import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { WalletOverview } from './types';

export async function getWalletBalance() {
  const response = await api.get<ApiResponse<number>>('/api/wallet');
  return response.data.data;
}

export async function getWalletOverview() {
  const response = await api.get<ApiResponse<WalletOverview>>('/api/wallet/transactions');
  return response.data.data;
}
