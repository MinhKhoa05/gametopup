import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { classNames } from "@/shared/lib/classNames";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
  children?: ReactNode;

  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;

  active?: boolean;
  loading?: boolean;

  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BASE_CLASS =
  "gt-button inline-flex items-center justify-center rounded-xl font-medium transition-all disabled:pointer-events-none disabled:opacity-50";

const ACTIVE_CLASS = "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

const sizeClasses = {
  xs: "min-h-8 gap-1.5 px-2.5 text-xs",
  sm: "min-h-9 gap-2 px-3 text-sm",
  md: "min-h-11 gap-2 px-4 text-sm",
  lg: "min-h-12 gap-2.5 px-5 text-base",
  icon: "size-10",
} satisfies Record<ButtonSize, string>;

const variantClasses = {
  primary: "gt-button-primary",
  secondary: "gt-button-secondary",
  outline: "gt-button-outline",
  ghost: "gt-button-ghost",
} satisfies Record<ButtonVariant, string>;

export function Button({
  children,
  className,

  leadingIcon,
  trailingIcon,

  active = false,
  loading = false,

  size = "md",
  variant = "secondary",

  type = "button",
  disabled,

  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={loading || disabled}
      className={classNames(
        BASE_CLASS,
        sizeClasses[size],
        variantClasses[variant],
        active && ACTIVE_CLASS,
        className,
      )}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leadingIcon}

      {children ? <span>{children}</span> : null}

      {!loading && trailingIcon}
    </button>
  );
}
