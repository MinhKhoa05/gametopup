import type { ReactNode } from 'react';
import { Send } from 'lucide-react';
import { Badge, EmptyState, IconBox, SectionHeading } from '@/shared/components';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { classNames } from '@/shared/lib/classNames';
import type { DepositRequest, WalletTransaction, WalletTransactionType } from '@/features/wallet/types';
import { getDepositRequestStatus } from '@/features/wallet/lib/deposit-request-status';

const WALLET_TRANSACTION_META: Record<
  WalletTransactionType,
  {
    decrease: boolean;
    icon: ReactNode;
    label: string;
    iconClassName: string;
  }
> = {
  1: {
    decrease: false,
    icon: <Send size={16} />,
    label: 'Nạp tiền',
    iconClassName: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
  },
  2: {
    decrease: true,
    icon: <Send size={16} className="rotate-180" />,
    label: 'Rút tiền',
    iconClassName: 'border-rose-400/15 bg-rose-400/10 text-rose-300',
  },
  3: {
    decrease: true,
    icon: <Send size={16} />,
    label: 'Thanh toán',
    iconClassName: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
  },
  4: {
    decrease: true,
    icon: <Send size={16} />,
    label: 'Hoàn tiền',
    iconClassName: 'border-rose-400/15 bg-rose-400/10 text-rose-300',
  },
};

export function WalletDepositRequestHistory({
  loading,
  requests,
  onCreate,
}: {
  loading: boolean;
  requests: DepositRequest[];
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

export function WalletTransactionHistory({
  loading,
  transactions,
}: {
  loading: boolean;
  transactions: WalletTransaction[];
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

function DepositRequestCard({ request }: { request: DepositRequest }) {
  const status = getDepositRequestStatus(request.status);

  return (
    <WalletActivityRow
      icon={status.icon}
      iconClassName={status.iconClassName}
      details={
        <div className="grid gap-2 text-left md:max-w-56 md:justify-self-end md:text-right">
          <Badge variant={status.badgeVariant} icon={status.icon}>
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

function WalletTransactionCard({ item }: { item: WalletTransaction }) {
  const meta = WALLET_TRANSACTION_META[item.type];

  return (
    <WalletActivityRow
      icon={meta.icon}
      iconClassName={meta.iconClassName}
      details={
        <div className="text-left md:text-right">
          <strong className={classNames('block text-lg font-black', meta.decrease ? 'text-rose-300' : 'text-emerald-300')}>
            {meta.decrease ? '-' : '+'}
            {formatCurrency(item.amount)}
          </strong>
          <span className="block text-sm text-slate-400">Còn lại {formatCurrency(item.balanceAfter)}</span>
        </div>
      }
      title={<strong className="block text-base font-black text-white">{meta.label}</strong>}
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
