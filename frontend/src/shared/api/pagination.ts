import { api } from "./client";
import type { ApiResponse } from "@/shared/types/api";
import type { CursorPageResponse, CursorParams } from "@/shared/types/pagination";

export async function getCursorPage<TItem, TFilter = never>(
  url: string,
  params: CursorParams<TFilter> = {},
) {
  const response = await api.get<ApiResponse<CursorPageResponse<TItem>>>(
    url,
    { params },
  );

  return response.data.data;
}
