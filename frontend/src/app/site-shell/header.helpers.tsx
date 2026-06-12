import { Boxes, LayoutDashboard, LogOut, Receipt, UserRound, WalletCards, Users } from 'lucide-react';
import type { HeaderAccountMenuItem } from '@/shared/types/layout';
import type { HeaderAccountMenuItemConfig } from '@/app/config/site';

const HEADER_MENU_ICON_BY_HREF = {
  '/admin': <LayoutDashboard size={16} />,
  '/admin/games': <Boxes size={16} />,
  '/admin/packages': <Boxes size={16} />,
  '/admin/orders': <WalletCards size={16} />,
  '/admin/deposits': <WalletCards size={16} />,
  '/admin/users': <Users size={16} />,
  '/orders': <Receipt size={16} />,
  '/profile': <UserRound size={16} />,
  '/wallet': <WalletCards size={16} />,
} as const;

export function getMenuIcon(href?: string) {
  if (!href) return <LogOut size={16} />;
  const icon = HEADER_MENU_ICON_BY_HREF[href as keyof typeof HEADER_MENU_ICON_BY_HREF];
  if (icon) return icon;
  return <LogOut size={16} />;
}

type HeaderNavItemLike = {
  href: string;
  label: string;
};

export function getVisibleHeaderNavItems<T extends HeaderNavItemLike>(items: readonly T[], isLoggedIn: boolean) {
  if (isLoggedIn) return items;
  return items.filter((item) => item.href !== '/orders' && item.href !== '/wallet');
}

export function buildHeaderAccountMenuItems<T extends HeaderAccountMenuItemConfig>(
  items: readonly T[],
  onLogout: () => void,
  navigate: (href: string) => void,
): HeaderAccountMenuItem[] {
  return items.map((item) => ({
    label: item.label,
    icon: getMenuIcon(item.href),
    className: item.className,
    dividerAfter: item.dividerAfter,
    onClick: () => {
      if (item.className === 'logout') {
        onLogout();
        return;
      }

      if (item.href) navigate(item.href);
    },
  }));
}
