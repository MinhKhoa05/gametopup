import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { IconBox } from './IconBox';

export function StatCard({
  className,
  iconClassName,
  icon,
  label,
  surface = true,
  variant = 'stacked',
  value,
}: {
  className?: string;
  iconClassName?: string;
  icon: ReactNode;
  label: ReactNode;
  surface?: boolean;
  variant?: 'stacked' | 'inline';
  value: ReactNode;
}) {
  return (
    <div
      className={classNames(
        surface && 'gametopup-surface',
        'stat-card',
        `stat-card--${variant}`,
        className,
      )}
    >
      <IconBox className={iconClassName}>{icon}</IconBox>
      <div className={classNames('stat-card__copy', variant === 'inline' && 'gap-1')}>
        <span className="block font-extrabold leading-[1.25] text-slate-400">{label}</span>
        <strong
          className={classNames(
            'block break-words font-black leading-[1.1] text-white',
            variant === 'stacked'
              ? 'text-[clamp(1.35rem,2.4vw,2rem)]'
              : 'text-[clamp(1.2rem,1.9vw,1.65rem)]',
          )}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}
