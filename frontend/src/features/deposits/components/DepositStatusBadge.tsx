import { Badge } from '@/shared/components';
import { getDepositStatusMeta } from '../depositMetadata';
import type { WalletDepositStatus } from '../types';

type DepositStatusBadgeProps = {
  className?: string;
  status: WalletDepositStatus;
};

export function DepositStatusBadge({ className, status }: DepositStatusBadgeProps) {
  const meta = getDepositStatusMeta(status);

  return (
    <Badge className={className} icon={meta.icon} tone={meta.tone}>
      {meta.label}
    </Badge>
  );
}
