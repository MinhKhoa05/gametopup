import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Route } from '../lib/routes';
import { GamePackage, User } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { payOrder, placeOrder, getMyOrders } from '../services/orders.api';
import { getWallet } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { useOrdersStore } from '../store/orders.store';
import type { AuthStatus, AuthUserSnapshot } from '../types/auth.types';
import { executeBackgroundFetch } from './common/useBackgroundFetch';

const WALLET_SNAPSHOT_KEY = 'gametopup.wallet.snapshot';

function readWalletSnapshot() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(WALLET_SNAPSHOT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { balance?: number } | null;
    return typeof parsed?.balance === 'number' ? { balance: parsed.balance } : null;
  } catch {
    return null;
  }
}

function writeWalletSnapshot(wallet: { balance: number } | null) {
  if (typeof window === 'undefined') return;

  try {
    if (!wallet) {
      window.localStorage.removeItem(WALLET_SNAPSHOT_KEY);
      return;
    }

    window.localStorage.setItem(WALLET_SNAPSHOT_KEY, JSON.stringify({ balance: wallet.balance }));
  } catch {
    // Ignore storage failures.
  }
}

export function useUserOrders(
  user: User | null,
  authStatus: AuthStatus,
  userSnapshot: AuthUserSnapshot | null,
  execute: AsyncActionExecutor,
  setError: (message: string | null) => void,
) {
  const [walletSnapshot, setWalletSnapshot] = useState<{ balance: number } | null>(() => readWalletSnapshot());
  const ordersState = useOrdersStore(
    useShallow((state) => ({
      orders: state.orders,
      wallet: state.wallet,
    })),
  );

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      setWalletSnapshot(null);
    }
  }, [authStatus, user, userSnapshot]);

  useEffect(() => {
    writeWalletSnapshot(walletSnapshot);
  }, [walletSnapshot]);

  const refreshUserArea = useCallback(async () => {
    if (!user) return;
    const current = useOrdersStore.getState();
    const hasData = current.wallet !== null || current.orders.length > 0;

    await executeBackgroundFetch({
      hasData,
      setLoading: (loading) => {
        current.setWalletLoading(loading);
        current.setOrdersLoading(loading);
      },
      setError,
      fetcher: () => Promise.allSettled([getWallet(), getMyOrders()]),
      onSuccess: ([walletResult, ordersResult]) => {
        if (walletResult.status === 'fulfilled') {
          current.setWallet(walletResult.value);
          setWalletSnapshot(walletResult.value);
        }
        else if (!hasData) setError(getApiMessage(walletResult.reason));

        if (ordersResult.status === 'fulfilled') current.setOrders(ordersResult.value);
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
    walletSnapshot,
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
