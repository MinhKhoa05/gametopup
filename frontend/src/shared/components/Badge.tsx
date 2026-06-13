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
    accent: 'border-cyan-300/45 bg-cyan-400/20 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_8px_18px_rgba(34,211,238,0.12)]',
    success: 'border-emerald-300/45 bg-emerald-500/20 text-emerald-50 shadow-[0_0_0_1px_rgba(34,197,94,0.08),0_8px_18px_rgba(34,197,94,0.12)]',
    warning: 'border-amber-300/45 bg-amber-500/20 text-amber-50 shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_8px_18px_rgba(245,158,11,0.12)]',
    danger: 'border-rose-300/45 bg-rose-500/20 text-rose-50 shadow-[0_0_0_1px_rgba(239,68,68,0.08),0_8px_18px_rgba(239,68,68,0.12)]',
    default: 'border-white/14 bg-[rgba(255,255,255,0.07)] text-slate-200',
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
