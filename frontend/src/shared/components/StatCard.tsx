import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type StatCardTone = 'primary' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<StatCardTone, { icon: string; value: string }> = {
  primary: {
    icon: 'border border-[color:var(--gt-border-accent)] bg-[var(--gt-primary-soft)] text-[var(--gt-primary)]',
    value: 'text-[var(--gt-primary-hover)]',
  },
  success: {
    icon: 'border border-[rgba(34,197,94,0.14)] bg-[rgba(34,197,94,0.08)] text-[#4ade80]',
    value: 'text-[#4ade80]',
  },
  warning: {
    icon: 'border border-[rgba(245,158,11,0.14)] bg-[rgba(245,158,11,0.08)] text-[#fbbf24]',
    value: 'text-[#fbbf24]',
  },
  danger: {
    icon: 'border border-[rgba(239,68,68,0.14)] bg-[rgba(239,68,68,0.08)] text-[#f87171]',
    value: 'text-[#f87171]',
  },
};

export function StatCard({
  className,
  icon,
  compact,
  labelClassName,
  label,
  supporting,
  value,
  tone = 'primary',
}: {
  className?: string;
  compact?: boolean;
  labelClassName?: string;
  icon: ReactNode;
  label: ReactNode;
  supporting?: ReactNode;
  tone?: StatCardTone;
  value: ReactNode;
}) {
  const toneClasses = TONE_CLASSES[tone];
  const rootClassName = classNames(
    'gt-stat-item grid min-h-[112px] grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 sm:p-5',
    compact && 'min-h-[96px] gap-3 p-3.5 sm:p-4',
    className,
  );

  return (
    <article className={rootClassName}>
      <div
        className={classNames(
          'flex h-14 w-14 items-center justify-center rounded-[18px]',
          compact && 'h-11 w-11 rounded-[16px]',
          toneClasses.icon,
        )}
      >
        {icon}
      </div>
      <div className="grid gap-1">
        <span className={classNames('font-semibold gt-text-muted', compact ? 'text-[0.82rem]' : 'text-sm', labelClassName)}>{label}</span>
        <strong className={classNames('font-black tracking-[-0.05em] tabular-nums leading-none', compact ? 'text-[1.08rem]' : 'text-[1.75rem]', toneClasses.value)}>{value}</strong>
        {supporting ? <span className={classNames('gt-text-disabled', compact ? 'text-xs' : 'text-sm')}>{supporting}</span> : null}
      </div>
    </article>
  );
}
