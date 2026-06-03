import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { DepositRequest, User } from '../types';
import { confirmDepositTransfer, createDepositRequest, getMyDepositRequests, getWalletTransactions } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { useWalletStore } from '../store/wallet.store';
import { executeBackgroundFetch } from './common/useBackgroundFetch';

export function useWalletTransactions(
  user: User | null,
  setError: (message: string | null) => void,
) {
  const transactionsState = useWalletStore(
    useShallow((state) => ({
      transactions: state.transactions,
      transactionsLoading: state.transactionsLoading,
    })),
  );

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    const current = useWalletStore.getState();
    
    await executeBackgroundFetch({
      hasData: current.transactions.length > 0,
      setLoading: current.setTransactionsLoading,
      setError,
      fetcher: getWalletTransactions,
      onSuccess: current.setTransactions,
    });
  }, [setError, user]);

  useEffect(() => {
    refreshTransactions().catch(() => undefined);
  }, [refreshTransactions, user?.id]);

  return {
    refreshTransactions,
    transactions: transactionsState.transactions,
    transactionsLoading: transactionsState.transactionsLoading,
  };
}

export function useWalletDeposit({
  refreshUserArea,
  execute,
}: {
  refreshUserArea: () => Promise<void>;
  execute: AsyncActionExecutor;
}) {
  const [depositAmount, setDepositAmount] = useState(200000);
  const [deposit, setDeposit] = useState<DepositRequest | null>(null);

  async function handleCreateDeposit(event: FormEvent) {
    event.preventDefault();

    await execute(() => createDepositRequest(depositAmount), {
      successMessage: 'Đã tạo yêu cầu nạp ví. Quét QR và xác nhận khi đã chuyển khoản.',
      onSuccess: async (request) => {
        setDeposit(request);
        await refreshUserArea();
      },
    });
  }

  async function handleConfirmTransfer() {
    if (!deposit) return;

    await execute(() => confirmDepositTransfer(deposit.id), {
      successMessage: 'Đã ghi nhận xác nhận chuyển khoản. Yêu cầu sẽ được duyệt sớm.',
      onSuccess: async (request) => {
        setDeposit(request);
        await refreshUserArea();
      },
    });
  }

  return {
    deposit,
    depositAmount,
    handleConfirmTransfer,
    handleCreateDeposit,
    setDeposit,
    setDepositAmount,
  };
}

export function useDepositRequests(
  user: User | null,
  setError: (message: string | null) => void,
) {
  const depositRequestsState = useWalletStore(
    useShallow((state) => ({
      depositRequests: state.depositRequests,
      depositRequestsLoading: state.depositRequestsLoading,
    })),
  );

  const refreshDepositRequests = useCallback(async () => {
    if (!user) return;
    const current = useWalletStore.getState();

    await executeBackgroundFetch({
      hasData: current.depositRequests.length > 0,
      setLoading: current.setDepositRequestsLoading,
      setError,
      fetcher: getMyDepositRequests,
      onSuccess: current.setDepositRequests,
    });
  }, [setError, user]);

  useEffect(() => {
    refreshDepositRequests().catch(() => undefined);
  }, [refreshDepositRequests, user?.id]);

  return {
    depositRequests: depositRequestsState.depositRequests,
    depositRequestsLoading: depositRequestsState.depositRequestsLoading,
    refreshDepositRequests,
  };
}
