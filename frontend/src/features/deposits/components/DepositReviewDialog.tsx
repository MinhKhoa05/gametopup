import { CheckCircle2, CircleSlash, WalletCards } from 'lucide-react';

import { WalletDepositStatus, type DepositReviewRequest } from '@/features/deposits/types';
import { Button, DetailRow, Dialog } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import { DepositStatusBadge } from './DepositStatusBadge';

type DepositReviewDialogProps = {
  actionable: boolean;
  busy: boolean;
  onClose: () => void;
  onReview: (
    action: 'approve' | 'reject',
    request: DepositReviewRequest,
    note?: string,
  ) => Promise<void>;
  request: DepositReviewRequest | null;
  reviewNote: string;
  setReviewNote: (value: string) => void;
};

export function DepositReviewDialog({
  actionable,
  busy,
  onClose,
  onReview,
  request,
  reviewNote,
  setReviewNote,
}: DepositReviewDialogProps) {
  if (!request) {
    return null;
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-5"
      description={`User #${request.userId} · ${request.code}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={busy} onClick={onClose} variant="ghost">
            Đóng
          </Button>

          {actionable ? (
            <>
              {request.status === WalletDepositStatus.UserConfirmed ? (
                <Button
                  className="border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
                  disabled={busy}
                  leadingIcon={<CircleSlash size={16} />}
                  onClick={() => void onReview('reject', request)}
                >
                  Từ chối
                </Button>
              ) : null}

              <Button
                disabled={busy}
                leadingIcon={<CheckCircle2 size={16} />}
                onClick={() => void onReview('approve', request)}
                variant="primary"
              >
                Duyệt yêu cầu
              </Button>
            </>
          ) : null}
        </div>
      }
      icon={<WalletCards size={18} />}
      isOpen
      loading={busy}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
      title={`Yêu cầu #${request.id}`}
    >
      <div className="grid gap-4">
        <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] gt-text-disabled">
                Số tiền
              </p>
              <strong className="mt-1 block text-2xl font-black tracking-tight gt-text">
                {formatCurrency(request.amount)}
              </strong>
            </div>
            <DepositStatusBadge status={request.status} />
          </div>
        </div>

        <div className="grid gap-2 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 text-sm">
          <DetailRow label="Nội dung chuyển khoản">{request.code}</DetailRow>
          <DetailRow label="Người gửi">User #{request.userId}</DetailRow>
          <DetailRow label="Ngày tạo">{formatDate(request.createdAt)}</DetailRow>
          {request.userConfirmedAt ? (
            <DetailRow label="Khách xác nhận">{formatDate(request.userConfirmedAt)}</DetailRow>
          ) : null}
          {request.reviewedAt ? (
            <DetailRow label="Đã xử lý">{formatDate(request.reviewedAt)}</DetailRow>
          ) : null}
          {request.reviewedBy ? (
            <DetailRow label="Người duyệt">#{request.reviewedBy}</DetailRow>
          ) : null}
        </div>

        <div className="grid gap-3 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 py-4">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] gt-text-disabled">
            Ghi chú xử lý
          </span>

          {request.adminNote ? (
            <div className="rounded-[14px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <strong className="mb-1 block text-amber-50">Ghi chú hiện có</strong>
              <p className="m-0 leading-6 text-amber-100/90">{request.adminNote}</p>
            </div>
          ) : null}

          {actionable ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold gt-text">
                Ghi chú admin
              </span>
              <textarea
                className={classNames(
                  'min-h-24 w-full rounded-[14px] border gt-border bg-[rgba(7,16,31,0.72)] px-4 py-3 text-base gt-text outline-none',
                  'placeholder:text-slate-500 transition-all duration-200 hover:border-cyan/25',
                  'focus:border-cyan focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-70',
                )}
                disabled={busy}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Lý do duyệt hoặc từ chối, nếu cần."
                value={reviewNote}
              />
            </label>
          ) : (
            <div className="rounded-[14px] border border-dashed border-white/[0.08] bg-slate-950/25 px-4 py-3 text-sm leading-6 gt-text-muted">
              Chỉ yêu cầu ở trạng thái <b className="gt-text">đã xác nhận</b> mới có thể duyệt hoặc từ chối.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
