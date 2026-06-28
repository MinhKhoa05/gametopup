import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useCreateOrderMutation } from '@/features/orders/server';
import type { GamePackage } from '@/features/packages/types';

export type PurchaseDraft = {
  characterName: string;
  uidServer: string;
};

type CheckoutResult = {
  orderId: number;
  successAt: string;
};

type PurchaseInfo = PurchaseDraft;

type UsePurchaseFlowArgs = {
  gameId: number;
  selectedPackage: GamePackage | undefined;
  onContinueShopping?: () => void;
};

export function usePurchaseFlow({ gameId, selectedPackage, onContinueShopping }: UsePurchaseFlowArgs) {
  const createOrderMutation = useCreateOrderMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);

  useEffect(() => {
    setDialogOpen(false);
    setSuccessOpen(false);
    setCheckoutResult(null);
    setPurchaseInfo(null);
  }, [gameId]);

  const openConfirm = () => {
    setDialogOpen(true);
  };

  const closeConfirm = () => {
    setDialogOpen(false);
  };

  const closeSuccess = () => {
    setSuccessOpen(false);
    setCheckoutResult(null);
    setPurchaseInfo(null);
  };

  const continueShopping = () => {
    closeSuccess();
    onContinueShopping?.();
  };

  const confirmPurchase = async (draft: PurchaseDraft) => {
    if (!selectedPackage) {
      return;
    }

    const characterName = draft.characterName.trim();
    const uidServer = draft.uidServer.trim();

    setPurchaseInfo({
      characterName,
      uidServer,
    });

    const gameAccountInfo = characterName
      ? `${uidServer} | Nhân vật: ${characterName}`
      : uidServer;

    try {
      const orderId = await createOrderMutation.mutateAsync({
        gamePackageId: selectedPackage.id,
        gameAccountInfo,
      });

      setCheckoutResult({
        orderId,
        successAt: new Date().toISOString(),
      });
      setDialogOpen(false);
      setSuccessOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Không thể hoàn tất mua gói. Vui lòng thử lại.');
    }
  };

  return {
    checkoutResult,
    closeConfirm,
    closeSuccess,
    continueShopping,
    confirmPurchase,
    dialogOpen,
    loading: createOrderMutation.isPending,
    openConfirm,
    purchaseInfo,
    successOpen,
  };
}
