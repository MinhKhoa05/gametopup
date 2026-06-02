import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export function IconBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={classNames('icon-box', className)}>{children}</div>;
}
