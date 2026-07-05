import { CheckCircle2, CircleSlash, Send, ShoppingBag } from 'lucide-react';

import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderStatus, type AdminOrder } from '@/features/orders/types';
import { Button, DetailRow, Dialog, ImageBox } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';

type AdminOrderDialogProps = {
  busy: boolean;
  currentAdminId: number | null;
  onCancelOrder: (orderId: number) => Promise<void>;
  onClose: () => void;
  onCompleteOrder: (orderId: number) => Promise<void>;
  onPickOrder: (orderId: number) => Promise<void>;
  order: AdminOrder | null;
};

export function AdminOrderDialog({
  busy,
  currentAdminId,
  onCancelOrder,
  onClose,
  onCompleteOrder,
  onPickOrder,
  order,
}: AdminOrderDialogProps) {
  if (!order) {
    return null;
  }

  const actionState = getOrderActionState(order, currentAdminId);

  return (
    <Dialog
      bodyClassName="p-4 sm:p-5"
      description={`User #${order.userId} · ${order.gameName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={busy} onClick={onClose} variant="ghost">
            Đóng
          </Button>

          {actionState.kind === 'pick' ? (
            <Button
              disabled={busy}
              leadingIcon={<Send size={16} />}
              onClick={() => void onPickOrder(order.id)}
              variant="primary"
            >
              Tiếp nhận
            </Button>
          ) : null}

          {actionState.kind === 'act' ? (
            <>
              <Button
                className="border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
                disabled={busy}
                leadingIcon={<CircleSlash size={16} />}
                onClick={() => void onCancelOrder(order.id)}
              >
                Hủy đơn
              </Button>
              <Button
                disabled={busy}
                leadingIcon={<CheckCircle2 size={16} />}
                onClick={() => void onCompleteOrder(order.id)}
                variant="primary"
              >
                Hoàn thành
              </Button>
            </>
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
      <div className="grid gap-4">
        <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] p-4">
          <div className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center">
            <div className="size-[72px] overflow-hidden rounded-[16px] border gt-border bg-white/[0.03]">
              <ImageBox src={order.packageImageUrl} alt="" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold gt-text-muted">
                {order.gameName} · {order.packageName}
              </p>
              <strong className="mt-1 block text-2xl font-black tracking-tight gt-text">
                {formatCurrency(order.packagePrice)}
              </strong>
            </div>
          </div>
        </div>

        <div className="grid gap-2 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 text-sm">
          <DetailRow label="UID / Server / Nhân vật">{order.gameAccountInfo}</DetailRow>
          <DetailRow label="Gói nạp">#{order.packageId}</DetailRow>
          <DetailRow label="Người mua">User #{order.userId}</DetailRow>
          <DetailRow label="Người xử lý">
            {order.assignedTo ? `Admin #${order.assignedTo}` : 'Chưa phân công'}
          </DetailRow>
          <DetailRow label="Ngày tạo">{formatDate(order.createdAt)}</DetailRow>
          <DetailRow label="Cập nhật lần cuối">{formatDate(order.updatedAt)}</DetailRow>
        </div>

        <p className="rounded-[16px] border border-dashed gt-border px-4 py-3 text-sm leading-6 gt-text-muted">
          {actionState.message}
        </p>
      </div>
    </Dialog>
  );
}

function canPick(order: AdminOrder) {
  return order.status === OrderStatus.Pending;
}

function canAct(order: AdminOrder, currentAdminId: number | null) {
  return order.status === OrderStatus.Processing && order.assignedTo === currentAdminId;
}

function getOrderActionState(order: AdminOrder, currentAdminId: number | null) {
  if (canPick(order)) {
    return {
      kind: 'pick' as const,
      message: 'Đơn đang chờ. Nếu thông tin đúng, tiếp nhận để bắt đầu xử lý.',
    };
  }

  if (canAct(order, currentAdminId)) {
    return {
      kind: 'act' as const,
      message: 'Đơn đang ở tay bạn. Hoàn thành khi đã giao xong, hoặc hủy nếu không thể xử lý.',
    };
  }

  if (order.status === OrderStatus.Processing && order.assignedTo && order.assignedTo !== currentAdminId) {
    return {
      kind: 'locked' as const,
      message: `Đơn này đang được admin #${order.assignedTo} xử lý.`,
    };
  }

  return {
    kind: 'none' as const,
    message: 'Không có thao tác nào cho trạng thái hiện tại.',
  };
}
