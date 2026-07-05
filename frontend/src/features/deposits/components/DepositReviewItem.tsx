import type { DepositReviewRequest } from '@/features/deposits/types';
import { isDepositReviewActionable } from '@/features/deposits/depositMetadata';
import { MediaListItem } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import { DepositStatusBadge } from './DepositStatusBadge';

type DepositReviewItemProps = {
  request: DepositReviewRequest;
  selected?: boolean;
  onClick: () => void;
};

export function DepositReviewItem({ request, selected = false, onClick }: DepositReviewItemProps) {
  return (
    <MediaListItem
      className={classNames(
        'p-3',
        isDepositReviewActionable(request.status) &&
          'border-cyan-400/20 bg-cyan-400/[0.06]',
      )}
      leading={<DepositRequestIcon request={request} />}
      meta={`User #${request.userId} · Tạo ${formatDate(request.createdAt)}`}
      onClick={onClick}
      selected={selected}
      subtitle={request.code}
      title={formatCurrency(request.amount)}
      titleAccessory={<DepositStatusBadge status={request.status} />}
      trailing={
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-semibold gt-text-disabled">
            {request.userConfirmedAt
              ? `Xác nhận ${formatDate(request.userConfirmedAt)}`
              : 'Chưa xác nhận'}
          </span>
          <span className="text-xs font-semibold gt-text-disabled">
            {request.reviewedBy ? `Admin #${request.reviewedBy}` : 'Chưa xử lý'}
          </span>
        </div>
      }
    />
  );
}

function DepositRequestIcon({ request }: { request: DepositReviewRequest }) {
  const isConfirmed = isDepositReviewActionable(request.status);

  return (
    <span
      className={classNames(
        'inline-flex size-12 items-center justify-center rounded-[16px] border font-black',
        isConfirmed
          ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
          : 'border-white/[0.06] bg-white/[0.03] text-cyan-50',
      )}
    >
      #{request.id}
    </span>
  );
}
