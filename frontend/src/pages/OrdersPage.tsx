import { Search } from 'lucide-react';
import { Route } from '../lib/routes';
import { Order } from '../types';
import { formatCurrency, formatDate } from '../lib/format';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';

export function OrdersPage({
  orders,
  busy,
  onPay,
  navigate,
}: {
  orders: Order[];
  busy: boolean;
  onPay: (orderId: number) => void;
  navigate: (route: Route) => void;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">Đơn Hàng Của Tôi</h1>
        <div className="search-box">
          <Search size={18} className="text-slate-400" />
          <input placeholder="Tìm mã đơn hàng..." />
        </div>
      </div>

      <div className="status-tabs">
        <button className="status-tab active">Tất cả</button>
        <button className="status-tab">Chờ xử lý</button>
        <button className="status-tab">Đã hoàn thành</button>
        <button className="status-tab">Đã hủy</button>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <div className="empty-state py-12">Bạn chưa có đơn hàng nào.</div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-row">
              <div className="w-12 h-12 bg-cyanline/10 text-cyanline rounded-xl flex items-center justify-center font-bold">
                #{order.id}
              </div>
              <div className="flex-1">
                <strong className="block text-white text-lg">Đơn hàng #{order.id} - Gói nạp ID: {order.gamePackageId}</strong>
                <span className="text-sm text-slate-400 block mt-1">Tài khoản: {order.gameAccountInfo} &bull; Số lượng: {order.quantity}</span>
                <span className="text-xs text-slate-500 block mt-1">{formatDate(order.createdAt)}</span>
              </div>
              <div className="text-right">
                <strong className="block text-cyanline text-xl mb-2">{formatCurrency(order.total || (order.unitPrice * order.quantity))}</strong>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="order-actions sm:pl-4 sm:border-l sm:border-white/5 sm:ml-4">
                {order.status === 0 ? (
                  <button 
                    className="btn-primary py-2 px-6 min-h-[40px] text-sm" 
                    onClick={() => onPay(order.id)} 
                    disabled={busy}
                  >
                    Thanh toán
                  </button>
                ) : (
                  <button className="btn-outline py-2 px-6 min-h-[40px] text-sm" onClick={() => navigate({name: 'games'})}>
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
