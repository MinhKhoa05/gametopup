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
    primary: 'gt-badge-primary',
    success: 'gt-badge-success',
    warning: 'gt-badge-warning',
    danger: 'gt-badge-danger',
    neutral: 'gt-badge-neutral',
  };

  return (
    <span
      title={title}
      className={classNames(
        'inline-flex items-center gap-1.5 whitespace-nowrap !rounded-[8px] border font-bold transition-colors',
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
