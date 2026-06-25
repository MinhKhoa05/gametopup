import { CheckCircle2, CircleSlash, Clock3 } from 'lucide-react';
import { Badge, Button, DetailRow, EmptyState, FilterChipGroup, MediaListItem, PanelShell, SearchBar, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { DepositRequestStatusInfo } from '@/features/deposits/lib/deposit-request-status';
import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
import type { AdminDepositRequest } from '@/features/deposits/types';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';

type DepositRequestFilter = 'active' | 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected';

type DepositRequestsAdminPanelState = {
  clearSelection: () => void;
  filter: DepositRequestFilter;
  filteredRequests: AdminDepositRequest[];
  filters: Array<{ key: DepositRequestFilter; label: string }>;
  query: string;
  resetFilters: () => void;
  reviewNote: string;
  reviewRequest: (action: 'approve' | 'reject', request: AdminDepositRequest, note?: string) => Promise<void>;
  selectedRequest: AdminDepositRequest | null;
  selectedStatus: DepositRequestStatusInfo | null;
  selectRequest: (request: AdminDepositRequest) => void;
  setFilter: (value: DepositRequestFilter) => void;
  setQuery: (value: string) => void;
  setReviewNote: (value: string) => void;
};

export function DepositsAdminPanel({
  busy,
  loading,
  requests,
  state,
}: {
  busy: boolean;
  loading: boolean;
  requests: AdminDepositRequest[];
  state: DepositRequestsAdminPanelState;
}) {
  const pendingCount = requests.filter((request) => request.status === 1 || request.status === 2).length;
  const approvedCount = requests.filter((request) => request.status === 3).length;
  const rejectedCount = requests.filter((request) => request.status === 4).length;
  const actionable = state.selectedRequest?.status === 2;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <PanelShell>
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Yêu cầu nạp tiền"
            titleClassName="text-[1.2rem]"
            description="Ưu tiên yêu cầu khách đã xác nhận chuyển khoản."
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="warning">Cần xem {pendingCount}</Badge>
                <Badge tone="success">Đã duyệt {approvedCount}</Badge>
                <Badge tone="danger">Từ chối {rejectedCount}</Badge>
              </div>
            }
          />

          <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm mã nạp, user, số tiền, trạng thái..." dense />

          <FilterChipGroup
            items={state.filters.map((item) => ({ value: item.key, label: item.label }))}
            value={state.filter}
            onChange={(value) => state.setFilter(value as DepositRequestFilter)}
          />

          {loading && state.filteredRequests.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải yêu cầu nạp tiền" rows={5} />
          ) : state.filteredRequests.length === 0 ? (
            <EmptyState
              description="Không có yêu cầu nào khớp với bộ lọc hiện tại."
              title="Chưa có yêu cầu nạp tiền phù hợp."
            >
              {(state.query.trim() || state.filter !== 'all') && (
                <div className="mt-4 flex justify-center">
                  <button className="gt-button gt-button-primary" onClick={state.resetFilters}>
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </EmptyState>
          ) : (
            <div className="grid gap-2.5">
              {state.filteredRequests.map((request) => {
                const status = getDepositRequestStatus(request.status);
                const isSelected = request.id === state.selectedRequest?.id;

                return (
                  <MediaListItem
                    key={request.id}
                    className={classNames('p-3', isSelected ? 'border-cyan/25 bg-cyan/10 shadow-[0_0_0_1px_rgba(34,211,238,0.08)]' : '')}
                    selected={isSelected}
                    onClick={() => state.selectRequest(request)}
                    leading={
                      <span className="inline-flex size-12 items-center justify-center rounded-[16px] border border-white/[0.06] bg-white/[0.03] font-black text-cyan-50 max-[700px]:size-[54px]">
                        #{request.id}
                      </span>
                    }
                    title={formatCurrency(request.amount)}
                    subtitle={request.code}
                    meta={`User #${request.userId} · Tạo ${formatDate(request.createdAt)}`}
                    titleAccessory={<Badge tone={status.tone}>{status.label}</Badge>}
                    trailing={
                      request.userConfirmedAt ? (
                        <span className="text-xs font-semibold text-slate-500">Xác nhận {formatDate(request.userConfirmedAt)}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Chưa xác nhận</span>
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </PanelShell>

      <PanelShell className="sticky top-24">
        <div className="grid gap-4 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
          <SectionHeading
            title="Duyệt giao dịch"
            titleClassName="text-[1.2rem]"
            description="Đối chiếu trạng thái xác nhận rồi duyệt hoặc từ chối."
            action={state.selectedRequest ? <Badge tone={state.selectedStatus?.tone ?? 'neutral'}>{state.selectedStatus?.label}</Badge> : undefined}
          />

          {!state.selectedRequest ? (
            <EmptyState
              title="Chưa chọn yêu cầu"
              description="Chọn một yêu cầu từ danh sách bên trái để xem chi tiết và xử lý."
            >
              <div className="flex justify-center mb-4 order-first">
                <span className="inline-flex size-10 items-center justify-center rounded-[16px] border border-white/[0.06] bg-white/[0.03] text-cyan-50">
                  <Clock3 size={16} />
                </span>
              </div>
            </EmptyState>
          ) : (
            <div className="grid gap-4 pb-1">
              <div className="overflow-hidden rounded-[22px] border border-cyan/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.72))] p-4 shadow-[0_18px_48px_rgba(2,6,23,0.24)]">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-4">
                  <span className="inline-flex aspect-square items-center justify-center rounded-[18px] border border-white/[0.08] bg-slate-950/30 text-base font-black text-cyan-50">
                    #{state.selectedRequest.id}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan">Yêu cầu nạp</p>
                        <strong className="mt-1 block text-2xl font-black tracking-[-0.04em] text-white">{formatCurrency(state.selectedRequest.amount)}</strong>
                        <span className="mt-1 block truncate text-sm text-slate-300">User #{state.selectedRequest.userId} · {state.selectedRequest.code}</span>
                      </div>
                      <Badge tone={state.selectedStatus?.tone ?? 'neutral'} icon={state.selectedStatus?.icon} className="shrink-0 rounded-full">
                        {state.selectedStatus?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {actionable ? (
                <div className="flex flex-wrap gap-2.5">
                  <Button className="min-h-11 px-4 py-2 text-sm" disabled={busy} onClick={() => void state.reviewRequest('approve', state.selectedRequest as AdminDepositRequest)}>
                    <CheckCircle2 size={16} />
                    Duyệt yêu cầu
                  </Button>

                  <Button className="min-h-11 border-rose-400/25 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100" disabled={busy} onClick={() => void state.reviewRequest('reject', state.selectedRequest as AdminDepositRequest)}>
                    <CircleSlash size={16} />
                    Từ chối
                  </Button>
                </div>
              ) : null}

              <div className="grid gap-2 rounded-[20px] border border-white/[0.07] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-slate-200">
                <DetailRow label="Nội dung chuyển khoản">{state.selectedRequest.code}</DetailRow>
                <DetailRow label="Người gửi">User #{state.selectedRequest.userId}</DetailRow>
                <DetailRow label="Ngày tạo">{formatDate(state.selectedRequest.createdAt)}</DetailRow>
                <DetailRow label="Khách xác nhận">{state.selectedRequest.userConfirmedAt ? formatDate(state.selectedRequest.userConfirmedAt) : 'Chưa xác nhận'}</DetailRow>
                <DetailRow label="Đã xử lý">{state.selectedRequest.reviewedAt ? formatDate(state.selectedRequest.reviewedAt) : 'Chưa xử lý'}</DetailRow>
                <DetailRow label="Người duyệt">{state.selectedRequest.reviewedBy ? `#${state.selectedRequest.reviewedBy}` : '---'}</DetailRow>
              </div>

              <div className="grid gap-2 rounded-[20px] border border-white/[0.07] bg-[rgba(255,255,255,0.035)] px-4 text-sm text-slate-200">
                <DetailRow label="Trạng thái xác nhận">{state.selectedRequest.userConfirmedAt ? 'Đã xác nhận' : 'Chưa xác nhận'}</DetailRow>
                <DetailRow label="Đã xử lý">{state.selectedRequest.reviewedAt ? formatDate(state.selectedRequest.reviewedAt) : 'Chưa xử lý'}</DetailRow>
                <DetailRow label="Người duyệt">{state.selectedRequest.reviewedBy ? `#${state.selectedRequest.reviewedBy}` : '---'}</DetailRow>
              </div>

              <div className="grid gap-3 rounded-[20px] border border-white/[0.07] bg-[rgba(255,255,255,0.035)] px-4 py-4">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-slate-400">Audit / Ghi chú</span>
                {state.selectedRequest.adminNote ? (
                  <div className="rounded-[18px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    <strong className="mb-1 block text-amber-50">Ghi chú hiện có</strong>
                    <p className="m-0 leading-6 text-amber-100/90">{state.selectedRequest.adminNote}</p>
                  </div>
                ) : null}

                {actionable ? (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-200">Ghi chú admin</span>
                    <textarea
                      className={classNames(
                        'w-full min-h-24 rounded-[18px] border border-white/[0.08] bg-[rgba(7,16,31,0.72)] px-4 py-3 text-base text-slate-200 outline-none',
                        'placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10',
                        'focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-70',
                      )}
                      disabled={busy}
                      placeholder="Lý do duyệt hoặc từ chối, nếu cần."
                      value={state.reviewNote}
                      onChange={(event) => state.setReviewNote(event.target.value)}
                    />
                  </label>
                ) : (
                  <div className="rounded-[18px] border border-dashed border-white/[0.08] bg-slate-950/25 px-4 py-3 text-sm leading-6 text-slate-400">
                    Chỉ yêu cầu ở trạng thái <b className="text-white">đã xác nhận</b> mới có thể duyệt hoặc từ chối.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </PanelShell>
    </div>
  );
}
