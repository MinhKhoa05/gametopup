import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type SectionHeadingProps = {
  title: ReactNode;
  titleClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  action?: ReactNode;
  actionClassName?: string;
  className?: string;
};

export function SectionHeading({
  action,
  actionClassName,
  className,
  description,
  descriptionClassName,
  title,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div className={classNames('flex items-start justify-between gap-4', className)}>
      <div className="grid min-w-0 gap-0.5">
        <h2 className={classNames('m-0 text-[1.05rem] font-black leading-[1.15] gt-text', titleClassName)}>{title}</h2>
        {description ? <p className={classNames('m-0 text-sm leading-[1.5] gt-text-muted', descriptionClassName)}>{description}</p> : null}
      </div>
      {action ? <div className={classNames('flex flex-none items-start justify-end text-sm font-extrabold text-cyan-300', actionClassName)}>{action}</div> : null}
    </div>
  );
}
