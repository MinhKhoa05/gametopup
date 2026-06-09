import { apiBaseUrl } from '@/lib/api';

export function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const defaultImageSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" fill="none">
  <rect width="320" height="180" rx="20" fill="#0f172a"/>
  <rect x="18" y="18" width="284" height="144" rx="16" fill="#111f3a" stroke="#1f3353"/>
  <path d="M78 121L128 71L158 101L184 75L242 133H78Z" fill="#1fd2f2" fill-opacity=".22"/>
  <circle cx="109" cy="70" r="14" fill="#1fd2f2" fill-opacity=".3"/>
  <path d="M85 136H235" stroke="#334155" stroke-width="6" stroke-linecap="round"/>
</svg>
`;

export const DEFAULT_IMAGE_SRC = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultImageSvg)}`;

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

export function resolveImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('/')) {
    return `${apiBaseUrl}${url}`;
  }
  return url;
}

export function pickImage(item: { name: string; imageUrl?: string }) {
  if (item.imageUrl && !item.imageUrl.includes('example.com')) return resolveImageUrl(item.imageUrl);

  const normalizedName = item.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
  const key = Object.keys(gameImages).find((name) => normalizedName.includes(name));

  return key
    ? gameImages[key]
    : DEFAULT_IMAGE_SRC;
}
