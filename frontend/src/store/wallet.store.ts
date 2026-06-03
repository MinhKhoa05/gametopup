import { create } from 'zustand';
import type { DepositRequest, WalletTransaction } from '../types';

type WalletStore = {
  depositRequests: DepositRequest[];
  depositRequestsLoading: boolean;
  transactions: WalletTransaction[];
  transactionsLoading: boolean;
  setDepositRequests: (depositRequests: DepositRequest[]) => void;
  setDepositRequestsLoading: (depositRequestsLoading: boolean) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setTransactionsLoading: (transactionsLoading: boolean) => void;
  clearWalletData: () => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
  depositRequests: [],
  depositRequestsLoading: false,
  transactions: [],
  transactionsLoading: false,

  setDepositRequests: (depositRequests) => set({ depositRequests }),
  setDepositRequestsLoading: (depositRequestsLoading) => set({ depositRequestsLoading }),
  setTransactions: (transactions) => set({ transactions }),
  setTransactionsLoading: (transactionsLoading) => set({ transactionsLoading }),

  clearWalletData: () =>
    set({
      depositRequests: [],
      depositRequestsLoading: false,
      transactions: [],
      transactionsLoading: false,
    }),
}));

export const walletActions = {
  clearWalletData: () => useWalletStore.getState().clearWalletData(),
  setDepositRequests: (depositRequests: DepositRequest[]) => useWalletStore.getState().setDepositRequests(depositRequests),
  setDepositRequestsLoading: (depositRequestsLoading: boolean) =>
    useWalletStore.getState().setDepositRequestsLoading(depositRequestsLoading),
  setTransactions: (transactions: WalletTransaction[]) => useWalletStore.getState().setTransactions(transactions),
  setTransactionsLoading: (transactionsLoading: boolean) => useWalletStore.getState().setTransactionsLoading(transactionsLoading),
};
