import { Search } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { OrderStatusBadge } from '../components/orders/OrderStatusBadge';
import { Route } from '../lib/routes';
import { formatCurrency, formatDate } from '../lib/format';
import { classNames } from '../lib/ui';
import { Order } from '../types';
import { AsyncActionExecutor } from '../hooks/common/useAsyncAction';
import { useUserOrders } from '../hooks/orders.hooks';

export function OrdersPage({
  busy,
  execute,
  user,
  navigate,
}: {
  busy: boolean;
  execute: AsyncActionExecutor;
  user: import('../types').User | null;
  navigate: (route: Route) => void;
}) {
  const isLoggedIn = Boolean(user);
  const userOrders = useUserOrders(isLoggedIn, execute);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white">Đơn Hàng Của Tôi</h1>
        <div className="search-box max-w-md">
          <Search size={18} className="text-slate-400" />
          <input placeholder="Tìm mã đơn hàng..." aria-label="Tìm mã đơn hàng" />
        </div>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {['Tất cả', 'Chờ xử lý', 'Đã hoàn thành', 'Đã huỷ'].map((label, index) => (
          <button
            key={label}
            type="button"
            className={classNames(
              'whitespace-nowrap border-b-2 px-5 py-3 text-sm font-bold transition-colors',
              index === 0 ? 'border-cyanline text-cyan-100' : 'border-transparent text-slate-400 hover:border-cyanline/30 hover:text-slate-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {userOrders.orders.length === 0 ? (
          <EmptyState className="py-12">Bạn chưa có đơn hàng nào.</EmptyState>
        ) : (
          userOrders.orders.map((order) => (
            <div
              key={order.id}
              className="grid gap-4 rounded-2xl border border-white/5 bg-ink-lighter p-4 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyanline/10 font-bold text-cyanline">#{order.id}</div>
              <div className="min-w-0">
                <strong className="block text-lg text-white">
                  Đơn hàng #{order.id} - Gói nạp ID: {order.gamePackageId}
                </strong>
                <span className="mt-1 block text-sm text-slate-400">
                  Tài khoản: {order.gameAccountInfo} &bull; Số lượng: {order.quantity}
                </span>
                <span className="mt-1 block text-xs text-slate-500">{formatDate(order.createdAt)}</span>
              </div>
              <div className="text-left md:text-right">
                <strong className="mb-2 block text-xl text-cyanline">
                  {formatCurrency(order.total || order.unitPrice * order.quantity)}
                </strong>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="md:border-l md:border-white/5 md:pl-4">
                {order.status === 0 ? (
                  <button className="btn-primary min-h-10 px-6 py-2 text-sm" onClick={() => userOrders.handlePay(order.id)} disabled={busy}>
                    Thanh toán
                  </button>
                ) : (
                  <button className="btn-outline min-h-10 px-6 py-2 text-sm" onClick={() => navigate({ name: 'games' })}>
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
