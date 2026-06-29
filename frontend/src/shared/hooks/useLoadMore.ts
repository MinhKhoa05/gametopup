import { useCallback, useState } from "react";

type UseLoadMoreOptions = {
  totalCount: number;
  pageSize: number;
};

export function useLoadMore({ totalCount, pageSize }: UseLoadMoreOptions) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const hasMore = visibleCount < totalCount;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + pageSize, totalCount));
  }, [pageSize, totalCount]);

  const reset = useCallback(() => {
    setVisibleCount(pageSize);
  }, [pageSize]);

  return {
    visibleCount,
    hasMore,
    loadMore,
    reset,
  };
}
