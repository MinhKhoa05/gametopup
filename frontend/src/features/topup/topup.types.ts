import type { ReactNode } from 'react';

export type GameOrderStep = 1 | 2 | 3;

export type OrderDetailField = {
  compact?: boolean;
  icon?: ReactNode;
  label: string;
  last?: boolean;
  value: ReactNode;
};

export type OrderStatusCard = {
  badgeClassName: string;
  badgeLabel: string;
  description: ReactNode;
  hint?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  iconCircle?: boolean;
  title: string;
};

export type GameOrderSummaryRow = {
  icon?: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
};
