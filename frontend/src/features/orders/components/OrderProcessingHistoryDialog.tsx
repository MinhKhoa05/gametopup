import type { ComponentType } from 'react';
import { History } from 'lucide-react';

import { ORDER_TIMELINE_STATUS_META } from '@/features/orders/orderMetadata';
import type { OrderHistory } from '@/features/orders/types';
import { Button, Dialog, EmptyState, LoadingState } from '@/shared/components';
import { formatDate } from '@/shared/lib/format';

type OrderProcessingHistoryDialogProps = {
  history: OrderHistory[];
  loading: boolean;
  onClose: () => void;
  orderId: number | null;
};

export function OrderProcessingHistoryDialog({
  history,
  loading,
  onClose,
  orderId,
}: OrderProcessingHistoryDialogProps) {
  if (orderId === null) {
    return null;
  }

  const events = [...history]
    .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt))
    .map((item) => {
      const meta = ORDER_TIMELINE_STATUS_META[item.toStatus];

      return {
        id: item.id,
        actor: item.isAdmin ? `Admin #${item.actionBy}` : `User #${item.actionBy}`,
        description: item.note?.trim() || meta.description,
        icon: meta.icon,
        iconClassName: meta.color,
        time: item.createdAt,
        title: meta.title,
      };
    });

  return (
    <Dialog
      bodyClassName="p-4 sm:p-5"
      description={`Order #${orderId}`}
      footer={
        <div className="flex justify-end">
          <Button disabled={loading} onClick={onClose} variant="ghost">
            Đóng
          </Button>
        </div>
      }
      icon={<History size={18} />}
      isOpen
      loading={loading}
      maxWidthClassName="max-w-2xl"
      onClose={onClose}
      title="Processing History"
    >
      {loading && events.length === 0 ? (
        <LoadingState title="Đang tải lịch sử xử lý..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="Chưa có lịch sử xử lý"
          description="Các thay đổi trạng thái của đơn hàng sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="max-h-[520px] overflow-y-auto pr-1">
          {events.map((event, index) => (
            <TimelineItem
              key={event.id}
              actor={event.actor}
              description={event.description}
              icon={event.icon}
              iconClassName={event.iconClassName}
              last={index === events.length - 1}
              time={formatDate(event.time)}
              title={event.title}
            />
          ))}
        </div>
      )}
    </Dialog>
  );
}

function TimelineItem({
  actor,
  description,
  icon: Icon,
  iconClassName,
  last,
  time,
  title,
}: {
  actor: string;
  description?: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  iconClassName?: string;
  last: boolean;
  time: string;
  title: string;
}) {
  return (
    <div className={['relative flex gap-4', !last && 'mb-5 pb-5'].filter(Boolean).join(' ')}>
      {!last ? (
        <div className="absolute bottom-[-20px] left-[12px] top-7 w-px bg-[var(--gt-border)]" />
      ) : null}

      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--gt-border)] bg-[var(--gt-card)]">
        <Icon size={16} className={iconClassName} />
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-[var(--gt-border)] bg-[var(--gt-panel)] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h4 className="font-semibold gt-text">{title}</h4>
          <span className="text-xs gt-text-muted">{time}</span>
        </div>

        <p className="mt-2 text-sm leading-6 gt-text-muted">{description}</p>
        <p className="mt-2 text-xs font-semibold gt-text-disabled">{actor}</p>
      </div>
    </div>
  );
}
