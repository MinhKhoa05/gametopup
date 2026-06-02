import { FormEvent, useState } from 'react';
import { AsyncActionExecutor } from '../../../hooks/useAsyncAction';
import { DepositRequest } from '../../../types';
import { confirmDepositTransfer, createDepositRequest } from '../services/walletService';

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
