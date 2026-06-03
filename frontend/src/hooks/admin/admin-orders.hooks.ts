import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from '../common/useAsyncAction';
import { executeBackgroundFetch } from '../common/useBackgroundFetch';
import { getAdminOrders, pickOrder, completeOrder, cancelOrder } from '../../services/admin.api';
import { useAdminOrdersStore } from '../../store/admin/admin-orders.store';

export function useAdminOrders(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const { orders, loading } = useAdminOrdersStore(
    useShallow((state) => ({ orders: state.orders, loading: state.loading }))
  );

  async function refresh() {
    const current = useAdminOrdersStore.getState();
    await executeBackgroundFetch({
      hasData: current.orders.length > 0,
      setLoading: current.setLoading,
      setError,
      fetcher: getAdminOrders,
      onSuccess: current.setOrders,
    });
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  async function pickOrderAction(orderId: number) {
    await execute(() => pickOrder(orderId), { successMessage: `Đã tiếp nhận đơn #${orderId}.`, onSuccess: refresh });
  }

  async function completeOrderAction(orderId: number) {
    await execute(() => completeOrder(orderId), { successMessage: `Đã hoàn thành đơn #${orderId}.`, onSuccess: refresh });
  }

  async function cancelOrderAction(orderId: number) {
    await execute(() => cancelOrder(orderId), { successMessage: `Đã hủy đơn #${orderId}.`, onSuccess: refresh });
  }

  return {
    orders,
    loading,
    refresh,
    pickOrder: pickOrderAction,
    completeOrder: completeOrderAction,
    cancelOrder: cancelOrderAction,
  };
}
