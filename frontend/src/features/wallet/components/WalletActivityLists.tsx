import type { ReactNode } from 'react';
import { Send } from 'lucide-react';
import { Badge, EmptyState, IconBox, SectionHeading } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/format';
import { classNames } from '@/lib/ui';
import type { DepositRequestItem, WalletTransactionItem } from '@/features/wallet/wallet.types';
import {
  getDepositRequestBadgeVariant,
  getDepositRequestIconClassName,
  getDepositRequestStatus,
  getTransactionIcon,
  getTransactionIconClassName,
  getTransactionLabel,
  isDecreaseTransaction,
} from '@/helpers/wallet-activity.helpers';

export function DepositRequestList({
  loading,
  requests,
  onCreate,
}: {
  loading: boolean;
  requests: DepositRequestItem[];
  onCreate: () => void;
}) {
  const recentRequests = requests.slice(0, 4);

  return (
    <section className="gt-surface-ink rounded-2xl">
      <SectionHeading
        className="px-6 pt-6"
        action={<Send size={22} />}
        title="Yêu cầu nạp gần đây"
        description="Theo dõi các yêu cầu đã gửi và trạng thái admin duyệt."
      />

      {loading && recentRequests.length === 0 ? (
        <EmptyState variant="flush" title="Đang tải yêu cầu nạp..." />
      ) : recentRequests.length === 0 ? (
        <EmptyState
          variant="flush"
          actionLabel="Tạo yêu cầu nạp"
          description="Hãy tạo yêu cầu mới để hệ thống cấp mã VietQR."
          onAction={onCreate}
          title="Chưa có yêu cầu nạp nào."
        />
      ) : (
        <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {recentRequests.map((request) => (
            <DepositRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </section>
  );
}

export function WalletTransactionList({
  loading,
  transactions,
}: {
  loading: boolean;
  transactions: WalletTransactionItem[];
}) {
  if (loading && transactions.length === 0) {
    return <EmptyState variant="flush" title="Đang tải lịch sử ví..." />;
  }

  if (transactions.length === 0) {
    return <EmptyState variant="flush" title="Chưa có giao dịch phù hợp." />;
  }

  return (
    <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
      {transactions.map((item) => (
        <WalletTransactionCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function DepositRequestCard({ request }: { request: DepositRequestItem }) {
  const status = getDepositRequestStatus(request.status);

  return (
    <WalletActivityRow
      icon={status.icon}
      iconClassName={getDepositRequestIconClassName(status.tone)}
      details={
        <div className="grid gap-2 text-left md:max-w-56 md:justify-self-end md:text-right">
          <Badge variant={getDepositRequestBadgeVariant(status.tone)} icon={status.icon}>
            {status.label}
          </Badge>
          <span className="text-sm leading-5 text-slate-400">{status.description}</span>
        </div>
      }
      title={<strong className="block text-base font-black text-white">{formatCurrency(request.amount)}</strong>}
      description={
        <>
          <span className="mt-1 block break-words text-sm text-slate-300">{request.transferContent}</span>
          <small className="mt-1 block text-xs font-semibold text-slate-500">{formatDate(request.createdAt)}</small>
        </>
      }
    />
  );
}

function WalletTransactionCard({ item }: { item: WalletTransactionItem }) {
  const decrease = isDecreaseTransaction(item.type);

  return (
    <WalletActivityRow
      icon={getTransactionIcon(item.type)}
      iconClassName={getTransactionIconClassName(item.type)}
      details={
        <div className="text-left md:text-right">
          <strong className={classNames('block text-lg font-black', decrease ? 'text-rose-300' : 'text-emerald-300')}>
            {decrease ? '-' : '+'}
            {formatCurrency(item.amount)}
          </strong>
          <span className="block text-sm text-slate-400">Còn lại {formatCurrency(item.balanceAfter)}</span>
        </div>
      }
      title={<strong className="block text-base font-black text-white">{getTransactionLabel(item.type)}</strong>}
      description={
        <>
          <span className="mt-1 block break-words text-sm text-slate-300">{item.description || `Giao dịch ví #${item.id}`}</span>
          <small className="mt-1 block text-xs font-semibold text-slate-500">{formatDate(item.createdAt)}</small>
        </>
      }
    />
  );
}

function WalletActivityRow({
  description,
  details,
  icon,
  iconClassName,
  title,
}: {
  description: ReactNode;
  details: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  title: ReactNode;
}) {
  return (
    <div className="grid gap-4 px-6 py-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
      <IconBox
        size="md"
        className={classNames(
          '!bg-blue-500/10 !text-blue-300',
          iconClassName,
        )}
      >
        {icon}
      </IconBox>
      <div className="min-w-0">
        {title}
        {description}
      </div>
      {details}
    </div>
  );
}
