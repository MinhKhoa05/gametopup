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

export function matchesQuery(values: Array<string | number | null | undefined>, query: string) {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery));
}
