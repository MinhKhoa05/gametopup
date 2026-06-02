import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export function EmptyState({
  actionLabel,
  className,
  description,
  icon,
  onAction,
  title,
  children,
}: {
  actionLabel?: string;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  onAction?: () => void;
  title?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={classNames('empty-state', className)} role="status">
      {icon && <div className="empty-state__icon">{icon}</div>}
      {title && <div className="m-0 text-[1.15rem] font-extrabold leading-[1.25] text-white">{title}</div>}
      {description && <div className="m-0 text-[0.9rem] leading-[1.55] text-slate-400">{description}</div>}
      {children}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary mt-1.5" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
