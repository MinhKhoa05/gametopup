import type { ReactNode } from 'react';
import { classNames } from '../../lib/ui';

export function SectionHeading({
  action,
  children,
  className,
  description,
  eyebrow,
  title,
}: {
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title?: ReactNode;
  }) {
  return (
    <div className={classNames('flex items-start justify-between gap-4', className)}>
      {children ?? (
        <div className="grid min-w-0 gap-0.5">
          {eyebrow ? <p className="m-0 mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-cyan">{eyebrow}</p> : null}
          {title ? <h2 className="m-0 text-[1.05rem] font-black leading-[1.15] text-white">{title}</h2> : null}
          {description ? <p className="m-0 text-sm leading-[1.5] text-slate-400">{description}</p> : null}
        </div>
      )}
      {action ? <div className="flex flex-none items-start justify-end text-sm font-extrabold text-cyan">{action}</div> : null}
    </div>
  );
}
