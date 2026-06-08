import { LayoutDashboard, LogOut, Receipt, UserRound, WalletCards } from 'lucide-react';
import type { HeaderAccountMenuItem } from '@/shared/types/layout.types';
import type { Route } from '@/lib/routes';

export function getMenuIcon(routeName?: string) {
  if (routeName === 'account') return <UserRound size={16} />;
  if (routeName === 'orders') return <Receipt size={16} />;
  if (routeName === 'wallet') return <WalletCards size={16} />;
  if (routeName === 'admin') return <LayoutDashboard size={16} />;
  return <LogOut size={16} />;
}

type HeaderNavItemLike = {
  route: Route;
};

type HeaderMenuItemLike = {
  className?: string;
  dividerAfter?: boolean;
  label: string;
  route?: Route;
};

export function getVisibleHeaderNavItems<T extends HeaderNavItemLike>(items: T[], isLoggedIn: boolean) {
  if (isLoggedIn) return items;
  return items.filter((item) => item.route.name !== 'orders' && item.route.name !== 'wallet');
}

export function buildHeaderAccountMenuItems<T extends HeaderMenuItemLike>(
  items: T[],
  onLogout: () => void,
  navigate: (route: Route) => void,
): HeaderAccountMenuItem[] {
  return items.map((item) => ({
    label: item.label,
    icon: getMenuIcon(item.route?.name),
    className: item.className,
    dividerAfter: item.dividerAfter,
    onClick: () => {
      if (item.className === 'logout') {
        onLogout();
        return;
      }

      if (item.route) navigate(item.route);
    },
  }));
}
