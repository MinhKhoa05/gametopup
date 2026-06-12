import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'danger' | 'default';
type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  size?: BadgeSize;
  title?: string;
  variant?: BadgeVariant;
};

export function Badge({ children, className, icon, size = 'sm', title, variant = 'default' }: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    accent: 'border-cyan/25 bg-cyan/10 text-cyan-50',
    success: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    danger: 'border-rose-400/25 bg-rose-400/10 text-rose-200',
    default: 'border-white/12 bg-[rgba(255,255,255,0.05)] text-slate-300',
  };

  const sizeClasses: Record<BadgeSize, string> = {
    sm: 'min-h-8 px-2.5 py-1 text-[0.8rem]',
    md: 'min-h-10 px-3.5 py-2 text-sm',
  };

  return (
    <span
      title={title}
      className={classNames(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {icon ? <span className="inline-flex shrink-0 items-center">{icon}</span> : null}
      {children}
    </span>
  );
}
