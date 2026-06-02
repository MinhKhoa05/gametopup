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
      {title && <div className="empty-state__title">{title}</div>}
      {description && <div className="empty-state__description">{description}</div>}
      {children}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
