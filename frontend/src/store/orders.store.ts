import { create } from 'zustand';
import type { Order, WalletInfo } from '../types';

type OrdersStore = {
  orders: Order[];
  ordersLoading: boolean;
  wallet: WalletInfo | null;
  walletLoading: boolean;
  setOrders: (orders: Order[]) => void;
  setOrdersLoading: (ordersLoading: boolean) => void;
  setWallet: (wallet: WalletInfo | null) => void;
  setWalletLoading: (walletLoading: boolean) => void;
  clearUserArea: () => void;
};

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  ordersLoading: false,
  wallet: null,
  walletLoading: false,

  setOrders: (orders) => set({ orders }),
  setOrdersLoading: (ordersLoading) => set({ ordersLoading }),
  setWallet: (wallet) => set({ wallet }),
  setWalletLoading: (walletLoading) => set({ walletLoading }),

  clearUserArea: () =>
    set({
      orders: [],
      ordersLoading: false,
      wallet: null,
      walletLoading: false,
    }),
}));

export const ordersActions = {
  clearUserArea: () => useOrdersStore.getState().clearUserArea(),
  setOrders: (orders: Order[]) => useOrdersStore.getState().setOrders(orders),
  setOrdersLoading: (ordersLoading: boolean) => useOrdersStore.getState().setOrdersLoading(ordersLoading),
  setWallet: (wallet: WalletInfo | null) => useOrdersStore.getState().setWallet(wallet),
  setWalletLoading: (walletLoading: boolean) => useOrdersStore.getState().setWalletLoading(walletLoading),
};
