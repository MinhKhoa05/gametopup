export function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export function filterByQuery<T>(items: T[], query: string, getText: (item: T) => string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => getText(item).toLowerCase().includes(normalizedQuery));
}
