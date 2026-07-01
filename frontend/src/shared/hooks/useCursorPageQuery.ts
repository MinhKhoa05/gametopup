import { useCallback, useState } from "react";
import {
  keepPreviousData,
  type QueryKey,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { CursorPageResponse } from "@/shared/types/pagination";

type UseCursorPageQueryOptions<TItem> = {
  enabled?: boolean;
  gcTime?: number;
  keepPreviousData?: boolean;
  persist?: boolean;
  queryFn: (cursor: number | null) => Promise<CursorPageResponse<TItem>>;
  queryKey: QueryKey;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
};

function appendCursorPage<T>(
  current: CursorPageResponse<T> | undefined,
  next: CursorPageResponse<T>,
): CursorPageResponse<T> {
  if (!current) {
    return next;
  }

  return {
    items: [...current.items, ...next.items],
    nextCursor: next.nextCursor,
    hasMore: next.hasMore,
  };
}

export function useCursorPageQuery<TItem>({
  enabled = true,
  gcTime,
  keepPreviousData: shouldKeepPreviousData = false,
  persist = false,
  queryFn,
  queryKey,
  refetchOnWindowFocus,
  staleTime,
}: UseCursorPageQueryOptions<TItem>) {
  const queryClient = useQueryClient();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const query = useQuery({
    queryKey,
    queryFn: () => queryFn(null),
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    placeholderData: shouldKeepPreviousData ? keepPreviousData : undefined,
    meta: persist ? { persist: true } : undefined,
  });

  const loadMore = useCallback(async () => {
    const current =
      queryClient.getQueryData<CursorPageResponse<TItem>>(queryKey) ??
      query.data;

    if (!current?.hasMore || current.nextCursor === null || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = await queryFn(current.nextCursor);

      queryClient.setQueryData<CursorPageResponse<TItem>>(queryKey, (old) => {
        if (!old) {
          return nextPage;
        }

        return appendCursorPage(old, nextPage);
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, query.data, queryClient, queryFn, queryKey]);

  return {
    ...query,
    hasMore: query.data?.hasMore ?? false,
    isLoadingMore,
    items: query.data?.items ?? [],
    loadMore,
  };
}
