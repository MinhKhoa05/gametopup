import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ShieldCheck, UserRound } from 'lucide-react';
import { classNames } from '../../lib/ui';
import type { ReactNode } from 'react';
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
        className="header-user-button flex items-center gap-2 rounded-xl border border-white/10 bg-ink-lighter px-3 py-2 transition-colors hover:bg-ink-light"
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
          <div className="header-dropdown-info">
            <div className="header-dropdown-info-text">
              <span className="header-dropdown-info-name">{infoLabel}</span>
              <Badge tone="success" icon={<ShieldCheck size={14} />}>
                {infoBadge}
              </Badge>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames('header-dropdown-item', item.className)}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
              {item.dividerAfter ? <div className="header-dropdown-divider my-1" /> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
