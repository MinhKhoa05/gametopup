import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';
import { Button } from './Button';
import { IconBox, type IconBoxSize, type IconBoxTone } from './IconBox';

export type EmptyStateVariant = 'default' | 'compact' | 'spacious' | 'flush';

export function EmptyState({
  actionLabel,
  className,
  description,
  icon,
  iconSize = 'md',
  iconTone = 'primary',
  onAction,
  title,
  children,
  variant = 'default',
}: {
  actionLabel?: string;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  iconSize?: IconBoxSize;
  iconTone?: IconBoxTone;
  onAction?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  variant?: EmptyStateVariant;
}) {
  const variantClassName =
    variant === 'compact'
      ? 'gt-panel grid gap-2 px-5 py-6 text-center'
      : variant === 'spacious'
        ? 'gt-panel grid gap-3 px-6 py-12 text-center'
        : variant === 'flush'
          ? 'grid gap-3 border-x-0 border-b-0 border-t border-white/5 bg-transparent px-6 py-6 text-center'
          : 'gt-panel grid gap-3 px-6 py-8 text-center';

  return (
    <div className={classNames(variantClassName, className)} role="status">
      {icon ? (
        <IconBox className="mx-auto" size={iconSize} tone={iconTone}>
          {icon}
        </IconBox>
      ) : null}
      {title ? <div className="m-0 text-[1.15rem] font-extrabold leading-[1.25] gt-text">{title}</div> : null}
      {description ? <div className="m-0 text-[0.9rem] leading-[1.55] gt-text-muted">{description}</div> : null}
      {children}
      {actionLabel && onAction ? (
        <Button type="button" variant="primary" className="mt-1.5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
