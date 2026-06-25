import { ShieldCheck } from "lucide-react";

import { Button, DetailRow, ImageBox } from "@/shared/components";
import { formatCurrency, formatDate } from "@/shared/lib/format";

import { Order, OrderHistory, OrderStatus } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";

const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Chờ xử lý",
  [OrderStatus.Processing]: "Đang xử lý",
  [OrderStatus.Completed]: "Hoàn thành",
  [OrderStatus.Cancelled]: "Đã hủy",
};

type Props = {
  order: Order | null;
  history: OrderHistory[];
  open: boolean;
  onClose: () => void;
};

export function OrderDetailDialog({ order, history, open, onClose }: Props) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex max-h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[var(--gt-surface)] shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/10 px-7 py-6">
          <div>
            <p className="gt-text-muted text-xs uppercase tracking-[0.2em]">
              Chi tiết đơn hàng
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              #GTOP{order.id}
            </h2>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        {/* BODY */}

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* LEFT */}

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-5">
              <div className="flex gap-5">
                <ImageBox
                  src={order.packageImageUrl}
                  alt={order.packageName}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xl font-bold text-white">
                    {order.gameName}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {order.packageName}
                  </p>

                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Thanh toán
                    </div>

                    <div className="text-3xl font-black text-cyan-300">
                      {formatCurrency(order.packagePrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-4 text-sm font-semibold text-white">
                Thông tin đơn hàng
              </div>

              <div className="grid gap-3">
                <DetailRow label="Mã đơn">#GTOP{order.id}</DetailRow>

                <DetailRow label="Tài khoản game">
                  {order.gameAccountInfo}
                </DetailRow>

                <DetailRow label="Game">{order.gameName}</DetailRow>

                <DetailRow label="Gói nạp">{order.packageName}</DetailRow>

                <DetailRow label="Thanh toán">
                  {formatCurrency(order.packagePrice)}
                </DetailRow>

                <DetailRow label="Ngày tạo">
                  {formatDate(order.createdAt)}
                </DetailRow>

                <DetailRow label="Cập nhật">
                  {formatDate(order.updatedAt)}
                </DetailRow>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <ShieldCheck size={18} className="text-cyan-300" />
              </div>

              <div>
                <div className="font-bold text-white">Lịch sử xử lý</div>

                <div className="text-sm text-slate-400">
                  Theo dõi toàn bộ quá trình xử lý đơn hàng
                </div>
              </div>
            </div>

            {history.length === 0 ? (
              <TimelineItem
                title="Đơn hàng được tạo"
                time={formatDate(order.createdAt)}
                last
              />
            ) : (
              <div className="space-y-5">
                {history.map((item, index) => (
                  <TimelineItem
                    key={item.id}
                    title={STATUS_LABEL[item.toStatus]}
                    description={item.note}
                    time={formatDate(item.createdAt)}
                    last={index === history.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex justify-end border-t border-white/10 bg-black/10 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  description,
  time,
  last,
}: {
  title: string;
  description?: string | null;
  time: string;
  last: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {!last && (
        <div className="absolute left-[15px] top-9 bottom-[-24px] w-px bg-white/10" />
      )}

      <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 ring-4 ring-cyan-500/10">
        <div className="h-3 w-3 rounded-full bg-cyan-400" />
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-white">{title}</div>

            <div className="mt-1 text-xs text-slate-500">{time}</div>
          </div>
        </div>

        {description && (
          <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        )}
      </div>
    </div>
  );
}
