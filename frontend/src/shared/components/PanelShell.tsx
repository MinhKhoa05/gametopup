import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PanelShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

const BASE_CLASS = 'gt-panel relative isolate overflow-hidden border gt-border';

export function PanelShell({ children, className, contentClassName }: PanelShellProps) {
  return (
    <section className={classNames(BASE_CLASS, className)}>
      <div className={classNames("relative z-10", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
