import { FormEvent, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { GamePackage } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { ordersQueryKey, payOrder, placeOrder, useOrdersQuery } from '../services/orders';
import { useRefreshWalletQuery, useWalletQuery } from '../services/wallet';

export function useUserOrders(isLoggedIn: boolean, execute: AsyncActionExecutor) {
  const ordersQuery = useOrdersQuery(isLoggedIn);
  const walletQuery = useWalletQuery(isLoggedIn);
  const queryClient = useQueryClient();
  const refreshWallet = useRefreshWalletQuery();

  const refreshUserArea = useCallback(async () => {
    if (!isLoggedIn) return;

    await Promise.all([
      refreshWallet(),
      queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
    ]);
  }, [isLoggedIn, queryClient, refreshWallet]);

  const handlePay = useCallback(
    async (orderId: number) => {
      await execute(() => payOrder(orderId), {
        successMessage: 'Thanh toán đơn hàng thành công.',
        onSuccess: refreshUserArea,
      });
    },
    [execute, refreshUserArea],
  );

  return {
    handlePay,
    orders: ordersQuery.data ?? [],
    refreshUserArea,
    wallet: walletQuery.data ?? null,
  };
}

export function useCheckoutOrder({
  refreshUserArea,
  execute,
  selectedPackage,
}: {
  refreshUserArea: () => Promise<void>;
  execute: AsyncActionExecutor;
  selectedPackage: GamePackage | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [gameAccountInfo, setGameAccountInfo] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<2 | 3 | 4>(2);
  const [checkoutPackage, setCheckoutPackage] = useState<GamePackage | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutGameAccountInfo, setCheckoutGameAccountInfo] = useState('');
  const [checkoutOrderId, setCheckoutOrderId] = useState<number | null>(null);
  const [checkoutSuccessAt, setCheckoutSuccessAt] = useState<number | null>(null);
  const checkoutSubtotal = checkoutPackage ? checkoutPackage.salePrice * checkoutQuantity : 0;
  const checkoutTotal = checkoutSubtotal;
  const selectedTotal = selectedPackage ? selectedPackage.salePrice * quantity : 0;

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (!selectedPackage) return;

    setCheckoutPackage(selectedPackage);
    setCheckoutQuantity(quantity);
    setCheckoutGameAccountInfo(gameAccountInfo);
    setCheckoutOrderId(null);
    setCheckoutSuccessAt(null);
    setCheckoutStep(3);
  }

  const handlePayOrder = useCallback(async () => {
    if (!checkoutPackage) return;

    await execute(
      async () => {
        const orderId = await placeOrder(checkoutPackage.id, checkoutQuantity, checkoutGameAccountInfo);
        await payOrder(orderId);
        return orderId;
      },
      {
        successMessage: 'Thanh toán đơn hàng thành công.',
        onSuccess: async (orderId) => {
          setCheckoutOrderId(orderId);
          setCheckoutSuccessAt(Date.now());
          setCheckoutStep(4);
          await refreshUserArea();
        },
      },
    );
  }, [checkoutGameAccountInfo, checkoutPackage, checkoutQuantity, execute, refreshUserArea]);

  const resetCheckout = useCallback(() => {
    setCheckoutStep(2);
    setCheckoutPackage(null);
    setCheckoutQuantity(1);
    setCheckoutGameAccountInfo('');
    setCheckoutOrderId(null);
    setCheckoutSuccessAt(null);
  }, []);

  return {
    checkoutPackage,
    checkoutStep,
    checkoutOrderId,
    checkoutQuantity,
    checkoutSubtotal,
    checkoutTotal,
    checkoutSuccessAt,
    checkoutGameAccountInfo,
    gameAccountInfo,
    handlePlaceOrder,
    handlePayOrder,
    resetCheckout,
    quantity,
    setGameAccountInfo,
    setQuantity,
    selectedTotal,
  };
}
