import type { ComponentType } from "react";
import {
  ShieldCheck,
  Clock3,
  Cog,
  CircleCheckBig,
  CircleX,
} from "lucide-react";

import { Button, DetailRow, Dialog, ImageBox, PanelShell } from "@/shared/components";
import { formatCurrency, formatDate } from "@/shared/lib/format";

import { OrderStatus } from "../types";
import type { Order, OrderHistory } from "../types";
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
    title: "Đơn hàng đã được ghi nhận",
    color: "text-amber-400",
    description:
      "Yêu cầu mua gói đã được ghi nhận và đang chờ quản trị viên tiếp nhận.",
  },

  [OrderStatus.Processing]: {
    icon: Cog,
    title: "Đang xử lý",
    color: "text-cyan-400",
    description: "Quản trị viên tiếp nhận và đang xử lý đơn hàng.",
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
  historyLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function OrderDetailDialog({
  order,
  history,
  historyLoading,
  isOpen,
  onClose,
}: Props) {
  if (!isOpen || !order) return null;

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

  return (
    <Dialog
      bodyClassName="grid flex-1 gap-6 overflow-y-auto p-5 sm:p-6 lg:grid-cols-[380px_minmax(0,1fr)]"
      description={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{order.gameName}</span>
          <span className="hidden h-1 w-1 rounded-full bg-[var(--gt-text-muted)] opacity-40 sm:block" />
          <span>{formatDate(order.createdAt)}</span>
        </span>
      }
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
      headerAccessory={<OrderStatusBadge status={order.status} />}
      icon={<ShieldCheck size={18} />}
      isOpen={isOpen}
      maxWidthClassName="max-w-5xl"
      onClose={onClose}
      panelClassName="flex max-h-[85vh] flex-col"
      title={`#GTOP${order.id}`}
    >
      <PanelShell className="p-6">
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

        <div>
          <div className="text-sm font-medium gt-text-muted">Thanh toán</div>

          <div className="mt-2 text-[2rem] font-black text-cyan-300">
            {formatCurrency(order.packagePrice)}
          </div>
        </div>

        <div className="my-5 h-px bg-[var(--gt-border)]" />

        <div>
          <DetailRow label="Mã đơn">#GTOP{order.id}</DetailRow>
          <DetailRow label="Tài khoản">{order.gameAccountInfo}</DetailRow>
          <DetailRow label="Ngày tạo">{formatDate(order.createdAt)}</DetailRow>
          <DetailRow label="Cập nhật">{formatDate(order.updatedAt)}</DetailRow>
        </div>
      </PanelShell>

      <PanelShell className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-cyan-500/10">
            <ShieldCheck size={18} className="text-cyan-300" />
          </div>

          <div>
            <div className="text-lg font-black gt-text">Lịch sử xử lý</div>

            <div className="text-sm gt-text-muted">
              Theo dõi toàn bộ quá trình xử lý đơn hàng
            </div>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto pr-1">
          {historyLoading && timelineEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--gt-border)] bg-[var(--gt-panel)] px-4 py-5 text-sm gt-text-muted">
              Đang tải lịch sử xử lý...
            </div>
          ) : (
            timelineEvents.map((event, index) => (
              <TimelineItem
                key={event.id}
                icon={event.icon}
                iconClassName={event.color}
                title={event.title}
                description={event.description}
                time={formatDate(event.time)}
                last={index === timelineEvents.length - 1}
              />
            ))
          )}
        </div>
      </PanelShell>
    </Dialog>
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
  icon: ComponentType<{ size?: number; className?: string }>;
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

          <span className="shrink-0 text-xs gt-text-muted">{time}</span>
        </div>

        <p className="mt-2 text-sm leading-6 gt-text-muted">{description}</p>
      </div>
    </div>
  );
}
