import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppPageContainer } from '@/app/components/AppPageContainer';
import { EmptyState, SearchBar } from '@/shared/components';
import { useCancelOrderMutation, useMyOrdersQuery, usePayOrderMutation } from '@/features/orders/server';
import { OrderCard } from '@/features/orders/components/OrderCard';
import { routes } from '@/app/router/routes';

export function OrdersPage() {
  const navigate = useNavigate();
  const ordersQuery = useMyOrdersQuery();
  const payOrderMutation = usePayOrderMutation();
  const cancelOrderMutation = useCancelOrderMutation();
  const [workingOrderId, setWorkingOrderId] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const orders = ordersQuery.data ?? [];
  const filteredOrders = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return orders;
    }

    return orders.filter((order) => {
      return String(order.id).includes(keyword) || String(order.gamePackageId).includes(keyword) || order.gameAccountInfo.toLowerCase().includes(keyword);
    });
  }, [orders, query]);

  async function handlePay(orderId: number) {
    setWorkingOrderId(orderId);

    try {
      await payOrderMutation.mutateAsync({ orderId });
    } finally {
      setWorkingOrderId(null);
    }
  }

  async function handleCancel(orderId: number) {
    setWorkingOrderId(orderId);

    try {
      await cancelOrderMutation.mutateAsync({ orderId });
    } finally {
      setWorkingOrderId(null);
    }
  }

  return (
    <AppPageContainer className="py-8">
      <div className="mb-8 flex items-start justify-between gap-4 max-[640px]:flex-col">
        <div className="grid gap-1.5">
          <p className="gt-eyebrow">Orders</p>
          <h1 className="m-0 text-[clamp(1.9rem,2.7vw,2.75rem)] font-black leading-none text-white">Đơn Hàng Của Tôi</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-slate-400">Theo dõi trạng thái đơn, thanh toán hoặc hủy khi đơn vẫn còn hợp lệ.</p>
        </div>
      </div>

      <SearchBar className="max-w-md" value={query} onChange={setQuery} ariaLabel="Tìm đơn hàng" placeholder="Tìm mã đơn, gói hoặc tài khoản..." />

      {ordersQuery.isPending ? (
        <div className="mt-6 grid gap-4" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : ordersQuery.error ? (
        <EmptyState
          className="mt-6"
          title="Không tải được đơn hàng"
          description={ordersQuery.error instanceof Error ? ordersQuery.error.message : 'Đã có lỗi xảy ra.'}
          actionLabel="Thử lại"
          onAction={() => ordersQuery.refetch()}
        />
      ) : filteredOrders.length ? (
        <div className="mt-6 grid gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              busy={workingOrderId === order.id}
              order={order}
              onBrowseGames={() => navigate(routes.games())}
              onCancel={() => void handleCancel(order.id)}
              onPay={() => void handlePay(order.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title={query.trim() ? `Không tìm thấy đơn hàng phù hợp với "${query}".` : 'Chưa có đơn hàng'}
          description={query.trim() ? 'Thử đổi từ khóa tìm kiếm.' : 'Khi bạn tạo đơn ở kho game, lịch sử đơn sẽ xuất hiện ở đây.'}
          actionLabel={query.trim() ? undefined : 'Khám phá kho game'}
          onAction={query.trim() ? undefined : () => navigate(routes.games())}
        />
      )}
    </AppPageContainer>
  );
}
