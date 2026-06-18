import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PanelShellProps = {
  children: ReactNode;
  className?: string;
};

const BASE_CLASS = 'gt-panel relative isolate overflow-hidden border gt-border';

export function PanelShell({ children, className }: PanelShellProps) {
  return (
    <section className={classNames(BASE_CLASS, className)}>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
