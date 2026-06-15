import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  active?: boolean;
};

const BASE_CLASS =
  'inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50';

export function FilterChip({ active = false, children, className, type = 'button', ...props }: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={classNames(
        BASE_CLASS,
        active
          ? 'border-cyan/30 bg-cyan-400 text-slate-950 shadow-[0_8px_22px_rgba(34,211,238,0.16)]'
          : 'border-white/10 bg-white/[0.04] text-slate-300 hover:-translate-y-px hover:border-cyan/20 hover:bg-cyan/10 hover:text-cyan-50',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
