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
    <div className={classNames('section-heading', className)}>
      {children ?? (
        <div className="section-heading__copy">
          {eyebrow ? <p className="eyebrow m-0 mb-1.5 text-[0.75rem] font-extrabold uppercase tracking-[0.15em] text-cyanline">{eyebrow}</p> : null}
          {title ? <h2 className="m-0 text-[1.25rem] font-black leading-[1.15] text-white">{title}</h2> : null}
          {description ? <p className="m-0 text-[0.92rem] leading-[1.55] text-slate-400">{description}</p> : null}
        </div>
      )}
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
