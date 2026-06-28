import { LoaderCircle } from 'lucide-react';

import { classNames } from '@/shared/lib/classNames';

type LoadingStateProps = {
  className?: string;
  description?: string;
  title?: string;
};

export function LoadingState({ className, description, title }: LoadingStateProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={classNames(
        'flex min-h-[220px] items-center justify-center px-4 py-10 text-center gt-text',
        className,
      )}
      role="status"
    >
      <div className="grid justify-items-center gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.035] text-cyan-200 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
          <LoaderCircle aria-hidden="true" className="size-5 animate-spin" />
        </span>
        {title ? <p className="m-0 text-sm font-bold text-white">{title}</p> : null}
        {description ? <p className="m-0 max-w-sm text-sm leading-6 gt-text-muted">{description}</p> : null}
      </div>
    </div>
  );
}
