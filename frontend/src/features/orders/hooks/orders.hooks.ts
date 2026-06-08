import { useCallback, useMemo, useState } from 'react';
import { useAuthSession } from '@/features/auth/hooks/auth.hooks';
import { matchesQuery } from '@/lib/search';
import { useOrderMutations, useOrdersQuery } from '@/features/orders/api/orders';
import { useWalletQuery } from '@/features/wallet/api/wallet';
import type { Order } from '@/features/orders/orders.types';

export function useUserOrders(isLoggedIn: boolean) {
  const ordersQuery = useOrdersQuery(isLoggedIn);
  const walletQuery = useWalletQuery(isLoggedIn);
  const orderMutations = useOrderMutations();

  const handlePay = useCallback(
    (orderId: number) => {
      orderMutations.pay.mutate({ orderId });
    },
    [orderMutations.pay],
  );

  return {
    busy: orderMutations.place.isPending || orderMutations.pay.isPending,
    handlePay,
    orders: ordersQuery.data ?? [],
    ordersLoading: ordersQuery.isPending && !ordersQuery.data,
    wallet: walletQuery.data ?? null,
    walletLoading: walletQuery.isPending && !walletQuery.data,
  };
}

export function useOrdersPage() {
  const [query, setQuery] = useState('');
  const auth = useAuthSession();
  const userOrders = useUserOrders(auth.isLoggedIn);

  const filteredOrders = useMemo(() => {
    return userOrders.orders.filter((order) =>
      matchesQuery([order.id, order.gamePackageId, order.gameAccountInfo, order.status], query),
    );
  }, [query, userOrders.orders]);

  return {
    busy: userOrders.busy,
    filteredOrders,
    onPay: userOrders.handlePay,
    query,
    setQuery,
  };
}
