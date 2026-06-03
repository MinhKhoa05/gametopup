import { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export function AdminNavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={classNames('admin-nav-button', active && 'active')}
      onClick={onClick}
    >
      <span className="admin-nav-button-icon">{icon}</span>
      <span className="admin-nav-button-label">{label}</span>
    </button>
  );
}
