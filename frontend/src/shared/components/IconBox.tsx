import type { HTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';

export type IconBoxSize = 'sm' | 'md' | 'lg';
export type IconBoxTone = 'primary' | 'neutral' | 'soft';

type IconBoxProps = HTMLAttributes<HTMLDivElement> & {
  circle?: boolean;
  round?: boolean;
  size?: IconBoxSize;
  tone?: IconBoxTone;
};

const sizeClasses: Record<IconBoxSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
};

const toneClasses: Record<IconBoxTone, string> = {
  primary: 'gt-icon-box-primary',
  neutral: 'gt-icon-box-neutral',
  soft: 'gt-icon-box-soft',
};

export function IconBox({ circle = false, round = false, size = 'md', tone = 'primary', className, children, ...props }: IconBoxProps) {
  const isRound = circle || round;

  return (
    <div
      className={classNames(
        'gt-icon-box',
        toneClasses[tone],
        sizeClasses[size],
        isRound ? 'rounded-full' : size === 'lg' ? 'rounded-2xl' : 'rounded-xl',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
