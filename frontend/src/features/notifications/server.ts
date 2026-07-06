import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "./api";
import type { Notification, UnreadNotificationCount } from "./types";
import { useCursorPageQuery } from "@/shared/hooks/useCursorPageQuery";
import type { CursorPageResponse } from "@/shared/types/pagination";

const NOTIFICATION_PAGE_SIZE = 5;
const NOTIFICATION_STALE_TIME = 1000 * 30;
const NOTIFICATION_GC_TIME = 1000 * 60 * 5;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: ["notifications", "list"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export function useNotificationsQuery(enabled = true) {
  return useCursorPageQuery<Notification>({
    queryKey: notificationKeys.list,
    queryFn: (cursor) =>
      getNotifications({
        cursor,
        limit: NOTIFICATION_PAGE_SIZE,
      }),
    enabled,
    staleTime: NOTIFICATION_STALE_TIME,
    gcTime: NOTIFICATION_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    enabled,
    staleTime: NOTIFICATION_STALE_TIME,
    gcTime: NOTIFICATION_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationKeys.list }),
        queryClient.cancelQueries({ queryKey: notificationKeys.unreadCount }),
      ]);

      const previousNotifications =
        queryClient.getQueryData<CursorPageResponse<Notification>>(
          notificationKeys.list,
        );
      const previousUnreadCount =
        queryClient.getQueryData<UnreadNotificationCount>(
          notificationKeys.unreadCount,
        );

      queryClient.setQueryData<CursorPageResponse<Notification>>(
        notificationKeys.list,
        (current) => {
          if (!current) return current;

          return {
            ...current,
            items: current.items.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    isRead: true,
                    readAt: notification.readAt ?? new Date().toISOString(),
                  }
                : notification,
            ),
          };
        },
      );

      queryClient.setQueryData<UnreadNotificationCount>(
        notificationKeys.unreadCount,
        (current) => ({
          unreadCount: Math.max((current?.unreadCount ?? 1) - 1, 0),
        }),
      );

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          notificationKeys.list,
          context.previousNotifications,
        );
      }

      if (context?.previousUnreadCount) {
        queryClient.setQueryData(
          notificationKeys.unreadCount,
          context.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}
