import { useEffect, useMemo, useState } from 'react';
import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
import type { AdminDepositRequest } from '@/features/deposits/types';

type DepositRequestFilter = 'active' | 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected';

const DEPOSIT_REQUEST_FILTERS: Array<{ key: DepositRequestFilter; label: string }> = [
  { key: 'active', label: 'Cần xử lý' },
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ chuyển khoản' },
  { key: 'user-confirmed', label: 'Đã xác nhận' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

export function useAdminDepositRequestsPageState({
  onApproveRequest,
  onRejectRequest,
  requests,
}: {
  onApproveRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  onRejectRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  requests: AdminDepositRequest[];
}) {
  const [filter, setFilter] = useState<DepositRequestFilter>('active');
  const [query, setQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesFilter =
        (filter === 'active' && (request.status === 1 || request.status === 2)) ||
        filter === 'all' ||
        (filter === 'pending' && request.status === 1) ||
        (filter === 'user-confirmed' && request.status === 2) ||
        (filter === 'approved' && request.status === 3) ||
        (filter === 'rejected' && request.status === 4);

      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [
        String(request.id),
        String(request.userId),
        String(request.amount),
        request.code,
        getDepositRequestStatus(request.status).label,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, query, requests]);

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

  const selectedStatus = selectedRequest ? getDepositRequestStatus(selectedRequest.status) : null;

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
    selectedStatus,
    selectRequest,
    setFilter,
    setQuery,
    setReviewNote,
  };
}
