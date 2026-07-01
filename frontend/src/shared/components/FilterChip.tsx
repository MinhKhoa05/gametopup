import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type FilterChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  active?: boolean;
  tone?: "primary" | "muted";
};

const BASE_CLASS = 'gt-chip inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-50';

export function FilterChip({
  active = false,
  children,
  className,
  tone = "primary",
  type = 'button',
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={classNames(
        BASE_CLASS,
        tone === "muted" ? "gt-chip-muted" : "",
        active ? (tone === "muted" ? "gt-chip-muted-active" : "gt-chip-active") : '',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
