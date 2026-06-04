import { FormEvent, useState } from 'react';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { DepositRequest } from '../types';
import {
  useConfirmDepositMutation,
  useCreateDepositMutation,
  useDepositRequestsQuery,
  useRefreshWalletQuery,
  useTransactionsQuery,
} from '../services/wallet';

export function useWalletTransactions(isLoggedIn: boolean) {
  const transactionsQuery = useTransactionsQuery(isLoggedIn);
  const refreshWallet = useRefreshWalletQuery();

  const refreshTransactions = async () => {
    if (!isLoggedIn) return;
    await refreshWallet();
  };

  return {
    refreshTransactions,
    transactions: transactionsQuery.data ?? [],
    transactionsLoading: transactionsQuery.isPending && !transactionsQuery.data,
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

  const createDepositMutation = useCreateDepositMutation(async (request) => {
    setDeposit(request);
    await refreshUserArea();
  });

  const confirmDepositMutation = useConfirmDepositMutation(async (request) => {
    setDeposit(request);
    await refreshUserArea();
  });

  async function handleCreateDeposit(event: FormEvent) {
    event.preventDefault();

    await execute(() => createDepositMutation.mutateAsync(depositAmount), {
      successMessage: 'Đã tạo yêu cầu nạp ví. Quét QR và xác nhận khi đã chuyển khoản.',
    });
  }

  async function handleConfirmTransfer() {
    if (!deposit) return;

    await execute(() => confirmDepositMutation.mutateAsync(deposit.id), {
      successMessage: 'Đã ghi nhận xác nhận chuyển khoản. Yêu cầu sẽ được duyệt sớm.',
    });
  }

  return {
    confirmDepositPending: confirmDepositMutation.isPending,
    createDepositPending: createDepositMutation.isPending,
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
  const refreshWallet = useRefreshWalletQuery();

  const refreshDepositRequests = async () => {
    if (!isLoggedIn) return;
    await refreshWallet();
  };

  return {
    depositRequests: depositRequestsQuery.data ?? [],
    depositRequestsLoading: depositRequestsQuery.isPending && !depositRequestsQuery.data,
    refreshDepositRequests,
  };
}
