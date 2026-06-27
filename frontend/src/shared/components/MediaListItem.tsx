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
  const interactiveSurfaceClass = 'border-[color:var(--gt-border-accent)] bg-[var(--gt-panel-hover)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14),0_10px_24px_rgba(2,6,23,0.22)]';
  const interactiveHoverClass = 'hover:border-[color:var(--gt-border-accent)] hover:bg-[var(--gt-panel-hover)] hover:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14),0_10px_24px_rgba(2,6,23,0.22)]';

  return (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={classNames(
        'gt-card-hover gt-border min-h-[88px] rounded-[20px] border p-3 transition sm:min-h-[92px]',
        selected ? interactiveSurfaceClass : `bg-[var(--gt-card)] ${interactiveHoverClass}`,
        onClick && 'cursor-pointer',
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        {leading && (
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[16px] self-center sm:size-[clamp(3rem,3.6vw,3.75rem)]">
            {leading}
          </div>
        )}

        <div className="flex min-w-0 flex-col justify-center">
          <strong className="block truncate text-[0.95rem] font-bold leading-tight gt-text sm:text-[clamp(0.9rem,0.35vw+0.78rem,1rem)]">
            {title}
          </strong>

          {subtitle && (
            <p className="mt-1 truncate text-[0.82rem] leading-tight gt-text-muted sm:text-[clamp(0.78rem,0.2vw+0.72rem,0.88rem)]">
              {subtitle}
            </p>
          )}

          {meta && (
            <p className="mt-1 truncate text-[0.7rem] leading-tight gt-text-disabled sm:text-[clamp(0.68rem,0.18vw+0.62rem,0.76rem)]">
              {meta}
            </p>
          )}

          {(titleAccessory || trailing) && (
            <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
              <div className="min-w-0">{titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : <span />}</div>

              {trailing ? <div className="shrink-0">{trailing}</div> : null}
            </div>
          )}
        </div>

        {(titleAccessory || trailing) && (
          <div className="hidden min-w-0 flex-col items-end justify-center gap-3 self-center text-right sm:flex">
            {titleAccessory ? <div className="shrink-0">{titleAccessory}</div> : null}

            {trailing ? <div className={classNames('shrink-0', 'mt-auto')}>{trailing}</div> : null}
          </div>
        )}
      </div>
    </article>
  );
}
