import type { HTMLAttributes } from 'react';
import { classNames } from '@/lib/ui';

type RecordRowProps = HTMLAttributes<HTMLDivElement> & {
  highlighted?: boolean;
};

export function RecordRow({ className, highlighted, ...props }: RecordRowProps) {
  return (
    <div
      className={classNames(
        'gt-record-row max-[700px]:grid-cols-1',
        highlighted && 'border-cyan/25 bg-cyan/10 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]',
        className,
      )}
      {...props}
    />
  );
}
