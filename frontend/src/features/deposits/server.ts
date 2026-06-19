import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { confirmDepositTransfer, createDepositRequest } from './api';
import { walletKeys } from '@/features/wallet/server';

export function useCreateDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepositRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã tạo yêu cầu nạp tiền.');
    },
  });
}

export function useConfirmDepositTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmDepositTransfer,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success('Đã xác nhận chuyển khoản.');
    },
  });
}
