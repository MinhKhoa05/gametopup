import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export type IconBoxSize = 'sm' | 'md' | 'lg';

export function IconBox({
  children,
  className,
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  size?: IconBoxSize;
}) {
  return <div className={classNames('icon-box', `icon-box--${size}`, className)}>{children}</div>;
}
