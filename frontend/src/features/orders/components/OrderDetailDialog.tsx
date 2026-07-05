import { CircleSlash, ShoppingBag } from 'lucide-react';

import { Button, Dialog } from '@/shared/components';

import type { Order } from '../types';
import { canUserCancelOrder } from '../orderMetadata';
import { OrderDetailContent } from './OrderDetailContent';
import { OrderStatusBadge } from './OrderStatusBadge';

type OrderDetailDialogProps = {
  busy?: boolean;
  isOpen: boolean;
  onCancelOrder?: (orderId: number) => Promise<void>;
  onClose: () => void;
  order: Order | null;
};

export function OrderDetailDialog({
  busy = false,
  isOpen,
  onCancelOrder,
  onClose,
  order,
}: OrderDetailDialogProps) {
  if (!isOpen || !order) {
    return null;
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-5"
      description={`${order.gameName} · ${order.packageName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={busy} onClick={onClose} variant="ghost">
            Đóng
          </Button>

          {canUserCancelOrder(order.status) && onCancelOrder ? (
            <Button
              className="border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-300/30 hover:bg-rose-500/15 hover:text-rose-100"
              disabled={busy}
              leadingIcon={<CircleSlash size={16} />}
              onClick={() => void onCancelOrder(order.id)}
            >
              Hủy đơn
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
      <OrderDetailContent order={order} />
    </Dialog>
  );
}
