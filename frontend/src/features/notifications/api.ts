import { api } from "@/shared/api/client";
import { getCursorPage } from "@/shared/api/pagination";
import type { ApiResponse } from "@/shared/types/api";
import type { CursorParams } from "@/shared/types/pagination";
import type { Notification, UnreadNotificationCount } from "./types";

type NotificationListParams = Pick<CursorParams, "cursor" | "limit">;

export async function getNotifications(params: NotificationListParams = {}) {
  return getCursorPage<Notification>("/api/notifications", params);
}

export async function getUnreadNotificationCount() {
  const response = await api.get<ApiResponse<UnreadNotificationCount>>(
    "/api/notifications/unread-count",
  );

  return response.data.data;
}

export async function markNotificationAsRead(notificationId: number) {
  await api.patch<ApiResponse<null>>(`/api/notifications/${notificationId}/read`);
}
