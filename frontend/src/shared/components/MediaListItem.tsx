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
        'gt-card-hover gt-border min-h-[92px] rounded-[20px] border p-3 transition',
        selected ? interactiveSurfaceClass : `bg-[var(--gt-card)] ${interactiveHoverClass}`,
        onClick && 'cursor-pointer',
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
          <strong className="block truncate text-[clamp(0.9rem,0.35vw+0.78rem,1rem)] font-bold leading-tight gt-text">
            {title}
          </strong>

          {subtitle && (
            <p className="mt-1 truncate text-[clamp(0.78rem,0.2vw+0.72rem,0.88rem)] leading-tight gt-text-muted">
              {subtitle}
            </p>
          )}

          {meta && (
            <p className="mt-1 truncate text-[clamp(0.68rem,0.18vw+0.62rem,0.76rem)] leading-tight gt-text-disabled">
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
