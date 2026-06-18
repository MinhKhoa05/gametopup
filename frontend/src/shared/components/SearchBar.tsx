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
  'gt-input-shell relative flex w-full min-w-0 items-center gap-3 px-4 gt-text-soft';

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
      <span className="pointer-events-none shrink-0 gt-text-soft" aria-hidden="true">
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
