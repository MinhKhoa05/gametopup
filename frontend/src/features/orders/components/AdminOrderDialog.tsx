import { CheckCircle2, CircleSlash, History, Send, ShoppingBag } from 'lucide-react';

import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderStatus, type AdminOrder } from '@/features/orders/types';
import { Button, DetailRow, Dialog } from '@/shared/components';
import { formatDate } from '@/shared/lib/format';

import { OrderDetailContent } from './OrderDetailContent';

type AdminOrderDialogProps = {
  busy: boolean;
  currentAdminId: number | null;
  onCancelOrder: (orderId: number) => Promise<void>;
  onClose: () => void;
  onCompleteOrder: (orderId: number) => Promise<void>;
  onOpenHistory: (orderId: number) => void;
  onPickOrder: (orderId: number) => Promise<void>;
  order: AdminOrder | null;
};

export function AdminOrderDialog({
  busy,
  currentAdminId,
  onCancelOrder,
  onClose,
  onCompleteOrder,
  onOpenHistory,
  onPickOrder,
  order,
}: AdminOrderDialogProps) {
  if (!order) {
    return null;
  }

  const isPending = order.status === OrderStatus.Pending;
  const isAssignedProcessing =
    order.status === OrderStatus.Processing && order.assignedTo === currentAdminId;

  let actionMessage = 'Không có thao tác nào cho trạng thái hiện tại.';
  if (isPending) {
    actionMessage = 'Đơn đang chờ. Nếu thông tin đúng, tiếp nhận để bắt đầu xử lý.';
  } else if (isAssignedProcessing) {
    actionMessage = 'Đơn đang ở tay bạn. Hoàn thành khi đã giao xong, hoặc hủy nếu không thể xử lý.';
  } else if (order.status === OrderStatus.Processing && order.assignedTo) {
    actionMessage = `Đơn này đang được admin #${order.assignedTo} xử lý.`;
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-5"
      description={`User #${order.userId} · ${order.gameName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={busy} onClick={onClose} variant="ghost">
            Đóng
          </Button>

          <Button
            disabled={busy}
            leadingIcon={<History size={16} />}
            onClick={() => onOpenHistory(order.id)}
            variant="secondary"
          >
            Processing History
          </Button>

          {isPending || isAssignedProcessing ? (
            <Button
              className="border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
              disabled={busy}
              leadingIcon={<CircleSlash size={16} />}
              onClick={() => void onCancelOrder(order.id)}
            >
              Hủy đơn
            </Button>
          ) : null}

          {isPending ? (
            <Button
              disabled={busy}
              leadingIcon={<Send size={16} />}
              onClick={() => void onPickOrder(order.id)}
              variant="primary"
            >
              Tiếp nhận
            </Button>
          ) : null}

          {isAssignedProcessing ? (
            <Button
              disabled={busy}
              leadingIcon={<CheckCircle2 size={16} />}
              onClick={() => void onCompleteOrder(order.id)}
              variant="primary"
            >
              Hoàn thành
            </Button>
          ) : null}
        </div>
      }
      headerActions={<OrderStatusBadge status={order.status} />}
      icon={<ShoppingBag size={18} />}
      isOpen
      loading={busy}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
      title={`Đơn #${order.id}`}
    >
      <OrderDetailContent
        actionMessage={actionMessage}
        order={order}
        extraRows={
          <>
            <DetailRow label="Người mua">User #{order.userId}</DetailRow>
            <DetailRow label="Người xử lý">
              {order.assignedTo ? `Admin #${order.assignedTo}` : 'Chưa phân công'}
            </DetailRow>
            {order.assignedAt ? (
              <DetailRow label="Thời gian nhận">{formatDate(order.assignedAt)}</DetailRow>
            ) : null}
          </>
        }
      />
    </Dialog>
  );
}
