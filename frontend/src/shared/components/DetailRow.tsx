import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type DetailRowProps = {
  icon?: ReactNode;
  iconClassName?: string;
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
  icon,
  iconClassName,
  label,
  labelClassName,
  value,
  valueClassName,
}: DetailRowProps) {
  return (
    <div
      className={classNames(
        'grid gap-4',
        icon ? 'grid-cols-[auto_minmax(0,1fr)_auto]' : 'grid-cols-[minmax(0,1fr)_auto]',
        divider && 'border-b border-white/[0.06] py-3.5 last:border-b-0',
        className,
      )}
    >
      {icon ? (
        <span className={classNames('inline-flex items-center justify-center rounded-[18px] border border-white/[0.06] bg-white/[0.03] p-2 text-slate-200', iconClassName)}>{icon}</span>
      ) : null}
      <span className={classNames('text-sm font-medium text-slate-100', labelClassName)}>{label}</span>
      <span className={classNames('text-right text-sm font-medium text-slate-100', valueClassName)}>{value}</span>
    </div>
  );
}
