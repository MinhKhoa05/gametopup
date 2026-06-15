import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';

type PanelShellProps = {
  children: ReactNode;
  className?: string;
};

const BASE_CLASS =
  'relative isolate overflow-hidden rounded-[26px] border border-white/[0.10] bg-[linear-gradient(180deg,rgba(22,32,48,0.96),rgba(14,22,34,0.98))] shadow-[0_14px_34px_rgba(2,6,23,0.14)] ring-1 ring-white/[0.03]';

export function PanelShell({ children, className }: PanelShellProps) {
  return (
    <section className={classNames(BASE_CLASS, className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.05),transparent_42%,rgba(255,255,255,0.02))] opacity-75" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
