import { api } from '@/shared/api/client';
import { getCursorPage } from '@/shared/api/pagination';
import type { ApiResponse } from '@/shared/types/api';
import type { CursorParams } from '@/shared/types/pagination';
import type {
  DepositReviewRequest,
  ConfirmDepositTransferInput,
  CreateDepositRequestInput,
  WalletDeposit,
  WalletDepositFilter,
} from './types';

export type DepositReviewFilter = WalletDepositFilter | null;

export type DepositReviewInput = {
  note?: string;
  requestId: number;
};

export async function createDepositRequest(payload: CreateDepositRequestInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>('/api/deposits', payload);
  return response.data.data;
}

export async function confirmDepositTransfer({ requestId }: ConfirmDepositTransferInput) {
  const response = await api.post<ApiResponse<WalletDeposit>>(`/api/deposits/${requestId}/confirm`);
  return response.data.data;
}

type DepositRequestParams = CursorParams<WalletDepositFilter>;

export async function getDepositRequests(params: DepositRequestParams = {}) {
  return getCursorPage<WalletDeposit, WalletDepositFilter>(
    '/api/deposits',
    params,
  );
}

function buildDepositReviewBody(note?: string) {
  const trimmedNote = note?.trim();
  return trimmedNote ? { note: trimmedNote } : {};
}

// ---------- REVIEW ----------

type DepositReviewParams = CursorParams<WalletDepositFilter>;

export async function getDepositReviewRequests(params: DepositReviewParams = {}) {
  return getCursorPage<DepositReviewRequest, WalletDepositFilter>(
    '/api/admin/deposits',
    params,
  );
}

export async function approveDepositRequest(payload: DepositReviewInput) {
  const body = buildDepositReviewBody(payload.note);
  const response = await api.post<ApiResponse<DepositReviewRequest>>(`/api/admin/deposits/${payload.requestId}/approve`, body);
  return response.data.data;
}

export async function rejectDepositRequest(payload: DepositReviewInput) {
  const body = buildDepositReviewBody(payload.note);
  const response = await api.post<ApiResponse<DepositReviewRequest>>(`/api/admin/deposits/${payload.requestId}/reject`, body);
  return response.data.data;
}
