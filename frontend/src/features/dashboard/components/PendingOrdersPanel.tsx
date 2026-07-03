import { useNavigate } from 'react-router-dom';

import { routes } from '@/app/router/routes';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import type { AdminOrder } from '@/features/orders/types';
import { Button, EmptyState, ImageBox, LoadingState, MediaListItem, PanelShell, SectionHeading } from '@/shared/components';
import { DEFAULT_IMAGE_SRC } from '@/shared/lib/image';
import { formatCurrency, formatDate } from '@/shared/lib/format';

const VISIBLE_ITEMS = 5;

export function PendingOrdersPanel({
  loading,
  orders,
}: {
  loading: boolean;
  orders: AdminOrder[];
}) {
  const navigate = useNavigate();
  const visibleOrders = orders.slice(0, VISIBLE_ITEMS);

  return (
    <PanelShell>
      <div className="grid gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <SectionHeading
          title="Đơn hàng chờ xử lý"
          titleClassName="text-[1.2rem]"
          action={
            <Button
              size="sm"
              variant="ghost"
              className="px-0 text-cyan"
              onClick={() => navigate(routes.admin('orders'))}
            >
              Xem tất cả
            </Button>
          }
        />

        {loading ? (
          <LoadingState title="Đang tải đơn hàng..." />
        ) : visibleOrders.length === 0 ? (
          <EmptyState
            title="Không có đơn chờ xử lý."
            description="Các đơn mới hoặc đang xử lý sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="grid gap-2.5">
            {visibleOrders.map((order) => (
              <MediaListItem
                key={order.id}
                leading={
                  <ImageBox
                    src={order.packageImageUrl || DEFAULT_IMAGE_SRC}
                    alt={order.packageName}
                    className="object-cover"
                  />
                }
                title={`Đơn #${order.id}`}
                subtitle={`${order.gameName} · ${order.packageName}`}
                meta={`User #${order.userId} · ${formatDate(order.createdAt)}`}
                titleAccessory={<OrderStatusBadge status={order.status} />}
                trailing={
                  <strong className="text-[1rem] font-black tracking-[-0.04em] text-cyan-100 gt-tabular">
                    {formatCurrency(order.packagePrice)}
                  </strong>
                }
                onClick={() => navigate(routes.admin('orders'))}
              />
            ))}
          </div>
        )}
      </div>
    </PanelShell>
  );
}
