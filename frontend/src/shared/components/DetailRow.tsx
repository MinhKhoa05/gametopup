import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type DetailRowProps = {
  className?: string;
  divider?: boolean;
  label: ReactNode;
  labelClassName?: string;
  value: ReactNode;
  valueClassName?: string;
};

export function DetailRow({
  className,
  divider = true,
  label,
  labelClassName,
  value,
  valueClassName,
}: DetailRowProps) {
  return (
    <div
      className={classNames(
        'grid gap-4',
        'grid-cols-[minmax(0,1fr)_auto]',
        divider && 'border-b border-white/[0.06] py-3.5 last:border-b-0',
        className,
      )}
    >
      <span className={classNames('text-sm font-medium text-slate-100', labelClassName)}>{label}</span>
      <span className={classNames('text-right text-sm font-medium text-slate-100', valueClassName)}>{value}</span>
    </div>
  );
}
