import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'default' | 'accent';
type ButtonSize = 'md' | 'sm' | 'icon';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-[14px] border font-bold outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-2 px-3 text-sm',
  md: 'min-h-12 gap-2 px-4 py-2.5',
  icon: 'size-10 p-0',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-cyan/30 bg-cyan-400 text-slate-950 shadow-[0_8px_22px_rgba(34,211,238,0.16)] hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_12px_28px_rgba(34,211,238,0.22)]',
  secondary:
    'border-cyan/25 bg-[rgba(7,16,31,0.72)] text-cyan-50 hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-[rgba(15,29,51,0.9)] hover:text-cyan-50 hover:shadow-[0_10px_24px_rgba(34,211,238,0.08)]',
  ghost: 'border-transparent bg-transparent text-slate-100 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white',
  outline:
    'border-white/10 bg-[rgba(7,16,31,0.72)] text-slate-100 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] hover:text-white hover:shadow-[0_10px_24px_rgba(2,6,23,0.12)]',
  default:
    'border-cyan/25 bg-[rgba(7,16,31,0.72)] text-cyan-50 hover:-translate-y-0.5 hover:border-cyan/40 hover:bg-[rgba(15,29,51,0.9)] hover:text-cyan-50 hover:shadow-[0_10px_24px_rgba(34,211,238,0.08)]',
  accent:
    'border-cyan/30 bg-cyan-400 text-slate-950 shadow-[0_8px_22px_rgba(34,211,238,0.16)] hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_12px_28px_rgba(34,211,238,0.22)]',
};

export function Button({
  children,
  className,
  size = 'md',
  variant = 'secondary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={classNames(BASE_CLASS, sizeClasses[size], variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
