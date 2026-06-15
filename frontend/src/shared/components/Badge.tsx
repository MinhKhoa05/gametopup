import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type BadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  title?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
};

export function Badge({ children, className, icon, title, tone = 'neutral' }: BadgeProps) {
  const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
    primary: 'border-cyan-300/45 bg-cyan-400/20 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_8px_18px_rgba(34,211,238,0.12)]',
    success: 'border-emerald-300/45 bg-emerald-500/20 text-emerald-50 shadow-[0_0_0_1px_rgba(34,197,94,0.08),0_8px_18px_rgba(34,197,94,0.12)]',
    warning: 'border-amber-300/45 bg-amber-500/20 text-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_8px_18px_rgba(245,158,11,0.12)]',
    danger: 'border-rose-300/45 bg-rose-500/20 text-rose-50 shadow-[0_0_0_1px_rgba(239,68,68,0.08),0_8px_18px_rgba(239,68,68,0.12)]',
    neutral: 'border-white/14 bg-[rgba(255,255,255,0.07)] text-slate-200',
  };

  return (
    <span
      title={title}
      className={classNames(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold transition-colors',
        'min-h-8 px-2.5 py-1 text-[0.8rem]',
        toneClasses[tone],
        className,
      )}
    >
      {icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null}
      {children}
    </span>
  );
}
