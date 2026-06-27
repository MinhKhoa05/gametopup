import { useQuery } from '@tanstack/react-query';
import { getWalletBalance, getWalletTransactions } from './api';

const WALLET_BALANCE_STALE_TIME = 1000 * 30;
const WALLET_TRANSACTIONS_STALE_TIME = 1000 * 60;
const WALLET_GC_TIME = 1000 * 60 * 5;

export const walletKeys = {
  all: ['wallet'] as const,
  balance: ['wallet', 'balance'] as const,
  transactions: ['wallet', 'transactions'] as const,
};

export function useWalletBalanceQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: getWalletBalance,
    enabled,
    staleTime: WALLET_BALANCE_STALE_TIME,
    gcTime: WALLET_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useWalletTransactionsQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.transactions,
    queryFn: getWalletTransactions,
    enabled,
    staleTime: WALLET_TRANSACTIONS_STALE_TIME,
    gcTime: WALLET_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}
