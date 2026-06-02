import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export type BadgeTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export function Badge({
  children,
  className,
  icon,
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span className={classNames('pill', 'inline-flex items-center gap-1', `pill--${tone}`, className)}>
      {icon}
      {children}
    </span>
  );
}
