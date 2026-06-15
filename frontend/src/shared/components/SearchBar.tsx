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

const searchBarBaseClassName =
  'relative flex w-full min-w-0 items-center gap-3 rounded-[22px] border border-white/10 bg-[rgba(7,16,31,0.72)] px-4 text-slate-200 transition-all duration-200 hover:-translate-y-px hover:border-cyan/25 hover:bg-[rgba(15,29,51,0.9)] focus-within:border-cyan/60 focus-within:bg-[rgba(15,29,51,0.9)] focus-within:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]';

const searchInputClassName =
  '!min-h-0 !border-0 !bg-transparent !px-0 text-base leading-6 text-white !shadow-none hover:!bg-transparent hover:!shadow-none focus:!border-transparent focus:!bg-transparent focus:!shadow-none';

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
        searchBarBaseClassName,
        dense ? 'min-h-[3.25rem]' : 'min-h-[3.75rem]',
        className,
      )}
      aria-label={ariaLabel}
    >
      <span className="pointer-events-none shrink-0 text-cyan-50/90" aria-hidden="true">
        {icon ?? <Search size={size} />}
      </span>

      <input
        className={classNames(fieldInputClassName, searchInputClassName, inputClassName)}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </label>
  );
}
