import { useMemo, useState } from 'react';
import { WalletCards } from 'lucide-react';

import type { DepositReviewFilter } from '../api';
import {
  DEPOSIT_REVIEW_FILTER_OPTIONS,
  isDepositReviewActionable,
} from '../depositMetadata';
import { useDepositReviewSection } from '../server';
import { DepositReviewItem } from '../components/DepositReviewItem';
import { DepositReviewDialog } from '../components/DepositReviewDialog';
import type { DepositReviewRequest } from '../types';
import {
  Button,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  LoadMoreButton,
  LoadingState,
  PageHero,
  SearchBar,
} from '@/shared/components';
import { groupItemsByDate } from '@/shared/lib/groupByDate';
import { filterByQuery } from '@/shared/lib/search';

function getDepositReviewSearchText(request: DepositReviewRequest) {
  return [
    String(request.id),
    String(request.userId),
    String(request.amount),
    request.code,
  ].join(' ');
}

export function DepositAdminPage() {
  const [filter, setFilter] = useState<DepositReviewFilter>('active');
  const [query, setQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DepositReviewRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const section = useDepositReviewSection(filter);

  const visibleRequests = useMemo(
    () => filterByQuery(section.requests, query, getDepositReviewSearchText),
    [query, section.requests],
  );

  const requestGroups = useMemo(
    () => groupItemsByDate(visibleRequests, (count) => `${count} yêu cầu`),
    [visibleRequests],
  );

  const actionable = selectedRequest ? isDepositReviewActionable(selectedRequest.status) : false;

  function selectRequest(request: DepositReviewRequest) {
    setSelectedRequest(request);
    setReviewNote(request.adminNote ?? '');
  }

  function closeDetail() {
    setSelectedRequest(null);
    setReviewNote('');
  }

  function resetFilters() {
    setFilter('active');
    setQuery('');
  }

  async function reviewRequest(action: 'approve' | 'reject', request: DepositReviewRequest, note = reviewNote) {
    const payload = {
      note: note.trim() || undefined,
      requestId: request.id,
    };

    if (action === 'approve') {
      await section.approveRequest(payload);
    } else {
      await section.rejectRequest(payload);
    }

    closeDetail();
  }

  return (
    <>
      <div className="grid gap-5">
        <PageHero
          visual={
            <IconBox size="lg" tone="primary" className="h-[56px] w-[56px] rounded-[18px]">
              <WalletCards size={28} strokeWidth={1.8} />
            </IconBox>
          }
          title="Yêu cầu nạp tiền"
          description="Duyệt yêu cầu nạp và đối chiếu xác nhận chuyển khoản."
        />

        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <SearchBar
            ariaLabel="Tìm kiếm yêu cầu nạp tiền"
            dense
            onChange={setQuery}
            placeholder="Tìm mã yêu cầu, user, số tiền..."
            value={query}
          />

          <FilterChipGroup
            ariaLabel="Lọc yêu cầu nạp tiền"
            items={DEPOSIT_REVIEW_FILTER_OPTIONS}
            onChange={(value) => setFilter(value as DepositReviewFilter)}
            value={filter}
          />
        </div>

        {section.loading && visibleRequests.length === 0 ? (
          <LoadingState title="Đang tải yêu cầu nạp tiền..." />
        ) : visibleRequests.length === 0 ? (
          <EmptyState
            description="Không có yêu cầu nào khớp với bộ lọc hiện tại."
            title="Chưa có yêu cầu nạp tiền phù hợp."
          >
            {(query.trim() || filter !== 'active') && (
              <div className="mt-4 flex justify-center">
                <Button onClick={resetFilters} size="sm" variant="primary">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-5">
            <GroupedList
              groups={requestGroups}
              getItemKey={(request) => request.id}
              itemListClassName="space-y-2"
              renderItem={(request) => (
                <DepositReviewItem
                  request={request}
                  selected={request.id === selectedRequest?.id}
                  onClick={() => selectRequest(request)}
                />
              )}
            />

            <LoadMoreButton
              className="pt-2"
              hasMore={section.hasMore}
              isLoading={section.isLoadingMore}
              onLoadMore={section.loadMore}
            />
          </div>
        )}
      </div>

      <DepositReviewDialog
        actionable={actionable}
        busy={section.busy}
        onClose={closeDetail}
        onReview={reviewRequest}
        request={selectedRequest}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
      />
    </>
  );
}
