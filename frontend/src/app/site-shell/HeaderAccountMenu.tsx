import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { HeaderAccountMenuItem } from '@/shared/types/layout';
import { classNames } from '@/shared/lib/classNames';

type HeaderAccountMenuProps = {
  items: HeaderAccountMenuItem[];
  triggerLabel: string;
};

export function HeaderAccountMenu({ items, triggerLabel }: HeaderAccountMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(triggerLabel);

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
        className={classNames(
          'gt-button gt-button-secondary min-h-10 rounded-2xl px-2.5 py-2',
          open && 'border-cyan/25 bg-cyan/10 text-cyan-50',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-cyan/15 bg-cyan/10 text-[0.68rem] font-black uppercase tracking-[0.12em] text-cyan-50">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-semibold gt-text sm:block">{triggerLabel}</span>
        <ChevronDown size={14} className={classNames('gt-text-muted transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="gt-panel absolute right-0 z-50 mt-2 max-h-[calc(100vh-5rem)] w-72 overflow-y-auto overflow-x-hidden py-2 backdrop-blur-xl sm:w-80">
          <div className="border-b gt-border px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-cyan/15 bg-cyan/10 text-sm font-black uppercase tracking-[0.12em] text-cyan-50">
                {initials}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight gt-text">{triggerLabel}</span>
                <span className="block text-xs gt-text-muted">Đã đăng nhập</span>
              </div>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors',
                  item.className === 'logout'
                    ? 'border-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200'
                    : 'border-transparent gt-text-muted hover:text-white',
                )}
                onClick={() => {
                  item.onClick();
                  setOpen(false);
                }}
              >
                {item.icon}
                {item.label}
              </button>
              {item.dividerAfter ? <div className="my-1 h-px bg-gradient-to-r from-transparent via-[color:var(--gt-border)] to-transparent" /> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getInitials(value: string) {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'MK';
  }

  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : parts[0]?.[1] ?? '';
  return `${first}${last}`.toUpperCase() || 'MK';
}
