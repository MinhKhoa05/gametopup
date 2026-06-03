import { FormEvent, useEffect, useState } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { DepositRequest, User, WalletTransaction } from '../types';
import { confirmDepositTransfer, createDepositRequest, getMyDepositRequests, getWalletTransactions } from '../services/wallet.api';
import { getApiMessage } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export function useWalletTransactions(user: User | null, setError: (message: string | null) => void) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const authStatus = useAuthStore((state) => state.authStatus);
  const userSnapshot = useAuthStore((state) => state.userSnapshot);

  async function refreshTransactions() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) {
      setTransactions([]);
      return;
    }

    setTransactionsLoading(transactions.length === 0);

    try {
      const data = await getWalletTransactions();
      setTransactions(data);
    } catch (err) {
      if (transactions.length === 0) setError(getApiMessage(err));
    } finally {
      setTransactionsLoading(false);
    }
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      setTransactions([]);
      return;
    }

    refreshTransactions().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

  return {
    refreshTransactions,
    transactions,
    transactionsLoading,
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

export function useDepositRequests(user: User | null, setError: (message: string | null) => void) {
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [depositRequestsLoading, setDepositRequestsLoading] = useState(false);
  const authStatus = useAuthStore((state) => state.authStatus);
  const userSnapshot = useAuthStore((state) => state.userSnapshot);

  async function refreshDepositRequests() {
    if (!user && !(authStatus === 'checking' && userSnapshot)) {
      setDepositRequests([]);
      return;
    }

    setDepositRequestsLoading(depositRequests.length === 0);

    try {
      const data = await getMyDepositRequests();
      setDepositRequests(data);
    } catch (err) {
      if (depositRequests.length === 0) setError(getApiMessage(err));
    } finally {
      setDepositRequestsLoading(false);
    }
  }

  useEffect(() => {
    if (authStatus === 'guest' || (!user && !userSnapshot)) {
      setDepositRequests([]);
      return;
    }

    refreshDepositRequests().catch(() => undefined);
  }, [authStatus, user, userSnapshot]);

  return {
    depositRequests,
    depositRequestsLoading,
    refreshDepositRequests,
  };
}
