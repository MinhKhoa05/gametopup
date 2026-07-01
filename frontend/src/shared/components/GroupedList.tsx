import type { Key, ReactNode } from "react";

type GroupedListGroup<T> = {
  title: string;
  items: readonly T[];
  countLabel?: ReactNode;
};

type GroupedListProps<T> = {
  groups: readonly GroupedListGroup<T>[];
  renderItem: (item: T) => ReactNode;
  getItemKey: (item: T) => Key;
  itemListClassName?: string;
};

export function GroupedList<T>({
  groups,
  renderItem,
  getItemKey,
  itemListClassName = "space-y-4",
}: GroupedListProps<T>) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold gt-text-soft">{group.title}</h3>

            <div className="h-px flex-1 bg-[var(--gt-border)]" />

            {group.countLabel ? (
              <span className="text-xs gt-text-muted">{group.countLabel}</span>
            ) : null}
          </div>

          <div className={itemListClassName}>
            {group.items.map((item) => (
              <div key={getItemKey(item)}>{renderItem(item)}</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
