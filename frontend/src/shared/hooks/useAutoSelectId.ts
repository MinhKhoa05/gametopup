import { useEffect, useState } from 'react';

type HasId = {
  id: number;
};

export function useAutoSelectId<T extends HasId>(
  items: readonly T[],
  resetKey?: unknown,
) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [resetKey]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((current) =>
      current && items.some((item) => item.id === current) ? current : items[0].id,
    );
  }, [items]);

  return [selectedId, setSelectedId] as const;
}
