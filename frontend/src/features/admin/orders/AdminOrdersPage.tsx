import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAdminOrdersPageState, useAdminOrdersSection } from './hooks';
import { OrdersAdminPanel } from '@/features/admin/orders/components/OrdersAdminPanel';

export function AdminOrdersPage() {
  const auth = useAuthSession();
  const section = useAdminOrdersSection();
  const state = useAdminOrdersPageState(section.orders);

  return (
    <OrdersAdminPanel
      busy={section.busy}
      currentUser={auth.user}
      loading={section.loading}
      onCancelOrder={section.cancelOrder}
      onCompleteOrder={section.completeOrder}
      onPickOrder={section.pickOrder}
      orders={section.orders}
      state={state}
    />
  );
}
