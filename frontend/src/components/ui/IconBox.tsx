import type { HTMLAttributes } from 'react';
import { classNames } from '@/lib/ui';

export type IconBoxSize = 'sm' | 'md' | 'lg';

type IconBoxProps = HTMLAttributes<HTMLDivElement> & {
  circle?: boolean;
  size?: IconBoxSize;
};

const sizeClasses: Record<IconBoxSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

export function IconBox({circle = false, size = 'md', className, children, ...props}: IconBoxProps) {
  return (
    <div
      className={classNames(
        'inline-flex flex-none items-center justify-center border border-cyan/25 bg-cyan/10 text-cyan',
        sizeClasses[size],
        circle ? 'rounded-full' : size === 'lg' ? 'rounded-2xl' : 'rounded-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
