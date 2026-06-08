import type { ChangeEvent, KeyboardEventHandler } from 'react';
import { Search } from 'lucide-react';
import { classNames } from '@/lib/ui';
import { inputClassName as inputBaseClassName } from './Field';

export function SearchBar({
  ariaLabel,
  className,
  dense = false,
  inputClassName: inputExtraClassName,
  onChange,
  onEnter,
  placeholder,
  size = 16,
  value,
}: {
  ariaLabel?: string;
  className?: string;
  dense?: boolean;
  inputClassName?: string;
  onChange: (value: string) => void;
  onEnter?: (value: string) => void;
  placeholder: string;
  size?: number;
  value: string;
}) {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      onEnter?.(value);
    }
  };

  return (
    <label
      className={classNames(
        dense
          ? 'flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-ink-lighter px-3.5 text-slate-200 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] focus-within:border-cyan/25 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]'
          : 'flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-ink-lighter px-4 text-slate-200 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] focus-within:border-cyan/25 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]',
        className,
      )}
      aria-label={ariaLabel}
    >
      <Search size={size} className="pointer-events-none shrink-0 text-cyan" />
      <input
        className={classNames(
          inputBaseClassName,
          dense
            ? '!min-h-0 !border-0 !bg-transparent !px-0 text-sm !shadow-none hover:!bg-transparent hover:!shadow-none focus:!border-transparent focus:!bg-transparent focus:!shadow-none'
            : '!min-h-0 !border-0 !bg-transparent !px-0 !shadow-none hover:!bg-transparent hover:!shadow-none focus:!border-transparent focus:!bg-transparent focus:!shadow-none',
          inputExtraClassName,
        )}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
}
