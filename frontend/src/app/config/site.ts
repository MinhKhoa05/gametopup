import { routes, type AdminSection } from '@/app/router/routes';
import type { NavItem } from '@/shared/types/layout';

export type HeaderAccountMenuItemConfig = {
  label: string;
  href?: string;
  className?: string;
  dividerAfter?: boolean;
};

export type BottomNavItemConfig = NavItem & {
  iconKey: 'home' | 'games' | 'wallet' | 'orders' | 'profile';
  requiresAuth?: boolean;
};

export type FooterContactLinkConfig = {
  label: string;
  href: string;
  ariaLabel: string;
  iconKey: 'mail' | 'facebook' | 'zalo';
  external: boolean;
};

export type FooterSupportPointConfig = {
  label: string;
  iconKey: 'shield' | 'zap' | 'headset';
};

export type FooterDeveloperLinkConfig = {
  label: string;
  href: string;
};

export const SITE = {
  name: 'GameTopUp',
  adminName: 'GameTopUp Admin',
  tagline: 'Đại lý nạp game trung gian',
  footerDescription: 'Giúp khách hàng nạp game với mức giá tốt hơn và theo dõi đơn hàng dễ dàng.',
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

export const HEADER_NAV_ITEMS = [
  { label: 'Trang chủ', href: routes.home() },
  { label: 'Kho game', href: routes.games() },
  { label: 'Lịch sử đơn', href: routes.orders() },
] as const;

export const HEADER_ACCOUNT_MENU_USER_ITEMS: HeaderAccountMenuItemConfig[] = [
  { label: 'Hồ sơ', href: routes.profile() },
  { label: 'Lịch sử đơn', href: routes.orders() },
  { label: 'Lịch sử ví', href: routes.wallet(), dividerAfter: true },
  { label: 'Đăng xuất', className: 'logout' },
];

export const HEADER_ACCOUNT_MENU_ADMIN_ITEMS: HeaderAccountMenuItemConfig[] = [
  { label: 'Hồ sơ', href: routes.profile() },
  { label: 'Lịch sử đơn', href: routes.orders() },
  { label: 'Lịch sử ví', href: routes.wallet(), dividerAfter: true },
  { label: 'Tổng quan', href: routes.admin('dashboard') },
  { label: 'Quản lý game', href: routes.admin('games') },
  { label: 'Gói nạp', href: routes.admin('packages') },
  { label: 'Đơn hàng', href: routes.admin('orders') },
  { label: 'Nạp tiền', href: routes.admin('deposits') },
  { label: 'Người dùng', href: routes.admin('users'), dividerAfter: true },
  { label: 'Trang quản trị', href: routes.admin(), dividerAfter: true },
  { label: 'Đăng xuất', className: 'logout' },
];

export const BOTTOM_NAV_ITEMS: BottomNavItemConfig[] = [
  { label: 'Trang chủ', href: routes.home(), iconKey: 'home' },
  { label: 'Game', href: routes.games(), iconKey: 'games' },
  { label: 'Ví', href: routes.wallet(), iconKey: 'wallet', requiresAuth: true },
  { label: 'Đơn hàng', href: routes.orders(), iconKey: 'orders', requiresAuth: true },
  { label: 'Tài khoản', href: routes.profile(), iconKey: 'profile', requiresAuth: true },
];

export const FOOTER_SERVICE_LINKS = [
  { label: 'Kho game', href: routes.games() },
  { label: 'Nạp ví VietQR', href: routes.wallet() },
  { label: 'Tra cứu đơn hàng', href: routes.orders() },
  { label: 'Chính sách bảo mật', href: routes.home() },
] as const;

export const FOOTER_SUPPORT_POINTS: FooterSupportPointConfig[] = [
  { label: 'Bảo mật 100%', iconKey: 'shield' },
  { label: 'Xử lý tức thì', iconKey: 'zap' },
  { label: 'Hỗ trợ 24/7', iconKey: 'headset' },
];

export const FOOTER_CONTACT_LINKS: FooterContactLinkConfig[] = [
  {
    label: 'Email',
    href: `mailto:${SITE.contact.email}`,
    ariaLabel: 'Email',
    iconKey: 'mail',
    external: false,
  },
  {
    label: 'Facebook',
    href: SITE.contact.facebook,
    ariaLabel: 'Facebook',
    iconKey: 'facebook',
    external: true,
  },
  {
    label: 'Zalo',
    href: SITE.contact.zalo,
    ariaLabel: 'Zalo',
    iconKey: 'zalo',
    external: true,
  },
];

export const FOOTER_DEVELOPER_LINKS = [
  { label: 'GitHub', href: SITE.contact.github },
  { label: 'LinkedIn', href: SITE.contact.linkedin },
] as const;

export function getFooterCopyright() {
  return `© ${SITE.copyrightYear} ${SITE.name}. All rights reserved.`;
}

export const ADMIN_HEADER_SUBTITLES: Record<AdminSection, string> = {
  dashboard: 'Tổng quan',
  games: 'Quản lý game',
  packages: 'Quản lý gói nạp',
  orders: 'Quản lý đơn hàng',
  deposits: 'Quản lý nạp tiền',
  users: 'Quản lý người dùng',
} as const;
