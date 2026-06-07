import { useEffect, useMemo, useState } from 'react';
import { getDepositRequestStatus } from '../../helpers/wallet-activity.helpers';
import type { AdminDepositRequest } from '../../types';
import { useAdminDepositRequestMutations, useAdminDepositRequestsQuery } from '../../services/admin/admin-deposits.service';

export function useAdminDepositRequestsSection() {
  const requestsQuery = useAdminDepositRequestsQuery();
  const requestMutations = useAdminDepositRequestMutations();

  const requests = requestsQuery.data ?? [];
  const loading = requestsQuery.isPending && !requestsQuery.data;
  const busy = [requestMutations.approve.isPending, requestMutations.reject.isPending].some(Boolean);

  return {
    approveRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.approve.mutateAsync(payload);
    },
    busy,
    loading,
    rejectRequest: async (payload: { note?: string; requestId: number }) => {
      await requestMutations.reject.mutateAsync(payload);
    },
    requests,
  };
}

type DepositRequestFilter = 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected';

const FILTERS: Array<{ key: DepositRequestFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ chuyển khoản' },
  { key: 'user-confirmed', label: 'Đã xác nhận' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

const emptyReviewNote = '';

export function useAdminDepositRequestsPanel({
  onApproveRequest,
  onRejectRequest,
  requests,
}: {
  onApproveRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  onRejectRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  requests: AdminDepositRequest[];
}) {
  const [filter, setFilter] = useState<DepositRequestFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState(emptyReviewNote);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesFilter =
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
        request.transferContent,
        request.bankId ?? '',
        request.accountNo ?? '',
        request.accountName ?? '',
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
    setReviewNote(emptyReviewNote);
  }

  function resetFilters() {
    setFilter('all');
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
    FILTERS,
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
