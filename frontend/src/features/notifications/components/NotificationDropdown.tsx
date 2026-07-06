import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BellRing,
  ChevronDown,
  CircleAlert,
  Inbox,
  Megaphone,
  RefreshCcw,
  ShoppingBag,
  Sparkles,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import {
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from "../server";
import type { Notification } from "../types";
import { NotificationType } from "../types";
import { classNames } from "@/shared/lib/classNames";
import { formatDateTimeCompact } from "@/shared/lib/format";

type NotificationDropdownProps = {
  enabled?: boolean;
};

export function NotificationDropdown({ enabled = true }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedNotificationId, setExpandedNotificationId] = useState<number | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const notificationsQuery = useNotificationsQuery(enabled && open);
  const unreadCountQuery = useUnreadNotificationCountQuery(enabled);
  const markAsReadMutation = useMarkNotificationAsReadMutation();

  const notifications = notificationsQuery.items;
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleNotification = (notification: Notification) => {
    setExpandedNotificationId((current) =>
      current === notification.id ? null : notification.id,
    );

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  return (
    <div ref={menuRef} className="relative hidden sm:block">
      <button
        type="button"
        className={classNames(
          "gt-button gt-button-secondary relative h-11 w-11 items-center justify-center rounded-2xl gt-text-soft sm:inline-flex",
          open && "border-cyan/25 bg-cyan/10 text-cyan-50",
        )}
        aria-label="Thông báo"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Thông báo"
        onClick={() => setOpen((current) => !current)}
      >
        {hasUnread ? <BellRing size={18} /> : <Bell size={18} />}

        {hasUnread ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full border border-[var(--gt-shell)] bg-cyan-500 px-1.5 py-0.5 text-center text-[0.68rem] font-black leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Thông báo"
          className="gt-panel absolute right-0 z-50 mt-3 w-[min(23rem,calc(100vw-2rem))] overflow-hidden bg-[var(--gt-panel)] shadow-[0_20px_56px_rgba(2,6,23,0.42)]"
        >
          <div className="flex items-start justify-between gap-3 border-b gt-border px-4 py-4">
            <div>
              <p className="text-[15px] font-bold tracking-[-0.02em] gt-text">
                Thông báo
              </p>
              <p className="mt-1 text-xs gt-text-muted">
                {hasUnread
                  ? `${unreadCount} thông báo chưa đọc`
                  : "Bạn đã đọc hết thông báo"}
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl border gt-border bg-white/5 p-2 gt-text-muted transition hover:bg-white/10 hover:text-white"
              aria-label="Làm mới thông báo"
              onClick={() => {
                notificationsQuery.refetch();
                unreadCountQuery.refetch();
              }}
            >
              <RefreshCcw
                size={14}
                className={classNames(
                  (notificationsQuery.isFetching || unreadCountQuery.isFetching) &&
                    "animate-spin",
                )}
              />
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto p-2">
            {notificationsQuery.isPending ? (
              <NotificationSkeleton />
            ) : notificationsQuery.isError ? (
              <NotificationError onRetry={() => notificationsQuery.refetch()} />
            ) : notifications.length === 0 ? (
              <NotificationEmpty />
            ) : (
              <div role="list" className="space-y-2">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isExpanded={expandedNotificationId === notification.id}
                    onClick={() => toggleNotification(notification)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  isExpanded,
  notification,
  onClick,
}: {
  isExpanded: boolean;
  notification: Notification;
  onClick: () => void;
}) {
  const Icon = getNotificationIcon(notification.type);

  return (
    <button
      type="button"
      role="listitem"
      className={classNames(
        "w-full rounded-2xl border px-3 py-3 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--gt-panel)]",
        notification.isRead
          ? "border-white/[0.06] bg-white/[0.025] hover:bg-white/[0.04]"
          : "border-cyan-400/18 bg-cyan-400/[0.045] hover:bg-cyan-400/[0.07]",
      )}
      aria-expanded={isExpanded}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <span
          className={classNames(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
            notification.isRead
              ? "border-white/10 bg-white/[0.04] gt-text-muted"
              : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
          )}
        >
          <Icon size={15} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={classNames(
                "line-clamp-1 text-sm tracking-[-0.01em]",
                notification.isRead ? "font-semibold gt-text-soft" : "font-bold gt-text",
              )}
            >
              {notification.title}
            </p>

            <ChevronDown
              size={14}
              className={classNames(
                "mt-0.5 shrink-0 gt-text-disabled transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </div>

          {isExpanded ? (
            <div className="mt-2">
              <p className="text-xs leading-5 gt-text-muted">
                {notification.message}
              </p>
              <time className="mt-2 block text-[0.68rem] font-semibold gt-text-disabled">
                {formatDateTimeCompact(notification.createdAt)}
              </time>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Đang tải thông báo">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 rounded-2xl bg-white/[0.03] p-3">
          <div className="h-8 w-8 animate-pulse rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationEmpty() {
  return (
    <div className="px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
        <Inbox size={20} />
      </div>
      <p className="mt-4 text-sm font-bold gt-text">Chưa có thông báo</p>
      <p className="mt-1 text-xs leading-5 gt-text-muted">
        Khi đơn hàng hoặc ví có cập nhật, thông báo sẽ xuất hiện tại đây.
      </p>
    </div>
  );
}

function NotificationError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-6 py-8 text-center">
      <p className="text-sm font-bold text-red-200">Không tải được thông báo.</p>
      <button
        type="button"
        className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/15"
        onClick={onRetry}
      >
        Thử lại
      </button>
    </div>
  );
}

function getNotificationIcon(type: NotificationType): LucideIcon {
  if (
    type === NotificationType.DepositSubmitted ||
    type === NotificationType.DepositApproved ||
    type === NotificationType.DepositRejected
  ) {
    return WalletCards;
  }

  if (
    type === NotificationType.OrderPlaced ||
    type === NotificationType.OrderProcessing ||
    type === NotificationType.OrderCompleted
  ) {
    return ShoppingBag;
  }

  if (type === NotificationType.OrderCancelled) return CircleAlert;
  if (type === NotificationType.Welcome) return Sparkles;

  return Megaphone;
}
