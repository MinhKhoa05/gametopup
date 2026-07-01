import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type { AdminDepositRequest, WalletDepositFilter } from '@/features/deposits/types';

export const adminDepositsKeys = {
  all: ['admin', 'deposits'] as const,
  list: (filter: AdminDepositFilter) => ['admin', 'deposits', 'list', filter] as const,
};

export type AdminDepositFilter = WalletDepositFilter | null;

export type AdminDepositReviewInput = {
  note?: string;
  requestId: number;
};

function buildDepositReviewBody(note?: string) {
  const trimmedNote = note?.trim();
  return trimmedNote ? { note: trimmedNote } : {};
}

type AdminDepositParams = CursorParams<WalletDepositFilter>;

export async function getAdminDepositRequests(params: AdminDepositParams = {}) {
  return getCursorPage<AdminDepositRequest, WalletDepositFilter>(
    '/api/admin/deposits',
    params,
  );
}

export async function approveAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = buildDepositReviewBody(payload.note);
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/admin/deposits/${payload.requestId}/approve`, body);
  return response.data.data;
}

export async function rejectAdminDepositRequest(payload: AdminDepositReviewInput) {
  const body = buildDepositReviewBody(payload.note);
  const response = await api.post<ApiResponse<AdminDepositRequest>>(`/api/admin/deposits/${payload.requestId}/reject`, body);
  return response.data.data;
}
