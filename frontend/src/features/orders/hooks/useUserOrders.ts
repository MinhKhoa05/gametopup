import { useEffect, useState } from 'react';
import { getWallet } from '../../wallet/services/walletService';
import { getMyOrders, payOrder } from '../services/orderService';
import { Order, User, WalletInfo } from '../../../types';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';

export function useUserOrders(user: User | null, execute: AsyncActionExecutor) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  async function refreshUserArea() {
    if (!user) return;

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
    if (!user) {
      clearUserArea();
      return;
    }

    refreshUserArea().catch(() => undefined);
  }, [user]);

  return {
    clearUserArea,
    handlePay,
    orders,
    refreshUserArea,
    setOrders,
    wallet,
  };
}
