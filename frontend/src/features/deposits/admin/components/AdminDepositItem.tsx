import { Clock3 } from 'lucide-react';

import { WalletDepositStatus, type AdminDepositRequest } from '@/features/deposits/types';
import { Badge, MediaListItem } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';

type AdminDepositItemProps = {
  request: AdminDepositRequest;
  selected?: boolean;
  onClick: () => void;
};

export function AdminDepositItem({ request, selected = false, onClick }: AdminDepositItemProps) {
  return (
    <MediaListItem
      className={classNames(
        'p-3',
        request.status === WalletDepositStatus.UserConfirmed &&
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

function DepositRequestIcon({ request }: { request: AdminDepositRequest }) {
  const isConfirmed = request.status === WalletDepositStatus.UserConfirmed;

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

function DepositStatusBadge({ status }: { status: WalletDepositStatus }) {
  if (status === WalletDepositStatus.UserConfirmed) {
    return <Badge tone="primary">Đã xác nhận</Badge>;
  }

  if (status === WalletDepositStatus.Approved) {
    return <Badge tone="success">Đã duyệt</Badge>;
  }

  if (status === WalletDepositStatus.Rejected) {
    return <Badge tone="danger">Đã từ chối</Badge>;
  }

  return (
    <Badge tone="warning" icon={<Clock3 size={14} />}>
      Chờ chuyển khoản
    </Badge>
  );
}
