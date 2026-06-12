import { CheckCircle2, Clock, RefreshCcw, ShoppingCart, SquareMinus, XCircle } from 'lucide-react';
import type { Order } from '@/features/orders/types';
import { Badge, Button } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';

export function OrderCard({
  busy,
  order,
  onCancel,
  onBrowseGames,
}: {
  busy: boolean;
  onBrowseGames: () => void;
  onCancel: () => void;
  order: Order;
}) {
  const total = order.total ?? order.unitPrice;
  const statusMeta = getOrderStatusMeta(order.status, getOrderStatusIcon(order.status));
  const canCancel = order.status === 1 || order.status === 2;

  return (
    <article className="gt-surface grid gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <strong className="block text-lg font-black text-white">Đơn hàng #{order.id}</strong>
          <p className="mt-1 text-sm text-slate-300">Gói #{order.gamePackageId}</p>
          <p className="mt-1 text-sm text-slate-300">Tài khoản: {order.gameAccountInfo}</p>
        </div>
        <Badge variant={statusMeta.variant} icon={statusMeta.icon}>
          {statusMeta.label}
        </Badge>
      </div>

      <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
        <span>Tạo lúc: {formatDate(order.createdAt)}</span>
        <span>Cập nhật: {formatDate(order.updatedAt)}</span>
        <span>Thành tiền: {formatCurrency(total)}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onBrowseGames} disabled={busy}>
          <ShoppingCart size={16} />
          Mua lại
        </Button>

        {canCancel ? (
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            <SquareMinus size={16} />
            {busy ? 'Đang xử lý...' : 'Hủy đơn'}
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function getOrderStatusIcon(status: number) {
  const icons = {
    1: <Clock size={14} />,
    2: <RefreshCcw size={14} />,
    3: <CheckCircle2 size={14} />,
    4: <XCircle size={14} />,
  } as const;

  return icons[status as keyof typeof icons] ?? <Clock size={14} />;
}
