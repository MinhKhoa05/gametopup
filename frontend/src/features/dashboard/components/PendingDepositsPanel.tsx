import { useNavigate } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { WalletDepositStatus, type AdminDepositRequest } from '@/features/deposits/types';
import { Badge, Button, EmptyState, LoadingState, MediaListItem, PanelShell, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';

const VISIBLE_ITEMS = 5;

const DEPOSIT_STATUS_META = {
  [WalletDepositStatus.Pending]: { label: 'Chờ chuyển khoản', tone: 'warning' },
  [WalletDepositStatus.UserConfirmed]: { label: 'Khách xác nhận', tone: 'primary' },
  [WalletDepositStatus.Approved]: { label: 'Đã duyệt', tone: 'success' },
  [WalletDepositStatus.Rejected]: { label: 'Từ chối', tone: 'danger' },
} as const;

export function PendingDepositsPanel({
  loading,
  requests,
}: {
  loading: boolean;
  requests: AdminDepositRequest[];
}) {
  const navigate = useNavigate();
  const visibleRequests = requests.slice(0, VISIBLE_ITEMS);

  return (
    <PanelShell>
      <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <SectionHeading
          title="Yêu cầu nạp chờ duyệt"
          titleClassName="text-[1.2rem]"
          action={
            <Button
              size="sm"
              variant="ghost"
              className="px-0 text-cyan"
              onClick={() => navigate(routes.admin('deposits'))}
            >
              Xem tất cả
            </Button>
          }
        />

        {loading ? (
          <LoadingState title="Đang tải yêu cầu nạp tiền..." />
        ) : visibleRequests.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu nạp tiền chờ duyệt."
            description="Yêu cầu mới sẽ xuất hiện tại đây khi người dùng tạo lệnh nạp."
          />
        ) : (
          <div className="grid gap-2.5">
            {visibleRequests.map((request) => {
              const statusMeta = DEPOSIT_STATUS_META[request.status] ?? {
                label: `Trạng thái ${request.status}`,
                tone: 'neutral' as const,
              };

              return (
                <MediaListItem
                  key={request.id}
                  leading={
                    <span className="inline-flex size-12 items-center justify-center rounded-[16px] border border-white/[0.06] bg-white/[0.03] font-black text-cyan-50">
                      #{request.id}
                    </span>
                  }
                  title={formatCurrency(request.amount)}
                  subtitle={request.code}
                  meta={`User #${request.userId} · Tạo ${formatDate(request.createdAt)}`}
                  titleAccessory={
                    <Badge tone={statusMeta.tone} className="rounded-full">
                      {statusMeta.label}
                    </Badge>
                  }
                  trailing={
                    <span className="text-xs font-semibold text-slate-500">
                      {request.userConfirmedAt
                        ? `Xác nhận ${formatDate(request.userConfirmedAt)}`
                        : 'Chưa xác nhận'}
                    </span>
                  }
                  onClick={() => navigate(routes.admin('deposits'))}
                />
              );
            })}
          </div>
        )}
      </div>
    </PanelShell>
  );
}
