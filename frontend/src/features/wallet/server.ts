import { useQuery } from '@tanstack/react-query';
import { getWalletBalance, getWalletTransactions } from './api';
import type { WalletTransaction, WalletTransactionFilter } from './types';
import { useCursorPageQuery } from '@/shared/hooks/useCursorPageQuery';

const WALLET_HISTORY_PAGE_SIZE = 10;

const WALLET_BALANCE_STALE_TIME = 1000 * 30;
const WALLET_TRANSACTIONS_STALE_TIME = 1000 * 60;
const WALLET_GC_TIME = 1000 * 60 * 5;

export const walletKeys = {
  all: ['wallet'] as const,
  balance: ['wallet', 'balance'] as const,
  transactions: (filter: WalletTransactionFilter | null) =>
    ['wallet', 'transactions', 'list', filter] as const,
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

export function useWalletTransactionsQuery(
  filter: WalletTransactionFilter | null,
  enabled = true,
) {
  return useCursorPageQuery<WalletTransaction>({
    queryKey: walletKeys.transactions(filter),
    queryFn: (cursor) =>
      getWalletTransactions({
        cursor,
        filter,
        limit: WALLET_HISTORY_PAGE_SIZE,
      }),
    enabled,
    staleTime: WALLET_TRANSACTIONS_STALE_TIME,
    gcTime: WALLET_GC_TIME,
    refetchOnWindowFocus: false,
    persist: true,
  });
}
