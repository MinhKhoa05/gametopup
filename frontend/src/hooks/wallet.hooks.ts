import { FormEvent, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { DepositRequest, User } from '../types';
import { confirmDepositTransfer, createDepositRequest, getMyDepositRequests, getWalletTransactions } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { walletActions, useWalletStore } from '../store/wallet.store';
import type { AuthStatus, AuthUserSnapshot } from '../types/auth.types';

export function useWalletTransactions(
  user: User | null,
  authStatus: AuthStatus,
  userSnapshot: AuthUserSnapshot | null,
  setError: (message: string | null) => void,
) {
  const transactionsState = useWalletStore(
    useShallow((state) => ({
      transactions: state.transactions,
      transactionsLoading: state.transactionsLoading,
    })),
  );

  async function refreshTransactions() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) {
      walletActions.clearWalletData();
      return;
    }

    const hasData = useWalletStore.getState().transactions.length > 0;
    walletActions.setTransactionsLoading(!hasData);

    try {
      const data = await getWalletTransactions();
      walletActions.setTransactions(data);
    } catch (error) {
      if (!hasData) setError(getApiMessage(error));
    } finally {
      walletActions.setTransactionsLoading(false);
    }
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      walletActions.clearWalletData();
      return;
    }

    refreshTransactions().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

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
  authStatus: AuthStatus,
  userSnapshot: AuthUserSnapshot | null,
  setError: (message: string | null) => void,
) {
  const depositRequestsState = useWalletStore(
    useShallow((state) => ({
      depositRequests: state.depositRequests,
      depositRequestsLoading: state.depositRequestsLoading,
    })),
  );

  async function refreshDepositRequests() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) {
      walletActions.clearWalletData();
      return;
    }

    const hasData = useWalletStore.getState().depositRequests.length > 0;
    walletActions.setDepositRequestsLoading(!hasData);

    try {
      const data = await getMyDepositRequests();
      walletActions.setDepositRequests(data);
    } catch (error) {
      if (!hasData) setError(getApiMessage(error));
    } finally {
      walletActions.setDepositRequestsLoading(false);
    }
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      walletActions.clearWalletData();
      return;
    }

    refreshDepositRequests().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

  return {
    depositRequests: depositRequestsState.depositRequests,
    depositRequestsLoading: depositRequestsState.depositRequestsLoading,
    refreshDepositRequests,
  };
}
