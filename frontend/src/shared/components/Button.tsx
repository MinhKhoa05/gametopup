import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'default' | 'accent';
type ButtonSize = 'md' | 'sm' | 'icon';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const BASE_CLASS = 'gt-button disabled:cursor-not-allowed disabled:opacity-50';

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 gap-2 px-3 text-sm',
  md: 'min-h-12 gap-2 px-4 py-2.5',
  icon: 'size-10 p-0',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'gt-button-primary',
  secondary: 'gt-button-secondary',
  ghost: 'gt-button-ghost',
  outline: 'gt-button-outline',
  default: 'gt-button-secondary',
  accent: 'gt-button-primary',
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
