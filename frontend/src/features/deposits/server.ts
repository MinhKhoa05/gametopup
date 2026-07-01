import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  confirmDepositTransfer,
  createDepositRequest,
  getMyDepositRequestCursor,
  getMyDepositRequest,
} from "./api";
import type { WalletDeposit, WalletDepositFilter } from "./types";
import { useCursorPageQuery } from "@/shared/hooks/useCursorPageQuery";

const DEPOSIT_REQUESTS_STALE_TIME = 1000 * 30;
const DEPOSIT_REQUESTS_GC_TIME = 1000 * 60 * 5;
const DEPOSIT_REQUESTS_PAGE_SIZE = 10;

export const depositKeys = {
  all: ["deposits"] as const,
  list: ["deposits", "list"] as const,
  cursor: (filter: WalletDepositFilter | null) => ["deposits", "cursor", filter] as const,
};

export function useDepositRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: depositKeys.list,
    queryFn: () => getMyDepositRequest(),
    enabled,
    staleTime: DEPOSIT_REQUESTS_STALE_TIME,
    gcTime: DEPOSIT_REQUESTS_GC_TIME,
    refetchOnWindowFocus: false,
    meta: { persist: true },
  });
}

export function useDepositRequestsCursorQuery(
  filter: WalletDepositFilter | null,
  enabled = true,
) {
  return useCursorPageQuery<WalletDeposit>({
    queryKey: depositKeys.cursor(filter),
    queryFn: (cursor) =>
      getMyDepositRequestCursor({
        cursor,
        filter,
        limit: DEPOSIT_REQUESTS_PAGE_SIZE,
      }),
    enabled,
    staleTime: DEPOSIT_REQUESTS_STALE_TIME,
    gcTime: DEPOSIT_REQUESTS_GC_TIME,
    refetchOnWindowFocus: false,
    persist: true,
  });
}

export function useCreateDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepositRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: depositKeys.all,
      });

      toast.success("Đã tạo yêu cầu nạp tiền.");
    },
  });
}

export function useConfirmDepositTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmDepositTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: depositKeys.all,
      });

      toast.success("Đã xác nhận chuyển khoản.");
    },
  });
}
