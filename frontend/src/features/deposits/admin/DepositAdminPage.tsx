import { useMemo, useState } from 'react';
import { RefreshCw, WalletCards } from 'lucide-react';

import type { AdminDepositFilter } from './api';
import { useAdminDepositRequestsSection } from './hooks';
import { AdminDepositItem } from './components/AdminDepositItem';
import { DepositAdminDialog } from './components/DepositAdminDialog';
import { WalletDepositStatus, type AdminDepositRequest } from '../types';
import {
  Badge,
  Button,
  EmptyState,
  FilterChipGroup,
  GroupedList,
  IconBox,
  LoadMoreButton,
  LoadingState,
  PageHero,
  PanelShell,
  SearchBar,
  SectionHeading,
} from '@/shared/components';
import { groupItemsByDate } from '@/shared/lib/groupByDate';

const DEPOSIT_FILTERS: Array<{ key: AdminDepositFilter; label: string }> = [
  { key: 'active', label: 'Cần xử lý' },
  { key: null, label: 'Tất cả' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Đã từ chối' },
];

export function DepositAdminPage() {
  const [filter, setFilter] = useState<AdminDepositFilter>('active');
  const [query, setQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AdminDepositRequest | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const section = useAdminDepositRequestsSection(filter);

  const visibleRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return section.requests;
    }

    return section.requests.filter((request) =>
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
  }, [query, section.requests]);

  const requestGroups = useMemo(
    () => groupItemsByDate(visibleRequests, (count) => `${count} yêu cầu`),
    [visibleRequests],
  );

  const pendingCount = section.requests.filter(
    (request) =>
      request.status === WalletDepositStatus.Pending ||
      request.status === WalletDepositStatus.UserConfirmed,
  ).length;
  const confirmedCount = section.requests.filter(
    (request) => request.status === WalletDepositStatus.UserConfirmed,
  ).length;
  const actionable = selectedRequest?.status === WalletDepositStatus.UserConfirmed;

  function selectRequest(request: AdminDepositRequest) {
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

  async function reviewRequest(action: 'approve' | 'reject', request: AdminDepositRequest, note = reviewNote) {
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

        <PanelShell>
          <div className="space-y-5 p-6 lg:p-7">
            <SectionHeading
              title="Danh sách yêu cầu"
              titleClassName="text-[1.2rem]"
              description="Ưu tiên các yêu cầu khách đã xác nhận chuyển khoản."
              action={
                <div className="flex flex-wrap gap-2">
                  <Badge tone="warning">Cần xử lý {pendingCount}</Badge>
                  <Badge tone="primary">Đã xác nhận {confirmedCount}</Badge>
                </div>
              }
            />

            <FilterChipGroup
              ariaLabel="Lọc yêu cầu nạp tiền"
              items={DEPOSIT_FILTERS.map((item) => ({
                value: item.key,
                label: item.label,
              }))}
              onChange={(value) => setFilter(value as AdminDepositFilter)}
              value={filter}
            />

            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
              <SearchBar
                ariaLabel="Tìm kiếm yêu cầu nạp tiền"
                dense
                onChange={setQuery}
                placeholder="Tìm theo mã yêu cầu..."
                value={query}
              />

              <Button
                disabled={section.loading || section.busy}
                leadingIcon={<RefreshCw size={15} />}
                loading={section.refreshing}
                onClick={() => void section.refresh()}
                size="sm"
                variant="outline"
              >
                Làm mới
              </Button>
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
                    <AdminDepositItem
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
        </PanelShell>
      </div>

      <DepositAdminDialog
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
