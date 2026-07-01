export type CursorParams<TFilter = never> = {
  cursor?: number | null;
  limit?: number;
  filter?: TFilter | null;
};

export type CursorPageResponse<T> = {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
};
