import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { IconBox } from './IconBox';

export function StatCard({
  className,
  icon,
  label,
  value,
}: {
  className?: string;
  icon: ReactNode;
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className={classNames('stat-card', 'stat-card--stacked', 'stat-card--panel', className)}>
      <IconBox>{icon}</IconBox>
      <div className="stat-card__copy">
        <span className="stat-card__label">{label}</span>
        <strong className="stat-card__value">{value}</strong>
      </div>
    </div>
  );
}
