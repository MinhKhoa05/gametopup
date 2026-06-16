import type { ReactNode } from 'react';
import { classNames } from '@/shared/lib/classNames';
import { FilterChip } from './FilterChip';

export type FilterChipGroupItem<T extends string = string> = {
  label: ReactNode;
  value: T;
};

type FilterChipGroupProps<T extends string = string> = {
  ariaLabel?: string;
  className?: string;
  items: ReadonlyArray<FilterChipGroupItem<T>>;
  onChange: (value: T) => void;
  value: T;
};

export function FilterChipGroup<T extends string>({ ariaLabel, className, items, onChange, value }: FilterChipGroupProps<T>) {
  return (
    <div className={classNames('flex flex-wrap gap-2.5', className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <FilterChip key={item.value} active={value === item.value} onClick={() => onChange(item.value)}>
          {item.label}
        </FilterChip>
      ))}
    </div>
  );
}
