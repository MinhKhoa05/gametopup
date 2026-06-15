import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type StatCardTone = 'primary' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<StatCardTone, { icon: string; value: string }> = {
  primary: {
    icon: 'border-cyan-400/15 bg-cyan-500/30 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_0_24px_rgba(34,211,238,0.18)]',
    value: 'text-cyan-100',
  },
  success: {
    icon: 'border-emerald-400/15 bg-emerald-500/30 text-emerald-100 shadow-[0_0_0_1px_rgba(34,197,94,0.14),0_0_24px_rgba(34,197,94,0.18)]',
    value: 'text-emerald-100',
  },
  warning: {
    icon: 'border-amber-400/15 bg-amber-500/30 text-amber-100 shadow-[0_0_0_1px_rgba(245,158,11,0.14),0_0_24px_rgba(245,158,11,0.18)]',
    value: 'text-amber-100',
  },
  danger: {
    icon: 'border-rose-400/15 bg-rose-500/30 text-rose-100 shadow-[0_0_0_1px_rgba(244,63,94,0.14),0_0_24px_rgba(244,63,94,0.18)]',
    value: 'text-rose-100',
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
    'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-[22px] border border-cyan/15 bg-[rgba(8,20,40,0.58)] p-5 backdrop-blur-[14px] transition-all duration-200 hover:-translate-y-1 hover:border-cyan/30 hover:shadow-[0_18px_38px_rgba(2,6,23,0.18)]',
    compact && 'gap-3 p-3',
    className,
  );

  return (
    <article className={rootClassName}>
      <div
        className={classNames(
          'flex h-14 w-14 items-center justify-center rounded-[18px] border text-cyan-50',
          compact && 'h-11 w-11 rounded-[16px]',
          toneClasses.icon,
        )}
      >
        {icon}
      </div>
      <div className="grid gap-1">
        <span className={classNames('font-semibold text-slate-400', compact ? 'text-[0.82rem]' : 'text-sm', labelClassName)}>{label}</span>
        <strong className={classNames('font-black tracking-[-0.05em] tabular-nums leading-none', compact ? 'text-[1.08rem]' : 'text-[1.75rem]', toneClasses.value)}>{value}</strong>
        {supporting ? <span className={classNames('text-slate-500', compact ? 'text-xs' : 'text-sm')}>{supporting}</span> : null}
      </div>
    </article>
  );
}
