import type { CSSProperties, ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export type IconBoxSize = 'sm' | 'md' | 'lg';

export function IconBox({
  children,
  className,
  style,
  size = 'md',
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  size?: IconBoxSize;
}) {
  return (
    <div className={classNames('icon-box', `icon-box--${size}`, className)} style={style}>
      {children}
    </div>
  );
}
