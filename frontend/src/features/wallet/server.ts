import { useQuery } from '@tanstack/react-query';
import { getWalletBalance, getWalletTransactions } from './api';

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
  });
}

export function useWalletTransactionsQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.transactions,
    queryFn: getWalletTransactions,
    enabled,
  });
}
