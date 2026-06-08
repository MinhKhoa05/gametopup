import { FormEvent, useState } from 'react';
import type { DepositRequest } from '@/features/wallet/wallet.types';
import {
  useDepositRequestsQuery,
  useTransactionsQuery,
  useWalletQuery,
  useWalletMutations,
} from '@/features/wallet/api/wallet';

export type TransactionFilter = 'all' | 'deposit' | 'withdraw' | 'paid' | 'refund';
export type WalletView = 'overview' | 'deposit';

function matchesTransactionFilter(type: number, filter: TransactionFilter) {
  if (filter === 'all') return true;
  if (filter === 'deposit') return type === 1;
  if (filter === 'withdraw') return type === 2;
  if (filter === 'paid') return type === 3;
  if (filter === 'refund') return type === 4;
  return true;
}

export function useWalletTransactions(isLoggedIn: boolean, filter: TransactionFilter) {
  const transactionsQuery = useTransactionsQuery(isLoggedIn);
  const transactions = transactionsQuery.data ?? [];

  return {
    transactions: transactions.filter((item) => matchesTransactionFilter(item.type, filter)),
    transactionsLoading: transactionsQuery.isPending && !transactionsQuery.data,
  };
}

export function useWalletDeposit() {
  const [depositAmount, setDepositAmount] = useState(200000);
  const [deposit, setDeposit] = useState<DepositRequest | null>(null);
  const walletMutations = useWalletMutations();

  function handleCreateDeposit(event: FormEvent) {
    event.preventDefault();

    walletMutations.createDeposit.mutate({ amount: depositAmount }, {
      onSuccess: (request) => {
        setDeposit(request);
      },
    });
  }

  function handleConfirmTransfer() {
    if (!deposit) return;

    walletMutations.confirmDeposit.mutate({ requestId: deposit.id }, {
      onSuccess: (request) => {
        setDeposit(request);
      },
    });
  }

  return {
    confirmDepositPending: walletMutations.confirmDeposit.isPending,
    createDepositPending: walletMutations.createDeposit.isPending,
    deposit,
    depositAmount,
    handleConfirmTransfer,
    handleCreateDeposit,
    setDeposit,
    setDepositAmount,
  };
}

export function useDepositRequests(isLoggedIn: boolean) {
  const depositRequestsQuery = useDepositRequestsQuery(isLoggedIn);

  return {
    depositRequests: depositRequestsQuery.data ?? [],
    depositRequestsLoading: depositRequestsQuery.isPending && !depositRequestsQuery.data,
  };
}

export function useWalletPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [view, setView] = useState<WalletView>('overview');
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const walletQuery = useWalletQuery(isLoggedIn);
  const walletTransactions = useWalletTransactions(isLoggedIn, filter);
  const depositRequests = useDepositRequests(isLoggedIn);
  const deposit = useWalletDeposit();

  return {
    deposit,
    depositRequests,
    filteredTransactions: walletTransactions.transactions,
    filter,
    isLoggedIn,
    wallet: walletQuery.data ?? null,
    walletLoading: walletQuery.isPending && !walletQuery.data,
    setFilter,
    setView,
    transactionLoading: walletTransactions.transactionsLoading,
    view,
  };
}
