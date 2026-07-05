import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  approveDepositRequest,
  confirmDepositTransfer,
  createDepositRequest,
  getDepositRequests,
  getDepositReviewRequests,
  rejectDepositRequest,
} from "./api";
import type { DepositReviewRequest, WalletDeposit, WalletDepositFilter } from "./types";
import type { DepositReviewFilter, DepositReviewInput } from "./api";
import { walletKeys } from "@/features/wallet/server";
import { useCursorPageQuery } from "@/shared/hooks/useCursorPageQuery";

const DEPOSIT_REQUESTS_STALE_TIME = 1000 * 30;
const DEPOSIT_REQUESTS_GC_TIME = 1000 * 60 * 5;
const DEPOSIT_REQUESTS_PAGE_SIZE = 10;
const DEPOSIT_REVIEW_STALE_TIME = 1000 * 60 * 5;
const DEPOSIT_REVIEW_PAGE_SIZE = 20;

export const depositKeys = {
  all: ["deposits"] as const,
  list: (filter: WalletDepositFilter | null) => ["deposits", "list", filter] as const,
  review: ["admin", "deposits"] as const,
  reviewList: (filter: DepositReviewFilter) => ["admin", "deposits", "list", filter] as const,
};

export function useDepositRequestsQuery(
  filter: WalletDepositFilter | null,
  enabled = true,
) {
  return useCursorPageQuery<WalletDeposit>({
    queryKey: depositKeys.list(filter),
    queryFn: (cursor) =>
      getDepositRequests({
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

// ---------- REVIEW ----------

function useDepositReviewRequestsQuery(filter: DepositReviewFilter) {
  return useCursorPageQuery<DepositReviewRequest>({
    queryKey: depositKeys.reviewList(filter),
    queryFn: (cursor) =>
      getDepositReviewRequests({
        cursor,
        filter,
        limit: DEPOSIT_REVIEW_PAGE_SIZE,
      }),
    keepPreviousData: true,
    staleTime: DEPOSIT_REVIEW_STALE_TIME,
  });
}

export function useApproveDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveDepositRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: depositKeys.review });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Đã duyệt yêu cầu nạp tiền.");
    },
  });
}

export function useRejectDepositRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectDepositRequest,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: depositKeys.review });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Đã từ chối yêu cầu nạp tiền.");
    },
  });
}

export function useDepositReviewSection(filter: DepositReviewFilter = null) {
  const requestsQuery = useDepositReviewRequestsQuery(filter);
  const requestMutations = {
    approve: useApproveDepositRequestMutation(),
    reject: useRejectDepositRequestMutation(),
  };

  const requests = requestsQuery.items;
  const loading = requestsQuery.isPending && requestsQuery.data === undefined;
  const busy = [requestMutations.approve.isPending, requestMutations.reject.isPending].some(Boolean);

  return {
    approveRequest: async (payload: DepositReviewInput) => {
      await requestMutations.approve.mutateAsync(payload);
    },
    busy,
    hasMore: requestsQuery.hasMore,
    isLoadingMore: requestsQuery.isLoadingMore,
    loadMore: requestsQuery.loadMore,
    loading,
    refresh: requestsQuery.refetch,
    refreshing: requestsQuery.isFetching && !requestsQuery.isPending,
    rejectRequest: async (payload: DepositReviewInput) => {
      await requestMutations.reject.mutateAsync(payload);
    },
    requests,
  };
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
