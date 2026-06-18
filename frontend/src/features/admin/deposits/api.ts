import { api } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/types/api';
import type { AdminDepositRequest } from '@/features/deposits/types';

export const adminDepositsKeys = {
  all: ['admin', 'deposits'] as const,
};

export type AdminDepositReviewInput = {
  note?: string;
  requestId: number;
};

export async function getAdminDepositRequests() {
  const response = await api.get<ApiResponse<AdminDepositRequest[]>>('/api/admin/deposits');
  return response.data.data;
}

export async function approveAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/admin/deposits/${payload.requestId}/approve`, body);
  return response.data.data;
}

export async function rejectAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = payload.note?.trim() ? { note: payload.note.trim() } : {};
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/admin/deposits/${payload.requestId}/reject`, body);
  return response.data.data;
}
