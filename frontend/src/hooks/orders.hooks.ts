import { FormEvent, useCallback, useState } from 'react';
import type { GamePackage } from '../types';
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

export function useCheckoutOrder({
  selectedPackage,
}: {
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
  const orderMutations = useOrderMutations();
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

    await orderMutations.place.mutateAsync(
      {
        gamePackageId: checkoutPackage.id,
        quantity: checkoutQuantity,
        gameAccountInfo: checkoutGameAccountInfo,
      },
      {
        onSuccess: async (orderId) => {
          await orderMutations.pay.mutateAsync({ orderId });
          setCheckoutOrderId(orderId);
          setCheckoutSuccessAt(Date.now());
          setCheckoutStep(4);
        },
      },
    );
  }, [checkoutGameAccountInfo, checkoutPackage, checkoutQuantity, orderMutations]);

  const resetCheckout = useCallback(() => {
    setCheckoutStep(2);
    setCheckoutPackage(null);
    setCheckoutQuantity(1);
    setCheckoutGameAccountInfo('');
    setCheckoutOrderId(null);
    setCheckoutSuccessAt(null);
  }, []);

  return {
    busy: orderMutations.place.isPending || orderMutations.pay.isPending,
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
