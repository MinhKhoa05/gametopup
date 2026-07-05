import { useNavigate } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { DepositReviewItem } from '@/features/deposits/components/DepositReviewItem';
import type { DepositReviewRequest } from '@/features/deposits/types';
import { Button, EmptyState, LoadingState, PanelShell, SectionHeading } from '@/shared/components';

const VISIBLE_ITEMS = 5;

export function PendingDepositsPanel({
  loading,
  requests,
}: {
  loading: boolean;
  requests: DepositReviewRequest[];
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
            {visibleRequests.map((request) => (
              <DepositReviewItem
                key={request.id}
                request={request}
                onClick={() => navigate(routes.admin('deposits'))}
              />
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  );
}
