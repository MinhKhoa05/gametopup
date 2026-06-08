import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock3, CreditCard, Send, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import type { DepositRequestStatus } from '@/features/wallet/wallet.types';

const transactionLabelByType: Record<number, string> = {
  1: 'Nạp tiền',
  2: 'Rút tiền',
  3: 'Thanh toán đơn hàng',
  4: 'Hoàn tiền',
};

const transactionIconByType: Record<number, ReactNode> = {
  1: <ArrowDownLeft size={18} />,
  2: <ArrowUpRight size={18} />,
  3: <ArrowUpRight size={18} />,
  4: <ArrowDownLeft size={18} />,
};

const depositRequestStatusByCode: Record<number, DepositRequestStatus> = {
  1: {
    label: 'Chờ chuyển khoản',
    description: 'Bạn cần chuyển khoản và xác nhận.',
    tone: 'pending',
    icon: <Clock3 size={18} />,
  },
  2: {
    label: 'Đã gửi, chờ duyệt',
    description: 'Admin kiểm tra khoảng 10-15 phút.',
    tone: 'reviewing',
    icon: <Send size={18} />,
  },
  3: {
    label: 'Đã duyệt',
    description: 'Số dư đã được cộng vào ví.',
    tone: 'approved',
    icon: <CheckCircle2 size={18} />,
  },
  4: {
    label: 'Đã từ chối',
    description: 'Vui lòng kiểm tra lại thông tin.',
    tone: 'rejected',
    icon: <XCircle size={18} />,
  },
};

export function getDepositRequestStatus(status: number) {
  return depositRequestStatusByCode[status] ?? {
    label: `Trạng thái ${status}`,
    description: 'Đang cập nhật thông tin.',
    tone: 'pending' as const,
    icon: <Clock3 size={18} />,
  };
}

export function getDepositRequestBadgeVariant(tone: DepositRequestStatus['tone']) {
  switch (tone) {
    case 'approved':
      return 'success';
    case 'reviewing':
      return 'accent';
    case 'rejected':
      return 'danger';
    default:
      return 'warning';
  }
}

export function getDepositRequestIconClassName(tone: DepositRequestStatus['tone']) {
  switch (tone) {
    case 'reviewing':
      return '!bg-amber-400/10 !text-amber-300';
    case 'approved':
      return '!bg-emerald-500/10 !text-emerald-300';
    case 'rejected':
      return '!bg-rose-500/10 !text-rose-300';
    default:
      return '!bg-blue-500/10 !text-blue-300';
  }
}

export function getTransactionLabel(type: number) {
  return transactionLabelByType[type] ?? `Giao dịch loại ${type}`;
}

export function getTransactionIcon(type: number) {
  return transactionIconByType[type] ?? <CreditCard size={18} />;
}

export function isDecreaseTransaction(type: number) {
  return type === 2 || type === 3;
}

export function getTransactionIconClassName(type: number) {
  switch (type) {
    case 2:
    case 3:
      return '!bg-rose-500/10 !text-rose-300';
    case 4:
      return '!bg-emerald-500/10 !text-emerald-300';
    default:
      return '!bg-cyan/10 !text-cyan';
  }
}
