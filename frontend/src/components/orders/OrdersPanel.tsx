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
    <div className="section-panel">
      <SectionHeading>
        <div className="section-heading__copy">
          <p className="eyebrow section-heading__eyebrow">Theo dõi</p>
          <h2 className="section-heading__title">Đơn của tôi</h2>
        </div>
        <span className="pill">{orders.length} đơn</span>
      </SectionHeading>
      <div className="order-list">
        {orders.slice(0, limit).map((order) => (
          <div className="order-row" key={order.id}>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyanline/12 text-cyanline">
              <Banknote size={18} />
            </div>
            <div>
              <strong>Đơn #{order.id}</strong>
              <span>
                {statusLabel(order.status)} - {formatDate(order.createdAt)}
              </span>
            </div>
            <div className="ml-auto text-right">
              <strong>{formatCurrency((order.total ?? order.unitPrice * order.quantity) || 0)}</strong>
              {order.status === 1 && (
                <button className="tiny-button" type="button" onClick={() => onPay(order.id)} disabled={busy}>
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
