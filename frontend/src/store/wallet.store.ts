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
}));
