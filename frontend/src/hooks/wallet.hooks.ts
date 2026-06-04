import { FormEvent, useState } from 'react';
import { DepositRequest } from '../types';
import {
  useDepositRequestsQuery,
  useTransactionsQuery,
  useWalletMutations,
} from '../services/wallet';

export function useWalletTransactions(isLoggedIn: boolean) {
  const transactionsQuery = useTransactionsQuery(isLoggedIn);

  return {
    transactions: transactionsQuery.data ?? [],
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
