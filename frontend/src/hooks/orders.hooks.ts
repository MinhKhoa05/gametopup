import { useCallback } from 'react';
import { useOrderMutations, useOrdersQuery } from '../services/orders';
import { useWalletQuery } from '../services/wallet';

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
