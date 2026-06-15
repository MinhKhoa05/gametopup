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
  primary: 'border-cyan/25 bg-cyan/10 text-cyan-50',
  neutral: 'border-white/10 bg-white/[0.04] text-slate-200',
  soft: 'border-white/8 bg-white/[0.025] text-slate-300',
};

export function IconBox({ circle = false, round = false, size = 'md', tone = 'primary', className, children, ...props }: IconBoxProps) {
  const isRound = circle || round;

  return (
    <div
      className={classNames(
        'inline-flex flex-none items-center justify-center border',
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
