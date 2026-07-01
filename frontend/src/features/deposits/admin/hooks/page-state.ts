import { useEffect, useMemo, useState } from 'react';
import type { AdminDepositRequest } from '@/features/deposits/types';
import type { AdminDepositFilter } from '../api';

const DEPOSIT_REQUEST_FILTERS: Array<{ key: AdminDepositFilter; label: string }> = [
  { key: 'active', label: 'Cần xử lý' },
  { key: null, label: 'Tất cả' },
  { key: 'pending', label: 'Chờ chuyển khoản' },
  { key: 'userConfirmed', label: 'Đã xác nhận' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

export function useAdminDepositRequestsPageState({
  filter,
  onApproveRequest,
  onRejectRequest,
  requests,
  setFilter,
}: {
  filter: AdminDepositFilter;
  onApproveRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  onRejectRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  requests: AdminDepositRequest[];
  setFilter: (filter: AdminDepositFilter) => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return requests;
    }

    return requests.filter((request) =>
      [
        String(request.id),
        String(request.userId),
        String(request.amount),
        request.code,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, requests]);

  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? null;

  useEffect(() => {
    if (selectedRequest) return;
    if (filteredRequests.length === 0) return;

    const firstRequest = filteredRequests[0];
    setSelectedRequestId(firstRequest.id);
    setReviewNote(firstRequest.adminNote ?? '');
  }, [filteredRequests, selectedRequest]);

  function selectRequest(request: AdminDepositRequest) {
    setSelectedRequestId(request.id);
    setReviewNote(request.adminNote ?? '');
  }

  function clearSelection() {
    setSelectedRequestId(null);
    setReviewNote('');
  }

  function resetFilters() {
    setFilter('active');
    setQuery('');
  }

  async function reviewRequest(action: 'approve' | 'reject', request: AdminDepositRequest, note = reviewNote) {
    const payload = {
      note: note.trim() || undefined,
      requestId: request.id,
    };

    if (action === 'approve') {
      await onApproveRequest(payload);
    } else {
      await onRejectRequest(payload);
    }

    clearSelection();
  }

  return {
    filters: DEPOSIT_REQUEST_FILTERS,
    clearSelection,
    filter,
    filteredRequests,
    query,
    resetFilters,
    reviewNote,
    reviewRequest,
    selectedRequest,
    selectRequest,
    setFilter,
    setQuery,
    setReviewNote,
  };
}
