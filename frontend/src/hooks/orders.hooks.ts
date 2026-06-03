import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { GamePackage, User } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { payOrder, placeOrder, getMyOrders } from '../services/orders.api';
import { getWallet } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { useOrdersStore } from '../store/orders.store';
import { useWalletStore } from '../store/wallet.store';
import type { CachedUser, AuthStatus } from '../types';
import { executeBackgroundFetch } from './common/useBackgroundFetch';

export function useUserOrders(
  user: User | null,
  authStatus: AuthStatus,
  cachedUser: CachedUser | null,
  execute: AsyncActionExecutor,
  setError: (message: string | null) => void,
) {
  const ordersState = useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
    })),
  );

  const refreshUserArea = useCallback(async () => {
    if (!user) return;
    const currentOrders = useOrdersStore.getState();
    const currentWallet = useWalletStore.getState();
    const hasData = currentWallet.wallet !== null || currentOrders.orders.length > 0;

    await executeBackgroundFetch({
      hasData,
      setLoading: (loading) => {
        currentWallet.setWalletLoading(loading);
        currentOrders.setOrdersLoading(loading);
      },
      setError,
      fetcher: () => Promise.allSettled([getWallet(), getMyOrders()]),
      onSuccess: ([walletResult, ordersResult]) => {
        if (walletResult.status === 'fulfilled') {
          currentWallet.setWallet(walletResult.value);
        }
        else if (!hasData) setError(getApiMessage(walletResult.reason));

        if (ordersResult.status === 'fulfilled') currentOrders.setOrders(ordersResult.value);
        else if (!hasData) setError(getApiMessage(ordersResult.reason));
      },
    });
  }, [setError, user]);

  useEffect(() => {
    refreshUserArea().catch(() => undefined);
  }, [refreshUserArea, user?.id]);

  const handlePay = useCallback(async (orderId: number) => {
    await execute(() => payOrder(orderId), {
      successMessage: 'Thanh toán đơn hàng thành công.',
      onSuccess: refreshUserArea,
    });
  }, [execute, refreshUserArea]);

  return {
    handlePay,
    orders: ordersState.orders,
    refreshUserArea,
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

    await execute(async () => {
      const orderId = await placeOrder(checkoutPackage.id, checkoutQuantity, checkoutGameAccountInfo);
      await payOrder(orderId);
      return orderId;
    }, {
      successMessage: 'Thanh toán đơn hàng thành công.',
      onSuccess: async (orderId) => {
        setCheckoutOrderId(orderId);
        setCheckoutSuccessAt(Date.now());
        setCheckoutStep(4);
        await refreshUserArea();
      },
    });
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
