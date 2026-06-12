import { apiBaseUrl } from '@/shared/api/client';

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

export function resolveImageUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('/')) {
    return `${apiBaseUrl}${url}`;
  }
  return url;
}

export function resolveImageSrc(url?: string | null, fallbackSrc = DEFAULT_IMAGE_SRC) {
  return resolveImageUrl(url) || fallbackSrc;
}
