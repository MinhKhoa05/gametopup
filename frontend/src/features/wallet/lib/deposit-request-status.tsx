import { CheckCircle2, Clock3, Send, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export type DepositRequestStatusInfo = {
  tone: 'warning' | 'primary' | 'success' | 'danger';
  description: string;
  icon: ReactNode;
  iconClassName: string;
  label: string;
};

export const DEPOSIT_REQUEST_STATUS_BY_CODE: Record<number, DepositRequestStatusInfo> = {
  1: {
    description: 'Bạn cần chuyển khoản và xác nhận.',
    label: 'Chờ chuyển khoản',
    tone: 'warning',
    icon: <Send size={16} />,
    iconClassName: 'border-amber-400/15 bg-amber-400/10 text-amber-300',
  },
  2: {
    description: 'Admin kiểm tra khoảng 10-15 phút.',
    label: 'Đã gửi, chờ duyệt',
    tone: 'primary',
    icon: <Clock3 size={16} />,
    iconClassName: 'border-cyan/15 bg-cyan/10 text-cyan-50',
  },
  3: {
    description: 'Số dư đã được cộng vào ví.',
    label: 'Đã duyệt',
    tone: 'success',
    icon: <CheckCircle2 size={16} />,
    iconClassName: 'border-emerald-400/15 bg-emerald-400/10 text-emerald-300',
  },
  4: {
    description: 'Vui lòng kiểm tra lại thông tin.',
    label: 'Đã từ chối',
    tone: 'danger',
    icon: <XCircle size={16} />,
    iconClassName: 'border-rose-400/15 bg-rose-400/10 text-rose-300',
  },
};

const DEFAULT_DEPOSIT_REQUEST_STATUS: DepositRequestStatusInfo = {
  tone: 'warning',
  description: 'Đang cập nhật thông tin.',
  icon: <Send size={16} />,
  iconClassName: 'border-amber-400/15 bg-amber-400/10 text-amber-300',
  label: 'Chờ chuyển khoản',
};

const DEPOSIT_REQUEST_FLOW_STEP_BY_STATUS: Record<number, number> = {
  1: 2,
  2: 3,
  3: 5,
  4: 4,
};

export function getDepositRequestStatus(status: number): DepositRequestStatusInfo {
  return DEPOSIT_REQUEST_STATUS_BY_CODE[status] ?? {
    ...DEFAULT_DEPOSIT_REQUEST_STATUS,
    label: `Trạng thái ${status}`,
  };
}

export function getDepositRequestFlowStep(status: number) {
  return DEPOSIT_REQUEST_FLOW_STEP_BY_STATUS[status] ?? 2;
}
