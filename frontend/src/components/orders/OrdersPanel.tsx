import { Banknote } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/format';
import { statusLabel } from '../../lib/labels';
import { Order } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { SectionHeading } from '../common/SectionHeading';

export function OrdersPanel({
  orders,
  busy,
  onPay,
  limit = 5,
}: {
  orders: Order[];
  busy: boolean;
  onPay: (orderId: number) => void;
  limit?: number;
  }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-ink-light p-6">
      <SectionHeading
        className="mb-5"
        eyebrow="Theo dõi"
        title="Đơn của tôi"
        action={<span className="pill">{orders.length} đơn</span>}
      />
      <div className="grid gap-3">
        {orders.slice(0, limit).map((order) => (
          <div
            key={order.id}
            className="grid gap-3 rounded-2xl border border-white/5 bg-white/4 p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyanline/10 text-cyanline">
              <Banknote size={18} />
            </div>
            <div className="min-w-0">
              <strong className="block text-white">Đơn #{order.id}</strong>
              <span className="mt-1 block text-sm text-slate-400">
                {statusLabel(order.status)} - {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="text-left md:text-right">
              <strong className="block text-lg font-black text-cyan-100">
                {formatCurrency((order.total ?? order.unitPrice * order.quantity) || 0)}
              </strong>
              {order.status === 1 && (
                <button
                  type="button"
                  onClick={() => onPay(order.id)}
                  disabled={busy}
                  className="mt-2 inline-flex min-h-8 items-center rounded-lg border border-cyan-400/15 bg-cyan-400/10 px-3 text-xs font-bold text-cyan-100 transition-colors hover:bg-cyan-400/15"
                >
                  Thanh toán
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <EmptyState>Đăng nhập và đặt gói để xem lịch sử đơn hàng.</EmptyState>}
      </div>
    </div>
  );
}
