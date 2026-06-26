import React from "react";
import { createPortal } from "react-dom";
import {
  ShieldCheck,
  Clock3,
  Cog,
  CircleCheckBig,
  CircleX,
} from "lucide-react";

import { Button, DetailRow, ImageBox } from "@/shared/components";
import { formatCurrency, formatDate } from "@/shared/lib/format";

import { Order, OrderHistory, OrderStatus } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";

const TIMELINE_STATUS_META: Record<
  OrderStatus,
  {
    icon: typeof Clock3;
    title: string;
    description: string;
    color: string;
  }
> = {
  [OrderStatus.Pending]: {
    icon: Clock3,
    title: "Đơn hàng đã được ghi nhận",
    color: "text-amber-400",
    description:
      "Yêu cầu mua gói đã được ghi nhận và đang chờ quản trị viên tiếp nhận.",
  },

  [OrderStatus.Processing]: {
    icon: Cog,
    title: "Đang xử lý",
    color: "text-cyan-400",
    description: "Quản trị viên tiếp nhận và đang xử lý đơn hàng.",
  },

  [OrderStatus.Completed]: {
    icon: CircleCheckBig,
    title: "Hoàn thành",
    color: "text-emerald-400",
    description: "Đơn hàng đã được hoàn tất.",
  },

  [OrderStatus.Cancelled]: {
    icon: CircleX,
    title: "Đã hủy",
    color: "text-red-400",
    description: "Đơn hàng đã bị hủy.",
  },
};

type Props = {
  order: Order | null;
  history: OrderHistory[];
  open: boolean;
  onClose: () => void;
};

export function OrderDetailDialog({ order, history, open, onClose }: Props) {
  if (!open || !order) return null;

  const timelineEvents = history.map((item) => {
    const meta = TIMELINE_STATUS_META[item.toStatus];

    return {
      id: item.id,
      icon: meta.icon,
      color: meta.color,
      title: meta.title,
      description: item.note?.trim() || meta.description,
      time: item.createdAt,
    };
  });

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border gt-border bg-[var(--gt-panel)] shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        {/* HEADER */}

        <div className="flex items-start justify-between border-b gt-border px-6 py-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] gt-text-muted">
              Chi tiết đơn hàng
            </p>

            <h2 className="mt-2 text-[2rem] font-black leading-none gt-text">
              #GTOP{order.id}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm gt-text-muted">
              <span>{order.gameName}</span>

              <span className="hidden h-1 w-1 rounded-full bg-[var(--gt-text-muted)] opacity-40 sm:block" />

              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* BODY */}

        <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* LEFT */}

          <div className="rounded-[24px] border gt-border bg-[var(--gt-card)] p-6">
            <div className="flex items-start gap-4">
              <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[16px] border gt-border bg-[var(--gt-card)]">
                <ImageBox
                  src={order.packageImageUrl}
                  alt={order.packageName}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm gt-text-muted">{order.gameName}</p>

                <h3
                  className="mt-1 overflow-hidden text-[1.05rem] font-black leading-[1.25] gt-text
                    [display:-webkit-box]
                    [-webkit-box-orient:vertical]
                    [-webkit-line-clamp:2]"
                  title={order.packageName}
                >
                  {order.packageName}
                </h3>

                <p className="mt-2 text-sm leading-6 gt-text-muted">
                  Gói nạp dành cho {order.gameName}.
                </p>
              </div>
            </div>

            <div className="my-5 h-px bg-[var(--gt-border)]" />

            <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] p-5">
              <div className="text-sm font-medium gt-text-muted">
                Thanh toán
              </div>

              <div className="mt-2 text-[2rem] font-black text-cyan-300">
                {formatCurrency(order.packagePrice)}
              </div>
            </div>

            <div className="mt-4 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4">
              <DetailRow label="Mã đơn">#GTOP{order.id}</DetailRow>

              <DetailRow label="Tài khoản">{order.gameAccountInfo}</DetailRow>

              <DetailRow label="Ngày tạo">
                {formatDate(order.createdAt)}
              </DetailRow>

              <DetailRow label="Cập nhật">
                {formatDate(order.updatedAt)}
              </DetailRow>
            </div>
          </div>

          {/* RIGHT */}

          <div className="rounded-[24px] border gt-border bg-[var(--gt-card)] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-cyan-500/10">
                <ShieldCheck size={18} className="text-cyan-300" />
              </div>

              <div>
                <div className="text-lg font-black gt-text">Lịch sử xử lý</div>

                <div className="text-sm gt-text-muted">
                  Theo dõi toàn bộ quá trình xử lý đơn hàng
                </div>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-1">
              {timelineEvents.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  icon={event.icon}
                  iconClassName={event.color}
                  title={event.title}
                  description={event.description}
                  time={formatDate(event.time)}
                  last={index === timelineEvents.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t gt-border bg-[var(--gt-card)] px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TimelineItem({
  icon: Icon,
  iconClassName,
  title,
  description,
  time,
  last,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClassName?: string;
  title: string;
  description?: string;
  time: string;
  last: boolean;
}) {
  return (
    <div
      className={["relative flex gap-4", !last && "mb-5 pb-5"]
        .filter(Boolean)
        .join(" ")}
    >
      {!last && (
        <div className="absolute left-[12px] top-7 bottom-[-20px] w-px bg-[var(--gt-border)]" />
      )}

      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--gt-border)] bg-[var(--gt-card)]">
        <Icon size={16} className={iconClassName} />
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-panel)] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <h4 className="font-semibold gt-text">{title}</h4>

          <span className="shrink-0 text-xs gt-text-muted">
            {time}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 gt-text-muted">{description}</p>
      </div>
    </div>
  );
}
