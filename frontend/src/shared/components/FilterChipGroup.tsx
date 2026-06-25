import type { ReactNode } from "react";
import { classNames } from "@/shared/lib/classNames";
import { FilterChip } from "./FilterChip";


type FilterValue = string | number;

export type FilterChipGroupItem<T extends FilterValue> = {
  label: ReactNode;
  value: T;
};

type FilterChipGroupProps<T extends FilterValue> = {
  items: readonly FilterChipGroupItem<T>[];
  value: T;
  onChange: (value: T) => void;

  className?: string;
  ariaLabel?: string;
};

export function FilterChipGroup<T extends FilterValue>({
  items,
  value,
  onChange,
  className,
  ariaLabel,
}: FilterChipGroupProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={classNames("flex flex-wrap gap-2.5", className)}
    >
      {items.map(({ value: itemValue, label }) => (
        <FilterChip
          key={itemValue}
          active={value === itemValue}
          onClick={() => onChange(itemValue)}
        >
          {label}
        </FilterChip>
      ))}
    </div>
  );
}
