import { formatGroupedDate } from "./format";

type DatedItem = {
  createdAt: string;
};

export function groupItemsByDate<T extends DatedItem>(
  items: T[],
  countLabel: (count: number) => string,
) {
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const label = formatGroupedDate(item.createdAt);
    const current = groups.get(label) ?? [];
    current.push(item);
    groups.set(label, current);
  });

  return Array.from(groups, ([title, groupedItems]) => ({
    title,
    items: groupedItems,
    countLabel: countLabel(groupedItems.length),
  }));
}
