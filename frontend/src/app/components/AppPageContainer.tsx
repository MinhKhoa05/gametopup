import type { HTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

export function AppPageContainer({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  return (
    <div className={classNames('mx-auto w-full max-w-[1480px] px-4 sm:px-6 lg:px-8', className)} {...props}>
      {children}
    </div>
  );
}
