import type { KeyboardEvent, ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type MediaListItemProps = {
  title: ReactNode;

  leading?: ReactNode;
  titleAccessory?: ReactNode;

  subtitle?: ReactNode;
  meta?: ReactNode;

  trailing?: ReactNode;

  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export function MediaListItem({
  title,
  leading,
  titleAccessory,
  subtitle,
  meta,
  trailing,
  selected,
  onClick,
  className,
}: MediaListItemProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={classNames(
        'rounded-[20px] border p-3 transition',
        selected
          ? 'border-cyan/30 bg-cyan/5 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]'
          : 'border-white/[0.08] bg-white/[0.025]',
        onClick &&
          'cursor-pointer hover:-translate-y-px hover:border-cyan/20 hover:bg-white/[0.05]',
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
        {leading && <div className="shrink-0">{leading}</div>}

        <div className="min-w-0">
          <strong className="block truncate text-sm font-bold text-white">
            {title}
          </strong>

          {subtitle && (
            <p className="mt-1 truncate text-sm text-slate-400">
              {subtitle}
            </p>
          )}

          {meta && (
            <p className="mt-1 truncate text-xs text-slate-500">
              {meta}
            </p>
          )}
        </div>

        {(titleAccessory || trailing) && (
          <div className="flex min-w-0 flex-col items-end gap-3 self-stretch text-right">
            {titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : null}

            {trailing ? <div className={classNames('shrink-0', 'mt-auto')}>{trailing}</div> : null}
          </div>
        )}
      </div>
    </article>
  );
}
