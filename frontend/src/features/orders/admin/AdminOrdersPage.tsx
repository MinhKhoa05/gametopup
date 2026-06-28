import { useAuthUserQuery } from '@/features/auth/server';
import { useAdminOrdersPageState, useAdminOrdersSection } from './hooks';
import { OrdersAdminPanel } from './components/OrdersAdminPanel';

export function AdminOrdersPage() {
  const authQuery = useAuthUserQuery();
  const section = useAdminOrdersSection();
  const state = useAdminOrdersPageState(section.orders);

  return (
    <OrdersAdminPanel
      busy={section.busy}
      currentUser={authQuery.data ?? null}
      loading={section.loading}
      onCancelOrder={section.cancelOrder}
      onCompleteOrder={section.completeOrder}
      onPickOrder={section.pickOrder}
      orders={section.orders}
      state={state}
    />
  );
}
