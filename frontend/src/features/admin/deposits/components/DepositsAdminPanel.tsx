import { CheckCircle2, CircleSlash, Clock3, Send, UserRound, WalletCards } from 'lucide-react';
import { Badge, Button, DetailRow, EmptyState, FilterChipGroup, MediaListItem, PanelShell, SearchBar, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { DepositRequestStatusInfo } from '@/features/wallet/lib/deposit-request-status';
import { getDepositRequestStatus } from '@/features/wallet/lib/deposit-request-status';
import type { DepositRequest } from '@/features/wallet/types';
import { AdminListSkeleton } from '@/features/admin/components/AdminShared';

type DepositRequestsAdminPanelState = {
  clearSelection: () => void;
  filter: 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected';
  filteredRequests: DepositRequest[];
  filters: Array<{ key: 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected'; label: string }>;
  query: string;
  resetFilters: () => void;
  reviewNote: string;
  reviewRequest: (action: 'approve' | 'reject', request: DepositRequest, note?: string) => Promise<void>;
  selectedRequest: DepositRequest | null;
  selectedStatus: DepositRequestStatusInfo | null;
  selectRequest: (request: DepositRequest) => void;
  setFilter: (value: 'all' | 'pending' | 'user-confirmed' | 'approved' | 'rejected') => void;
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
  requests: DepositRequest[];
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
            description="Duyệt hoặc từ chối các yêu cầu đã được khách hàng xác nhận chuyển khoản."
            action={
              <div className="flex flex-wrap gap-2">
                <Badge tone="warning">Chờ xử lý {pendingCount}</Badge>
                <Badge tone="success">Đã duyệt {approvedCount}</Badge>
                <Badge tone="danger">Từ chối {rejectedCount}</Badge>
              </div>
            }
          />

          <SearchBar className="mb-1" value={state.query} onChange={state.setQuery} placeholder="Tìm theo mã, user, số tiền, nội dung chuyển khoản..." dense />

          <FilterChipGroup
            items={state.filters.map((item) => ({ value: item.key, label: item.label }))}
            value={state.filter}
            onChange={(value) => state.setFilter(value as typeof state.filter)}
          />

          {loading && state.filteredRequests.length === 0 ? (
            <AdminListSkeleton ariaLabel="Đang tải yêu cầu nạp tiền" rows={5} />
          ) : state.filteredRequests.length === 0 ? (
            <EmptyState
              actionLabel={state.query.trim() || state.filter !== 'all' ? 'Xóa bộ lọc' : undefined}
              description="Không có yêu cầu nào khớp với bộ lọc hiện tại."
              onAction={state.query.trim() || state.filter !== 'all' ? state.resetFilters : undefined}
              title="Chưa có yêu cầu nạp tiền phù hợp."
            />
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
                    title={
                      <>
                        User #{request.userId} · {formatCurrency(request.amount)}
                      </>
                    }
                    subtitle={request.transferContent}
                    meta={`${request.code} · ${request.bankId ?? 'Không có ngân hàng'}${request.accountNo ? ` · ${request.accountNo}` : ''} · Tạo lúc ${formatDate(request.createdAt)}`}
                    titleAccessory={<Badge tone={status.tone}>{status.label}</Badge>}
                    trailing={
                      request.userConfirmedAt ? (
                        <span className="text-xs font-semibold text-slate-500">Xác nhận {formatDate(request.userConfirmedAt)}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Chưa xác nhận giao dịch</span>
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
            title="Chi tiết yêu cầu"
            titleClassName="text-[1.2rem]"
            description="Xem thông tin chuyển khoản và xử lý thủ công."
            action={state.selectedRequest ? <Badge tone={state.selectedStatus?.tone ?? 'neutral'}>{state.selectedStatus?.label}</Badge> : undefined}
          />

          {!state.selectedRequest ? (
            <EmptyState
              title="Chưa chọn yêu cầu"
              description="Chọn một yêu cầu từ danh sách bên trái để xem chi tiết và xử lý."
              icon={
                <span className="inline-flex size-10 items-center justify-center rounded-[16px] border border-white/[0.06] bg-white/[0.03] text-cyan-50">
                  <Clock3 size={16} />
                </span>
              }
            />
          ) : (
            <div className="grid gap-4 pb-1">
              <div className="rounded-[20px] border border-cyan/15 bg-cyan/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan">Đang xem</p>
                    <strong className="mt-1 block text-xl font-black text-white">#{state.selectedRequest.id}</strong>
                    <span className="mt-1 block text-sm text-slate-300">User #{state.selectedRequest.userId}</span>
                  </div>
                  <Badge tone={state.selectedStatus?.tone ?? 'neutral'} icon={state.selectedStatus?.icon}>
                    {state.selectedStatus?.label}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-1.5 text-sm leading-6 text-slate-200">
                  <span className="font-semibold text-white">{formatCurrency(state.selectedRequest.amount)}</span>
                  <span className="break-words text-slate-200">{state.selectedRequest.code}</span>
                  <span className="break-words text-slate-300">{state.selectedRequest.transferContent}</span>
                </div>
              </div>

              <div className="grid gap-3 rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-4">
                <DetailRow label={<span className="inline-flex items-center gap-2"><WalletCards size={16} />Số tiền</span>}>{formatCurrency(state.selectedRequest.amount)}</DetailRow>
                <DetailRow label={<span className="inline-flex items-center gap-2"><Send size={16} />Mã nạp</span>}>{state.selectedRequest.code}</DetailRow>
                <DetailRow label={<span className="inline-flex items-center gap-2"><UserRound size={16} />Ngân hàng</span>}>{state.selectedRequest.bankId ?? '---'}</DetailRow>
                <DetailRow label={<span className="inline-flex items-center gap-2"><WalletCards size={16} />Số tài khoản</span>}>{state.selectedRequest.accountNo ?? '---'}</DetailRow>
                <DetailRow label={<span className="inline-flex items-center gap-2"><UserRound size={16} />Tên tài khoản</span>}>{state.selectedRequest.accountName ?? '---'}</DetailRow>
                <DetailRow label={<span className="inline-flex items-center gap-2"><Send size={16} />Nội dung</span>}>{state.selectedRequest.transferContent}</DetailRow>
              </div>

              <div className="grid gap-2 text-sm leading-6 text-slate-200">
                <span>Tạo lúc: {formatDate(state.selectedRequest.createdAt)}</span>
                <span>Xác nhận lúc: {state.selectedRequest.userConfirmedAt ? formatDate(state.selectedRequest.userConfirmedAt) : 'Chưa xác nhận'}</span>
                <span>Đã duyệt lúc: {state.selectedRequest.reviewedAt ? formatDate(state.selectedRequest.reviewedAt) : 'Chưa xử lý'}</span>
                <span>Người duyệt: {state.selectedRequest.reviewedBy ? `#${state.selectedRequest.reviewedBy}` : '---'}</span>
              </div>

              {state.selectedRequest.adminNote ? (
                <div className="rounded-[18px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  <strong className="mb-1 block text-amber-50">Ghi chú hiện có</strong>
                  <p className="m-0 leading-6 text-amber-100/90">{state.selectedRequest.adminNote}</p>
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Ghi chú admin</span>
                <textarea
                  className={classNames(
                    'w-full min-h-28 rounded-[18px] border border-white/[0.08] bg-[rgba(7,16,31,0.72)] px-4 py-3 text-base text-slate-200 outline-none',
                    'placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10',
                    'focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-70',
                  )}
                  disabled={busy}
                  placeholder="Lý do duyệt hoặc từ chối, nếu cần."
                  value={state.reviewNote}
                  onChange={(event) => state.setReviewNote(event.target.value)}
                />
              </label>

              {!actionable ? (
                <div className="rounded-[18px] border border-dashed border-white/[0.08] bg-slate-950/25 px-4 py-3 text-sm leading-6 text-slate-400">
                  Chỉ các yêu cầu ở trạng thái <b className="text-white">đã xác nhận</b> mới có thể duyệt hoặc từ chối.
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2.5">
                <Button className="min-h-11 px-4 py-2 text-sm" disabled={busy || !actionable} onClick={() => void state.reviewRequest('approve', state.selectedRequest as DepositRequest)}>
                  <CheckCircle2 size={16} />
                  Duyệt yêu cầu
                </Button>

                <Button className="min-h-11 border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100" disabled={busy || !actionable} onClick={() => void state.reviewRequest('reject', state.selectedRequest as DepositRequest)}>
                  <CircleSlash size={16} />
                  Từ chối
                </Button>

                <Button variant="outline" className="min-h-11 px-4 py-2 text-sm" disabled={busy} onClick={state.clearSelection}>
                  Hủy chọn
                </Button>
              </div>
            </div>
          )}
        </div>
      </PanelShell>
    </div>
  );
}
