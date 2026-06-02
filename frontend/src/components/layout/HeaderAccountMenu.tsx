import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ShieldCheck, UserRound } from 'lucide-react';
import { classNames } from '../../lib/ui';
import { Badge } from '../common/Badge';

export type HeaderAccountMenuItem = {
  className?: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  dividerAfter?: boolean;
};

export function HeaderAccountMenu({
  infoLabel,
  infoBadge,
  items,
  triggerLabel,
}: {
  infoLabel: string;
  infoBadge: string;
  items: HeaderAccountMenuItem[];
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-ink-lighter px-3 py-2 transition-colors hover:bg-ink-light"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyanline/20 text-cyanline">
          <UserRound size={14} />
        </div>
        <span className="hidden text-sm font-semibold text-white sm:block">{triggerLabel}</span>
        <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
      </button>

      {open && (
        <div className="header-dropdown absolute right-0 z-50 mt-2 w-64 rounded-2xl py-2 shadow-2xl">
          <div className="grid gap-1 border-b border-white/10 bg-cyanline/3 px-3 py-3">
            <div className="min-w-0 grid gap-1">
              <span className="text-[0.98rem] font-bold leading-tight text-white">{infoLabel}</span>
              <Badge tone="success" icon={<ShieldCheck size={14} />}>
                {infoBadge}
              </Badge>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors',
                  item.className === 'logout'
                    ? 'text-red-300 hover:bg-red-500/10 hover:text-red-200'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
              {item.dividerAfter ? <div className="my-1 h-px bg-gradient-to-r from-transparent via-slate-500/20 to-transparent" /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
