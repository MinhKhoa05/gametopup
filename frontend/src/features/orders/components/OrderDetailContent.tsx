import type { ReactNode } from 'react';

import { DetailRow, ImageBox } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';

type OrderDetailContentProps = {
  actionMessage?: ReactNode;
  extraRows?: ReactNode;
  order: {
    createdAt: string;
    gameAccountInfo: string;
    gameName: string;
    id: number;
    packageId: number;
    packageImageUrl: string;
    packageName: string;
    packagePrice: number;
    updatedAt: string;
  };
};

export function OrderDetailContent({
  actionMessage,
  extraRows,
  order,
}: OrderDetailContentProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[18px] border gt-border bg-[var(--gt-card)] p-4">
        <div className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center">
          <div className="size-[72px] overflow-hidden rounded-[16px] border gt-border bg-white/[0.03]">
            <ImageBox src={order.packageImageUrl} alt="" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold gt-text-muted">
              {order.gameName} · {order.packageName}
            </p>
            <strong className="mt-1 block text-2xl font-black tracking-tight gt-text">
              {formatCurrency(order.packagePrice)}
            </strong>
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-[18px] border gt-border bg-[var(--gt-card)] px-4 text-sm">
        <DetailRow label="UID / Server / Nhân vật">{order.gameAccountInfo}</DetailRow>
        <DetailRow label="Gói nạp">#{order.packageId}</DetailRow>
        {extraRows}
        <DetailRow label="Ngày tạo">{formatDate(order.createdAt)}</DetailRow>
        <DetailRow label="Cập nhật lần cuối">{formatDate(order.updatedAt)}</DetailRow>
      </div>

      {actionMessage ? (
        <p className="rounded-[16px] border border-dashed gt-border px-4 py-3 text-sm leading-6 gt-text-muted">
          {actionMessage}
        </p>
      ) : null}
    </div>
  );
}
