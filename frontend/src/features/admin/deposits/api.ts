import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { DepositRequest } from '@/features/wallet/types';

export const adminDepositsKeys = {
  all: ['admin', 'deposits'] as const,
};

export type AdminDepositReviewInput = {
  note?: string;
  requestId: number;
};

export async function getAdminDepositRequests() {
  const response = await api.get<ApiResponse<DepositRequest[]>>('/api/wallet/deposit-requests');
  return response.data.data;
}

export async function approveAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<DepositRequest>>(`/api/wallet/deposit-requests/${payload.requestId}/approve`, body);
  return response.data.data;
}

export async function rejectAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<DepositRequest>>(`/api/wallet/deposit-requests/${payload.requestId}/reject`, body);
  return response.data.data;
}
