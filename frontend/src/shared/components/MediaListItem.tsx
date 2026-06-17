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
        'min-h-[92px] rounded-[20px] border p-3 transition',
        selected
          ? 'border-cyan/30 bg-cyan/5 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]'
          : 'border-white/[0.08] bg-white/[0.025]',
        onClick &&
          'cursor-pointer hover:-translate-y-px hover:border-cyan/20 hover:bg-white/[0.05]',
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        {leading && (
          <div className="flex size-[clamp(3rem,3.6vw,3.75rem)] shrink-0 items-center justify-center overflow-hidden rounded-[16px] self-center">
            {leading}
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-center">
          <strong className="block truncate text-[clamp(0.9rem,0.35vw+0.78rem,1rem)] font-bold leading-tight text-white">
            {title}
          </strong>

          {subtitle && (
            <p className="mt-1 truncate text-[clamp(0.78rem,0.2vw+0.72rem,0.88rem)] leading-tight text-slate-400">
              {subtitle}
            </p>
          )}

          {meta && (
            <p className="mt-1 truncate text-[clamp(0.68rem,0.18vw+0.62rem,0.76rem)] leading-tight text-slate-500">
              {meta}
            </p>
          )}
        </div>

        {(titleAccessory || trailing) && (
          <div className="flex min-w-0 flex-col items-end justify-center gap-3 self-center text-right">
            {titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : null}

            {trailing ? <div className={classNames('shrink-0', 'mt-auto')}>{trailing}</div> : null}
          </div>
        )}
      </div>
    </article>
  );
}
