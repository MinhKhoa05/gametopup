import type { HTMLAttributes } from 'react';
import { classNames } from '@/shared/lib/classNames';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div className={classNames('animate-pulse rounded-2xl bg-white/10', className)} aria-hidden="true" {...props} />;
}
