import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type DetailRowProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DetailRow({ label, children, className }: DetailRowProps) {
  return (
    <div
      className={classNames(
        'grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4 border-b gt-border py-3.5 last:border-b-0',
        className,
      )}
    >
      <div className="min-w-0 text-sm font-medium gt-text-muted">{label}</div>
      <div className="min-w-0 justify-self-end text-right text-sm font-medium gt-text">{children}</div>
    </div>
  );
}
