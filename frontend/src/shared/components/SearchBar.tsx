import type { ChangeEvent, KeyboardEventHandler, ReactNode } from 'react';
import { Search } from 'lucide-react';
import { classNames } from '@/shared/lib/classNames';
import { inputClassName as fieldInputClassName } from './Field';

type SearchBarProps = {
  ariaLabel?: string;
  className?: string;
  dense?: boolean;
  icon?: ReactNode;
  inputClassName?: string;
  onChange: (value: string) => void;
  onEnter?: (value: string) => void;
  placeholder: string;
  size?: number;
  value: string;
};

export function SearchBar({
  ariaLabel,
  className,
  dense = false,
  icon,
  inputClassName,
  onChange,
  onEnter,
  placeholder,
  size = 16,
  value,
}: SearchBarProps) {
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      onEnter?.(value);
    }
  };

  return (
    <label
      className={classNames(
        dense
          ? 'relative flex min-h-11 w-full min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-slate-200 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_8px_24px_rgba(34,211,238,0.1)] focus-within:border-cyan/70 focus-within:bg-cyan/10 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.14)]'
          : 'relative flex min-h-12 w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-slate-200 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/25 hover:bg-cyan/10 hover:shadow-[0_8px_24px_rgba(34,211,238,0.1)] focus-within:border-cyan/70 focus-within:bg-cyan/10 focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.14)]',
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="pointer-events-none shrink-0 text-cyan" aria-hidden="true">
        {icon ?? <Search size={size} />}
      </span>
      <input
        className={classNames(
          fieldInputClassName,
          dense
            ? '!min-h-0 !border-0 !bg-transparent !px-0 text-sm !shadow-none hover:!bg-transparent hover:!shadow-none focus:!border-transparent focus:!bg-transparent focus:!shadow-none'
            : '!min-h-0 !border-0 !bg-transparent !px-0 !shadow-none hover:!bg-transparent hover:!shadow-none focus:!border-transparent focus:!bg-transparent focus:!shadow-none',
          inputClassName,
        )}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
}
