import { useQuery } from '@tanstack/react-query';
import { getWalletBalance, getWalletOverview } from './api';

export const walletKeys = {
  all: ['wallet'] as const,
  balance: ['wallet', 'balance'] as const,
  overview: ['wallet', 'overview'] as const,
};

export function useWalletBalanceQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: getWalletBalance,
    enabled,
  });
}

export function useWalletOverviewQuery(enabled = true) {
  return useQuery({
    queryKey: walletKeys.overview,
    queryFn: getWalletOverview,
    enabled,
  });
}
