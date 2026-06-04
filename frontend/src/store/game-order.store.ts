import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePackage } from '../types';

export type GameOrderStep = 1 | 2 | 3;

type GameOrderState = {
  activeGameId: number | null;
  step: GameOrderStep;
  selectedPackageId: number | null;
  quantity: number;
  gameAccountInfo: string;
  checkoutPackage: GamePackage | null;
  checkoutGameName: string;
  checkoutQuantity: number;
  checkoutGameAccountInfo: string;
  checkoutOrderId: number | null;
  checkoutSuccessAt: number | null;
  setActiveGameId: (gameId: number) => void;
  setStep: (step: GameOrderStep) => void;
  setSelectedPackageId: (packageId: number | null) => void;
  setQuantity: (quantity: number) => void;
  setGameAccountInfo: (value: string) => void;
  startCheckout: (payload: { selectedPackage: GamePackage; gameName: string }) => void;
  setCheckoutSuccess: (orderId: number) => void;
  resetCheckout: () => void;
  resetWizard: () => void;
};

const initialState = {
  activeGameId: null as number | null,
  step: 1 as GameOrderStep,
  selectedPackageId: null,
  quantity: 1,
  gameAccountInfo: '',
  checkoutPackage: null,
  checkoutGameName: '',
  checkoutQuantity: 1,
  checkoutGameAccountInfo: '',
  checkoutOrderId: null,
  checkoutSuccessAt: null,
};

export const useGameOrderStore = create<GameOrderState>()(
  persist(
    (set) => ({
      ...initialState,
      setActiveGameId: (gameId) => set({ activeGameId: gameId }),
      setStep: (step) => set({ step }),
      setSelectedPackageId: (packageId) => set({ selectedPackageId: packageId }),
      setQuantity: (quantity) => set({ quantity }),
      setGameAccountInfo: (value) => set({ gameAccountInfo: value }),
      startCheckout: ({ selectedPackage, gameName }) =>
        set((state) => ({
          checkoutPackage: selectedPackage,
          checkoutGameName: gameName,
          checkoutQuantity: state.quantity,
          checkoutGameAccountInfo: state.gameAccountInfo,
          checkoutOrderId: null,
          checkoutSuccessAt: null,
          step: 2,
        })),
      setCheckoutSuccess: (orderId) =>
        set({
          checkoutOrderId: orderId,
          checkoutSuccessAt: Date.now(),
          step: 3,
        }),
      resetCheckout: () =>
        set({
          checkoutPackage: null,
          checkoutGameName: '',
          checkoutQuantity: 1,
          checkoutGameAccountInfo: '',
          checkoutOrderId: null,
          checkoutSuccessAt: null,
        }),
      resetWizard: () => set({ ...initialState }),
    }),
    {
      name: 'gametopup-game-order',
      partialize: (state) => ({
        activeGameId: state.activeGameId,
        step: state.step,
        selectedPackageId: state.selectedPackageId,
        quantity: state.quantity,
        gameAccountInfo: state.gameAccountInfo,
        checkoutPackage: state.checkoutPackage,
        checkoutGameName: state.checkoutGameName,
        checkoutQuantity: state.checkoutQuantity,
        checkoutGameAccountInfo: state.checkoutGameAccountInfo,
        checkoutOrderId: state.checkoutOrderId,
        checkoutSuccessAt: state.checkoutSuccessAt,
      }),
    },
  ),
);
