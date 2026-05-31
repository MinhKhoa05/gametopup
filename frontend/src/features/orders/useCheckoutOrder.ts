import { FormEvent, useState } from 'react';
import { Route } from '../../lib/routes';
import { GamePackage } from '../../types';
import { AsyncActionExecutor } from '../../hooks/useAsyncAction';
import { placeOrder } from './orderService';

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
