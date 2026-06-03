import { api, ApiResponse } from '../lib/api';
import { DepositRequest, WalletInfo, WalletTransaction } from '../types';

export async function getWallet() {
  const response = await api.get<ApiResponse<number | WalletInfo>>('/api/wallet');
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
