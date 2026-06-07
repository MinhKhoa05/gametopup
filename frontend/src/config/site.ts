import type { Route } from '../lib/routes';

export const SITE = {
  name: 'GameTopUp',
  adminName: 'GameTopUp Admin',
  tagline: 'Đại lý nạp game trung gian',
  footerDescription:
    'Dịch vụ nạp game trung gian an toàn và tiết kiệm. Chúng tôi mang đến giải pháp tối ưu chi phí nạp với mức giá tốt nhất, đi kèm hỗ trợ tận tâm.',
  copyrightYear: 2026,
  developerName: 'Hồ Nguyễn Minh Khoa',
  contact: {
    email: 'mkhoa639@gmail.com',
    facebook: 'https://www.facebook.com/honguyen.minhkhoa',
    zalo: 'https://zalo.me/0373441697',
    github: 'https://github.com/MinhKhoa05',
    linkedin: 'https://www.linkedin.com/in/minh-khoa-h%E1%BB%93-nguy%E1%BB%85n-0365353b7/',
  },
} as const;

export const HEADER_NAV_ITEMS: Array<{ label: string; route: Route }> = [
  { label: 'Trang chủ', route: { name: 'home' } },
  { label: 'Kho game', route: { name: 'games' } },
  { label: 'Lịch sử đơn', route: { name: 'orders' } },
];

export type HeaderAccountMenuItemConfig = {
  label: string;
  route?: Route;
  className?: string;
  dividerAfter?: boolean;
};

export const HEADER_ACCOUNT_MENU_USER_ITEMS: HeaderAccountMenuItemConfig[] = [
  { label: 'Hồ sơ', route: { name: 'account' } },
  { label: 'Lịch sử đơn', route: { name: 'orders' } },
  { label: 'Lịch sử ví', route: { name: 'wallet' }, dividerAfter: true },
  { label: 'Đăng xuất', className: 'logout' },
];

export const HEADER_ACCOUNT_MENU_ADMIN_ITEMS: HeaderAccountMenuItemConfig[] = [
  { label: 'Hồ sơ', route: { name: 'account' } },
  { label: 'Lịch sử đơn', route: { name: 'orders' } },
  { label: 'Lịch sử ví', route: { name: 'wallet' }, dividerAfter: true },
  { label: 'Trang quản trị', route: { name: 'admin' }, dividerAfter: true },
  { label: 'Đăng xuất', className: 'logout' },
];

export const BOTTOM_NAV_ITEMS: Array<{ label: string; route: Route }> = [
  { label: 'Trang chủ', route: { name: 'home' } },
  { label: 'Game', route: { name: 'games' } },
  { label: 'Ví', route: { name: 'wallet' } },
  { label: 'Đơn hàng', route: { name: 'orders' } },
  { label: 'Tài khoản', route: { name: 'account' } },
];

export const FOOTER_SERVICE_LINKS: Array<{ label: string; route: Route }> = [
  { label: 'Kho game', route: { name: 'games' } },
  { label: 'Nạp ví VietQR', route: { name: 'wallet' } },
  { label: 'Tra cứu đơn hàng', route: { name: 'orders' } },
  { label: 'Chính sách bảo mật', route: { name: 'home' } },
];

export const FOOTER_SUPPORT_POINTS = ['Bảo mật 100%', 'Xử lý tức thì', 'Hỗ trợ 24/7'] as const;

export const FOOTER_CONTACT_LINKS = [
  {
    label: 'Email',
    href: `mailto:${SITE.contact.email}`,
    ariaLabel: 'Email',
    icon: 'mail',
    external: false,
  },
  {
    label: 'Facebook',
    href: SITE.contact.facebook,
    ariaLabel: 'Facebook',
    icon: 'facebook',
    external: true,
  },
  {
    label: 'Zalo',
    href: SITE.contact.zalo,
    ariaLabel: 'Zalo',
    icon: 'message',
    external: true,
  },
] as const;

export const FOOTER_DEVELOPER_LINKS = [
  { label: 'GitHub', href: SITE.contact.github },
  { label: 'LinkedIn', href: SITE.contact.linkedin },
] as const;

export function getFooterCopyright() {
  return `© ${SITE.copyrightYear} ${SITE.name}. All rights reserved.`;
}

export type AdminSection = 'dashboard' | 'games' | 'packages' | 'orders' | 'deposits' | 'users';

export const ADMIN_HEADER_SUBTITLES: Record<AdminSection, string> = {
  dashboard: 'Tổng quan',
  games: 'Quản lý game',
  packages: 'Quản lý gói nạp',
  orders: 'Quản lý đơn hàng',
  deposits: 'Quản lý nạp tiền',
  users: 'Quản lý người dùng',
} as const;
