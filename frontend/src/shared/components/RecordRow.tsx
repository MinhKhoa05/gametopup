import type { HTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';

type RecordRowProps = HTMLAttributes<HTMLDivElement> & {
  highlighted?: boolean;
};

export function RecordRow({ className, highlighted, ...props }: RecordRowProps) {
  return (
    <div
      className={classNames(
        'grid min-w-0 grid-cols-[auto_1fr_auto] gap-3 items-center rounded-[12px] border border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] px-3 py-2.5 max-[700px]:grid-cols-1',
        highlighted && 'border-cyan/25 bg-cyan/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]',
        className,
      )}
      {...props}
    />
  );
}
