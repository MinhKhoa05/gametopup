import { FormEvent, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Route } from '../lib/routes';
import { GamePackage, User } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { payOrder, placeOrder, getMyOrders } from '../services/orders.api';
import { getWallet } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { ordersActions, useOrdersStore } from '../store/orders.store';
import type { AuthStatus, AuthUserSnapshot } from '../types/auth.types';

export function useUserOrders(
  user: User | null,
  authStatus: AuthStatus,
  userSnapshot: AuthUserSnapshot | null,
  execute: AsyncActionExecutor,
  setError: (message: string | null) => void,
) {
  const ordersState = useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
      wallet: state.wallet,
    })),
  );

  async function refreshUserArea() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) {
      ordersActions.clearUserArea();
      return;
    }

    const current = useOrdersStore.getState();
    const hasData = current.wallet !== null || current.orders.length > 0;
    ordersActions.setWalletLoading(!hasData);
    ordersActions.setOrdersLoading(!hasData);

    const [walletResult, ordersResult] = await Promise.allSettled([getWallet(), getMyOrders()]);

    if (walletResult.status === 'fulfilled') {
      ordersActions.setWallet(walletResult.value);
    } else if (!hasData) {
      setError(getApiMessage(walletResult.reason));
    }

    if (ordersResult.status === 'fulfilled') {
      ordersActions.setOrders(ordersResult.value);
    } else if (!hasData) {
      setError(getApiMessage(ordersResult.reason));
    }

    ordersActions.setWalletLoading(false);
    ordersActions.setOrdersLoading(false);
  }

  async function handlePay(orderId: number) {
    await execute(() => payOrder(orderId), {
      successMessage: 'Thanh toán đơn hàng thành công.',
      onSuccess: refreshUserArea,
    });
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      ordersActions.clearUserArea();
      return;
    }

    refreshUserArea().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

  return {
    handlePay,
    orders: ordersState.orders,
    refreshUserArea,
    wallet: ordersState.wallet,
  };
}

export function useCheckoutOrder({
  navigate,
  refreshUserArea,
  execute,
  selectedPackage,
}: {
  navigate: (route: Route) => void;
  refreshUserArea: () => Promise<void>;
  execute: AsyncActionExecutor;
  selectedPackage: GamePackage | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [gameAccountInfo, setGameAccountInfo] = useState('');
  const total = selectedPackage ? selectedPackage.salePrice * quantity : 0;

  async function handlePlaceOrder(event: FormEvent) {
    event.preventDefault();
    if (!selectedPackage) return;

    await execute(() => placeOrder(selectedPackage.id, quantity, gameAccountInfo), {
      successMessage: 'Đã tạo đơn. Bạn có thể thanh toán ngay bằng số dư ví.',
      onSuccess: async () => {
        setGameAccountInfo('');
        await refreshUserArea();
        navigate({ name: 'orders' });
      },
    });
  }

  return {
    gameAccountInfo,
    handlePlaceOrder,
    quantity,
    setGameAccountInfo,
    setQuantity,
    total,
  };
}
