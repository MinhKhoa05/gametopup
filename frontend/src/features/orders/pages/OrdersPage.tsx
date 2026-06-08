import { EmptyState, SearchBar } from '@/components/ui';
import { OrderCard } from '@/features/orders/components';
import { useOrdersPage } from '@/features/orders/hooks/orders.hooks';

export function OrdersPage() {
  const ordersPage = useOrdersPage();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-black text-white">Đơn Hàng Của Tôi</h1>
        <SearchBar
          className="max-w-md flex-1"
          inputClassName="text-sm"
          placeholder="Tìm mã đơn hàng..."
          ariaLabel="Tìm mã đơn hàng"
          value={ordersPage.query}
          onChange={ordersPage.setQuery}
        />
      </div>

      <div className="grid gap-4">
        {ordersPage.filteredOrders.length === 0 ? (
          <EmptyState variant="spacious">
            {ordersPage.query.trim() ? `Không tìm thấy đơn hàng phù hợp với "${ordersPage.query}".` : 'Bạn chưa có đơn hàng nào.'}
          </EmptyState>
        ) : (
          ordersPage.filteredOrders.map((order) => <OrderCard key={order.id} busy={ordersPage.busy} order={order} onPay={ordersPage.onPay} />)
        )}
      </div>
    </div>
  );
}
