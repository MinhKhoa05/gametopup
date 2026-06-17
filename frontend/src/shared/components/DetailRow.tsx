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
        'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0',
        className,
      )}
    >
      <div className="min-w-0 text-sm font-medium text-slate-400">{label}</div>
      <div className="min-w-0 justify-self-end text-right text-sm font-medium text-slate-100">{children}</div>
    </div>
  );
}
