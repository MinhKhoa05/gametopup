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
          {eyebrow ? <p className="eyebrow section-heading__eyebrow">{eyebrow}</p> : null}
          {title ? <h2 className="section-heading__title">{title}</h2> : null}
          {description ? <p className="section-heading__description">{description}</p> : null}
        </div>
      )}
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
