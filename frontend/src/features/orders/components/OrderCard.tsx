import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge, Button, IconBox } from '@/components/ui';
import { useRoute } from '@/hooks/common/route.hooks';
import { formatCurrency, formatDate } from '@/lib/format';
import { statusLabel } from '@/lib/labels';
import type { Order } from '@/features/orders/orders.types';

type OrderCardProps = {
  busy: boolean;
  order: Order;
  onPay: (orderId: number) => void;
};

export function OrderCard({ busy, order, onPay }: OrderCardProps) {
  const { navigate } = useRoute();
  const total = order.total || order.unitPrice * order.quantity;
  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <div className="grid gap-4 rounded-2xl border border-white/5 bg-ink-lighter p-4 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center">
      <IconBox size="md" className="font-black text-[0.8rem]">
        #{order.id}
      </IconBox>
      <div className="min-w-0">
        <strong className="block text-lg text-white">
          Đơn hàng #{order.id} - Gói nạp ID: {order.gamePackageId}
        </strong>
        <span className="mt-1 block text-sm text-slate-400">
          Tài khoản: {order.gameAccountInfo} • Số lượng: {order.quantity}
        </span>
        <span className="mt-1 block text-xs text-slate-500">{formatDate(order.createdAt)}</span>
      </div>
      <div className="text-left md:text-right">
        <strong className="mb-2 block text-xl text-cyan">{formatCurrency(total)}</strong>
        <Badge className="ml-auto w-fit" icon={statusMeta.icon} variant={statusMeta.variant}>
          {statusLabel(order.status)}
        </Badge>
      </div>
      <div className="md:border-l md:border-white/5 md:pl-4">
        {order.status === 0 ? (
          <Button className="min-h-10 px-6 py-2 text-sm" variant="accent" onClick={() => onPay(order.id)} disabled={busy}>
            Thanh toán
          </Button>
        ) : (
          <Button className="min-h-10 px-6 py-2 text-sm" onClick={() => navigate({ name: 'games' })}>
            Mua lại
          </Button>
        )}
      </div>
    </div>
  );
}

function getOrderStatusMeta(status: number) {
  switch (status) {
    case 0:
      return { icon: <Clock size={14} />, variant: 'warning' as const };
    case 1:
      return { icon: <CheckCircle2 size={14} />, variant: 'success' as const };
    case 2:
      return { icon: <XCircle size={14} />, variant: 'danger' as const };
    default:
      return { icon: null, variant: 'default' as const };
  }
}
