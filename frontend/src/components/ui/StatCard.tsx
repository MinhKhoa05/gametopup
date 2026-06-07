import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';
import { IconBox } from './IconBox';

export function StatCard({
  className,
  iconClassName,
  icon,
  label,
  surface = true,
  supporting,
  variant = 'stacked',
  value,
}: {
  className?: string;
  iconClassName?: string;
  icon: ReactNode;
  label: ReactNode;
  supporting?: ReactNode;
  surface?: boolean;
  variant?: 'stacked' | 'inline';
  value: ReactNode;
}) {
  const rootClassName = classNames(
    surface && 'gt-surface-ink rounded-[20px]',
    'grid min-w-0 gap-3',
    variant === 'stacked' ? 'p-4' : 'grid-cols-[auto_minmax(0,1fr)] items-center gap-3 p-4',
    className,
  );

  return (
    <div className={rootClassName}>
      <IconBox size="sm" className={classNames('h-10 w-10 rounded-xl', iconClassName)}>
        {icon}
      </IconBox>
      <div className={classNames('grid min-w-0 gap-1.5', variant === 'inline' && 'gap-1')}>
        <span className="block font-extrabold leading-[1.25] text-slate-400">{label}</span>
        <strong
          className={classNames(
            'block break-words font-black leading-[1.1] text-white',
            variant === 'stacked'
              ? 'text-[clamp(1.3rem,2.2vw,1.9rem)]'
              : 'text-[clamp(1.2rem,1.9vw,1.65rem)]',
          )}
        >
          {value}
        </strong>
        {supporting ? <span className="block text-sm leading-[1.45] text-slate-400">{supporting}</span> : null}
      </div>
    </div>
  );
}
