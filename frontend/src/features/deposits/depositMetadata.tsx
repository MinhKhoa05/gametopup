import type { ReactNode } from 'react';
import { Clock3 } from 'lucide-react';

import type { FilterChipGroupItem } from '@/shared/components';
import { WalletDepositStatus } from './types';
import type { DepositReviewFilter } from './api';

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

type DepositStatusMeta = {
  icon?: ReactNode;
  label: string;
  tone: BadgeTone;
};

export const DEPOSIT_REVIEW_FILTER_OPTIONS = [
  { value: 'active', label: 'Cần xử lý' },
  { value: null, label: 'Tất cả' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Đã từ chối' },
] satisfies readonly FilterChipGroupItem<DepositReviewFilter>[];

const DEPOSIT_STATUS_META: Record<WalletDepositStatus, DepositStatusMeta> = {
  [WalletDepositStatus.Pending]: {
    label: 'Chờ chuyển khoản',
    tone: 'warning',
    icon: <Clock3 size={14} />,
  },
  [WalletDepositStatus.UserConfirmed]: {
    label: 'Đã xác nhận',
    tone: 'primary',
  },
  [WalletDepositStatus.Approved]: {
    label: 'Đã duyệt',
    tone: 'success',
  },
  [WalletDepositStatus.Rejected]: {
    label: 'Đã từ chối',
    tone: 'danger',
  },
};

export function getDepositStatusMeta(status: WalletDepositStatus | number): DepositStatusMeta {
  return DEPOSIT_STATUS_META[status as WalletDepositStatus] ?? {
    label: `Trạng thái ${status}`,
    tone: 'neutral',
  };
}

export function isDepositReviewActionable(status: WalletDepositStatus) {
  return status === WalletDepositStatus.Pending || status === WalletDepositStatus.UserConfirmed;
}

export function isDepositReviewPending(status: WalletDepositStatus) {
  return status === WalletDepositStatus.Pending || status === WalletDepositStatus.UserConfirmed;
}
