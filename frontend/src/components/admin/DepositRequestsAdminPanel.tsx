import { CheckCircle2, CircleSlash, Clock3, Send, UserRound, WalletCards } from 'lucide-react';
import type { ReactNode } from 'react';
import { getDepositRequestStatus } from '../../helpers/wallet-activity.helpers';
import { formatCurrency, formatDate } from '../../lib/format';
import { classNames } from '../../lib/ui';
import type { AdminDepositRequest } from '../../types';
import { useAdminDepositRequestsPanel } from '../../hooks/admin/admin-deposits.hook';
import { AdminSkeleton } from './AdminShared';
import { Badge, Button, EmptyState, IconBox, RecordRow, SearchBar, SectionHeading } from '../ui';

export function DepositRequestsAdminPanel({
  busy,
  loading,
  onApproveRequest,
  onRejectRequest,
  requests,
}: {
  busy: boolean;
  loading: boolean;
  onApproveRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  onRejectRequest: (payload: { note?: string; requestId: number }) => Promise<void>;
  requests: AdminDepositRequest[];
}) {
  const {
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
  } = useAdminDepositRequestsPanel({
    onApproveRequest,
    onRejectRequest,
    requests,
  });

  const pendingCount = requests.filter((request) => request.status === 1 || request.status === 2).length;
  const approvedCount = requests.filter((request) => request.status === 3).length;
  const rejectedCount = requests.filter((request) => request.status === 4).length;
  const actionable = selectedRequest?.status === 2;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
      <div className="gt-surface grid gap-4">
        <SectionHeading
          title="Yêu cầu nạp tiền"
          description="Duyệt hoặc từ chối các yêu cầu đã được khách hàng xác nhận chuyển khoản."
          action={
            <div className="flex items-center gap-2">
              <Badge variant="warning">Chờ xử lý {pendingCount}</Badge>
              <Badge variant="success">Đã duyệt {approvedCount}</Badge>
              <Badge variant="danger">Từ chối {rejectedCount}</Badge>
            </div>
          }
        />

        <SearchBar
          className="mb-1"
          inputClassName="text-sm"
          value={query}
          onChange={setQuery}
          placeholder="Tìm theo mã, user, số tiền, nội dung chuyển khoản..."
        />

        <div className="flex flex-wrap gap-2.5">
          {FILTERS.map((item) => (
            <Button
              key={item.key}
              variant={filter === item.key ? 'accent' : 'default'}
              className="min-h-10 whitespace-nowrap rounded-full px-3.5 py-2 text-sm"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {loading && filteredRequests.length === 0 ? (
          <AdminSkeleton rows={6} />
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            actionLabel={query.trim() || filter !== 'all' ? 'Xóa bộ lọc' : undefined}
            description="Không có yêu cầu nào khớp với bộ lọc hiện tại."
            onAction={query.trim() || filter !== 'all' ? resetFilters : undefined}
            title="Chưa có yêu cầu nạp tiền phù hợp."
          />
        ) : (
          <div className="grid gap-2.5">
            {filteredRequests.map((request) => {
              const status = getDepositRequestStatus(request.status);
              const isSelected = request.id === selectedRequest?.id;

              return (
                <RecordRow className="grid-cols-[auto_minmax(0,1fr)_minmax(160px,auto)]" highlighted={isSelected} key={request.id}>
                  <IconBox size="md" className="font-black text-[0.8rem]">
                    #{request.id}
                  </IconBox>

                  <div className="min-w-0">
                    <strong className="block text-white">
                      User #{request.userId} · {formatCurrency(request.amount)}
                    </strong>
                    <small className="mt-1 block break-words text-slate-300">{request.transferContent}</small>
                    <small className="mt-1 block text-slate-500">
                      {request.code}
                      {' · '}
                      {request.bankId ?? 'Không có ngân hàng'}
                      {request.accountNo ? ` · ${request.accountNo}` : ''}
                    </small>
                    <small className="mt-1 block text-slate-500">Tạo lúc {formatDate(request.createdAt)}</small>
                  </div>

                  <div className="grid justify-items-end gap-2 max-[700px]:justify-items-start">
                    <div className="grid gap-1.5 justify-items-end max-[700px]:justify-items-start">
                      <Badge variant={statusBadgeVariant(request.status)} icon={status.icon}>
                        {status.label}
                      </Badge>
                      {request.userConfirmedAt ? (
                        <span className="text-xs font-semibold text-slate-500">Xác nhận {formatDate(request.userConfirmedAt)}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Chưa xác nhận giao dịch</span>
                      )}
                    </div>

                    <Button
                      className="min-h-10 px-4 py-2 text-sm"
                      variant={isSelected ? 'accent' : 'default'}
                      onClick={() => selectRequest(request)}
                    >
                      {isSelected ? 'Đang xem' : 'Xem chi tiết'}
                    </Button>
                  </div>
                </RecordRow>
              );
            })}
          </div>
        )}
      </div>

      <aside className="gt-surface sticky top-24 grid gap-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <SectionHeading
          title="Chi tiết yêu cầu"
          description="Xem thông tin chuyển khoản và thực hiện duyệt thủ công."
          action={selectedRequest ? <Badge variant="default">{selectedStatus?.label}</Badge> : undefined}
        />

        {!selectedRequest ? (
          <EmptyState
            variant="compact"
            description="Chọn một yêu cầu từ danh sách bên trái để xem chi tiết và xử lý."
            icon={
              <IconBox size="sm">
                <Clock3 size={16} />
              </IconBox>
            }
            title="Chưa chọn yêu cầu"
          />
        ) : (
          <div className="grid gap-4 pb-1">
            <div className="rounded-2xl border border-cyan/15 bg-cyan/8 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-cyan">Đang xem</p>
                  <strong className="mt-1 block text-xl font-black text-white">#{selectedRequest.id}</strong>
                  <span className="mt-1 block text-sm text-slate-300">User #{selectedRequest.userId}</span>
                </div>
                <Badge variant={statusBadgeVariant(selectedRequest.status)} icon={selectedStatus?.icon}>
                  {selectedStatus?.label}
                </Badge>
              </div>

              <div className="mt-3 grid gap-1.5 text-sm leading-6 text-slate-200">
                <span className="font-semibold text-white">{formatCurrency(selectedRequest.amount)}</span>
                <span className="break-words text-slate-200">{selectedRequest.code}</span>
                <span className="break-words text-slate-300">{selectedRequest.transferContent}</span>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <strong className="block text-lg font-black text-white">#{selectedRequest.id}</strong>
                  <span className="mt-1 block text-sm text-slate-300">User #{selectedRequest.userId}</span>
                </div>
                <Badge variant={statusBadgeVariant(selectedRequest.status)} icon={selectedStatus?.icon}>
                  {selectedStatus?.label}
                </Badge>
              </div>

              <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-200">
                <DetailRow label="Số tiền" value={formatCurrency(selectedRequest.amount)} icon={<WalletCards size={16} />} />
                <DetailRow label="Mã nạp" value={selectedRequest.code} icon={<Send size={16} />} />
                <DetailRow label="Ngân hàng" value={selectedRequest.bankId ?? '---'} icon={<UserRound size={16} />} />
                <DetailRow label="Số tài khoản" value={selectedRequest.accountNo ?? '---'} icon={<WalletCards size={16} />} />
                <DetailRow label="Tên tài khoản" value={selectedRequest.accountName ?? '---'} icon={<UserRound size={16} />} />
                <DetailRow label="Nội dung" value={selectedRequest.transferContent} icon={<Send size={16} />} />
              </div>

              <div className="grid gap-2 text-sm leading-6 text-slate-200">
                <span>Tạo lúc: {formatDate(selectedRequest.createdAt)}</span>
                <span>Xác nhận lúc: {selectedRequest.userConfirmedAt ? formatDate(selectedRequest.userConfirmedAt) : 'Chưa xác nhận'}</span>
                <span>Đã duyệt lúc: {selectedRequest.reviewedAt ? formatDate(selectedRequest.reviewedAt) : 'Chưa xử lý'}</span>
                <span>Người duyệt: {selectedRequest.reviewedBy ? `#${selectedRequest.reviewedBy}` : '---'}</span>
              </div>

              {selectedRequest.adminNote ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  <strong className="mb-1 block text-amber-50">Ghi chú hiện có</strong>
                  <p className="m-0 leading-6 text-amber-100/90">{selectedRequest.adminNote}</p>
                </div>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Ghi chú admin</span>
                <textarea
                  className={classNames(
                    'w-full min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-slate-200 outline-none',
                    'placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25 hover:bg-cyan/10',
                    'focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-70',
                  )}
                  disabled={busy}
                  placeholder="Lý do duyệt hoặc từ chối, nếu cần."
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                />
              </label>

              {!actionable ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/25 px-4 py-3 text-sm leading-6 text-slate-400">
                  Chỉ các yêu cầu ở trạng thái <b className="text-white">đã xác nhận</b> mới có thể duyệt hoặc từ chối.
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2.5">
                <Button
                  className="min-h-11 px-4 py-2 text-sm"
                  disabled={busy || !actionable}
                  onClick={() => void reviewRequest('approve', selectedRequest)}
                >
                  <CheckCircle2 size={16} />
                  Duyệt yêu cầu
                </Button>

                <Button
                  className="min-h-11 border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
                  disabled={busy || !actionable}
                  onClick={() => void reviewRequest('reject', selectedRequest)}
                >
                  <CircleSlash size={16} />
                  Từ chối
                </Button>

                <Button variant="outline" className="min-h-11 px-4 py-2 text-sm" disabled={busy} onClick={clearSelection}>
                  Hủy chọn
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2">
      <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-cyan">{icon}</span>
      <div className="min-w-0">
        <span className="block text-[0.78rem] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className="mt-1 block break-words text-sm font-semibold text-slate-100">{value}</span>
      </div>
    </div>
  );
}

function statusBadgeVariant(status: number) {
  switch (status) {
    case 2:
      return 'accent';
    case 3:
      return 'success';
    case 4:
      return 'danger';
    default:
      return 'warning';
  }
}
