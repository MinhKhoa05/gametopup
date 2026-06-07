import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../../lib/ui';
import type { HeaderAccountMenuItem } from '../../types/layout.type';

export function HeaderAccountMenu({
  items,
  triggerLabel,
}: {
  items: HeaderAccountMenuItem[];
  triggerLabel: string;
}) {
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
          'gt-interactive inline-flex min-h-10 items-center gap-2 rounded-2xl border px-2.5 py-2',
          open
            ? 'border-cyan/25 bg-cyan/10 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_18px_rgba(34,211,238,0.12)]'
            : 'border-white/10 bg-white/[0.04] text-white',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-cyan/15 bg-cyan/10 text-[0.68rem] font-black uppercase tracking-[0.12em] text-cyan-50">
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-semibold text-white sm:block">{triggerLabel}</span>
        <ChevronDown size={14} className="text-slate-400 transition-transform duration-200" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#091224]/95 py-2 shadow-[0_24px_56px_rgba(2,6,23,0.42)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-full border border-cyan/15 bg-cyan/10 text-sm font-black uppercase tracking-[0.12em] text-cyan-50">
                {initials}
              </span>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold leading-tight text-white">{triggerLabel}</span>
              </div>
            </div>
          </div>

          {items.map((item, index) => (
            <div key={`${item.label}-${index}`}>
              <button
                type="button"
                className={classNames(
                  'gt-interactive flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold',
                  item.className === 'logout'
                    ? 'border-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200'
                    : 'border-transparent text-slate-300 hover:text-white',
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
