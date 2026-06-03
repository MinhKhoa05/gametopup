import { FormEvent, useState, useEffect } from 'react';
import { Route } from '../lib/routes';
import { GamePackage, Order, User, WalletInfo } from '../types';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { getWallet } from '../services/wallet.api';
import { getMyOrders, payOrder, placeOrder } from '../services/orders.api';
import { useAuthStore } from '../store/auth.store';

export function useUserOrders(user: User | null, execute: AsyncActionExecutor) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const authStatus = useAuthStore((state) => state.authStatus);
  const userSnapshot = useAuthStore((state) => state.userSnapshot);

  async function refreshUserArea() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) return;

    const [walletData, orderData] = await Promise.allSettled([getWallet(), getMyOrders()]);
    if (walletData.status === 'fulfilled') setWallet(walletData.value);
    if (orderData.status === 'fulfilled') setOrders(orderData.value);
  }

  function clearUserArea() {
    setWallet(null);
    setOrders([]);
  }

  async function handlePay(orderId: number) {
    await execute(() => payOrder(orderId), {
      successMessage: 'Thanh toán đơn hàng thành công.',
      onSuccess: refreshUserArea,
    });
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      clearUserArea();
      return;
    }

    refreshUserArea().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

  return {
    clearUserArea,
    handlePay,
    orders,
    refreshUserArea,
    setOrders,
    wallet,
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
