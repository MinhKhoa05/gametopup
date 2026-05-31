export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const gameImages: Record<string, string> = {
  'free fire':
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80',
  'lien quan':
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1000&q=80',
  fifa:
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1000&q=80',
  'call of duty':
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
  undawn:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
  sky:
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80',
};

export function pickImage(item: { name: string; imageUrl?: string }) {
  if (item.imageUrl && !item.imageUrl.includes('example.com')) return item.imageUrl;

  const normalizedName = item.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const key = Object.keys(gameImages).find((name) => normalizedName.includes(name));

  return key
    ? gameImages[key]
    : 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1000&q=80';
}
