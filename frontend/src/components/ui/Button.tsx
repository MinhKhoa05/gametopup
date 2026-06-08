import type { ButtonHTMLAttributes } from 'react';
import { classNames } from '@/lib/ui';

export type ButtonVariant = 'default' | 'accent' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const BASE_CLASS =
  'inline-flex items-center justify-center rounded-xl border font-bold outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-2 px-3 text-sm',
  md: 'min-h-12 gap-2 px-4 py-2.5',
  icon: 'size-10 p-0',
};

const DEFAULT_CLASS =
  'border-cyan/25 bg-transparent text-cyan-50 hover:-translate-y-0.5 hover:bg-cyan/10 hover:text-cyan-50 hover:shadow-[0_8px_24px_rgba(34,211,238,0.10)]';

const OUTLINE_CLASS =
  'border-white/10 bg-transparent text-slate-100 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white hover:shadow-[0_8px_24px_rgba(2,6,23,0.12)]';

const ACCENT_CLASS =
  'border-cyan/25 bg-gradient-to-r from-cyan-100 via-cyan to-cyan-200 text-slate-950 shadow-[0_4px_14px_rgba(34,211,238,0.18)] hover:-translate-y-0.5';

export function Button({
  size = 'md',
  variant = 'default',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        BASE_CLASS,
        sizeClasses[size],
        variant === 'accent' ? ACCENT_CLASS : variant === 'outline' ? OUTLINE_CLASS : DEFAULT_CLASS,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
